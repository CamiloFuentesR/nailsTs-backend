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
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateJWT_1 = __importDefault(require("../helpers/generateJWT"));
const models_1 = require("../models");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let { password, email } = req.body;
    try {
        const user = yield models_1.User.findOne({
            where: { email },
            include: [{ model: models_1.Role, attributes: ['name'] }],
        });
        if (!user) {
            return res.status(400).json({
                msg: 'Usuario o contraseña incorrecto',
            });
        }
        if (!user.state) {
            return res.status(400).json({
                msg: 'Usuario inhabilitado',
            });
        }
        const validatePassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validatePassword) {
            return res.status(400).json({
                msg: 'Usuario o contraseña incorrecto',
            });
        }
        const { id } = user;
        const roleName = ((_a = user.dataValues.Role) === null || _a === void 0 ? void 0 : _a.name) || 'unknown';
        const token = yield (0, generateJWT_1.default)(id, email, roleName);
        res.json({
            ok: true,
            token,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador',
        });
    }
});
exports.login = login;
const renewToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, email } = req.user;
    const role = req.role;
    // Generar un nuevo token después de revalidar el token anterior
    const token = yield (0, generateJWT_1.default)(id, email, role);
    res.status(201).json({
        ok: true,
        token,
    });
});
exports.renewToken = renewToken;
//# sourceMappingURL=auth.js.map