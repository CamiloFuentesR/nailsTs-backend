"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpload = void 0;
const validateUpload = (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
        return res.status(400).json({
            msg: 'No hay archivos en la petición',
        });
    }
    next();
};
exports.validateUpload = validateUpload;
//# sourceMappingURL=validateUpload.js.map