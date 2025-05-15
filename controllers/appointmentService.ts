import { Request, RequestHandler, Response } from 'express';
import {
  Appointment,
  AppointmentService,
  Service,
  ServicesCategory,
} from '../models';
import { AppointmentServiceInstance } from '../models/AppointmentService';
import { Op, fn, col, literal } from 'sequelize';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const createAppointmentService: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id, ...appointmentServiceData } = req.body;
    console.log(appointmentServiceData);
    const apService = await AppointmentService.findByPk(id);
    console.log('Evento creado');
    console.log(apService);
    if (apService) {
      return res.status(500).json({
        ok: false,
        msg: 'Error al crear la prestacion, datos duplicados',
      });
    }
    const appointmentService: AppointmentServiceInstance =
      await AppointmentService.create({
        id,
        ...appointmentServiceData,
      });
    return res.status(201).json({
      ok: true,
      msg: 'Cita creada con éxito',
      appointmentService,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error al crear la prestacion de servicios',
      details: error.message,
    });
  }
};

export const getAppointmentService = async (req: Request, res: Response) => {
  try {
    const appointmentService = await AppointmentService.findAll({
      include: [
        {
          model: Service,
          attributes: [
            'id',
            'name',
            'services_category_id',
            'price',
            'duration',
          ],
          include: [
            {
              model: ServicesCategory,
              as: 'category',
              attributes: ['name'],
            },
          ],
        },
      ],
    });
    if (appointmentService.length > 0) {
      return res.status(200).json({ ok: true, appointmentService });
    }
    return res.status(400).json({
      ok: false,
      msg: 'No se encontraron datos',
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAppointmentServiceReportByGroup = async (
  req: Request,
  res: Response,
) => {
  try {
    // Calcular el inicio y fin del mes actual
    const currentMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const currentMonthEnd = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    );

    // Obtén todos los servicios de citas con las categorías y el estado de la cita
    const appointmentServices = await AppointmentService.findAll({
      include: [
        {
          model: Service,
          attributes: [
            'id',
            'name',
            'services_category_id',
            'price',
            'duration',
          ],
          include: [
            {
              model: ServicesCategory,
              as: 'category',
              attributes: ['name'],
            },
          ],
        },
        {
          model: Appointment,
          attributes: [],
          where: {
            state: 3, // Filtra solo las citas con estado 3
            start: {
              [Op.between]: [currentMonthStart, currentMonthEnd], // Filtra solo las citas dentro del mes actual
            },
          },
        },
      ],
    });

    // Agrupar por categoría y contar
    const groupedData = appointmentServices.reduce(
      (acc, appointmentService) => {
        const categoryName = appointmentService.Service.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = { label: categoryName, value: 0 };
        }
        acc[categoryName].value += 1;
        return acc;
      },
      {} as Record<string, { label: string; value: number }>,
    );

    // Convertir a array y ordenar por nombre de categoría en orden ascendente
    const sortedData = Object.values(groupedData).sort((a, b) =>
      a.label.localeCompare(b.label),
    );

    if (appointmentServices.length > 0) {
      return res.status(200).json({ ok: true, serviceAppointment: sortedData });
    }

    return res.status(400).json({
      ok: false,
      msg: 'No se encontraron datos',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener los datos',
    });
  }
};

export const getAppointmentServiceByAppointment: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const appointment = await AppointmentService.findAll({
      where: {
        appointment_id: id,
      },
      include: [
        {
          model: Service,
          attributes: [
            'id',
            'name',
            'services_category_id',
            'price',
            'duration',
          ],
          include: [
            {
              model: ServicesCategory,
              as: 'category',
              attributes: ['name'],
            },
            // {
            //   model: Appointment,
            //   as: 'appointment',
            //   attributes: ['img'],
            // },
          ],
        },
        {
          model: Appointment,
          // as: 'appointment',
          attributes: ['img', 'discount'],
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

export const getAppointmentServiceByClient: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const appointmentServices = await AppointmentService.findAll({
      include: [
        {
          model: Service,
          attributes: [
            'id',
            'name',
            'services_category_id',
            'price',
            'duration',
          ],
          include: [
            {
              model: ServicesCategory,
              as: 'category',
              attributes: ['name'],
            },
          ],
        },
        {
          model: Appointment,
          attributes: [
            'id',
            'start',
            'end',
            'title',
            'client_id',
            'img',
            'state',
          ],
          where: {
            client_id: id,
            state: {
              [Op.notIn]: [-1], // Filtra los estados que no son -1 ni 4
            },
          },
          order: [['start', 'DESC']], // Ordenar por fecha de inicio de manera descendente
        },
      ],
    });

    if (!appointmentServices || appointmentServices.length === 0) {
      return res.status(200).json({
        ok: true,
        msg: 'No se encontraron citas para el cliente especificado',
      });
    }

    // Agrupar por appointment_id
    const groupedAppointments = appointmentServices.reduce(
      (acc: any, curr: any) => {
        const appointmentId = curr.appointment_id;
        if (!acc[appointmentId]) {
          acc[appointmentId] = {
            ...curr.Appointment.dataValues,
            services: [],
          };
        }
        acc[appointmentId].services.push({
          ...curr.Service.dataValues,
          price: curr.price,
          state: curr.state,
        });
        return acc;
      },
      {},
    );

    // Convertir objeto agrupado en array y ordenar por fecha de inicio de manera descendente
    const result = Object.values(groupedAppointments).sort((a: any, b: any) => {
      return new Date(b.start).getTime() - new Date(a.start).getTime();
    });

    return res.status(200).json({
      ok: true,
      appointments: result,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};
export const getAppointmentServiceOneByClient: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    // Busca todos los servicios de la cita utilizando el 'appointment_id'
    const appointmentServices = await AppointmentService.findAll({
      where: {
        appointment_id: id,
      },
      include: [
        {
          model: Service,
          attributes: [
            'id',
            'name',
            'services_category_id',
            'price',
            'duration',
          ],
          include: [
            {
              model: ServicesCategory,
              as: 'category',
              attributes: ['name'],
            },
          ],
        },
        {
          model: Appointment,
          attributes: [
            'id',
            'start',
            'end',
            'title',
            'client_id',
            'state',
            'img',
          ],
          where: {
            state: {
              [Op.notIn]: [-1],
            },
          },
        },
      ],
      order: [['Appointment', 'start', 'DESC']], // Ordenar por fecha de inicio de manera descendente
    });

    // Organiza los servicios agrupados por cita
    const appointments = appointmentServices.reduce(
      (acc, appointmentService) => {
        const { Appointment: appointment, Service: service } =
          appointmentService;

        // Si la cita ya está en el acumulador, agrega el servicio a su array de servicios
        if (acc[appointment.id]) {
          acc[appointment.id].services.push(service);
        } else {
          // Si la cita no está en el acumulador, la agrega con sus servicios asociados
          acc[appointment.id] = {
            ...appointment.get(), // Obtener los datos de la cita
            services: [service], // Agregar el primer servicio al array de servicios
          };
        }

        return acc;
      },
      {} as Record<string, any>,
    );

    // Convierte el objeto de citas agrupadas en un array
    const result = Object.values(appointments);

    return res.status(200).json({
      ok: true,
      appointments: result,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

export const getCurrentMonthEarningsByCategory = async (
  req: Request,
  res: Response,
) => {
  try {
    // Definir la zona horaria de Chile
    const tz = 'America/Santiago';
    const now = dayjs().tz(tz);

    // Obtener el primer y último día del mes en UTC
    const currentMonthStart = now.startOf('month').utc().toDate();
    const currentMonthEnd = now.endOf('month').utc().toDate();

    const earnings = await AppointmentService.findAll({
      attributes: [
        [fn('SUM', col('appointment_service_price')), 'totalEarnings'], // ← ahora correcto
        [col('Service.category.name'), 'label'],
        [fn('COUNT', col('Service.id')), 'value'],
      ],
      include: [
        {
          model: Service,
          attributes: [],
          include: [
            {
              model: ServicesCategory,
              as: 'category',
              attributes: ['name'],
            },
          ],
        },
        {
          model: Appointment,
          attributes: [],
          where: {
            start: {
              [Op.between]: [currentMonthStart, currentMonthEnd],
            },
            state: 3,
          },
        },
      ],
      group: ['Service.category.id', 'Service.category.name'],
      order: [
        [col('value'), 'DESC'],
        [col('Service.category.name'), 'ASC'],
      ],
    });
    console.log(earnings);
    const totalEarnings = earnings.reduce((sum, earning) => {
      const earningsValue = parseFloat(
        earning.getDataValue('totalEarnings')?.toString() || '0',
      );
      return sum + earningsValue;
    }, 0);

    return res.status(200).json({
      ok: true,
      earnings,
      totalEarnings,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

export const getCurrentMonthEarningsByService = async (
  req: Request,
  res: Response,
) => {
  try {
    const tz = 'America/Santiago';
    const now = dayjs().tz(tz);

    // Obtener el primer y último día del mes en UTC
    const currentMonthStart = now.startOf('month').utc().toDate();
    const currentMonthEnd = now.endOf('month').utc().toDate();

    const earningsByService = await AppointmentService.findAll({
      attributes: [
        [fn('SUM', col('AppointmentService.price')), 'totalEarnings'],
        [col('Service.name'), 'serviceName'],
      ],
      include: [
        {
          model: Service,
          attributes: [],
        },
        {
          model: Appointment,
          attributes: [],
          where: {
            state: 3,
            start: {
              [Op.between]: [currentMonthStart, currentMonthEnd],
            },
          },
        },
      ],
      where: {
        state: 3, // Filtrar por el estado 3 en AppointmentService
      },
      group: ['Service.id', 'Service.name'], // Agrupar por ID y nombre del servicio
      order: [[fn('SUM', col('Service.price')), 'DESC']], // Ordenar por el total de ganancias
    });

    const totalEarnings = earningsByService.reduce((sum, earning) => {
      const earningsValue = parseFloat(
        earning.getDataValue('totalEarnings')?.toString() || '0',
      );
      return sum + earningsValue;
    }, 0);

    return res.status(200).json({
      ok: true,
      earningsByService,
      totalEarnings,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

export const getEarningsByCategoryAndService = async (
  req: Request,
  res: Response,
) => {
  try {
    const currentMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const currentMonthEnd = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    );

    // Consulta para obtener los totales por categoría y por servicio
    const earnings = await AppointmentService.findAll({
      attributes: [
        [fn('SUM', col('AppointmentService.price')), 'totalEarnings'],
        [col('Service->category.name'), 'categoryName'],
        [col('Service.name'), 'serviceName'], // Obtener el nombre del servicio
      ],
      include: [
        {
          model: Service,
          attributes: [],
          include: [
            {
              model: ServicesCategory,
              as: 'category',
              attributes: [],
            },
          ],
        },
        {
          model: Appointment,
          attributes: [],
          where: {
            start: {
              [Op.between]: [currentMonthStart, currentMonthEnd],
            },
            state: {
              [Op.notIn]: [-1], // Filtra los estados que no son -1 (o cualquier otro estado que indique cancelación)
            },
          },
        },
      ],
      group: ['Service->category.id', 'Service.id'], // Agrupar por categoría y luego por servicio
      order: [[fn('SUM', col('Service.price')), 'DESC']], // Ordenar por las ganancias totales
    });

    let totalGlobalEarnings = 0;
    console.log(earnings);
    const earningsByCategory = earnings.reduce(
      (result: any[], earning: any) => {
        const categoryName = earning.getDataValue('categoryName');
        const serviceName = earning.getDataValue('serviceName');
        const totalEarnings = parseFloat(
          earning.getDataValue('totalEarnings')?.toString() || '0',
        );

        // Sumar al total global
        totalGlobalEarnings += totalEarnings;

        // Buscar si la categoría ya existe en el resultado
        let category = result.find(cat => cat.categoryName === categoryName);

        // Si la categoría no existe, se crea y se agrega al array
        if (!category) {
          category = {
            categoryName,
            totalEarnings: 0,
            services: [],
          };
          result.push(category);
        }

        // Agregar el total de la categoría
        category.totalEarnings += totalEarnings;

        // Agregar el servicio a la categoría
        category.services.push({
          serviceName,
          totalEarnings,
        });

        return result;
      },
      [],
    );

    // Ordenar las categorías por totalEarnings
    earningsByCategory.sort((a, b) => b.totalEarnings - a.totalEarnings);

    return res.status(200).json({
      ok: true,
      earningsByCategory,
      totalGlobalEarnings, // Incluye el total global
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};
