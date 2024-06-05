import { Request, RequestHandler, Response } from 'express';
// import User, { UserInstance } from '../models/user';
import bcrypt from 'bcrypt';
import generateJWT from '../helpers/generateJWT';
import { User, UserInstance } from '../models';
// import User,{ UserInstance } from '../models/';
// import { UserInstance } from '../models/user';

export const login: RequestHandler = async (req: Request, res: Response) => {
  let { password, email } = req.body;

  try {
    const user: UserInstance | null = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        msg: 'El usuario ingresado no existe',
      });
    }
    if (!user.state) {
      return res.status(400).json({
        msg: 'Usuario inhabilitado',
      });
    }

    // Verificar password
    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      return res.status(400).json({
        msg: 'Password incorrecto',
      });
    }
    const { id, role_id } = user;
    const token = await generateJWT(id, email, role_id);
    res.json({
      msg: 'Login ok',
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: 'Hable con el admin',
    });
  }
};

export const renewToken: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id, email, role } = req.user;
  // Generar un nuevo token después de revalidar el token anterior
  const token = await generateJWT(id, email, role);
  res.status(201).json({
    token,
  });
};
