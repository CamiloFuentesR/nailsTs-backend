"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const appoinment_1 = require("../controllers/appoinment");
const express_validator_1 = require("express-validator");
const dbValidator_1 = require("../helpers/dbValidator");
const router = (0, express_1.Router)();
router.post('/', [
    middleware_1.validateJWT,
    (0, express_validator_1.check)('service_id').custom(dbValidator_1.serviceByIdExist),
    (0, express_validator_1.check)('category_id').custom(dbValidator_1.categoryByIdExist),
    (0, express_validator_1.check)('client_id').custom(dbValidator_1.clientByIdExist),
    middleware_1.validateFields,
], appoinment_1.createAppointment);
router.get('/', middleware_1.validateJWT, appoinment_1.getAllAppointment);
router.get('/:id', middleware_1.validateJWT, appoinment_1.getAppointmentById);
router.put('/:id', middleware_1.validateJWT, appoinment_1.updateAppointment);
exports.default = router;
//# sourceMappingURL=appointment.js.map