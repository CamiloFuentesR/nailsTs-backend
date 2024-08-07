import { Request, RequestHandler, Response } from 'express';
import {
  Appointment,
  AppointmentService,
  Service,
  ServicesCategory,
} from '../models';
import { AppointmentServiceInstance } from '../models/AppointmentService';
import { Op } from 'sequelize';

export const createAppointmentService: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id, ...appointmentServiceData } = req.body;
    const apService = await AppointmentService.findByPk(id);
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

    // Convertir a array y ordenar por valor en orden descendente
    const sortedData = Object.values(groupedData).sort(
      (a, b) => b.value - a.value,
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
          ],
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
          attributes: ['id', 'start', 'end', 'title', 'client_id', 'state'],
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
      return res.status(409).json({
        ok: false,
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
