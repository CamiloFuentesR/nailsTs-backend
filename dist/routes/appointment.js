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
    (0, express_validator_1.check)('appointmentData.role').custom(dbValidator_1.isValidRole),
    (0, express_validator_1.check)('servicesData.*.service_id').custom(dbValidator_1.serviceByIdExist),
    (0, express_validator_1.check)('appointmentData.client_id').custom(dbValidator_1.clientByIdExist),
    // check('category_id').custom(categoryByIdExist),
    middleware_1.validateFields,
], appoinment_1.createAppointment);
router.get('/', middleware_1.validateJWT, appoinment_1.getAllAppointment);
router.get('/ByData', middleware_1.validateJWT, appoinment_1.getAllAppointmentByDate);
router.get('/reportByMonth', middleware_1.validateJWT, appoinment_1.getAppointmentByMonth);
router.get('/reportAccept', middleware_1.validateJWT, appoinment_1.getAcceptedAppointment);
router.get('/:id', middleware_1.validateJWT, appoinment_1.getAppointmentById);
router.put('/:id', middleware_1.validateJWT, (0, express_validator_1.check)('servicesData.*.service_id').custom(dbValidator_1.serviceByIdExist), (0, express_validator_1.check)('appointmentData.client_id').custom(dbValidator_1.clientByIdExist), middleware_1.validateFields, appoinment_1.updateAppointment);
router.delete('/:id', middleware_1.validateJWT, appoinment_1.deleteAppointment);
exports.default = router;
//# sourceMappingURL=appointment.js.map