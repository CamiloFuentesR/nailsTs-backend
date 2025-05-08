"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const express_validator_1 = require("express-validator");
const validateFields_1 = require("../middleware/validateFields");
const validateJWT_1 = require("../middleware/validateJWT");
const dbValidator_1 = require("../helpers/dbValidator");
const router = (0, express_1.Router)();
router.get('/', validateJWT_1.validateJWT, user_1.getUsers);
router.get('/active', validateJWT_1.validateJWT, user_1.getUsersActive);
router.get('/inactive', validateJWT_1.validateJWT, user_1.getUsersInactive);
router.get('/:id', [validateJWT_1.validateJWT, (0, express_validator_1.check)('id').custom(dbValidator_1.userByIdExist), validateFields_1.validateFields], user_1.getUserByid);
router.post('/', [
    (0, express_validator_1.check)('email').isEmail().withMessage('El email no es válido'),
    // .normalizeEmail(),
    (0, express_validator_1.check)('password')
        .notEmpty()
        .withMessage('Debe ingresar un password')
        .isLength({ min: 4 })
        .withMessage('El password debe tener al menos 5 caracteres'),
    validateFields_1.validateFields,
], user_1.createUser);
router.put('/:id', [
    validateJWT_1.validateJWT,
    (0, express_validator_1.check)('id').custom(dbValidator_1.userByIdExist),
    (0, express_validator_1.check)('email')
        .isEmail()
        .withMessage('El email no es válido')
        .normalizeEmail(),
    (0, express_validator_1.check)('state').notEmpty(),
    validateFields_1.validateFields,
], user_1.updateUser);
router.delete('/:id', [validateJWT_1.validateJWT, (0, express_validator_1.check)('id').custom(dbValidator_1.userByIdExist), validateFields_1.validateFields], user_1.deleteUser);
router.put('/active/:id', [validateJWT_1.validateJWT, (0, express_validator_1.check)('id').custom(dbValidator_1.userByIdExist), validateFields_1.validateFields], user_1.activeteUser);
exports.default = router;
//# sourceMappingURL=user.js.map