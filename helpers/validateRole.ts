import { NextFunction, Request, Response } from "express";



exports.isAdminRole = (req: Request, res: Response, next: NextFunction) => {

    if (!req.user) {
        return res.status(500).json({
            msg: 'Se quiere verifcar el rol sin validar el token'
        });
    }
    const { role, name } = req.user;

    if (role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            msg: ` '${name}' no es un Administrador autorizado`
        });
    }
    next();
}

export const haveRole = (...roles: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(500).json({
                msg: 'Se quiere verifcar el rol sin validar el token'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(401).json({
                msg: 'El usuario no contiene un rol válido para ejecutar esta acción'
            })
        }
        next();
    }
}