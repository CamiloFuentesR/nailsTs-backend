import { Request, RequestHandler, Response } from 'express';
import { ServicesCategory } from '../models';

export const getServicesCategory: RequestHandler = async (
  req: Request,
  res: Response,
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

export const createServicesCategory: RequestHandler = async (req, res) => {
  const name = req.body.name?.toUpperCase();

  if (!name || name.trim() === '') {
    return res.status(400).json({
      ok: false,
      msg: 'El nombre no puede estar vacío',
    });
  }

  try {
    const categoryExist = await ServicesCategory.findOne({ where: { name } });
    if (categoryExist) {
      return res.status(409).json({
        ok: false,
        msg: 'Ya existe una categoría con ese nombre',
      });
    }

    // Asigna valores predeterminados a los campos obligatorios

    const data = {
      name,
      state: req.body.state || 'active', // Valor predeterminado si no se envía
      information: req.body.information || null, // Campo opcional
      img: req.body.img || null, // Campo opcional
    };

    const category = await ServicesCategory.create(data);

    res.status(201).json({
      ok: true,
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error al crear la categoría',
    });
  }
};

export const showServiceCategoryById: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const category = await ServicesCategory.findByPk(id);
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

export const updateServicesCategory: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const { body } = req;

  // Buscar la categoría del servicio
  const serCat = await ServicesCategory.findByPk(id);

  // Si no existe el servicio, devolver un error
  if (!serCat) {
    return res.status(401).json({
      ok: false,
      msg: 'Servicio_categoria - no existe',
    });
  }
  console.log(body.state);
  // Conversión de state de 1/2 a booleano
  if (Number(body.state) === 1) {
    console.log('true');
    body.state = true;
  } else if (Number(body.state) === 2) {
    console.log('false');
    body.state = false;
  } else if (typeof body.state === 'string') {
    body.state = body.state.toLowerCase() === 'true';
  }
  console.log(body.state);

  // Eliminar el ID del body para la actualización
  const { id: _, ...bodyWithoutId } = body;

  // Actualizar la categoría del servicio
  const [updatedRowsCount, updatedServiceCategoryArray] =
    await ServicesCategory.update(bodyWithoutId, {
      where: { id },
      returning: true,
    });

  // Verificar si se actualizó el servicio
  if (updatedRowsCount === 0) {
    return res.status(404).json({
      ok: false,
      msg: 'Servicio no encontrado o no actualizado',
    });
  }

  // Devolver la respuesta con el servicio actualizado
  return res.status(200).json({
    ok: true,
    body: updatedServiceCategoryArray,
  });
};
