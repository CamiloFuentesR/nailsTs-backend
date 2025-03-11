"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateJWT_1 = require("../middleware/validateJWT");
const servicesCategory_1 = require("../controllers/servicesCategory");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.get('/', validateJWT_1.validateJWT, servicesCategory_1.getServicesCategory);
router.post('/', validateJWT_1.validateJWT, middleware_1.validateFields, servicesCategory_1.createServicesCategory);
router.put('/:id', validateJWT_1.validateJWT, servicesCategory_1.updateServicesCategory);
router.get('/:id', validateJWT_1.validateJWT, servicesCategory_1.showServiceCategoryById);
exports.default = router;
//# sourceMappingURL=services_category.js.map