import { NextFunction, Request, Response } from 'express';
import Role from '../models/role';
import User from '../models/user';
import { validate as isUUID } from 'uuid';
import Client from '../models/client';

export const isValidRole = async (name = '') => {
  const roleExist = await Role.findOne({ where: { name } });
  if (!roleExist) {
    throw new Error(`El rol ${name}, no existe en la BD`);
  }
};

export const emailExist = async (email = '') => {
  const userExist = await User.findOne({ where: { email } });
  if (userExist) {
    throw new Error(`Este email de usuario: '${email}', ya existe en la bdd`);
  }
};

export const userByIdExist = async (id = '') => {
  // validUUID (id)
  const userByIdExist = await User.findByPk(id);
  if (!isUUID(id)) {
    throw new Error('ID de usuario no válido');
  }
  if (!userByIdExist /* || userByIdExist.state === false */) {
    throw new Error(`El usuario con ID '${id}', no esta registrdo en la  bdd`);
  }
};

export const clientByIdExist = async (id = '') => {
  if (!id) {
    throw new Error('ID de cliente no proporcionado');
  }
  if (!isUUID(id)) {
    throw new Error('ID de cliente no válido');
  }
  const client = await Client.findByPk(id);
  if (!client) {
    throw new Error(`El cliente con ID '${id}' no está registrado en la BD`);
  }
  return client;
};

export const validUUID = async (value: string): Promise<boolean> => {
  if (!isUUID(value)) {
    throw new Error('No es un UUID válido');
  }
  return true;
};
