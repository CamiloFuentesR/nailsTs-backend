import { Transaction } from 'sequelize';
import Service from '../models/service';

/**
 * ═══════════════════════════ MODO SOMBRA ═══════════════════════════
 *
 * HOY ESTÁ EN false, Y ESO SIGNIFICA QUE ESTE ARCHIVO NO COBRA NADA.
 *
 * Con el interruptor en false, lo que se guarda sigue siendo exactamente el
 * precio que manda el navegador, igual que siempre. El cálculo del servidor se
 * hace igual, pero solo para dejar en el log la diferencia cuando no coincide
 * con lo que llegó. La idea es mirar ese log una semana: mientras aparezcan
 * diferencias, hay algo que entendimos distinto y hay que revisarlo antes de
 * tocar plata de verdad.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ PARA ACTIVAR EL RECÁLCULO: cambiar el false de la línea de abajo por  │
 * │ true. Es el ÚNICO cambio necesario, no hay que tocar los             │
 * │ controladores. Con true pasan las dos cosas a la vez: cada fila se    │
 * │ guarda con el precio del catálogo y Appointment.price pasa a ser la   │
 * │ suma de esas filas.                                                   │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Y OJO CON LA OTRA MITAD: el modo sombra existe para salir de él. Si el log
 * está limpio y nadie mueve este interruptor, quedamos exactamente igual que
 * antes —el navegador sigue diciendo cuánto cobrar— con la ilusión de haberlo
 * arreglado. Si esto sigue en false dentro de un mes, es un olvido y no una
 * decisión.
 */
const RECALCULAR_PRECIOS_EN_SERVIDOR = false;

/** Lo que se guarda en appointment_services, sin el appointment_id. */
export interface FilaDeCita {
  service_id: number;
  state: number;
  appointment_service_price: number;
  cantidad: number;
}

interface FilaPedida {
  service_id: number;
  state: number;
  price?: unknown;
  cantidad?: unknown;
}

interface ResueltoParaGuardar {
  /** Las filas tal como hay que insertarlas. */
  filas: FilaDeCita[];
  /** Lo que va en Appointment.price. */
  precioCita: number;
}

/**
 * Cuántas veces se hizo un servicio dentro de la cita.
 *
 * Solo pasa de 1 en los servicios marcados como `por_unidad`, como el parche de
 * polygel, que se cobra por uña: tres parches son una fila con cantidad 3 y no
 * tres filas.
 *
 * Cae en 1 cuando el campo no viene, que es el caso de todo lo que ya está
 * guardado y de cualquier cliente que todavía no lo mande. Lo que llegue mal ya
 * lo rechazó con 400 el validador de la ruta, antes de abrir la transacción y de
 * tomar el lock de agenda; esto es la red de abajo para que un valor raro nunca
 * se convierta en una fila que no cobra nada, y por eso no vuelve a devolver
 * error acá.
 */
export const normalizarCantidad = (valor: unknown): number => {
  if (typeof valor !== 'number' && typeof valor !== 'string') return 1;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 1) return 1;
  return numero;
};

/**
 * El descuento del formulario de la administradora es un PORCENTAJE, y llega
 * como string ('10') desde un <select> de 5/10/15/20/25/30. La reserva pública
 * manda 0.
 */
const leerDescuento = (valor: unknown): number => {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) return 0;
  return Math.min(numero, 100);
};

/**
 * Calcula lo que corresponde cobrar por cada fila de la cita, a partir del
 * catálogo y no de lo que diga el cliente.
 *
 * Lanza si algún servicio no existe: cuando esto esté activado, una cita cuyo
 * precio no se puede calcular no se debe guardar. En modo sombra el error lo
 * atrapa resolverFilasDeLaCita y la cita se guarda igual.
 */
export const calcularFilasDeLaCita = async (
  servicesData: FilaPedida[],
  descuento: unknown,
  transaction?: Transaction,
): Promise<ResueltoParaGuardar> => {
  const ids = servicesData.map(fila => Number(fila.service_id));
  const servicios = await Service.findAll({ where: { id: ids }, transaction });
  const porId = new Map(servicios.map(servicio => [servicio.id, servicio]));

  const porcentaje = leerDescuento(descuento);

  const filas = servicesData.map(fila => {
    const servicio = porId.get(Number(fila.service_id));
    if (!servicio) {
      throw new Error(`El servicio ${fila.service_id} no existe`);
    }

    // Solo los servicios por unidad se multiplican. Si no fuera así, mandando
    // cantidad 3 se podría cobrar tres veces una manicure que se hace una sola.
    const pedida = servicio.por_unidad ? normalizarCantidad(fila.cantidad) : 1;
    // El tope se aplica acá y no se le cree a la pantalla.
    const cantidad = servicio.maximo_unidades
      ? Math.min(pedida, servicio.maximo_unidades)
      : pedida;

    /*
     * ¿Este servicio va acompañado? Solo si la cita trae OTRO servicio que no
     * sea complemento.
     *
     * Es la regla estricta, y es a propósito. La consecuencia que salta a la
     * vista es que parafinoterapia + retiro, sin nada más, cobra los $10.000 y
     * no los $2.000. NO ES UN DESCUIDO: es lo que decidió la dueña, y su razón
     * fue que el precio bajo aplica solo si hay una manicure de verdad, porque
     * con un retiro solo la parafinoterapia pasa a ser el trabajo principal de
     * esa cita y se cobra completa.
     *
     * Si alguien lee esto en seis meses y le parece un caso mal cubierto: no lo
     * "arregles" acá, pregúntale a ella primero.
     */
    const acompanado = servicios.some(
      otro => otro.id !== servicio.id && !otro.es_complemento,
    );

    // Sequelize devuelve las columnas DECIMAL como string, y `price` es
    // DECIMAL(10,2): el Number() no es adorno, sin él esto concatena texto.
    const unitario =
      acompanado && servicio.precio_agregado !== null
        ? servicio.precio_agregado
        : Math.round(Number(servicio.price));

    const bruto = unitario * cantidad;

    /*
     * El descuento se aplica acá dentro, y esa es la parte que no se puede
     * saltar: hoy el formulario ya lo aplica fila por fila antes de mandarlas,
     * así que appointment_service_price guarda cifras NETAS. Si el servidor
     * recalculara solo el precio de lista, esa columna pasaría de neta a bruta
     * y el informe "Ganancias del mes" —que hace SUM de esta columna en
     * getCurrentMonthEarningsByCategory— subiría de golpe sin que nadie haya
     * vendido más, y los meses dejarían de ser comparables entre sí.
     */
    const neto = Math.round(bruto - (bruto * porcentaje) / 100);

    return {
      service_id: servicio.id,
      state: fila.state,
      appointment_service_price: neto,
      cantidad,
    };
  });

  const precioCita = filas.reduce(
    (suma, fila) => suma + fila.appointment_service_price,
    0,
  );

  return { filas, precioCita };
};

