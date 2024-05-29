"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJWT = (id = '', name = '', role = '') => {
    return new Promise((resolve, reject) => {
        const payload = { id, name, role };
        const secretKey = process.env.SECRET_KEY || undefined;
        if (!secretKey) {
            return reject('No se ha definido una llave secreta');
        }
        jsonwebtoken_1.default.sign(payload, secretKey, {
            expiresIn: '1h',
        }, (err, token) => {
            if (err) {
                console.error(err);
                reject('No se pudo generar el token');
            }
            else {
                resolve(token);
            }
        });
    });
};
exports.default = generateJWT;
//# sourceMappingURL=generateJWT.js.map