"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const appoinment_1 = require("../controllers/appoinment");
const router = (0, express_1.Router)();
router.post('/', [
    middleware_1.validateJWT,
    // check('service_id').custom(serviceByIdExist),
    // check('category_id').custom(categoryByIdExist),
    // check('client_id').custom(clientByIdExist),
    middleware_1.validateFields,
], appoinment_1.createAppointment);
router.get('/', middleware_1.validateJWT, appoinment_1.getAllAppointment);
router.get('/reportByMonth', middleware_1.validateJWT, appoinment_1.getAppointmentByMonth);
router.get('/reportAccept', middleware_1.validateJWT, appoinment_1.getAcceptedAppointment);
router.get('/:id', middleware_1.validateJWT, appoinment_1.getAppointmentById);
router.put('/:id', middleware_1.validateJWT, appoinment_1.updateAppointment);
router.delete('/:id', middleware_1.validateJWT, appoinment_1.updateAppointmentState);
exports.default = router;
//# sourceMappingURL=appointment.js.map