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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClient = exports.createClient = exports.showClientByUserId = exports.showClientById = exports.showAllCliens = exports.showAllClientInActive = exports.showAllClientActive = void 0;
const models_1 = require("../models");
const showAllClient = (req, res, state) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (state === '') {
            const client = yield models_1.Client.findAll();
            return !client
                ? res.status(409).json({
                    ok: false,
                    msg: 'No se encontraron clientes registradios',
                })
                : res.status(200).json({
                    ok: true,
                    msg: 'Se obtuvieron todos los clientes con éxito',
                    client,
                });
        }
        const client = yield models_1.Client.findAll({ where: { state } });
        if (!client) {
            return res.status(409).json({
                ok: false,
                msg: 'No se encontraron clientes',
            });
        }
        return res.status(200).json({
            ok: true,
            msg: state
                ? 'Se obtuvieron Clientes activos con éxito'
                : 'Se obtuvieron clientes inactivos con éxito',
            client,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
});
const showAllClientActive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    showAllClient(req, res, true);
});
exports.showAllClientActive = showAllClientActive;
const showAllClientInActive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    showAllClient(req, res, false);
});
exports.showAllClientInActive = showAllClientInActive;
const showAllCliens = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    showAllClient(req, res, '');
});
exports.showAllCliens = showAllCliens;
const showClientById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const client = yield models_1.Client.findByPk(id);
        if (!client) {
            return res.status(409).json({
                ok: false,
                msg: 'No se encontraron clientes',
            });
        }
        return res.status(200).json({
            ok: true,
            client,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
});
exports.showClientById = showClientById;
const showClientByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const client = yield models_1.Client.findOne({
            where: { user_id: id },
            attributes: ['id', 'name', 'phone_number'],
        });
        if (!client) {
            return res.status(200).json({
                ok: true,
                msg: 'Se le recuerda ingresar sus datos de contacto',
            });
        }
        return res.status(200).json({
            ok: true,
            client,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
});
exports.showClientByUserId = showClientByUserId;
const createClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    try {
        let client = yield models_1.Client.findOne({
            where: { user_id: id },
        });
        if (client) {
            return res.status(409).json({
                ok: false,
                msg: 'El cliente ya existe',
            });
        }
        client = models_1.Client.build(req.body);
        client.user_id = id;
        const clientSave = yield client.save();
        res.status(201).json({
            ok: true,
            msg: 'usuario creado con éxito',
            client: clientSave,
        });
    }
    catch (error) {
        console.log(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                ok: false,
                msg: 'Este cliente ya existe',
            });
        }
        res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
});
exports.createClient = createClient;
const updateClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { body } = req;
    try {
        const [updatedRowsCount, updatedClients] = yield models_1.Client.update(body, {
            where: { id },
            returning: true,
        });
        if (updatedRowsCount === 0 ||
            !updatedClients ||
            updatedClients.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'Cliente no encontrado o no actualizado',
            });
        }
        return res.status(200).json({
            ok: true,
            msg: 'Cliente actualizado correctamente',
            client: updatedClients[0],
        });
    }
    catch (error) {
        console.error('Error al actualizar el cliente:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor al actualizar el cliente',
            error: error.message,
        });
    }
});
exports.updateClient = updateClient;
//# sourceMappingURL=client.js.map