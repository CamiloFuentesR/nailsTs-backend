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
exports.updateUser = exports.createtUser = exports.getUser = exports.getUsers = void 0;
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateJWT_1 = __importDefault(require("../helpers/generateJWT"));
const jwt_decode_1 = require("jwt-decode");
const client_1 = __importDefault(require("../models/client"));
const role_1 = __importDefault(require("../models/role"));
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.default.findAll({
            include: [client_1.default,
                {
                    model: role_1.default,
                    attributes: ['name']
                }
            ],
        });
        if (!users) {
            return res.status(400).json({
                msg: 'No hay usuarios'
            });
        }
        res.json({
            msg: 'getUsers',
            users
        });
    }
    catch (error) {
        // throw new Error(error)
        return res.status(500).json({
            msg: error
        });
    }
});
exports.getUsers = getUsers;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // const clientWithUser = await Client.findByPk(id, {
    //     include: Users
    //   });
    const userWithClients = yield user_1.default.findByPk(id, {
        include: [client_1.default,
            {
                model: role_1.default,
                attributes: ['name']
            }
        ],
    });
    res.json({
        msg: 'getUser',
        user: userWithClients
    });
});
exports.getUser = getUser;
const createtUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (email === '' && password === '') {
        return res.status(401).json({
            ok: false,
            msg: 'No se pueden ingresar campos vacíos'
        });
    }
    try {
        let user = yield user_1.default.findOne({ where: { email } });
        if (user) {
            return (res.status(401).json({
                state: 'error',
                msg: 'El usuario ya existe',
            }));
        }
        user = user_1.default.build(req.body);
        const salt = yield bcrypt_1.default.genSalt(10);
        user.dataValues.password = yield bcrypt_1.default.hash(password, salt);
        user.dataValues.role_id = 1;
        user.dataValues.state = true;
        const userSave = yield user.save();
        const token = yield (0, generateJWT_1.default)(user.dataValues.id, user.dataValues.name, user.dataValues.role_id);
        const decodedToken = (0, jwt_decode_1.jwtDecode)("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI1OGIzMWJhLWI2YjUtNDQzMy05Y2FhLTc2NmNkZjhlMzNmOSIsIm5hbWUiOiIiLCJyb2xlIjoxLCJpYXQiOjE3MTY5MDcxODksImV4cCI6MTcxNjkxMDc4OX0.wpjkU-PtlTLV1ACkD-DwBk2PqhZsfYX1hZlxjWZP-nU");
        res.status(201).json({
            ok: false,
            msg: 'usuario creado con éxito',
            user: userSave,
            token,
            decodedToken
        });
    }
    catch (error) {
        res.status(500).json({
            ok: false,
            msg: error
        });
    }
});
exports.createtUser = createtUser;
const updateUser = (req, res) => {
    const { body } = req;
    res.json({
        msg: 'postUser',
        body,
    });
};
exports.updateUser = updateUser;
//# sourceMappingURL=user.js.map