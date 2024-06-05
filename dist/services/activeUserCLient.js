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
exports.activeUserAndClientState = void 0;
const conection_1 = __importDefault(require("../db/conection"));
const models_1 = require("../models");
const activeUserAndClientState = (userId, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield conection_1.default.transaction();
    try {
        const client = yield models_1.Client.findOne({
            where: { user_id: userId, state: false },
            transaction,
        });
        yield models_1.User.findByPk(userId);
        if (!client) {
            throw new Error(`Cliente ya se encuentra activo`);
        }
        const [affectedRowsClient, [updatedClient]] = yield models_1.Client.update({ state: true }, { where: { user_id: userId }, returning: true, transaction });
        const [affectedRows, [updatedUser]] = yield models_1.User.update({ state: true }, { where: { id: userId }, returning: true, transaction });
        yield transaction.commit();
        console.log('Cliente y usuario activados exitosamente');
        return res.status(200).json({
            ok: true,
            msg: 'Cliente y usuario activados exitosamente',
            updatedUser,
            updatedClient,
        });
    }
    catch (error) {
        yield transaction.rollback();
        throw new Error(error.message);
    }
});
exports.activeUserAndClientState = activeUserAndClientState;
//# sourceMappingURL=activeUserCLient.js.map