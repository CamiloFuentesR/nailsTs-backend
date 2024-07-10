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
exports.updateUserAndClientState = void 0;
const conection_1 = __importDefault(require("../db/conection"));
const models_1 = require("../models");
const updateUserAndClientState = (userId, body, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield conection_1.default.transaction();
    try {
        const client = yield models_1.Client.findOne({
            where: { user_id: userId },
        });
        const user = yield models_1.User.findByPk(userId);
        const { email, role_id, state, Client: clientData } = body;
        if (!client && user !== null) {
            const client = models_1.Client.build({
                name: clientData === null || clientData === void 0 ? void 0 : clientData.name,
                phone_number: clientData === null || clientData === void 0 ? void 0 : clientData.phone_number,
                user_id: user.id,
                state: true,
            });
            yield client.save();
        }
        const userUpdateResult = yield models_1.User.update({ email, role_id, state }, {
            where: { id: userId },
            returning: true,
            transaction,
        });
        if (!userUpdateResult || userUpdateResult.length < 2) {
            throw new Error(`Error actualizando el usuario`);
        }
        const [affectedRows, updatedUserArray] = userUpdateResult;
        const updatedUser = updatedUserArray[0];
        const clientUpdateResult = yield models_1.Client.update({ name: clientData === null || clientData === void 0 ? void 0 : clientData.name, phone_number: clientData === null || clientData === void 0 ? void 0 : clientData.phone_number, state }, {
            where: { user_id: userId },
            returning: true,
            transaction,
        });
        if (!clientUpdateResult || clientUpdateResult.length < 2) {
            throw new Error(`Error actualizando el cliente`);
        }
        const [affectedRowsClient, updatedClientArray] = clientUpdateResult;
        const updatedClient = updatedClientArray[0];
        yield transaction.commit();
        console.log('Cliente y usuario actualizados exitosamente');
        return res.status(200).json({
            ok: true,
            msg: 'Cliente y usuario actualizados exitosamente',
            updatedUser,
            updatedClient,
        });
    }
    catch (error) {
        yield transaction.rollback();
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error actualizando cliente y usuario',
            error: error.message,
        });
    }
});
exports.updateUserAndClientState = updateUserAndClientState;
//# sourceMappingURL=updateUserClient.js.map