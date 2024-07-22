import { Request, RequestHandler, Response } from 'express';
import BusinessHour from '../models/businessHour';

export const createBusinessHour: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id, ...businessHourData } = req.body;

  try {
    const existingBusinessHour = await BusinessHour.findByPk(id);
    console.log(existingBusinessHour);
    if (existingBusinessHour) {
      return res.status(500).json({
        ok: false,
        msg: 'Error al crear el horario, datos duplicados',
      });
    }
    const businessHour = await BusinessHour.create({
      id,
      ...businessHourData,
    });

    res.status(201).json({
      ok: true,
      msg: 'Horario creado con éxito',
      businessHour,
    });
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      msg: 'Error al crear el horario',
      details: error.message,
    });
  }
};

export const getAllBusinessHours: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const businessHours = await BusinessHour.findAll();

    if (businessHours) {
      res.status(200).json({
        ok: true,
        msg: 'Se obtuvieron los horarios con éxito',
        businessHours,
      });
    }
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'No se pudieron cargar los datos',
      details: error.message,
    });
  }
};

export const updateBusinessHour: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const [updatedRowsCount, updatedBusinessHours] = await BusinessHour.update(
      body,
      {
        where: { id },
        returning: true,
      },
    );
    if (
      updatedRowsCount === 0 ||
      !updatedBusinessHours ||
      updatedBusinessHours.length === 0
    ) {
      return res.status(404).json({
        ok: false,
        msg: 'Horario no encontrado o no actualizado',
      });
    }
    return res.status(200).json({
      ok: true,
      msg: 'Horario actualizado con éxito',
      businessHour: updatedBusinessHours[0],
    });
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      msg: 'Error interno del servidor al actualizar el horario',
      error: error.message,
    });
  }
};

export const getBusinessHourById: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const businessHour = await BusinessHour.findByPk(id);
    if (!businessHour) {
      return res.status(409).json({
        ok: false,
        msg: 'No se encontró el horario',
      });
    }
    return res.status(200).json({
      ok: true,
      businessHour,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};
