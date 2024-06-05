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
exports.renewToken = exports.login = void 0;
// import User, { UserInstance } from '../models/user';
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateJWT_1 = __importDefault(require("../helpers/generateJWT"));
const models_1 = require("../models");
// import User,{ UserInstance } from '../models/';
// import { UserInstance } from '../models/user';
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { password, email } = req.body;
    try {
        const user = yield models_1.User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({
                msg: 'El usuario ingresado no existe',
            });
        }
        if (!user.state) {
            return res.status(400).json({
                msg: 'Usuario inhabilitado',
            });
        }
        // Verificar password
        const validatePassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validatePassword) {
            return res.status(400).json({
                msg: 'Password incorrecto',
            });
        }
        const { id, role_id } = user;
        const token = yield (0, generateJWT_1.default)(id, email, role_id);
        res.json({
            msg: 'Login ok',
            token,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Hable con el admin',
        });
    }
});
exports.login = login;
const renewToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, email, role } = req.user;
    // Generar un nuevo token después de revalidar el token anterior
    const token = yield (0, generateJWT_1.default)(id, email, role);
    res.status(201).json({
        token,
    });
});
exports.renewToken = renewToken;
//# sourceMappingURL=auth.js.map