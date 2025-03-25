"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const businessHour_1 = require("../controllers/businessHour");
const router = (0, express_1.Router)();
router.post('/', middleware_1.validateJWT, businessHour_1.createBusinessHour);
router.put('/:id', middleware_1.validateJWT, businessHour_1.updateBusinessHour);
router.get('/', businessHour_1.getAllBusinessHours);
router.get('/:id', middleware_1.validateJWT, businessHour_1.getBusinessHourById);
// router.get('/', validateJWT, getAllBusinessHours);
exports.default = router;
//# sourceMappingURL=businessHour.js.map