"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
// import { validateFields } from '../middleware/validateFields';
const auth_1 = require("../controllers/auth");
const middleware_1 = __importDefault(require("../middleware"));
const router = (0, express_1.Router)();
router.post('/', [(0, express_validator_1.check)('email').normalizeEmail(), middleware_1.default.validateFields], auth_1.login);
exports.default = router;
//# sourceMappingURL=auth.js.map