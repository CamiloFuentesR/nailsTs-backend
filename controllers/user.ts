import { Request, RequestHandler, Response } from 'express';
import { UserInstance } from '../models/user';
import bcrypt from 'bcrypt';
import generateJWT from '../helpers/generateJWT';
import { deleteUserAndClientState } from '../services/deleteUserClient';
import { Client, Role, User } from '../models';

export const getUsersActive: RequestHandler = async (
  req: Request,
  res: Response
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
  res: Response
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
  res: Response
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
  console.log(userWithClients);
  res.json({
    ok: true,
    msg: 'getUser',
    user: userWithClients,
  });
};

export const createUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { email, password } = req.body;
  try {
    let user: UserInstance | null = await User.findOne({ where: { email } });
    if (user) {
      return res.status(401).json({
        state: 'error',
        msg: 'El usuario ya existe',
      });
    }

    user = User.build(req.body);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.role_id = 1;
    user.state = true;

    const userSave = await user.save();
    const token = await generateJWT(user.id, user.email, user.role_id);

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
  res: Response
) => {
  const { id } = req.params;
  const { body } = req;
  try {
    const user = await User.update(body, {
      where: { id },
      returning: true,
    });
    res.json({
      msg: 'postUser',
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msj: error,
    });
  }
};

export const deleteUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const client = await Client.findByPk(id);
    if (client) {
      await deleteUserAndClientState(id);
      const { name } = client;
      res.status(200).json({
        ok: true,
        msg: `El cliente ' ${name} ' ha sido eliminado`,
      });
    } else {
      const user = await User.update(
        { state: false },
        { where: { id }, returning: true }
      );
      res.status(400).json({
        ok: true,
        // msg: `El ${user.email} usuario ha sido eliminado`,
        user: user[1],
      });
    }
  } catch (error: any) {
    console.error('Error al eliminar cliente:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error en el servidor',
      error: error.message,
    });
  }
};

export const activarUsuario: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const client = await Client.findByPk(id);
    if (client) {
      await deleteUserAndClientState(id);
      const { name } = client;
      res.status(200).json({
        ok: true,
        msg: `El cliente ' ${name} ' ha sido eliminado`,
      });
    } else {
      const user = await Client.update(
        { state: false },
        { where: { id }, returning: true }
      );
      res.status(400).json({
        ok: true,
        // msg: `El ${user.email} usuario ha sido eliminado`,
        user: user[1],
      });
    }
  } catch (error: any) {
    console.error('Error al eliminar cliente:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error en el servidor',
      error: error.message,
    });
  }
};
