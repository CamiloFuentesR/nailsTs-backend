import { Request, RequestHandler, Response } from 'express';
import { Op } from 'sequelize';
import { ScheduleException } from '../models';
import { esUuidValido, validarExcepcion } from '../helpers/scheduleValidation';

export const getScheduleExceptions: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { from, to } = req.query;
    const where: any = {};

    if (from && to) {
      where.date = { [Op.between]: [from as string, to as string] };
    }

    const scheduleExceptions = await ScheduleException.findAll({
      where,
      order: [['date', 'ASC']],
    });

    return res.status(200).json({
      ok: true,
      msg: 'Se obtuvieron las excepciones con éxito',
      scheduleExceptions,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'No se pudieron cargar las excepciones',
      details: error.message,
    });
  }
};

export const createScheduleException: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const excepcion = req.body;

    const error = validarExcepcion(excepcion);
    if (error) {
      return res.status(400).json({ ok: false, msg: error });
    }

    const scheduleException = await ScheduleException.create(excepcion);
    return res.status(201).json({
      ok: true,
      msg: 'Cierre registrado con éxito',
      scheduleException,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al registrar el cierre',
      details: error.message,
    });
  }
};

export const deleteScheduleException: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    if (!esUuidValido(id)) {
      return res.status(400).json({
        ok: false,
        msg: 'El identificador del cierre no es válido',
      });
    }
    const borradas = await ScheduleException.destroy({ where: { id } });
    if (borradas === 0) {
      return res.status(404).json({ ok: false, msg: 'Cierre no encontrado' });
    }
    return res
      .status(200)
      .json({ ok: true, msg: 'Cierre eliminado con éxito', id });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al eliminar el cierre',
      details: error.message,
    });
  }
};
