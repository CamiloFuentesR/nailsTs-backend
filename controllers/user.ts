import { Request, Response } from "express"
import Users from "../models/user"
import bcrypt from 'bcrypt'
import generateJWT from "../helpers/generateJWT"
import Client from "../models/client";
import Role from "../models/role";
import { deleteUserAndClientState } from "../services/deleteUserClient";

export const getUsersActive = async (req: Request, res: Response) => {
    try {
        const users = await Users.findAll({
            where: { state: true },
            include: [
                {
                    model: Client,
                    // attributes: ['id', 'name', 'phone_number', 'state'],
                },
                {
                    model: Role,
                    attributes: ['name']
                }
            ],
        });

        if (users.length === 0) {
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
export const getUsersInactive = async (req: Request, res: Response) => {

    try {
        const users = await Users.findAll({
            where: { state: false },
            include: [
                {
                    model: Client,

                    // attributes: ['id', 'name', 'phone_number', 'state'],
                },
                {
                    model: Role,
                    attributes: ['name']
                }
            ],
        });

        if (users.length === 0) {
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

export const getUserByid = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userWithClients = await Users.findByPk(id, {
        include: [Client,
            {
                model: Role,
                attributes: ['name']
            }
        ],
    });
    console.log(userWithClients);
    res.json({
        ok: true,
        msg: 'getUser',
        user: userWithClients
    })
}

export const createtUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
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

        res.status(201).json({
            ok: true,
            msg: 'usuario creado con éxito',
            user: userSave,
            token,
        })
    } catch (error: any) {
        res.status(500).json({
            ok: false,
            msg: error
        })
    }

}

export const updateUser = async (req: Request, res: Response) => {

    const { id } = req.params;
    const { body } = req;
    try {
        const user = await Users.update(
            body
            , {
                where: { id },
                returning: true
            })
        console.log('user');
        res.json({
            msg: 'postUser',
            user: user,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msj: error
        })
    }

}

export const deleteUser = async (req: Request, res: Response) => {

    const { id } = req.params;
    try {
        const client = await Client.findOne({ where: { user_id: id } });
        if (client) {
            await deleteUserAndClientState(id);
            const { name } = client;
            res.status(200).json({
                ok: true,
                msg: `El cliente ' ${name} ' ha sido eliminado`
            })
        } else {
            await Users.update(
                { state: false },
                { where: { id } }
            );
            res.status(400).json({
                ok: true,
                msg: 'El usuario ha sido eliminado'
            })

        }

    } catch (error: any) {
        console.error('Error al eliminar cliente:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error en el servidor',
            error: error.message
        });
    }
}