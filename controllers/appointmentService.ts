import { Request, RequestHandler, Response } from 'express';
import { AppointmentService, Service, ServicesCategory } from '../models';
import { AppointmentServiceInstance } from '../models/AppointmentService';
import { where } from 'sequelize';

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
    // Obtén todos los servicios de citas con las categorías
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
      ],
    });

    // Agrupar por categoría y contar
    const groupedData = appointmentServices.reduce((acc, appointment) => {
      const categoryName = appointment.Service.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { label: categoryName, value: 0 };
      }
      acc[categoryName].value += 1;
      return acc;
    }, {} as Record<string, { label: string; value: number }>);

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

export const getAppointmentServiceById: RequestHandler = async (
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
