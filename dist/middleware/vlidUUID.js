"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const sequelize_1 = require("sequelize");
const errorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err && err.message.includes('JSON')) {
        // Errores de sintaxis en JSON
        return res.status(400).json({ error: 'Solicitud JSON malformada' });
    }
    else if (err instanceof sequelize_1.ValidationError) {
        // Errores de validación de datos
        return res.status(400).json({ error: err.message });
    }
    else {
        // Otros errores
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=vlidUUID.js.map