import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import User from "../models/user"

declare global {
    namespace Express {
        interface Request {
            user?: any; // Tipo de user puede ser cualquier cosa, ajusta según tus necesidades
        }
    }
}

export const validateJWT = async (req: Request, res: Response, next: NextFunction) => {

    const token = req.header('x-token-authorize')
    if (!token)
        return res.status(401).json({
            msg: 'Token no válido - no posee token'
        })
    const secretKey: Secret | undefined = process.env.SECRET_KEY || undefined;
    if (!secretKey) {
        return res.status(500).json({
            msg: 'Token no válido - La clave secreta no está definida en la configuración'
        });
    }

    try {
        // const { id } = jwt.verify(token, secretKey) as JwtPayload;
        const payload = jwt.verify(token, secretKey) as JwtPayload;
        const { id } = payload; //--> se obtiene la id desde el token
        const authenticatedUser = await User.findByPk(id);
        if (!authenticatedUser) {
            return res.status(401).json({
                mgs: 'Token no válido - usuario no encontrado en la BD'
            });
        }
        if (!authenticatedUser.dataValues.state) {
            return res.status(401).json({
                msg: 'Token no válido - usuario eliminado'
            });
        }
        req.user = authenticatedUser;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'No posee token válido para realizar esta acción'
        });
    }
}