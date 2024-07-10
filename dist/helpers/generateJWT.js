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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Genera un JWT.
 * @param id - ID del usuario en formato UUID.
 * @param name - Nombre del usuario.
 * @param role - Rol del usuario.
 * @returns Una promesa que resuelve con el token generado.
 */
const generateJWT = (id_1, ...args_1) => __awaiter(void 0, [id_1, ...args_1], void 0, function* (id, name = '', role) {
    const payload = { id, name, role };
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
        throw new Error('No se ha definido una llave secreta en el entorno');
    }
    try {
        const token = yield new Promise((resolve, reject) => {
            jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: '1d' }, (err, token) => {
                if (err || !token) {
                    console.error('Error al generar el token:', err);
                    reject('No se pudo generar el token');
                }
                else {
                    resolve(token);
                }
            });
        });
        return token;
    }
    catch (error) {
        console.error('Error al generar el token:', error);
        throw new Error('No se pudo generar el token');
    }
});
exports.default = generateJWT;
//# sourceMappingURL=generateJWT.js.map