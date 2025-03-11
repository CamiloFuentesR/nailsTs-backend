import Role from '../models/role';
import User from '../models/user';
import { validate as isUUID } from 'uuid';
import Client from '../models/client';
import { Service, ServicesCategory } from '../models';

export const isValidRole = async (name = '') => {
  const roleExist = await Role.findOne({ where: { name } });
  if (!roleExist) {
    // throw new Error(`El rol ${name}, no existe en la BD`);
    throw new Error(`No tienes permiso para ejecutar esta acción`);
  }
};

export const emailExist = async (email = '') => {
  const userExist = await User.findOne({ where: { email } });
  if (userExist) {
    throw new Error(`Este email de usuario: '${email}', ya existe en la bdd`);
  }
};

export const userByIdExist = async (id = '') => {
  const userByIdExist = await User.findByPk(id);
  if (!isUUID(id)) {
    throw new Error('ID de usuario no válido');
  }
  if (!userByIdExist /* || userByIdExist.state === false */) {
    throw new Error(`El usuario con ID '${id}', no esta registrdo en la  bdd`);
  }
};

export const clientByIdExist = async (id = '') => {
  console.log('clientByIdExist:', id);
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

export const serviceByIdExist = async (id = '') => {
  if (!id) {
    throw new Error('ID del servicio no proporcionado');
  }
  const service = await Service.findByPk(id);
  if (!service) {
    throw new Error(`El ID del servicio no es válido.`);
  }
  return service;
};
export const categoryByIdExist = async (id = '') => {
  if (!id) {
    throw new Error('ID de la categoria no proporcionado');
  }
  const category = await ServicesCategory.findByPk(id);
  if (!category) {
    throw new Error(`El ID la categoria no es válido.`);
  }
  return category;
};

export const validUUID = async (value: string): Promise<boolean> => {
  if (!isUUID(value)) {
    throw new Error('No es un UUID válido');
  }
  return true;
};

export const authorizedCollection = (
  collection = '',

  collections: string[] = [],
) => {
  console.log('authorize');
  console.log(collection);
  const include = collections.includes(collection);
  if (!include) {
    throw new Error(
      `La coleccion ${collection} no es permitida, - ${collections} `,
    );
  }

  return true;
};
