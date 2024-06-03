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
exports.validUUID = exports.userByIdExist = exports.emailExist = exports.isValidRole = void 0;
const role_1 = __importDefault(require("../models/role"));
const user_1 = __importDefault(require("../models/user"));
const uuid_1 = require("uuid");
const isValidRole = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (role = '') {
    const roleExist = yield role_1.default.findOne({ where: { role } });
    if (!roleExist) {
        throw new Error(`El rol ${role}, no existe en la BD`);
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
    // validUUID (id)
    const userByIdExist = yield user_1.default.findByPk(id);
    if (!(0, uuid_1.validate)(id)) {
        throw new Error('No es un UUID válido');
    }
    if (!userByIdExist /* || userByIdExist.state === false */) {
        throw new Error(`Este id de usuario: '${id}', no esta registrdo en la  bdd`);
    }
});
exports.userByIdExist = userByIdExist;
const validUUID = (value) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(0, uuid_1.validate)(value)) {
        throw new Error('No es un UUID válido');
    }
    return true;
});
exports.validUUID = validUUID;
//# sourceMappingURL=dbValidator.js.map