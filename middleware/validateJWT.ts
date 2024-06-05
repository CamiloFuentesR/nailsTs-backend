import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import User from '../models/user';
import Role from '../models/role';
import Client from '../models/client';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      role?: any;
    }
  }
}

export const validateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header('x-token-authorize');
  if (!token)
    return res.status(401).json({
      msg: 'Token no válido - no posee token',
    });
  const secretKey: Secret | undefined = process.env.SECRET_KEY || undefined;
  if (!secretKey) {
    return res.status(500).json({
      msg: 'Token no válido - La clave secreta no está definida en la configuración',
    });
  }

  try {
    // const { id } = jwt.verify(token, secretKey) as JwtPayload;
    const payload = jwt.verify(token, secretKey) as JwtPayload;
    const { id } = payload; //--> se obtiene la id desde el token
    const authenticatedUser = await User.findByPk(id, {
      include: [
        Client,
        {
          model: Role,
          attributes: ['name'],
        },
      ],
    });
    if (!authenticatedUser) {
      return res.status(401).json({
        mgs: 'Token no válido - usuario no encontrado en la BD',
      });
    }
    if (!authenticatedUser.state) {
      return res.status(401).json({
        msg: 'Token no válido - usuario eliminado',
      });
    }
    req.user = authenticatedUser;
    req.role = authenticatedUser.dataValues.Role?.name;
    next();
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      msg: 'Error interno del servidor',
      error: error.message,
    });
  }
};
