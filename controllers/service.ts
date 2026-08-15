import { Response, Request, RequestHandler } from 'express';
import { Service, ServicesCategory } from '../models';

/**
 * Traduce a booleano lo que venga en el cuerpo para es_complemento.
 *
 * Devuelve undefined cuando el campo no viene o no se entiende, y ese undefined
 * es la señal de "no lo toques": al crear deja que aplique el DEFAULT false de
 * la columna, y al actualizar deja el valor que el servicio ya tenía.
 *
 * A propósito no acepta 1/2 como state, donde el 2 es false porque viene de un
 * <select>. Mezclar las dos convenciones en el mismo cuerpo se presta para
 * guardar true donde iba false; el panel manda un booleano de verdad.
 */
const leerEsComplemento = (valor: unknown): boolean | undefined => {
  if (typeof valor === 'boolean') return valor;
  if (valor === 'true') return true;
  if (valor === 'false') return false;
  return undefined;
};

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
      where: { services_category_id: id, state: true },
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
  const { name, price, services_category_id, duration, es_complemento } =
    req.body;

  if (name === '') {
    return res.status(401).json({
      ok: false,
      msg: 'El nombre no puede estar vacío',
    });
  } else if (services_category_id === '') {
    return res.status(401).json({
      ok: false,
      msg: 'La id no puede estar vacía',
    });
  } else if (price === '') {
    return res.status(401).json({
      ok: false,
      msg: 'El precio no puede estar vacío',
    });
  }

  try {
    const serviceExist = await Service.findOne({ where: { name } });

    if (serviceExist) {
      return res.status(404).json({
        ok: false,
        msg: 'Ya existe un servicio con ese nombre',
      });
    }

    const data = {
      name,
      price,
      duration,
      state: true,
      // Si el cuerpo no lo trae queda undefined, y ahí Sequelize aplica el
      // defaultValue del modelo: el servicio nace como principal.
      es_complemento: leerEsComplemento(es_complemento),
      services_category_id,
    };

    const service = await Service.create(data);

    // Consulta el servicio recién creado para incluir la categoría
    const serviceWithCategory = await Service.findByPk(service.id, {
      include: [
        {
          model: ServicesCategory,
          as: 'category',
        },
      ],
    });

    return res.status(201).json({
      ok: true,
      service: serviceWithCategory,
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

export const updateService: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  let { body } = req;

  if (body.state === 1) {
    body.state = true;
  } else if (body.state === 2) {
    body.state = false;
  }

  // Crear una copia del cuerpo y excluir el campo `id`
  const { id: _, ...bodyWithoutId } = body;

  // El campo que no viene tiene que quedar como está. Sequelize ya resuelve el
  // undefined (Model.update descarta esas claves antes de armar el SET), pero
  // un null o un '' sí llegarían a la consulta, y la columna es NOT NULL: la
  // administradora que solo edita el precio desmarcaría el complemento sin
  // darse cuenta, o se llevaría un 500. Por eso se saca la clave salvo que
  // traiga un booleano legible.
  const esComplemento = leerEsComplemento(bodyWithoutId.es_complemento);
  if (esComplemento === undefined) {
    delete bodyWithoutId.es_complemento;
  } else {
    bodyWithoutId.es_complemento = esComplemento;
  }

  try {
    // Buscar el servicio por su id
    let service = await Service.findByPk(id);

    if (!service) {
      return res.status(400).json({
        ok: false,
        msg: 'No se encontró este servicio',
      });
    }

    // Actualizar el servicio con los nuevos datos
    const [updatedRowsCount] = await Service.update(bodyWithoutId, {
      where: { id },
    });

    // Verificar si la actualización se realizó correctamente
    if (updatedRowsCount === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'Servicio no encontrado o no actualizado',
      });
    }

    // Obtener el servicio actualizado con su categoría
    const updatedService = await Service.findByPk(id, {
      include: [
        {
          model: ServicesCategory,
          as: 'category',
        },
      ],
    });

    return res.status(201).json({
      ok: true,
      msg: 'Servicio actualizado correctamente',
      service: updatedService,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error interno del servidor',
    });
  }
};
