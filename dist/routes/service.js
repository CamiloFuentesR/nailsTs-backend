"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateJWT_1 = require("../middleware/validateJWT");
const service_1 = require("../controllers/service");
const router = (0, express_1.Router)();
router.get('/', service_1.getServices);
router.post('/', validateJWT_1.validateJWT, service_1.createService);
exports.default = router;
//# sourceMappingURL=service.js.map