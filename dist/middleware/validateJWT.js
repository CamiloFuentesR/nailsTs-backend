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
exports.validateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const role_1 = __importDefault(require("../models/role"));
const client_1 = __importDefault(require("../models/client"));
const validateJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = req.header('x-token-authorize');
    if (!token)
        return res.status(401).json({
            msg: 'Token no válido - no posee token',
        });
    const secretKey = process.env.SECRET_KEY || undefined;
    if (!secretKey) {
        return res.status(500).json({
            msg: 'Token no válido - La clave secreta no está definida en la configuración',
        });
    }
    try {
        // const { id } = jwt.verify(token, secretKey) as JwtPayload;
        const payload = jsonwebtoken_1.default.verify(token, secretKey);
        const { id } = payload; //--> se obtiene la id desde el token
        const authenticatedUser = yield user_1.default.findByPk(id, {
            include: [
                client_1.default,
                {
                    model: role_1.default,
                    attributes: ['name'],
                },
            ],
        });
        if (!authenticatedUser) {
            return res.status(401).json({
                mgs: 'Token no válido - usuario no encontrado en la BD',
            });
        }
        if (!authenticatedUser.state) {
            return res.status(401).json({
                msg: 'Token no válido - usuario eliminado',
            });
        }
        req.user = authenticatedUser;
        req.role = (_a = authenticatedUser.dataValues.Role) === null || _a === void 0 ? void 0 : _a.name;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error interno del servidor',
            error: error.message,
        });
    }
});
exports.validateJWT = validateJWT;
//# sourceMappingURL=validateJWT.js.map