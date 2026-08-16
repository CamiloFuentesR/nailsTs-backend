import db from '../db/conection';
import AppointmentService from '../models/AppointmentService';
import Service from '../models/service';

/**
 * Agrega a Services las columnas nuevas que falten, y a appointment_services la
 * cantidad. Las dos van juntas porque son una sola función: un servicio que se
 * cobra por unidad no sirve de nada si la cita no puede anotar cuántas.
 *
 * Mismo camino que ensureCategoryColumns: el proyecto no usa sequelize-cli y
 * las tablas se crearon a mano, así que no hay migraciones donde poner esto.
 * Una sentencia idempotente al arrancar, que en Koyeb se ejecuta una vez por
 * despliegue y no por request.
 *
 * ADD COLUMN IF NOT EXISTS es de Postgres y no toca la tabla si la columna ya
 * está. Nunca usar sync({ alter: true }) acá: infiere diferencias contra los
 * modelos y puede llegar a borrar columnas.
 *
 * NOT NULL DEFAULT false y no nullable: los servicios que ya existen quedan
 * todos como principales, que es exactamente cómo se comportan hoy. Nada cambia
 * al desplegar; la administradora marca después los que son complementos
 * (retiro, parafinoterapia, largos adicionales, parche por uña).
 *
 * El nombre de la tabla se pide al modelo en vez de escribirlo: Sequelize
 * pluraliza el nombre del modelo, y hardcodearlo se rompería en silencio si
 * alguna vez cambia esa convención.
 */
export const ensureServiceColumns = async (): Promise<void> => {
  // getTableName devuelve un objeto cuando la tabla lleva esquema. Sin este
  // caso, el template literal escribiría "[object Object]" y el ALTER fallaría.
  const nombre = Service.getTableName();
  const tabla = typeof nombre === 'string' ? nombre : nombre.tableName;

  /*
   * precio_agregado: el precio que cobra el servicio cuando se suma a otro.
   *
   * Nullable a propósito, y esa es toda la regla:
   *
   *   null  = no tiene precio condicional, siempre se cobra `price`.
   *   valor = ese es el precio cuando el servicio acompaña a otro; `price`
   *           sigue siendo el precio cuando se pide solo.
   *
   * Es lo que hoy son dos filas: "Manicure SPA al finalizar un servicio"
   * ($2.000) y "Manicure SPA sin esmaltado permanente" ($10.000). El nombre
   * cargaba la condición y la clienta tenía que elegir bien la fila; con la
   * columna es un servicio solo, y el precio lo decide el contexto.
   *
   * INTEGER y no DECIMAL como `price`: los precios del salón son pesos
   * redondos y appointment_services.appointment_service_price, que es donde
   * termina esta cifra, ya es INTEGER.
   *
   * por_unidad + unidad + maximo_unidades: servicios que se cobran varias
   * veces en la misma cita, como el parche de polygel, que vale $1.000 por
   * uña. `unidad` es el sustantivo ("uña") para que la pantalla pueda escribir
   * "3 uñas" en vez de "3". `maximo_unidades` nulo es sin tope.
   *
   * Multiplica el precio, NO la duración: hacer tres parches no toma el triple
   * de tiempo. La duración del servicio es la de la sesión y la fija la
   * administradora.
   *
   * NOT NULL DEFAULT false en por_unidad, y nulos en las otras tres: los
   * servicios que ya existen quedan exactamente como se comportan hoy (precio
   * único, una unidad). Nada cambia al desplegar.
   */
  await db.query(`
    ALTER TABLE "${tabla}"
      ADD COLUMN IF NOT EXISTS es_complemento BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS precio_agregado INTEGER,
      ADD COLUMN IF NOT EXISTS por_unidad BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS unidad VARCHAR(20),
      ADD COLUMN IF NOT EXISTS maximo_unidades INTEGER;
  `);

  /*
   * La cantidad va en la fila de la cita y no en el servicio: el servicio dice
   * que se cobra por unidad, la cita dice cuántas se hicieron. Sin esto no hay
   * dónde guardar "tres parches" y habría que repetir la fila tres veces, que
   * ensucia los informes por categoría (contarían tres servicios distintos).
   *
   * NOT NULL DEFAULT 1: las citas que ya están pasan a valer 1, que es lo que
   * hoy significan. Ningún cobro cambia al desplegar.
   *
   * El nombre de la tabla sale del modelo por lo mismo que arriba: Sequelize
   * lo deriva del nombre del modelo y escribirlo a mano se rompe en silencio si
   * esa convención cambia.
   */
  const nombreCita = AppointmentService.getTableName();
  const tablaCita =
    typeof nombreCita === 'string' ? nombreCita : nombreCita.tableName;

  await db.query(`
    ALTER TABLE "${tablaCita}"
      ADD COLUMN IF NOT EXISTS cantidad INTEGER NOT NULL DEFAULT 1;
  `);
};

export default ensureServiceColumns;
