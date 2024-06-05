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
exports.createRoles = exports.getRoles = void 0;
const models_1 = require("../models");
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield models_1.Role.findAll();
    if (!roles) {
        return res.status(404).json({
            ok: false,
            msg: 'No se encontraron roles',
        });
    }
    return res.status(200).json({
        ok: true,
        roles,
    });
});
exports.getRoles = getRoles;
const createRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield models_1.Role.findAll();
});
exports.createRoles = createRoles;
//# sourceMappingURL=role.js.map