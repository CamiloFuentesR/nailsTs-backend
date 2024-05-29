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
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateJWT_1 = __importDefault(require("../helpers/generateJWT"));
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { password, email } = req.body;
    email = req.body.email.toLowerCase();
    try {
        //verificar email
        const user = yield user_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({
                msg: 'Se ha ingesado un Email no existente'
            });
        }
        //verificar usuario activo
        if (!user.dataValues.state) {
            return res.status(400).json({
                msg: 'Usuario inhabilitado'
            });
        }
        //verificar pssword
        const validatePassword = yield bcrypt_1.default.compare(password, user.dataValues.password);
        if (!validatePassword) {
            return res.status(400).json({
                msg: 'Password incorrecto'
            });
        }
        const { id, name, role_id } = user.dataValues;
        const token = yield (0, generateJWT_1.default)(id, name, role_id);
        res.json({
            msg: 'Login ok',
            token
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Hable con el admin'
        });
    }
});
exports.login = login;
const renewToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, name, role } = req.user;
    //generar un nuevo token despues de revalidar el token anterior
    const token = yield (0, generateJWT_1.default)(id, name, role);
    res.status(201).json({
        token,
    });
});
exports.renewToken = renewToken;
//# sourceMappingURL=auth.js.map