import { Request, Response } from "express"
import User from "../models/user";
import bcrypt from 'bcrypt';
import generateJWT from "../helpers/generateJWT";
import Client from '../models/client';

export const login = async (req: Request, res: Response) => {

    let { password, email } = req.body;
    email = req.body.email.toLowerCase();
    try {
        //verificar email
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(400).json({
                msg: 'Se ha ingesado un Email no existente'
            })
        }
        //verificar usuario activo
        if (!user.dataValues.state) {
            return res.status(400).json({
                msg: 'Usuario inhabilitado'
            });
        }

        //verificar pssword
        const validatePassword = await bcrypt.compare(password, user.dataValues.password);

        if (!validatePassword) {
            return res.status(400).json({
                msg: 'Password incorrecto'
            });
        }
        const { id, name, role_id } = user.dataValues;
        const token = await generateJWT(id, name, role_id);
        res.json({
            msg: 'Login ok',
            token
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'Hable con el admin'
        })
    }
}

export const renewToken = async (req: Request, res: Response) => {

    const { id, name, role } = req.user;
    //generar un nuevo token despues de revalidar el token anterior
    const token = await generateJWT(id, name, role);
    res.status(201).json({
        token,
    })
};