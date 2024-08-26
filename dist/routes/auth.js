"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../controllers/auth");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.post('/', [
    (0, express_validator_1.check)('email')
        .notEmpty()
        .withMessage('Debe ingresar el email')
        .normalizeEmail()
        .isEmail()
        .withMessage('ingresar email válido'),
    (0, express_validator_1.check)('password')
        .notEmpty()
        .withMessage('El password no puede estar vacío'),
    middleware_1.validateFields,
], auth_1.login);
router.post('/renew', middleware_1.validateJWT, auth_1.renewToken);
router.post('/google', [
    (0, express_validator_1.check)('id_token', 'id_Token de google es necesdario').notEmpty(),
    // validateFields,
], auth_1.googleSignIn);
exports.default = router;
//# sourceMappingURL=auth.js.map