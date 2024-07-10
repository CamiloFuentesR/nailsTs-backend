"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const validateFields_1 = require("../middleware/validateFields");
const client_1 = require("../controllers/client");
const express_1 = require("express");
const validateJWT_1 = require("../middleware/validateJWT");
const dbValidator_1 = require("../helpers/dbValidator");
const validateRole_1 = require("../middleware/validateRole");
const router = (0, express_1.Router)();
router.get('/', validateJWT_1.validateJWT, client_1.showAllCliens);
router.get('/active', client_1.showAllClientActive);
router.get('/inactive', validateJWT_1.validateJWT, client_1.showAllClientInActive);
router.get('/:id', [validateJWT_1.validateJWT, validateFields_1.validateFields], client_1.showClientById);
router.get('/clientbyuser/:id', [validateJWT_1.validateJWT, validateFields_1.validateFields], client_1.showClientByUserId);
router.post('/', [
    validateJWT_1.validateJWT,
    (0, express_validator_1.check)('name').notEmpty().withMessage('Debe ingresar nombre'),
    (0, express_validator_1.check)('phone_number')
        .notEmpty()
        .withMessage('Debe ingresar teléfono')
        .isLength({ min: 9, max: 9 })
        .withMessage('Teléfono inválido')
        .isNumeric()
        .withMessage('Teléfono inválido'),
    validateFields_1.validateFields,
], client_1.createClient);
router.put('/:id', [
    validateJWT_1.validateJWT,
    validateRole_1.isAdminRole,
    (0, express_validator_1.check)('id').custom(dbValidator_1.clientByIdExist),
    (0, express_validator_1.check)('name').notEmpty().withMessage('Debe ingresar nombre'),
    (0, express_validator_1.check)('phone_number')
        .notEmpty()
        .withMessage('Debe ingresar teléfono')
        .isLength({ min: 9, max: 9 })
        .withMessage('Teléfono inválido')
        .isNumeric()
        .withMessage('Teléfono inválido'),
    validateFields_1.validateFields,
], client_1.updateClient);
exports.default = router;
//# sourceMappingURL=client.js.map