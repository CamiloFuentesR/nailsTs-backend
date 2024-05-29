import { Request, Response } from "express"
import Users from "../models/user"
import bcrypt from 'bcrypt'
import generateJWT from "../helpers/generateJWT"
import { jwtDecode } from 'jwt-decode';
import Client from "../models/client";
import Role from "../models/role";

export const getUsers = async (req: Request, res: Response) => {

    try {
        const users = await Users.findAll({
            include: [Client,
                {
                    model: Role,
                    attributes: ['name']
                }
            ],
        });

        if (!users) {
            return res.status(400).json({
                msg: 'No hay usuarios'
            })
        }

        res.json({
            msg: 'getUsers',
            users
        })
    } catch (error: any) {
        // throw new Error(error)

        return res.status(500).json({
            msg: error
        })
    }

}
export const getUser = async (req: Request, res: Response) => {

    const { id } = req.params;
    // const clientWithUser = await Client.findByPk(id, {
    //     include: Users
    //   });
    const userWithClients = await Users.findByPk(id, {
        include: [Client,
            {
                model: Role,
                attributes: ['name']
            }
        ],

    });

    res.json({
        msg: 'getUser',
        user: userWithClients
    })
}
export const createtUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (email === '' && password === '') {
        return res.status(401).json({
            ok: false,
            msg: 'No se pueden ingresar campos vacíos'
        })
    }
    try {

        let user = await Users.findOne({ where: { email } })
        if (user) {
            return (
                res.status(401).json({
                    state: 'error',
                    msg: 'El usuario ya existe',
                })
            )
        }

        user = Users.build(req.body);
        const salt = await bcrypt.genSalt(10);
        user.dataValues.password = await bcrypt.hash(password, salt);
        user.dataValues.role_id = 1;
        user.dataValues.state = true;

        const userSave = await user.save();
        const token = await generateJWT(user.dataValues.id, user.dataValues.name, user.dataValues.role_id);
        const decodedToken = jwtDecode("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI1OGIzMWJhLWI2YjUtNDQzMy05Y2FhLTc2NmNkZjhlMzNmOSIsIm5hbWUiOiIiLCJyb2xlIjoxLCJpYXQiOjE3MTY5MDcxODksImV4cCI6MTcxNjkxMDc4OX0.wpjkU-PtlTLV1ACkD-DwBk2PqhZsfYX1hZlxjWZP-nU");

        res.status(201).json({
            ok: false,
            msg: 'usuario creado con éxito',
            user: userSave,
            token,
            decodedToken
        })
    } catch (error: any) {
        res.status(500).json({
            ok: false,
            msg: error
        })
    }

}
export const updateUser = (req: Request, res: Response) => {

    const { body } = req;
    res.json({
        msg: 'postUser',
        body,
    })
}
