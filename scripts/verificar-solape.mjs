// =============================================================================
//  AVISO: ESTE SCRIPT CREA CITAS REALES EN LA BASE A LA QUE APUNTES.
//
//  Dispara varias creaciones de cita simultáneas sobre un mismo horario. La
//  cita que logre grabarse se borra sola al terminar, pero si ese borrado falla
//  queda una cita de prueba metida en la agenda. NO lo corras contra la base de
//  producción de un negocio sin revisar después que la limpieza haya salido
//  bien: si falla, el script imprime el id para borrarlo a mano.
//
//  Lo correcto es correrlo contra un entorno local o de pruebas.
// =============================================================================
//
// QUÉ VERIFICA
//
// Que dos (o más) citas simultáneas sobre el mismo horario NO puedan grabarse
// las dos. `createAppointment` toma un `pg_advisory_xact_lock` dentro de la
// transacción antes de consultar el solape; sin ese lock, dos peticiones a la
// vez pueden leer las dos "libre" y grabar las dos. Éste es el único modo de
// comprobarlo: el backend no tiene runner de pruebas.
//
// Con N peticiones simultáneas lo correcto es exactamente un 201 y N-1 con 409.
//
// Por defecto dispara 6, no 2, a propósito: el pool de conexiones de Sequelize
// está en su valor por defecto (5). Un bug donde el endpoint pide una segunda
// conexión teniendo una tomada solo se manifiesta al pasar de 5 peticiones
// simultáneas, y con 2 peticiones no se vería.
//
// USO
//
//   node scripts/verificar-solape.mjs <URL_API> <TOKEN_JWT> <CLIENT_ID> [N]
//
//   URL_API    Raíz de la API. Sirve con o sin el sufijo /api:
//              http://localhost:8000  ó  http://localhost:8000/api
//   TOKEN_JWT  Token de un usuario con rol ADMIN_ROLE o USER_ROLE (ver abajo).
//   CLIENT_ID  UUID de un cliente que exista en la base.
//   N          Peticiones simultáneas. Opcional, por defecto 6, mínimo 2.
//
// CÓMO OBTENER LOS ARGUMENTOS
//
//   Token — POST al login con un usuario que ya exista en esa base. Devuelve
//   { ok: true, token: "..." }:
//
//     curl -s -X POST http://localhost:8000/api/login \
//       -H "Content-Type: application/json" \
//       -d '{"email":"TU_EMAIL","password":"TU_PASSWORD"}'
//
//   CLIENT_ID — la lista de clientes activos no pide token:
//
//     curl -s http://localhost:8000/api/clients/active
//
//   Toma el `id` de cualquier cliente de esa respuesta.
//
// QUÉ SALIDA ESPERAR
//
//   Bien (la carrera está cerrada) — una 201, el resto 409, limpieza OK y
//   código de salida 0:
//
//     respuesta 1: 409  Ese horario ya fue tomado. Elige otro, por favor.
//     ...
//     Resumen: 1 creada (201), 5 rechazadas (409), 0 inesperadas
//     Limpieza: cita <uuid> borrada.
//     OK: exactamente una grabó y 5 fueron rechazadas.
//
//   Mal — cualquier otra combinación, con código de salida 1. El caso grave es
//   más de un 201: significa que se grabaron dos citas encima y la carrera NO
//   está cerrada.
//
// =============================================================================

import { randomUUID } from 'node:crypto';

// El nombre de la cabecera no es 'x-token': `middleware/validateJWT.ts` lee
// `req.header('x-token-authorize')`. Con el nombre equivocado todo responde 401
// y la verificación no probaría nada.
const CABECERA_TOKEN = 'x-token-authorize';

/** Tope por petición. Una que se cuelgue es en sí misma un hallazgo (es como se
 *  veía el bug de agotamiento del pool), así que se reporta, no se espera. */
const TIMEOUT_MS = 30000;

const CONCURRENCIA_POR_DEFECTO = 6;

const USO = `
Uso:  node scripts/verificar-solape.mjs <URL_API> <TOKEN_JWT> <CLIENT_ID> [N]

  URL_API    http://localhost:8000  ó  http://localhost:8000/api
  TOKEN_JWT  token de un usuario con rol ADMIN_ROLE o USER_ROLE
  CLIENT_ID  UUID de un cliente existente
  N          peticiones simultáneas (opcional, por defecto ${CONCURRENCIA_POR_DEFECTO}, mínimo 2)

AVISO: crea citas reales en la base a la que apuntes. No lo corras contra
producción sin revisar que la limpieza del final haya salido bien.
`;

const [, , API, TOKEN, CLIENT_ID, N_ARG] = process.argv;

if (!API || !TOKEN || !CLIENT_ID) {
  console.error('Faltan argumentos: <URL_API> <TOKEN_JWT> <CLIENT_ID> [N]');
  console.error(USO);
  process.exit(1);
}

const CONCURRENCIA = N_ARG === undefined ? CONCURRENCIA_POR_DEFECTO : Number(N_ARG);

