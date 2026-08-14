import { Op, Transaction, WhereOptions } from 'sequelize';
import db from '../db/conection';
import Appointment from '../models/appointment';

/**
 * Estados que NO ocupan agenda: -1 es cita cancelada (borrado suave) y 4 es el
 * otro estado que `getAllAppointment` deja fuera. Se replica ese criterio para
 * que la validación vea exactamente las mismas citas que el calendario.
 */
const ESTADOS_QUE_NO_OCUPAN = [-1, 4];

/**
 * Tope de duración de una cita. Los servicios más largos del catálogo son de
 * 3 horas y una combinación grande no pasa de 5, así que 12 deja margen de
 * sobra. Existe para que nadie pueda grabar una cita de años que haga que
 * todas las creaciones posteriores encuentren solape.
 */
const DURACION_MAXIMA_MS = 12 * 60 * 60 * 1000;

/**
 * Cuánto puede esperar por un lock una escritura de agenda.
 *
 * Está acá y no repetido en cada llamador porque es una perilla de tuning: si
 * alguien la sube, tiene que subirla en un solo lugar. La usa también el ALTER
 * de ensureNoOverlapConstraint, que acota la espera pero no toma el lock
 * consultivo.
 */
export const LOCK_TIMEOUT_AGENDA = '3s';

/**
 * Clave del lock de agenda. Cualquier bigint fijo sirve; un segundo lock
 * consultivo en el proyecto debe usar una clave distinta.
 */
const LOCK_AGENDA = 918273645;

/**
 * Serializa las escrituras de agenda dentro de la transacción recibida.
 *
 * El tope de espera va primero: SET LOCAL se revierte solo al cerrar la
 * transacción. Sin tope, una transacción trabada encola a todas las siguientes
 * con su conexión del pool tomada y deja sin base de datos a la API completa,
 * no solo al endpoint que la provocó. Acota cualquier espera de lock de la
 * transacción, no solo la del lock consultivo de acá abajo.
 *
 * Después toma el lock. Sin él, dos peticiones simultáneas pueden leer las dos
 * "libre" y grabar las dos: una consulta seguida de un insert no es atómica.
 * El lock se suelta solo al cerrar la transacción.
 *
 * Asume READ COMMITTED (el default de Postgres): la consulta de solape ve lo
 * que commiteó quien tenía el lock antes. Con REPEATABLE_READ dejaría de verlo
 * y se grabarían dos citas encima sin ningún error.
 */
export const tomarLockAgenda = async (
  transaction: Transaction,
): Promise<void> => {
  await db.query(`SET LOCAL lock_timeout = '${LOCK_TIMEOUT_AGENDA}'`, {
    transaction,
  });
  await db.query(`SELECT pg_advisory_xact_lock(${LOCK_AGENDA})`, {
    transaction,
  });
};

interface ArgsSolape {
  inicio: Date;
  fin: Date;
  /** Al reprogramar, la cita no debe chocar consigo misma. */
  ignorarId?: string;
  transaction?: Transaction;
}

/**
 * ¿Hay una cita activa que se pise con [inicio, fin)?
 *
 * La condición es `start < fin && end > inicio`. Dos citas que se tocan en el
 * borde (una termina 11:00, la otra empieza 11:00) NO solapan, que es el
 * comportamiento correcto para una agenda.
 *
 * Devuelve la cita encontrada o null.
 */
export const buscarCitaSolapada = async ({
  inicio,
  fin,
  ignorarId,
  transaction,
}: ArgsSolape) => {
  const where: WhereOptions = {
    state: { [Op.notIn]: ESTADOS_QUE_NO_OCUPAN },
    start: { [Op.lt]: fin },
    end: { [Op.gt]: inicio },
    ...(ignorarId ? { id: { [Op.ne]: ignorarId } } : {}),
  };

  return Appointment.findOne({ where, transaction });
};

/** ¿El rango es utilizable? Fechas válidas, fin posterior y duración acotada. */
export const rangoValido = (inicio: Date, fin: Date): boolean =>
  !isNaN(inicio.getTime()) &&
  !isNaN(fin.getTime()) &&
  fin > inicio &&
  fin.getTime() - inicio.getTime() <= DURACION_MAXIMA_MS;
