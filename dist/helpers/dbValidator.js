"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizedCollection = exports.validUUID = exports.categoryByIdExist = exports.serviceByIdExist = exports.clientByIdExist = exports.userByIdExist = exports.emailExist = exports.isValidRole = void 0;
const role_1 = __importDefault(require("../models/role"));
const user_1 = __importDefault(require("../models/user"));
const uuid_1 = require("uuid");
const client_1 = __importDefault(require("../models/client"));
const models_1 = require("../models");
const isValidRole = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (name = '') {
    const roleExist = yield role_1.default.findOne({ where: { name } });
    if (!roleExist) {
        // throw new Error(`El rol ${name}, no existe en la BD`);
        throw new Error(`No tienes permiso para ejecutar esta acción`);
    }
});
exports.isValidRole = isValidRole;
const emailExist = (...args_2) => __awaiter(void 0, [...args_2], void 0, function* (email = '') {
    const userExist = yield user_1.default.findOne({ where: { email } });
    if (userExist) {
        throw new Error(`Este email de usuario: '${email}', ya existe en la bdd`);
    }
});
exports.emailExist = emailExist;
const userByIdExist = (...args_3) => __awaiter(void 0, [...args_3], void 0, function* (id = '') {
    const userByIdExist = yield user_1.default.findByPk(id);
    if (!(0, uuid_1.validate)(id)) {
        throw new Error('ID de usuario no válido');
    }
    if (!userByIdExist /* || userByIdExist.state === false */) {
        throw new Error(`El usuario con ID '${id}', no esta registrdo en la  bdd`);
    }
});
exports.userByIdExist = userByIdExist;
const clientByIdExist = (...args_4) => __awaiter(void 0, [...args_4], void 0, function* (id = '') {
    console.log('clientByIdExist:', id);
    if (!id) {
        throw new Error('ID de cliente no proporcionado');
    }
    if (!(0, uuid_1.validate)(id)) {
        throw new Error('ID de cliente no válido');
    }
    const client = yield client_1.default.findByPk(id);
    if (!client) {
        throw new Error(`El cliente con ID '${id}' no está registrado en la BD`);
    }
    return client;
});
exports.clientByIdExist = clientByIdExist;
const serviceByIdExist = (...args_5) => __awaiter(void 0, [...args_5], void 0, function* (id = '') {
    if (!id) {
        throw new Error('ID del servicio no proporcionado');
    }
    const service = yield models_1.Service.findByPk(id);
    if (!service) {
        throw new Error(`El ID del servicio no es válido.`);
    }
    return service;
});
exports.serviceByIdExist = serviceByIdExist;
const categoryByIdExist = (...args_6) => __awaiter(void 0, [...args_6], void 0, function* (id = '') {
    if (!id) {
        throw new Error('ID de la categoria no proporcionado');
    }
    const category = yield models_1.ServicesCategory.findByPk(id);
    if (!category) {
        throw new Error(`El ID la categoria no es válido.`);
    }
    return category;
});
exports.categoryByIdExist = categoryByIdExist;
const validUUID = (value) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(0, uuid_1.validate)(value)) {
        throw new Error('No es un UUID válido');
    }
    return true;
});
exports.validUUID = validUUID;
const authorizedCollection = (collection = '', collections = []) => {
    const include = collections.includes(collection);
    if (!include) {
        throw new Error(`La coleccion ${collection} no es permitida, - ${collections} `);
    }
    return true;
};
exports.authorizedCollection = authorizedCollection;
//# sourceMappingURL=dbValidator.js.map