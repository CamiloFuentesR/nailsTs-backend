"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = void 0;
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const validExtensio = ['txt', 'md', 'jpg', 'png', 'webp', 'jpeg', 'gif'];
const uploadFiles = (file, validExtensions = validExtensio, folder = '') => {
    return new Promise((resolve, reject) => {
        // Obtener extensión del archivo
        const cutName = file.name.split('.');
        const extension = cutName[cutName.length - 1];
        console.log(validExtensions);
        console.log(extension);
        // Validar la extensión
        if (!(validExtensions === null || validExtensions === void 0 ? void 0 : validExtensions.includes(extension))) {
            return reject(`La extensión ${extension} no es válida. Extensiones permitidas: ${validExtensions === null || validExtensions === void 0 ? void 0 : validExtensions.join(', ')}`);
        }
        // Generar un nombre único para el archivo
        const tempName = (0, uuid_1.v4)() + '.' + extension;
        // Ruta donde se almacenará el archivo
        const uploadPath = path_1.default.join(__dirname, '../uploads/', folder, tempName);
        // Mover el archivo a la carpeta de destino
        file.mv(uploadPath, err => {
            if (err) {
                return reject(err);
            }
            resolve(tempName);
        });
    });
};
exports.uploadFiles = uploadFiles;
//# sourceMappingURL=uploadFiles.js.map