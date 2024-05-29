"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateJWT_1 = require("../middleware/validateJWT");
const servicesCategory_1 = require("../controllers/servicesCategory");
const router = (0, express_1.Router)();
router.get('/', validateJWT_1.validateJWT, servicesCategory_1.getServicesCategory);
router.post('/', validateJWT_1.validateJWT, servicesCategory_1.createCategory);
//# sourceMappingURL=services_category.js.map