/** Las filas tal como las guarda hoy el controlador, sin tocar nada. */
const filasDelNavegador = (servicesData: FilaPedida[]): FilaDeCita[] =>
  servicesData.map(fila => ({
    service_id: fila.service_id,
    state: fila.state,
    appointment_service_price: fila.price as number,
    cantidad: normalizarCantidad(fila.cantidad),
  }));

/**
 * Deja en el log en qué se diferencian el precio que llegó y el que da el
 * catálogo. Si coinciden no escribe nada: el silencio ES el resultado que se
 * está esperando para poder activar el recálculo.
 */
const registrarDiferencias = (
  idCita: unknown,
  navegador: FilaDeCita[],
  catalogo: FilaDeCita[],
): void => {
  const totalNavegador = navegador.reduce(
    (suma, fila) => suma + Math.round(Number(fila.appointment_service_price) || 0),
    0,
  );
  const totalCatalogo = catalogo.reduce(
    (suma, fila) => suma + fila.appointment_service_price,
    0,
  );

  const filasDistintas = navegador
    .map((fila, i) => ({ fila, esperada: catalogo[i] }))
    .filter(
      ({ fila, esperada }) =>
        esperada !== undefined &&
        (Math.round(Number(fila.appointment_service_price) || 0) !==
          esperada.appointment_service_price ||
          fila.cantidad !== esperada.cantidad),
    );

  if (totalNavegador === totalCatalogo && filasDistintas.length === 0) return;

  console.warn(
    `[precio-sombra] cita ${idCita}: se guarda ${totalNavegador} y el catalogo da ${totalCatalogo}`,
  );
  filasDistintas.forEach(({ fila, esperada }) => {
    console.warn(
      `[precio-sombra]   servicio ${fila.service_id}: se guarda ${fila.appointment_service_price} x${fila.cantidad}, el catalogo da ${esperada.appointment_service_price} x${esperada.cantidad}`,
    );
  });
};

/**
 * Devuelve lo que hay que guardar, según el interruptor de arriba.
 *
 * En modo sombra (hoy) devuelve tal cual lo que mandó el navegador y solo
 * registra la diferencia. Cualquier error del cálculo se atrapa acá a
 * propósito: mientras esto no cobre, un problema calculando NO puede impedir
 * que una clienta reserve. Cuando el interruptor pase a true, el error deja de
 * atraparse y una cita que no se puede calcular no se guarda, que es lo
 * correcto cuando de esto depende cuánto se cobra.
 */
export const resolverFilasDeLaCita = async ({
  servicesData,
  descuento,
  precioDelNavegador,
  idCita,
  transaction,
}: {
  servicesData: FilaPedida[];
  descuento: unknown;
  precioDelNavegador: unknown;
  idCita: unknown;
  transaction?: Transaction;
}): Promise<ResueltoParaGuardar> => {
  if (RECALCULAR_PRECIOS_EN_SERVIDOR) {
    return calcularFilasDeLaCita(servicesData, descuento, transaction);
  }

  const filas = filasDelNavegador(servicesData);

  try {
    const { filas: calculadas } = await calcularFilasDeLaCita(
      servicesData,
      descuento,
      transaction,
    );
    registrarDiferencias(idCita, filas, calculadas);
  } catch (error: any) {
    console.warn(
      `[precio-sombra] cita ${idCita}: no se pudo calcular el precio (${error.message})`,
    );
  }

  // El precio de la cita se devuelve sin tocar: en modo sombra nada de lo que
  // se guarda puede cambiar, ni siquiera redondeándose.
  return { filas, precioCita: precioDelNavegador as number };
};

/*
 * ALTERNATIVA CONOCIDA Y NO IMPLEMENTADA: congelar el precio histórico.
 *
 * Esto recalcula al crear Y al actualizar, que es el comportamiento que ya
 * existe: al reabrir una cita, el formulario rellena los precios desde el
 * catálogo de HOY y no desde la fila guardada (initialValuesGetService en el
 * frontend). O sea que editar una cita vieja después de una subida de precios
 * ya la re-precia, con o sin este archivo.
 *
 * Si alguna vez se quiere que el precio quede congelado al momento de reservar,
 * la regla sería recalcular solo al crear y respetar lo guardado al actualizar.
 * Es una decisión de negocio de la dueña, no un detalle técnico, y por eso no
 * está tomada acá.
 */
