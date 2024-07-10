import { Request, RequestHandler, Response } from 'express';
import AppointmentSate from '../models/appointmentState';

export const createAppointmentState: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id, name } = req.body;

  const appointmentState = await AppointmentSate.findByPk(id);

  if (appointmentState) {
    return res.status(400).json({
      ok: false,
      msg: 'Este elemento esta duplicado',
    });
  }
  const appointmentStateSave = await AppointmentSate.create({
    id,
    name,
  });
  res
    .status(201)
    .json({ ok: true, msg: 'Estado creado con éxito', appointmentStateSave });
};
