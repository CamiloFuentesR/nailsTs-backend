import { Request, RequestHandler, Response } from 'express';
import { Client, ClientInstance, User } from '../models';
import { json } from 'sequelize';

const showAllClient = async (
  req: Request,
  res: Response,
  state: boolean | '',
) => {
  try {
    if (state === '') {
      const client = await Client.findAll();
      return !client
        ? res.status(409).json({
            ok: false,
            msg: 'No se encontraron clientes registradios',
          })
        : res.status(200).json({
            ok: true,
            msg: 'Se obtuvieron todos los clientes con éxito',
            client,
          });
    }
    const client = await Client.findAll({ where: { state } });
    if (!client) {
      return res.status(409).json({
        ok: false,
        msg: 'No se encontraron clientes',
      });
    }

    return res.status(200).json({
      ok: true,
      msg: state
        ? 'Se obtuvieron Clientes activos con éxito'
        : 'Se obtuvieron clientes inactivos con éxito',
      client,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

export const showAllClientActive: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  showAllClient(req, res, true);
};

export const showAllClientInActive: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  showAllClient(req, res, false);
};

export const showAllCliens: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  showAllClient(req, res, '');
};

export const showClientById: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(409).json({
        ok: false,
        msg: 'No se encontraron clientes',
      });
    }
    return res.status(200).json({
      ok: true,
      client,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

export const showClientByUserId: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const client = await Client.findOne({
      where: { user_id: id },
      attributes: ['id', 'name', 'phone_number', 'img'],
    });
    if (!client) {
      return res.status(203).json({
        ok: false,
        msg: 'Se le recuerda ingresar sus datos de contacto',
      });
    }
    return res.status(200).json({
      ok: true,
      client,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

export const createClient: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.user;
  try {
    let client: ClientInstance | null = await Client.findOne({
      where: { user_id: id },
    });
    if (client) {
      return res.status(409).json({
        ok: false,
        msg: 'El cliente ya existe',
      });
    }
    client = Client.build(req.body);
    client.user_id = id;
    const clientSave = await client.save();
    const [afectedRowUser, [userUpdate]] = await User.update(
      { role_id: 2 },
      {
        where: { id },
        returning: true,
      },
    );

    res.status(201).json({
      ok: true,
      msg: 'usuario creado con éxito',
      client: clientSave,
      userUpdate,
    });
  } catch (error: any) {
    console.log(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        ok: false,
        msg: 'Este cliente ya existe',
      });
    }
    res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

export const updateClient: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params; // ID del cliente a actualizar
  const { body } = req;

  try {
    // Actualiza el cliente
    const [updatedRowsCount, updatedClients] = await Client.update(body, {
      where: { id },
      returning: true,
    });

    // Verifica si el cliente fue actualizado
    if (
      updatedRowsCount === 0 ||
      !updatedClients ||
      updatedClients.length === 0
    ) {
      return res.status(404).json({
        ok: false,
        msg: 'Cliente no encontrado o no actualizado',
      });
    }

    const updatedClient = updatedClients[0];
    const userId = updatedClient.user_id; // Obtiene el user_id del cliente actualizado

    // Obtiene el usuario relacionado
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado',
      });
    }

    // Solo actualiza el role_id si no es 1
    let updatedUser;
    if (user.role_id !== 1) {
      const [updatedRowsCountUser, updatedUserArray] = await User.update(
        { role_id: 2 }, // Cambia según tus necesidades
        {
          where: { id: userId }, // Usa user_id del cliente
          returning: true,
        },
      );
      if (
        updatedRowsCountUser === 0 ||
        !updatedUserArray ||
        updatedUserArray.length === 0
      ) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuario no encontrado o no actualizado',
        });
      }
      updatedUser = updatedUserArray[0];
    } else {
      updatedUser = user; // Mantiene el usuario sin cambios
    }

    return res.status(200).json({
      ok: true,
      msg: 'Cliente y usuario actualizados correctamente',
      client: updatedClient,
      updatedUser,
    });
  } catch (error: any) {
    console.error('Error al actualizar el cliente:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error interno del servidor al actualizar el cliente',
      error: error.message,
    });
  }
};
