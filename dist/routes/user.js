"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const express_validator_1 = require("express-validator");
const validateFields_1 = require("../middleware/validateFields");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.get('/', validateJWT_1.validateJWT, user_1.getUsers);
router.get('/:id', user_1.getUser);
router.post('/', [
    validateJWT_1.validateJWT,
    (0, express_validator_1.check)('email')
        .isEmail().withMessage('El email no es válido'),
    validateFields_1.validateFields
], user_1.createtUser);
exports.default = router;
//# sourceMappingURL=user.js.map