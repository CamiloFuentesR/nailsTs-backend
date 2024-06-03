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
const client_1 = __importDefault(require("../models/client"));
const user_1 = __importDefault(require("../models/user"));
const updateUserAndClientState = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield conection_1.default.transaction();
    try {
        yield user_1.default.update({ state: false }, { where: { id: userId }, transaction });
        yield client_1.default.update({ state: false }, { where: { user_id: userId }, transaction });
        yield transaction.commit();
        console.log('Estados actualizados correctamente');
    }
    catch (error) {
        yield transaction.rollback();
        throw new Error(error);
    }
});
exports.updateUserAndClientState = updateUserAndClientState;
//# sourceMappingURL=deleteUserClient.js.map