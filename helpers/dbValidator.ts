import { NextFunction, Request, Response } from "express";
import Role from "../models/role"
import User from "../models/user";
import { validate as isUUID } from 'uuid';


export const isValidRole = async (role = '') => {
    const roleExist = await Role.findOne({ where: { role } });
    if (!roleExist) {
        throw new Error(`El rol ${role}, no existe en la BD`)
    }
}


export const emailExist = async (email = '') => {
    const userExist = await User.findOne({ where: { email } });
    if (userExist) {
        throw new Error(`Este email de usuario: '${email}', ya existe en la bdd`);

    }
}

export const userByIdExist = async (id = '') => {

    // validUUID (id)
    const userByIdExist = await User.findByPk(id);
    if (!isUUID(id)) {
        throw new Error('No es un UUID válido');
    }
    if (!userByIdExist /* || userByIdExist.state === false */) {
        throw new Error(`Este id de usuario: '${id}', no esta registrdo en la  bdd`);
    }
}

export const validUUID = async (value: string): Promise<boolean> => {
    if (!isUUID(value)) {
        throw new Error('No es un UUID válido');
    }
    return true;
}

