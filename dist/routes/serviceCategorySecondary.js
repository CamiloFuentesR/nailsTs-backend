"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateJWT_1 = require("../middleware/validateJWT");
const serviceCategorySecondary_1 = require("../controllers/serviceCategorySecondary");
const router = (0, express_1.Router)();
router.post('/', validateJWT_1.validateJWT, serviceCategorySecondary_1.createServicesCategorySecondary);
router.get('/', validateJWT_1.validateJWT, serviceCategorySecondary_1.getServicesCategorySecondary);
router.get('/:id', validateJWT_1.validateJWT, serviceCategorySecondary_1.showServiceCategorySecondaryById);
router.put('/:id', validateJWT_1.validateJWT, serviceCategorySecondary_1.updateServicesCategorySecondary);
exports.default = router;
//# sourceMappingURL=serviceCategorySecondary.js.map