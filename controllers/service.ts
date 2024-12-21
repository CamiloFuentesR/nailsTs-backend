import { Response, Request, RequestHandler } from 'express';
import { Service, ServicesCategory } from '../models';

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.findAll({
      include: [
        {
          model: ServicesCategory,
          as: 'category',
        },
      ],
    });

    if (services.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'Servicios - no se encontraron servicios',
      });
    }

    return res.status(200).json({
      ok: true,
      services,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: error,
    });
  }
};
export const getServicesByCategory: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const services = await Service.findAll({
      where: { services_category_id: id },
    });
    if (!services) {
      return res.status(409).json({
        ok: false,
        msg: 'No se encontraron servicios',
      });
    }
    return res.status(200).json({
      ok: true,
      services,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

export const getServicesById: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const services = await Service.findByPk(id);
    if (!services) {
      return res.status(409).json({
        ok: false,
        msg: 'No se encontraron servicios',
      });
    }
    return res.status(200).json({
      ok: true,
      services,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

export const createService = async (req: Request, res: Response) => {
  const { name, price, services_category_id, duration } = req.body;

  if (name === '') {
    return res.status(401).json({
      ok: false,
      msg: 'El nombre no puede estar vacío',
    });
  } else if (services_category_id === '') {
    return res.status(401).json({
      ok: false,
      msg: 'La descripción no puede estar vacío',
    });
  } else if (price === '') {
    return res.status(401).json({
      ok: false,
      msg: 'El precio no puede estar vacío',
    });
  }
  try {
    const categoryExist = await Service.findOne({ where: { name } });

    if (categoryExist) {
      return res.status(404).json({
        ok: false,
        msg: 'Ya existe una categoría con ese nombre',
      });
    }
    const data = {
      name,
      price,
      duration,
      services_category_id,
    };
    const service = await Service.create(data);

    res.status(201).json({
      ok: true,
      service,
    });
  } catch (error: any) {
    console.error(error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(500).json({
        ok: false,
        msg: 'La categoria-servicio no existe, contacte con el administrador',
      });
    }
    return res.status(500).json({
      ok: false,
      msg: 'Server internal error',
    });
  }
};

export const updateservice: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const { body } = req;

  // Verificar y transformar el estado en booleano si es 1 o 2
  if (body.state === 1) {
    body.state = true;
  } else if (body.state === 2) {
    body.state = false;
  }

  // Buscar el servicio por su id
  let service = await Service.findByPk(id);

  if (!service) {
    return res.status(400).json({
      ok: false,
      msg: 'No se encontró este servicio',
    });
  }

  // Actualizar el servicio con los nuevos datos
  const [updatedRowsCount, updateService] = await Service.update(body, {
    where: { id },
    returning: true,
  });

  // Verificar si la actualización se realizó correctamente
  if (updatedRowsCount === 0 || !updateService || updateService.length === 0) {
    return res.status(404).json({
      ok: false,
      msg: 'Cliente no encontrado o no actualizado',
    });
  }

  // Responder con éxito si se actualizó el servicio
  res.status(201).json({
    ok: true,
    msg: 'Servicio actualizado correctamente',
    service: updateService[0],
  });
};
