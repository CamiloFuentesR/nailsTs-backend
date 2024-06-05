import { Request, RequestHandler, Response } from 'express';
import { Role } from '../models';

export const getRoles: RequestHandler = async (req: Request, res: Response) => {
  const roles = await Role.findAll();
  if (!roles) {
    return res.status(404).json({
      ok: false,
      msg: 'No se encontraron roles',
    });
  }
  return res.status(200).json({
    ok: true,
    roles,
  });
};

export const createRoles: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const roles = await Role.findAll();
};
