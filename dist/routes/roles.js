"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_1 = require("../controllers/role");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.get('/', middleware_1.validateJWT, role_1.getRoles);
router.get('/', middleware_1.validateJWT, role_1.createRoles);
exports.default = router;
//# sourceMappingURL=roles.js.map