import { Request, RequestHandler, Response } from 'express';
import { Client, ClientInstance } from '../models';
import { deleteUserAndClientState } from '../services/deleteUserClient';

const showAllClient = async (
  req: Request,
  res: Response,
  state: boolean | ''
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
            msg: 'Get Clients all',
            client,
          });
    }
    console.log(state);
    console.log('entra aqui');
    const client = await Client.findAll({ where: { state } });
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

export const showAllClientActive: RequestHandler = async (
  req: Request,
  res: Response
) => {
  showAllClient(req, res, true);
};

export const showAllClientInActive: RequestHandler = async (
  req: Request,
  res: Response
) => {
  showAllClient(req, res, false);
};

export const showAllCliens: RequestHandler = async (
  req: Request,
  res: Response
) => {
  showAllClient(req, res, '');
};

export const showClientById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const client = await Client.findAll({ where: { id } });
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

export const createClient: RequestHandler = async (
  req: Request,
  res: Response
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
    res.status(201).json({
      ok: true,
      msg: 'usuario creado con éxito',
      client: clientSave,
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
  res: Response
) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const [updatedRowsCount, updatedClients] = await Client.update(body, {
      where: { id },
      returning: true,
    });
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
    return res.status(200).json({
      ok: true,
      msg: 'Cliente actualizado correctamente',
      client: updatedClients[0],
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
