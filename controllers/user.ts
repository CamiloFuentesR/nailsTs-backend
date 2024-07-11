import { Request, RequestHandler, Response } from 'express';
import { UserInstance } from '../models/user';
import bcrypt from 'bcrypt';
import generateJWT from '../helpers/generateJWT';
import { deleteUserAndClientState } from '../services/deleteUserClient';
import { Client, Role, User } from '../models';
import { activeUserAndClientState } from '../services/activeUserCLient';
import { updateUserAndClientState } from '../services/updateUserClient';

export const getUsersActive: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const users = await User.findAll({
      where: { state: true },
      include: [
        {
          model: Client,
        },
        {
          model: Role,
          attributes: ['name'],
        },
      ],
    });
    if (users.length === 0) {
      return res.status(400).json({
        msg: 'No hay usuarios',
      });
    }
    res.json({
      msg: 'getUsers',
      users,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      msg: error,
    });
  }
};

export const getUsersInactive: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const users = await User.findAll({
      where: { state: false },
      include: [
        {
          model: Client,
        },
        {
          model: Role,
          attributes: ['name'],
        },
      ],
    });
    if (users.length === 0) {
      return res.status(400).json({
        msg: 'No hay usuarios',
      });
    }
    res.json({
      msg: 'getUsers',
      users,
    });
  } catch (error: any) {
    // throw new Error(error)

    return res.status(500).json({
      msg: error,
    });
  }
};

export const getUserByid: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const userWithClients = await User.findByPk(id, {
    include: [
      Client,
      {
        model: Role,
        attributes: ['name'],
      },
    ],
  });
  res.json({
    ok: true,
    msg: 'getUser',
    user: userWithClients,
  });
};

export const createUser: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { email, password } = req.body;
  try {
    let user: UserInstance | null = await User.findOne({
      where: { email },
      include: [{ model: Role, attributes: ['name'] }],
    });
    if (user) {
      return res.status(401).json({
        state: 'error',
        msg: 'El usuario ya existe',
      });
    }

    user = User.build(req.body);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.role_id = 2;
    user.state = true;
    const roleName = user.dataValues.Role?.name || 'unknown';
    const userSave = await user.save();
    const token = await generateJWT(user.id, user.email, 'USER_ROLE');

    res.status(201).json({
      ok: true,
      msg: 'usuario creado con éxito',
      user: userSave,
      token,
    });
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      msg: error,
    });
  }
};

export const updateUser: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const { body } = req;
  updateUserAndClientState(id, body, res);
};

export const deleteUser: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;

  try {
    await deleteUserAndClientState(id, res);
  } catch (error: any) {
    console.error('Error al eliminar cliente:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error en el servidor',
      error: error.message,
    });
  }
};
export const activeteUser: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;

  try {
    await activeUserAndClientState(id, res);
  } catch (error: any) {
    console.error('Error al activar cliente:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error en el servidor',
      error: error.message,
    });
  }
};
