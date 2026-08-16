import { NextFunction, Request, RequestHandler, Response } from 'express';
import Appointment from '../models/appointment';
import { AppointmentService, Service, ServicesCategory } from '../models';
import { Op, fn, col, ExclusionConstraintError } from 'sequelize';
import db from '../db/conection';
import {
  buscarCitaSolapada,
  rangoValido,
  tomarLockAgenda,
  ESTADOS_QUE_NO_OCUPAN,
} from '../helpers/haySolape';
import { resolverFilasDeLaCita } from '../helpers/calcularPreciosCita';

/**
 * ¿El error viene de la restricción de solape de la base?
 *
 * Es la última línea de defensa: la restricción citas_sin_solape saltó porque
 * el horario se tomó entre la consulta de solape y el INSERT. Por la API no
 * debería pasar nunca, porque el lock consultivo serializa las escrituras; el
 * caso real es una escritura por fuera, o un endpoint futuro que no tome el
 * lock. Sin esto responde 500 con el texto crudo de Postgres, que además filtra
 * el nombre interno de la restricción al cliente.
 */
const esSolapeDeLaBase = (error: unknown): boolean =>
  error instanceof ExclusionConstraintError &&
  error.constraint === 'citas_sin_solape';

/** Mismo texto que el 409 del chequeo previo: el frontend no distingue. */
const MSG_HORARIO_TOMADO = 'Ese horario ya fue tomado. Elige otro, por favor.';

