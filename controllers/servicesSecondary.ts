import { Request, RequestHandler, Response } from 'express';
import ServiceSecondary from '../models/serviceSecondary';

export const createServiceSecondary: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { name, price, category_secondary_id, duration } = req.body;

  if (name === '') {
    return res.status(401).json({
      ok: false,
      msg: 'El nombre no puede estar vacío',
    });
  } else if (category_secondary_id === '') {
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
    const categorySecondaryExist = await ServiceSecondary.findOne({
      where: { name },
    });

    if (categorySecondaryExist) {
      return res.status(404).json({
        ok: false,
        msg: 'Ya existe una categoría con ese nombre',
      });
    }
    const data = {
      name,
      price,
      duration,
      category_secondary_id,
    };
    const serviceSecondary = await ServiceSecondary.create(data);

    res.status(201).json({
      ok: true,
      serviceSecondary,
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

export const getServicesSecondary = async (req: Request, res: Response) => {
  try {
    const services = await ServiceSecondary.findAll();

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

export const getServicesSecondaryByCategory: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const services = await ServiceSecondary.findAll({
      where: { category_secondary_id: id },
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

export const getServicesSecondaryById: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const services = await ServiceSecondary.findByPk(id);
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

export const updateserviceSecondary: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const { body } = req;
  let service = await ServiceSecondary.findByPk(id);

  if (!service) {
    return res.status(400).json({
      ok: false,
      msg: 'No se encontró este servicio',
    });
  }

  const [updatedRowsCount, updateService] = await ServiceSecondary.update(
    body,
    {
      where: { id },
      returning: true,
    },
  );
  if (updatedRowsCount === 0 || !updateService || updateService.length === 0) {
    return res.status(404).json({
      ok: false,
      msg: 'Cliente no encontrado o no actualizado',
    });
  }
  res.status(201).json({
    ok: true,
    msg: 'Servicio actualizado correctamente',
    service: updateService[0],
  });
};