if (!Number.isInteger(CONCURRENCIA) || CONCURRENCIA < 2) {
  console.error(
    `N debe ser un entero de 2 o más. Se recibió: ${JSON.stringify(N_ARG)}`,
  );
  console.error(USO);
  process.exit(1);
}

// El servidor monta las rutas de citas en /api/appointment. Se acepta la URL con
// o sin /api para que un olvido no se traduzca en un 404 con cuerpo HTML que
// parecería un fallo de la validación.
const raiz = API.replace(/\/+$/, '');
const URL_CITAS = `${/\/api$/.test(raiz) ? raiz : `${raiz}/api`}/appointment`;

// Horario muy a futuro para no chocar con citas reales. El día se sortea dentro
// de 2030 en vez de ser fijo: si una corrida anterior no alcanzó a limpiar, un
// horario fijo haría que la siguiente recibiera puros 409 y el diagnóstico
// saldría equivocado. Se imprime el horario elegido para poder buscarlo a mano.
const diaSorteado = Math.floor(Math.random() * 365);
const inicio = new Date(Date.UTC(2030, 0, 1, 14, 0, 0) + diaSorteado * 86400000);
const fin = new Date(inicio.getTime() + 2 * 60 * 60 * 1000);

const cuerpoCita = id => ({
  appointmentData: {
    id,
    client_id: CLIENT_ID,
    start: inicio.toISOString(),
    end: fin.toISOString(),
    title: 'Prueba de solape',
    price: 1000,
    state: 1,
    backgroundColor: '#cccccc',
    className: 'test',
    discount: 0,
    // `check('appointmentData.role').custom(isValidRole)` busca este nombre en
    // la tabla Roles. Si la base no tuviera USER_ROLE, la API responde 400 y hay
    // que cambiarlo por el rol que sí exista.
    role: 'USER_ROLE',
  },
  // Vacío a propósito. `check('servicesData.*.service_id')` no se ejecuta sobre
  // un arreglo sin elementos, y `AppointmentService.bulkCreate([])` devuelve []
  // sin consultar la base. La cita se crea igual y ocupa agenda, que es lo único
  // que le importa a esta verificación.
  servicesData: [],
});

/** Extrae algo legible de la respuesta: `msg` propio de la API, los errores de
 *  express-validator (que llegan como { errors: [...] }, sin `msg` arriba), o el
 *  texto crudo si no era JSON. */
const describir = cuerpo => {
  if (cuerpo === null || cuerpo === undefined) return '(sin cuerpo)';
  if (typeof cuerpo === 'string') return cuerpo.slice(0, 300).replace(/\s+/g, ' ');
  if (cuerpo.msg) return cuerpo.msg + (cuerpo.details ? ` -- ${cuerpo.details}` : '');
  if (Array.isArray(cuerpo.errors)) {
    return cuerpo.errors.map(e => `${e.path ?? '?'}: ${e.msg}`).join(' | ');
  }
  return JSON.stringify(cuerpo).slice(0, 300);
};

const leerCuerpo = async respuesta => {
  const texto = await respuesta.text();
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
};

const crearCita = async id => {
  try {
    const respuesta = await fetch(URL_CITAS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [CABECERA_TOKEN]: TOKEN },
      body: JSON.stringify(cuerpoCita(id)),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return { id, status: respuesta.status, cuerpo: await leerCuerpo(respuesta) };
  } catch (error) {
    // status 0 = nunca hubo respuesta (timeout, conexión caída). No se puede
    // saber si la cita quedó grabada, así que igual se intenta borrar después.
    return { id, status: 0, cuerpo: `sin respuesta: ${error.message}` };
  }
};

