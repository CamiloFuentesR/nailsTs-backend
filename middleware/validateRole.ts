import { NextFunction, Request, RequestHandler, Response } from 'express';

export const isAdminRole: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.role) {
    return res.status(500).json({
      ok: false,
      msg: 'Token - Se quiere verifcar el rol sin validar el token',
    });
  }
  const role = req.role;

  if (role !== 'ADMIN_ROLE') {
    return res.status(401).json({
      ok: false,
      msg: ` '${req.user.Client.name}' no es un Administrador autorizado`,
    });
  }
  next();
};

export const haveRole: RequestHandler = (...roles: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(500).json({
        msg: 'Se quiere verifcar el rol sin validar el token',
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(401).json({
        msg: 'El usuario no contiene un rol válido para ejecutar esta acción',
      });
    }
    next();
  };
};
