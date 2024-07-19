import { Request, RequestHandler, Response } from 'express';
import Appointment from '../models/appointment';
import { Service, ServicesCategory } from '../models';
import { Op } from 'sequelize';

export const createAppointment: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id, service_id, category_id, ...appointmentData } = req.body;
  console.log(req.body);
  try {
    const ap = await Appointment.findByPk(id);
    if (ap) {
      return res.status(500).json({
        ok: false,
        msg: 'Error al crear la cita, datos duplicados',
      });
    }
    const appointment = await Appointment.create({
      id,
      service_id,
      category_id,
      ...appointmentData,
    });

    res.status(201).json({
      ok: true,
      msg: 'Cita creada con éxito',
      appointment,
    });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({
      ok: false,
      msg: 'Error al crear la cita',
      details: error.message,
    });
  }
};

export const getAllAppointment: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const appointment = await Appointment.findAll({
      where: {
        state: {
          [Op.ne]: -1, // Utiliza Op.ne (not equal) para filtrar los estados diferentes a -1
        },
      },
    });

    if (appointment) {
      res.status(200).json({
        ok: true,
        msg: 'Se obtuvieron las citas con éxito',
        appointment,
      });
    }
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'No se pudieron cargar datos',
      details: error.message,
    });
  }
};

export const updateAppointment: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const [updatedRowsCount, updatedClients] = await Appointment.update(body, {
      where: { id },
      returning: true,
    });
    if (
      updatedRowsCount === 0 ||
      !updatedClients ||
      updatedClients.length === 0
    ) {
      return res.status(404).json({
        ok: false,
        msg: 'Cita no encontrada o no actualizada',
      });
    }
    return res.status(200).json({
      ok: true,
      msg: 'Cita actualizada con éxito',
      appointment: updatedClients[0],
    });
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      msg: 'Error interno del servidor al actualizar la cita',
      error: error.message,
    });
  }
};

export const getAppointmentById: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Service,
          attributes: ['name'],
        },
        {
          model: ServicesCategory,
          attributes: ['name'],
        },
      ],
    });
    if (!appointment) {
      return res.status(409).json({
        ok: false,
        msg: 'No se encontraron citas',
      });
    }
    return res.status(200).json({
      ok: true,
      appointment,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};
