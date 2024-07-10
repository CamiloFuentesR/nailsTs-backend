import { Request, RequestHandler, Response } from 'express';
import bcrypt from 'bcrypt';
import generateJWT from '../helpers/generateJWT';
import { Role, User, UserInstance } from '../models';

export const login: RequestHandler = async (req: Request, res: Response) => {
  let { password, email } = req.body;

  try {
    const user: UserInstance | null = await User.findOne({
      where: { email },
      include: [{ model: Role, attributes: ['name'] }],
    });
    if (!user) {
      return res.status(400).json({
        msg: 'Usuario o contraseña incorrecto',
      });
    }
    if (!user.state) {
      return res.status(400).json({
        msg: 'Usuario inhabilitado',
      });
    }

    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      return res.status(400).json({
        msg: 'Usuario o contraseña incorrecto',
      });
    }
    const { id } = user;
    const roleName = user.dataValues.Role?.name || 'unknown';
    const token = await generateJWT(id, email, roleName);
    res.json({
      ok: true,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'Hable con el admin',
    });
  }
};

export const renewToken: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id, email } = req.user;
  const role = req.role;
  // Generar un nuevo token después de revalidar el token anterior
  const token = await generateJWT(id, email, role);
  res.status(201).json({
    ok: true,
    token,
  });
};
