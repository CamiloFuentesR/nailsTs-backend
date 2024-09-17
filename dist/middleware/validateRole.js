"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.haveRole = exports.isAdminRole = void 0;
const isAdminRole = (req, res, next) => {
    if (!req.role) {
        return res.status(500).json({
            ok: false,
            msg: 'Token - Se quiere verifcar el rol sin validar el token',
        });
    }
    const role = req.role;
    if (role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            ok: false,
            msg: ` '${req.user.Client.name}' no es un Administrador autorizado`,
        });
    }
    next();
};
exports.isAdminRole = isAdminRole;
const haveRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(500).json({
                msg: 'Se quiere verifcar el rol sin validar el token',
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(401).json({
                msg: 'El usuario no contiene un rol válido para ejecutar esta acción',
            });
        }
        next();
    };
};
exports.haveRole = haveRole;
//# sourceMappingURL=validateRole.js.map