// Qué se guarda en cada fila de servicios lo resuelve resolverFilasDeLaCita, en
// helpers/calcularPreciosCita. HOY DEVUELVE EXACTAMENTE LO QUE MANDA EL
// NAVEGADOR, igual que siempre: el cálculo del servidor está en modo sombra y
// solo deja la diferencia en el log. El interruptor para activarlo está al
// principio de ese archivo.

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
  next: NextFunction,
) => {
  const { servicesData, appointmentData } = req.body;
  console.log('Creating appointment with data:');
  console.log(req.body);
  // console.log(servicesData);
  // console.log(appointmentData);
  // Inicia una transacción
  const transaction = await db.transaction();

  try {
    const ap = await Appointment.findByPk(appointmentData.id, { transaction });
    if (ap) {
      await transaction.rollback();
      return res.status(500).json({
        ok: false,
        msg: 'Error al crear la cita, datos duplicados',
      });
    }

    const inicio = new Date(appointmentData.start);
    const fin = new Date(appointmentData.end);

    if (!rangoValido(inicio, fin)) {
      await transaction.rollback();
      return res.status(400).json({
        ok: false,
        msg: 'El horario de la cita no es válido',
      });
    }

    // Antes del lock a propósito: leer el catálogo no necesita la agenda quieta,
    // y todo lo que se haga con el lock tomado hace esperar a los demás que
    // están reservando.
    const { filas, precioCita } = await resolverFilasDeLaCita({
      servicesData,
      descuento: appointmentData.discount,
      precioDelNavegador: appointmentData.price,
      idCita: appointmentData.id,
      transaction,
    });

    // Serializa las escrituras de agenda y acota la espera por locks. El porqué
    // de cada parte está en tomarLockAgenda.
    await tomarLockAgenda(transaction);

    const solapada = await buscarCitaSolapada({ inicio, fin, transaction });
    if (solapada) {
      await transaction.rollback();
      return res.status(409).json({
        ok: false,
        msg: MSG_HORARIO_TOMADO,
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
        discount: appointmentData.discount,
        state: appointmentData.state,
        price: precioCita,
        className: appointmentData.className,
        img: appointmentData.img,
      },
      { transaction },
    );
    // Prepara los datos de servicios relacionados con la cita
    const appointmentServices = filas.map(fila => ({
      ...fila,
      appointment_id: appointment.id,
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

    if (esSolapeDeLaBase(error)) {
      return res.status(409).json({
        ok: false,
        msg: MSG_HORARIO_TOMADO,
      });
    }

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
      // where: {
      //   start: {
      //     [Op.between]: [startDate, endDate],
      //   },
      // },
      where: {
        start: { [Op.gte]: new Date(start as string) },
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
      res.status(204).json({
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
    // Con { transaction } se reutiliza la conexión que ya tomó la transacción.
    // Sin eso pide una segunda al pool teniendo una ocupada, y con el pool por
    // defecto en 5 unas pocas peticiones simultáneas se bloquean entre sí.
    const appointment = await Appointment.findOne({
      where: { id: appointmentData.id },
      transaction,
    });

    if (!appointment) {
      await transaction.rollback();
      return res.status(404).json({
        ok: false,
        msg: 'Cita no encontrada',
      });
    }

    const inicio = new Date(appointmentData.start);
    const fin = new Date(appointmentData.end);

    if (!rangoValido(inicio, fin)) {
      await transaction.rollback();
      return res.status(400).json({
        ok: false,
        msg: 'El horario de la cita no es válido',
      });
    }

    // Igual que al crear: antes del lock, porque leer el catálogo no necesita
    // la agenda quieta. Y también al actualizar, no solo al crear: hoy el
    // formulario ya rellena los precios desde el catálogo actual cuando se
    // reabre una cita, así que recalcular acá mantiene el comportamiento que ya
    // existe en vez de cambiarlo.
    const { filas, precioCita } = await resolverFilasDeLaCita({
      servicesData,
      descuento: appointmentData.discount,
      precioDelNavegador: appointmentData.price,
      idCita: appointmentData.id,
      transaction,
    });

    // Reprogramar tiene que tomar el mismo lock que crear: si no lo hiciera,
    // una creación y una reprogramación simultáneas podrían dejar dos citas en
    // el mismo horario.
    await tomarLockAgenda(transaction);

    // Cancelar libera el horario, no lo toma: una cancelación nunca debería
    // poder ser rechazada por "ese horario ya está tomado". Hoy no la rechaza,
    // pero solo porque ignorarId excluye la propia cita; eso es una coincidencia
    // afortunada y no una garantía, y con datos sucios la administradora se
    // quedaría sin la salida de emergencia. Los estados salen de haySolape para
    // no mantener una segunda lista literal de lo mismo.
    const liberaAgenda = ESTADOS_QUE_NO_OCUPAN.includes(
      Number(appointmentData.state),
    );

    // Se ignora la propia cita: al moverla dentro de su mismo horario se
    // chocaría consigo misma y quedaría imposible de guardar.
    const solapada = liberaAgenda
      ? null
      : await buscarCitaSolapada({
          inicio,
          fin,
          ignorarId: appointmentData.id,
          transaction,
        });
    if (solapada) {
      await transaction.rollback();
      return res.status(409).json({
        ok: false,
        msg: MSG_HORARIO_TOMADO,
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
        discount: appointmentData.discount,
        price: precioCita,
        className: appointmentData.className,
        img: appointmentData.img,
      },
      { transaction },
    );

    await AppointmentService.destroy({
      where: { appointment_id: appointmentData.id },
      transaction,
    });

    // La cantidad se guarda también acá, y no solo al crear: reprogramar o
    // editar una cita borra sus filas y las vuelve a insertar, así que sin esto
    // los tres parches de una cita ya guardada volverían a ser uno la primera
    // vez que ella le mueve la hora, y en silencio.
    const appointmentServices = filas.map(fila => ({
      ...fila,
      appointment_id: appointmentData.id,
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

    if (esSolapeDeLaBase(error)) {
      return res.status(409).json({
        ok: false,
        msg: MSG_HORARIO_TOMADO,
      });
    }

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
    // Con { transaction } se reutiliza la conexión que ya tomó la transacción.
    // Sin eso pide una segunda al pool teniendo una ocupada, y con el pool por
    // defecto en 5 unas pocas peticiones simultáneas se bloquean entre sí.
    //
    // No lleva lock ni validación de solape a propósito: cancelar libera un
    // bloque de agenda, no lo toma.
    const appointment = await Appointment.findOne({
      where: { id: id },
      transaction,
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