const borrarCita = async id => {
  try {
    const respuesta = await fetch(`${URL_CITAS}/${id}`, {
      method: 'DELETE',
      headers: { [CABECERA_TOKEN]: TOKEN },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return { status: respuesta.status, cuerpo: await leerCuerpo(respuesta) };
  } catch (error) {
    return { status: 0, cuerpo: `sin respuesta: ${error.message}` };
  }
};

console.log(`\nVerificación de solape  ->  ${URL_CITAS}`);
console.log(`Horario de prueba: ${inicio.toISOString()}  ..  ${fin.toISOString()}`);
console.log(`Peticiones simultáneas: ${CONCURRENCIA}\n`);

// Todas se lanzan en el mismo tick para que compitan de verdad.
const resultados = await Promise.all(
  Array.from({ length: CONCURRENCIA }, () => crearCita(randomUUID())),
);

resultados.forEach((r, i) => {
  console.log(`respuesta ${i + 1}: ${r.status || '---'}  ${describir(r.cuerpo)}`);
});

const creadas = resultados.filter(r => r.status === 201);
const rechazadas = resultados.filter(r => r.status === 409);
const inesperadas = resultados.filter(r => r.status !== 201 && r.status !== 409);

console.log(
  `\nResumen: ${creadas.length} creada(s) (201), ${rechazadas.length} rechazada(s) (409), ` +
    `${inesperadas.length} inesperada(s)`,
);

// --- Limpieza -------------------------------------------------------------
// Se intenta borrar todo lo que pudo haber quedado grabado: las 201 y también
// las que no dieron respuesta clara (timeout o 500), porque de ésas no se sabe
// si alcanzaron a insertar. Un 404 al borrar significa que no había nada.
//
// Secuencial y no en paralelo a propósito: `deleteAppointment` abre una
// transacción y luego consulta sin pasarle `{ transaction }`, o sea toma dos
// conexiones del pool a la vez. En paralelo se estorbarían entre ellas.
const aLimpiar = resultados.filter(
  r => r.status === 201 || r.status === 0 || r.status >= 500,
);
const noBorradas = [];

console.log('');
for (const r of aLimpiar) {
  const borrado = await borrarCita(r.id);
  if (borrado.status === 200) {
    console.log(`Limpieza: cita ${r.id} borrada.`);
  } else if (borrado.status === 404) {
    console.log(`Limpieza: cita ${r.id} no existía, nada que borrar.`);
  } else {
    const detalle = `${borrado.status || '---'} ${describir(borrado.cuerpo)}`;
    noBorradas.push({ id: r.id, detalle });
    console.log(`Limpieza: FALLÓ el borrado de la cita ${r.id} -> ${detalle}`);
  }
}
if (aLimpiar.length === 0) console.log('Limpieza: no se creó ninguna cita, nada que borrar.');

// --- Veredicto ------------------------------------------------------------
const esperadas = CONCURRENCIA - 1;
const correcto =
  creadas.length === 1 && rechazadas.length === esperadas && inesperadas.length === 0;

console.log('');
if (correcto) {
  console.log(
    `OK: exactamente una grabó y ${esperadas} fueron rechazadas. La carrera está cerrada.`,
  );
} else if (creadas.length > 1) {
  console.log(
    `FALLA GRAVE: ${creadas.length} peticiones grabaron su cita sobre el mismo horario.\n` +
      'La carrera NO está cerrada: el lock no está serializando las creaciones.\n' +
      'Revisa que createAppointment tome pg_advisory_xact_lock dentro de la transacción\n' +
      'y que la consulta de solape se haga con esa misma transacción.',
  );
} else if (creadas.length === 0 && rechazadas.length === CONCURRENCIA) {
  console.log(
    'FALLA: ninguna pudo grabar, todas recibieron 409.\n' +
      'La validación está rechazando de más. Causas típicas: quedó una cita de una\n' +
      'corrida anterior en ese horario (revisa el horario de arriba en la agenda), o\n' +
      'buscarCitaSolapada ve como ocupada una cita que no debería ocupar.',
  );
} else if (creadas.length === 0 && inesperadas.length === CONCURRENCIA) {
  console.log(
    'FALLA: ninguna petición llegó a competir, todas fallaron antes.\n' +
      'Esto no dice nada sobre la carrera. Revisa el detalle de arriba:\n' +
      '  400  el cuerpo no pasó los validadores (cliente inexistente, rol inválido).\n' +
      '  401  token inválido, vencido, o el usuario no es ADMIN_ROLE / USER_ROLE.\n' +
      '  404  la URL no apunta a la API (revisa host y puerto).\n' +
      '  ---  el servidor no respondió: caído, o colgado más de 30s.',
  );
} else {
  console.log(
    `FALLA: se esperaba 1 creada y ${esperadas} rechazadas, y salieron ` +
      `${creadas.length} creada(s), ${rechazadas.length} rechazada(s) y ` +
      `${inesperadas.length} inesperada(s).`,
  );
  const errores = inesperadas.filter(r => r.status >= 500 || r.status === 0);
  if (errores.length > 0) {
    console.log('\nRespuestas con error del servidor (cuerpo completo):');
    for (const e of errores) {
      console.log(`  ${e.status || '---'}  ${JSON.stringify(e.cuerpo)}`);
    }
  }
}

// La limpieza fallida también es un fallo: no es aceptable dejar citas de prueba
// dando vueltas en la agenda de un negocio. Va al final y por la misma salida
// que todo lo demás: mezclar stdout y stderr descoloca el orden apenas se
// redirige la salida a un archivo, y este aviso es justo el que no se puede
// perder ni quedar cortado a la mitad.
if (noBorradas.length > 0) {
  console.log('\n' + '!'.repeat(70));
  console.log('ATENCIÓN: QUEDARON CITAS DE PRUEBA SIN BORRAR. BÓRRALAS A MANO.');
  console.log(`Horario: ${inicio.toISOString()} .. ${fin.toISOString()}`);
  for (const n of noBorradas) {
    console.log(`  id ${n.id}   (falló el borrado: ${n.detalle})`);
  }
  console.log('!'.repeat(70));
}

process.exit(correcto && noBorradas.length === 0 ? 0 : 1);
