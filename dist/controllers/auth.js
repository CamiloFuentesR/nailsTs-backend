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
exports.googleSignInFirebase = exports.googleSignIn = exports.renewToken = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateJWT_1 = __importDefault(require("../helpers/generateJWT"));
const models_1 = require("../models");
const google_verify_1 = __importDefault(require("../helpers/google-verify"));
// import { firebaseAdminAuth } from '../config/firebase-admin';
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
const googleSignIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id_token } = req.body;
    console.log('id_token');
    console.log(id_token);
    try {
        const googleUser = yield (0, google_verify_1.default)(id_token);
        if (googleUser) {
            const { email, name, picture } = googleUser;
            if (!email) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Email no proporcionado por Google',
                });
            }
            let user = yield models_1.User.findOne({
                where: { email, state: true },
                include: [{ model: models_1.Role, attributes: ['name'] }],
            });
            if (!user) {
                user = yield models_1.User.create({
                    email,
                    password: ':p',
                    role_id: 3,
                    state: true,
                });
                const roleName = ((_a = user.dataValues.Role) === null || _a === void 0 ? void 0 : _a.name) || 'INVITE_ROLE';
                const token = yield (0, generateJWT_1.default)(user.id, email, roleName);
                return res.status(201).json({
                    ok: true,
                    msg: 'Usuario creado con éxito',
                    token,
                });
            }
            if (!user.state) {
                return res.status(401).json({
                    msg: 'Usuario inhabilitado',
                });
            }
            const roleName = ((_b = user.dataValues.Role) === null || _b === void 0 ? void 0 : _b.name) || 'unknown';
            const token = yield (0, generateJWT_1.default)(user.id, email, roleName);
            return res.status(201).json({
                ok: true,
                token,
            });
            // return res.status(200).json({
            //   ok: true,
            //   msg: 'Usuario ya existente',
            //   user,
            // });
        }
        return res.status(400).json({
            ok: false,
            msg: 'No se pudo obtener el Token',
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'El Token no se pudo verificar',
            error,
        });
    }
});
exports.googleSignIn = googleSignIn;
const googleSignInFirebase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { email } = req.body;
    console.log('id_token');
    // console.log(id_token);
    try {
        // const firebaseGoogleUser = await firebaseAdminAuth.verifyIdToken(id_token);
        // console.log('firebaseGoogleUser');
        // console.log(firebaseGoogleUser);
        if (email) {
            //   const { email, name, picture } = firebaseGoogleUser;
            if (!email) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Email no proporcionado por Google',
                });
            }
            let user = yield models_1.User.findOne({
                where: { email },
                include: [{ model: models_1.Role, attributes: ['name'] }],
            });
            if (!user) {
                user = yield models_1.User.create({
                    email,
                    password: ':p',
                    role_id: 3,
                    state: true,
                });
                const roleName = ((_a = user.dataValues.Role) === null || _a === void 0 ? void 0 : _a.name) || 'INVITE_ROLE';
                const token = yield (0, generateJWT_1.default)(user.id, email, roleName);
                return res.status(201).json({
                    ok: true,
                    msg: 'Usuario creado con éxito',
                    token,
                });
            }
            if (!user.state) {
                return res.status(401).json({
                    msg: 'Usuario inhabilitado',
                });
            }
            const roleName = ((_b = user.dataValues.Role) === null || _b === void 0 ? void 0 : _b.name) || 'unknown';
            const token = yield (0, generateJWT_1.default)(user.id, email, roleName);
            return res.status(201).json({
                ok: true,
                token,
            });
            // return res.status(200).json({
            //   ok: true,
            //   msg: 'Usuario ya existente',
            //   user,
            // });
        }
        return res.status(400).json({
            ok: false,
            msg: 'No se pudo obtener el Token de firebase',
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'El Token no se pudo verificar',
            error,
        });
    }
});
exports.googleSignInFirebase = googleSignInFirebase;
//# sourceMappingURL=auth.js.map