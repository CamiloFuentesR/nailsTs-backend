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
exports.activarUsuario = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserByid = exports.getUsersInactive = exports.getUsersActive = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateJWT_1 = __importDefault(require("../helpers/generateJWT"));
const deleteUserClient_1 = require("../services/deleteUserClient");
const models_1 = require("../models");
const getUsersActive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield models_1.User.findAll({
            where: { state: true },
            include: [
                {
                    model: models_1.Client,
                },
                {
                    model: models_1.Role,
                    attributes: ['name'],
                },
            ],
        });
        if (users.length === 0) {
            return res.status(400).json({
                msg: 'No hay usuarios',
            });
        }
        res.json({
            msg: 'getUsers',
            users,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: error,
        });
    }
});
exports.getUsersActive = getUsersActive;
const getUsersInactive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield models_1.User.findAll({
            where: { state: false },
            include: [
                {
                    model: models_1.Client,
                },
                {
                    model: models_1.Role,
                    attributes: ['name'],
                },
            ],
        });
        if (users.length === 0) {
            return res.status(400).json({
                msg: 'No hay usuarios',
            });
        }
        res.json({
            msg: 'getUsers',
            users,
        });
    }
    catch (error) {
        // throw new Error(error)
        return res.status(500).json({
            msg: error,
        });
    }
});
exports.getUsersInactive = getUsersInactive;
const getUserByid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userWithClients = yield models_1.User.findByPk(id, {
        include: [
            models_1.Client,
            {
                model: models_1.Role,
                attributes: ['name'],
            },
        ],
    });
    console.log(userWithClients);
    res.json({
        ok: true,
        msg: 'getUser',
        user: userWithClients,
    });
});
exports.getUserByid = getUserByid;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        let user = yield models_1.User.findOne({ where: { email } });
        if (user) {
            return res.status(401).json({
                state: 'error',
                msg: 'El usuario ya existe',
            });
        }
        user = models_1.User.build(req.body);
        const salt = yield bcrypt_1.default.genSalt(10);
        user.password = yield bcrypt_1.default.hash(password, salt);
        user.role_id = 1;
        user.state = true;
        const userSave = yield user.save();
        const token = yield (0, generateJWT_1.default)(user.id, user.email, user.role_id);
        res.status(201).json({
            ok: true,
            msg: 'usuario creado con éxito',
            user: userSave,
            token,
        });
    }
    catch (error) {
        res.status(500).json({
            ok: false,
            msg: error,
        });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { body } = req;
    try {
        const user = yield models_1.User.update(body, {
            where: { id },
            returning: true,
        });
        res.json({
            msg: 'postUser',
            user: user,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msj: error,
        });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const client = yield models_1.Client.findByPk(id);
        if (client) {
            yield (0, deleteUserClient_1.deleteUserAndClientState)(id);
            const { name } = client;
            res.status(200).json({
                ok: true,
                msg: `El cliente ' ${name} ' ha sido eliminado`,
            });
        }
        else {
            const user = yield models_1.User.update({ state: false }, { where: { id }, returning: true });
            res.status(400).json({
                ok: true,
                // msg: `El ${user.email} usuario ha sido eliminado`,
                user: user[1],
            });
        }
    }
    catch (error) {
        console.error('Error al eliminar cliente:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error en el servidor',
            error: error.message,
        });
    }
});
exports.deleteUser = deleteUser;
const activarUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const client = yield models_1.Client.findByPk(id);
        if (client) {
            yield (0, deleteUserClient_1.deleteUserAndClientState)(id);
            const { name } = client;
            res.status(200).json({
                ok: true,
                msg: `El cliente ' ${name} ' ha sido eliminado`,
            });
        }
        else {
            const user = yield models_1.Client.update({ state: false }, { where: { id }, returning: true });
            res.status(400).json({
                ok: true,
                // msg: `El ${user.email} usuario ha sido eliminado`,
                user: user[1],
            });
        }
    }
    catch (error) {
        console.error('Error al eliminar cliente:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error en el servidor',
            error: error.message,
        });
    }
});
exports.activarUsuario = activarUsuario;
//# sourceMappingURL=user.js.map