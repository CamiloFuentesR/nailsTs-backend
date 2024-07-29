import { Request, RequestHandler, Response } from 'express';
import { ServicesCategorySecondary } from '../models';

export const createServicesCategorySecondary: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const name = req.body.name.toUpperCase();
  if (name === '') {
    return res.status(401).json({
      ok: false,
      msg: 'El nombre no puede estar vacío',
    });
  }
  try {
    const categoryExist = await ServicesCategorySecondary.findOne({
      where: { name },
    });
    if (categoryExist) {
      return res.status(404).json({
        ok: false,
        msg: 'Ya existe una categoría con ese nombre',
      });
    }
    const data = {
      name,
    };
    const categorySecondary = await ServicesCategorySecondary.create(data);

    res.status(201).json({
      ok: true,
      categorySecondary,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getServicesCategorySecondary: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const serCat = await ServicesCategorySecondary.findAll();
    if (serCat.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'Servicios_categorias - no se encontraron resultados',
      });
    }
    res.status(200).json({
      ok: true,
      serCat,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error del servidor',
    });
  }
};

export const showServiceCategorySecondaryById: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const category = await ServicesCategorySecondary.findByPk(id);
    if (!category) {
      return res.status(409).json({
        ok: false,
        msg: 'No se encontraron categorias',
      });
    }
    return res.status(200).json({
      ok: true,
      category,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

export const updateServicesCategorySecondary: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const { body } = req;
  const serCat = await ServicesCategorySecondary.findByPk(id);

  if (!serCat) {
    return res.status(401).json({
      ok: false,
      msg: 'Servicio_categoria - no exixte',
    });
  }

  return res.status(200).json({
    ok: true,
    serCat,
    body,
  });
};
