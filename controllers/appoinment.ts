import { Request, RequestHandler, Response } from 'express';
import Appointment from '../models/appointment';
import { AppointmentService, Service, ServicesCategory } from '../models';
import { Op, fn, col } from 'sequelize';
import db from '../db/conection';

// export const createAppointment: RequestHandler = async (
//   req: Request,
//   res: Response,
// ) => {
//   const { id, service_id, category_id, ...appointmentData } = req.body;
//   console.log(req.body);
//   try {
//     const ap = await Appointment.findByPk(id);
//     if (ap) {
//       return res.status(500).json({
//         ok: false,
//         msg: 'Error al crear la cita, datos duplicados',
//       });
//     }
//     const appointment = await Appointment.create({
//       id,
//       service_id,
//       category_id,
//       ...appointmentData,
//     });

//     return res.status(201).json({
//       ok: true,
//       msg: 'Cita creada con éxito',
//       appointment,
//     });
//   } catch (error: any) {
//     console.log(error.message);
//     res.status(500).json({
//       ok: false,
//       msg: 'Error al crear la cita',
//       details: error.message,
//     });
//   }
// };

export const createAppointment: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { servicesData, appointmentData } = req.body;
  console.log(servicesData);
  console.log(appointmentData);
  // Inicia una transacción
  const transaction = await db.transaction();

  try {
    const ap = await Appointment.findByPk(appointmentData.id);
    if (ap) {
      await transaction.rollback();
      return res.status(500).json({
        ok: false,
        msg: 'Error al crear la cita, datos duplicados',
      });
    }

    const appointment = await Appointment.create(
      {
        id: appointmentData.id,
        client_id: appointmentData.client_id,
        start: appointmentData.start,
        end: appointmentData.end,
        title: appointmentData.title,
        backgroundColor: appointmentData.backgroundColor,
        state: appointmentData.state,
        price: appointmentData.price,
        className: appointmentData.className,
        img: appointmentData.img,
      },
      { transaction },
    );
    // Prepara los datos de servicios relacionados con la cita
    const appointmentServices = servicesData.map((service: any) => ({
      appointment_id: appointment.id,
      service_id: service.service_id,
      state: service.state,
      price: service.price,
    }));

    // Guarda los servicios relacionados
    await AppointmentService.bulkCreate(appointmentServices, { transaction });

    // Confirma la transacción
    await transaction.commit();

    return res.status(201).json({
      ok: true,
      msg: 'Cita creada con éxito',
      appointment,
    });
  } catch (error: any) {
    // Reversión de la transacción en caso de error
    await transaction.rollback();
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
          [Op.notIn]: [-1, 4],
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

export const getAllAppointmentByDate: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        ok: false,
        msg: 'Los parámetros "start" y "end" son requeridos',
      });
    }

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    const appointment = await Appointment.findAll({
      where: {
        start: {
          [Op.between]: [startDate, endDate],
        },
        state: {
          [Op.notIn]: [-1, 4],
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

export const getAcceptedAppointment: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const currentDate = new Date();

    const [totalAppointments, approvedAppointments, notApprovedAppointments] =
      await Promise.all([
        Appointment.count({
          where: {
            start: {
              [Op.gte]: currentDate, // Filtra las citas a partir de la fecha actual
            },
            state: {
              [Op.notIn]: [-1, 4], // Filtra los estados que no son -1 ni 4
            },
          },
        }),
        Appointment.count({
          where: {
            start: {
              [Op.gte]: currentDate, // Filtra las citas a partir de la fecha actual
            },
            // state: 2,
            state: [2, 3],
          },
        }),
        Appointment.count({
          where: {
            start: {
              [Op.gte]: currentDate, // Filtra las citas a partir de la fecha actual
            },
            state: 1, // Filtra las citas no aprobadas
          },
        }),
      ]);

    res.status(200).json({
      ok: true,
      msg: 'Se obtuvieron las citas con éxito',
      totalAppointments,
      approvedAppointments,
      notApprovedAppointments,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'No se pudieron cargar datos',
      details: error.message,
    });
  }
};

const monthNames = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export const getAppointmentByMonth: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    // Realiza la consulta para contar citas por mes
    const citasPorMes = await Appointment.findAll({
      attributes: [
        [fn('DATE_TRUNC', 'month', col('start')), 'mes'], // Agrupa por mes usando la columna 'start'
        [fn('COUNT', col('id')), 'totalCitas'], // Cuenta el número de citas
      ],
      where: {
        // state: {
        //   [Op.notIn]: [-1, 4],
        // },
        state: 3,
      },
      group: ['mes'], // Agrupa por mes
      order: [['mes', 'ASC']], // Ordena por mes en orden ascendente
    });

    // Mapear los resultados para incluir los nombres de meses en español
    const resultados = citasPorMes.map((registro: any) => {
      const mesIndex = new Date(registro.get('mes')).getMonth(); // Obtener el índice del mes
      return {
        month: monthNames[mesIndex], // Obtener el nombre del mes en español
        totalAppointment: Number(registro.get('totalCitas')),
      };
    });

    if (resultados.length > 0) {
      res.status(200).json({
        ok: true,
        msg: 'Se obtuvieron las citas por mes con éxito',
        appointmentByMonth: resultados,
      });
    } else {
      res.status(404).json({
        ok: false,
        msg: 'No se encontraron citas',
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
// export const updateAppointment: RequestHandler = async (
//   req: Request,
//   res: Response,
// ) => {
//   const { id } = req.params;
//   const { body } = req;

//   try {
//     const [updatedRowsCount, updatedClients] = await Appointment.update(body, {
//       where: { id },
//       returning: true,
//     });
//     if (
//       updatedRowsCount === 0 ||
//       !updatedClients ||
//       updatedClients.length === 0
//     ) {
//       return res.status(404).json({
//         ok: false,
//         msg: 'Cita no encontrada o no actualizada',
//       });
//     }
//     return res.status(200).json({
//       ok: true,
//       msg: 'Cita actualizada con éxito',
//       appointment: updatedClients[0],
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       ok: false,
//       msg: 'Error interno del servidor al actualizar la cita',
//       error: error.message,
//     });
//   }
// };

export const updateAppointment: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { appointmentData, servicesData } = req.body;
  // Inicia una transacción
  const transaction = await db.transaction();

  try {
    const appointment = await Appointment.findOne({
      where: { id: appointmentData.id },
    });

    if (!appointment) {
      await transaction.rollback();
      return res.status(404).json({
        ok: false,
        msg: 'Cita no encontrada',
      });
    }

    // Actualiza la cita
    await appointment.update(
      {
        client_id: appointmentData.client_id,
        start: appointmentData.start,
        end: appointmentData.end,
        title: appointmentData.title,
        backgroundColor: appointmentData.backgroundColor,
        state: appointmentData.state,
        price: appointmentData.price,
        className: appointmentData.className,
        img: appointmentData.img,
      },
      { transaction },
    );

    await AppointmentService.destroy({
      where: { appointment_id: appointmentData.id },
      transaction,
    });

    const appointmentServices = servicesData.map((service: any) => ({
      appointment_id: appointmentData.id,
      service_id: service.service_id,
      state: service.state,
      price: service.price,
    }));

    await AppointmentService.bulkCreate(appointmentServices, { transaction });

    // Confirma la transacción
    await transaction.commit();

    return res.status(200).json({
      ok: true,
      msg: 'Cita actualizada con éxito',
      appointment,
      // updateService,
    });

    // Itera sobre los datos de servicios recibidos y actualiza o crea según sea necesario
  } catch (error: any) {
    // Reversión de la transacción en caso de error
    await transaction.rollback();
    console.log(error.message);
    res.status(500).json({
      ok: false,
      msg: 'Error al actualizar la cita',
      details: error.message,
    });
  }
};

export const deleteAppointment: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;

  // Inicia una transacción
  const transaction = await db.transaction();

  try {
    const appointment = await Appointment.findOne({
      where: { id: id },
    });

    if (!appointment) {
      await transaction.rollback();
      return res.status(404).json({
        ok: false,
        msg: 'Cita no encontrada',
      });
    }

    // Actualiza el estado de la cita a -1
    await appointment.update({ state: -1 }, { transaction });

    // Actualiza el estado de los servicios de la cita a -1
    await AppointmentService.update(
      { state: -1 },
      {
        where: { appointment_id: id },
        transaction,
      },
    );

    // Confirma la transacción
    await transaction.commit();

    return res.status(200).json({
      ok: true,
      msg: 'Su cita ha sido cancelada con éxito.',
      appointment,
    });
  } catch (error: any) {
    // Reversión de la transacción en caso de error
    await transaction.rollback();
    console.log(error.message);
    res.status(500).json({
      ok: false,
      msg: 'Error al actualizar la cita y los servicios',
      details: error.message,
    });
  }
};

export const updateAppointmentState: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  try {
    const [affectedRows, updatedAppointments] = await Appointment.update(
      { state: -1 },
      {
        where: { id: id },
        returning: true, // Para obtener los registros actualizados en Postgres
      },
    );

    if (affectedRows === 0) {
      return null; // No se encontró el registro con el ID dado
    }

    return updatedAppointments[0]; // Retorna el primer registro actualizado
  } catch (error) {
    console.error('Error updating appointment state:', error);
    throw error;
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
