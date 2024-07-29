"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateJWT_1 = require("../middleware/validateJWT");
const servicesSecondary_1 = require("../controllers/servicesSecondary");
const router = (0, express_1.Router)();
router.post('/', validateJWT_1.validateJWT, servicesSecondary_1.createServiceSecondary);
router.get('/', validateJWT_1.validateJWT, servicesSecondary_1.getServicesSecondary);
router.get('/:id', validateJWT_1.validateJWT, servicesSecondary_1.getServicesSecondaryById);
router.get('/bycat/:id', validateJWT_1.validateJWT, servicesSecondary_1.getServicesSecondaryByCategory);
router.put('/:id', validateJWT_1.validateJWT, servicesSecondary_1.updateserviceSecondary);
exports.default = router;
//# sourceMappingURL=servicesSecondaries.js.map