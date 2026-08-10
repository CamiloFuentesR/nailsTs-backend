import { Request, RequestHandler, Response } from 'express';
import { Op } from 'sequelize';
import db from '../db/conection';
import { ScheduleRule } from '../models';
import { hayReglasSolapadas, validarRegla } from '../helpers/scheduleValidation';

/**
 * Resta un día a una fecha 'YYYY-MM-DD'. Aritmética de calendario pura, sin
 * zona horaria: la fecha ya viene resuelta desde el frontend, que es el único
 * lado del sistema que conoce la zona del negocio.
 */
const diaAnterior = (fecha: string): string => {
  const [y, m, d] = fecha.split('-').map(Number);
  const anterior = new Date(Date.UTC(y, m - 1, d - 1));
  return anterior.toISOString().slice(0, 10);
};

export const getScheduleRules: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { from, to } = req.query;
    const where: any = {};

    // Reglas que estuvieron vigentes en algún momento del rango pedido
    if (from && to) {
      where[Op.and] = [
        { validFrom: { [Op.lte]: to as string } },
        {
          [Op.or]: [
            { validUntil: null },
            { validUntil: { [Op.gte]: from as string } },
          ],
        },
      ];
    }

    const scheduleRules = await ScheduleRule.findAll({
      where,
      order: [
        ['dayOfWeek', 'ASC'],
        ['startTime', 'ASC'],
      ],
    });

    return res.status(200).json({
      ok: true,
      msg: 'Se obtuvieron las reglas de horario con éxito',
      scheduleRules,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'No se pudieron cargar las reglas de horario',
      details: error.message,
    });
  }
};

export const createScheduleRule: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const regla = req.body;

    const error = validarRegla(regla);
    if (error) {
      return res.status(400).json({ ok: false, msg: error });
    }

    // Se compara contra las que ya existen ese día
    const existentes = await ScheduleRule.findAll({
      where: { dayOfWeek: regla.dayOfWeek },
    });
    if (hayReglasSolapadas([...existentes.map(r => r.toJSON()), regla])) {
      return res.status(409).json({
        ok: false,
        msg: 'Ya existe un horario que se superpone con este día',
      });
    }

    const scheduleRule = await ScheduleRule.create(regla);
    return res.status(201).json({
      ok: true,
      msg: 'Horario recurrente creado con éxito',
      scheduleRule,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al crear el horario recurrente',
      details: error.message,
    });
  }
};

/**
 * Reemplaza la semana completa. No borra: cierra la vigencia de las reglas
 * anteriores y crea las nuevas, todo en una transacción. Así el historial
 * queda intacto (las semanas pasadas se siguen dibujando con el horario que
 * realmente rigió) y nunca hay un instante sin horario configurado.
 */
export const replaceWeek: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { rules, validFrom } = req.body as { rules: any[]; validFrom: string };

  if (!Array.isArray(rules)) {
    return res
      .status(400)
      .json({ ok: false, msg: 'Se espera un arreglo de reglas' });
  }
  if (!validFrom || !/^\d{4}-\d{2}-\d{2}$/.test(validFrom)) {
    return res.status(400).json({
      ok: false,
      msg: 'Se requiere validFrom con formato YYYY-MM-DD',
    });
  }

  const normalizadas = rules.map(r => ({
    ...r,
    validFrom,
    validUntil: null,
  }));

  for (const regla of normalizadas) {
    const error = validarRegla(regla);
    if (error) {
      return res.status(400).json({ ok: false, msg: error });
    }
  }
  if (hayReglasSolapadas(normalizadas)) {
    return res.status(409).json({
      ok: false,
      msg: 'Hay bloques que se superponen dentro del mismo día',
    });
  }

  const transaction = await db.transaction();
  try {
    // 1. Cerrar la vigencia de todo lo que sigue vigente
    await ScheduleRule.update(
      { validUntil: diaAnterior(validFrom) },
      {
        where: {
          [Op.or]: [
            { validUntil: null },
            { validUntil: { [Op.gte]: validFrom } },
          ],
        },
        transaction,
      },
    );

    // 2. Insertar las nuevas
    const creadas = await ScheduleRule.bulkCreate(normalizadas, { transaction });

    await transaction.commit();
    return res.status(200).json({
      ok: true,
      msg: 'Horario semanal actualizado con éxito',
      scheduleRules: creadas,
    });
  } catch (error: any) {
    await transaction.rollback();
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al guardar el horario semanal',
      details: error.message,
    });
  }
};

export const updateScheduleRule: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const error = validarRegla(req.body);
    if (error) {
      return res.status(400).json({ ok: false, msg: error });
    }

    const [filas, actualizadas] = await ScheduleRule.update(req.body, {
      where: { id },
      returning: true,
    });
    if (filas === 0) {
      return res
        .status(404)
        .json({ ok: false, msg: 'Regla de horario no encontrada' });
    }
    return res.status(200).json({
      ok: true,
      msg: 'Horario actualizado con éxito',
      scheduleRule: actualizadas[0],
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al actualizar la regla de horario',
      details: error.message,
    });
  }
};

export const deleteScheduleRule: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const borradas = await ScheduleRule.destroy({ where: { id } });
    if (borradas === 0) {
      return res
        .status(404)
        .json({ ok: false, msg: 'Regla de horario no encontrada' });
    }
    return res
      .status(200)
      .json({ ok: true, msg: 'Horario eliminado con éxito', id });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al eliminar la regla de horario',
      details: error.message,
    });
  }
};
