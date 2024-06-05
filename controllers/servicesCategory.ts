import { Request, RequestHandler, Response } from 'express';
import { ServicesCategory } from '../models';

export const getServicesCategory: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const serCat = await ServicesCategory.findAll();
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

export const createServicesCategory: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const name = req.body.name.toUpperCase();
  if (name === '') {
    return res.status(401).json({
      ok: false,
      msg: 'El nombre no puede estar vacío',
    });
  }
  try {
    const categoryExist = await ServicesCategory.findOne({ where: { name } });
    if (categoryExist) {
      return res.status(404).json({
        ok: false,
        msg: 'Ya existe una categoría con ese nombre',
      });
    }
    const data = {
      name,
    };
    const category = await ServicesCategory.create(data);

    res.status(201).json({
      ok: true,
      category,
    });
  } catch (error) {
    console.error(error);
  }
};

export const updateServicesCategory: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const { body } = req;
  const serCat = await ServicesCategory.findByPk(id);

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
