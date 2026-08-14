import { Op, Transaction } from 'sequelize';
import Appointment from '../models/appointment';

/**
 * Estados que NO ocupan agenda: -1 es cita cancelada (borrado suave) y 4 es el
 * otro estado que `getAllAppointment` deja fuera. Se replica ese criterio para
 * que la validación vea exactamente las mismas citas que el calendario.
 */
const ESTADOS_QUE_NO_OCUPAN = [-1, 4];

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
  const where: any = {
    state: { [Op.notIn]: ESTADOS_QUE_NO_OCUPAN },
    start: { [Op.lt]: fin },
    end: { [Op.gt]: inicio },
  };

  if (ignorarId) where.id = { [Op.ne]: ignorarId };

  return Appointment.findOne({ where, transaction });
};

/** ¿El rango es utilizable? Fechas válidas y fin estrictamente posterior. */
export const rangoValido = (inicio: Date, fin: Date): boolean =>
  !isNaN(inicio.getTime()) && !isNaN(fin.getTime()) && fin > inicio;
