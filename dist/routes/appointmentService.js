"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const appointmentService_1 = require("../controllers/appointmentService");
const router = (0, express_1.Router)();
router.post('/', [middleware_1.validateJWT, middleware_1.validateFields], appointmentService_1.createAppointmentService);
router.get('/', [middleware_1.validateJWT, middleware_1.validateFields], appointmentService_1.getAppointmentService);
router.get('/earningsByCategory', appointmentService_1.getCurrentMonthEarningsByCategory);
router.get('/earningsByServices', appointmentService_1.getCurrentMonthEarningsByService);
router.get('/reportByGroup', [middleware_1.validateJWT, middleware_1.validateFields], appointmentService_1.getAppointmentServiceReportByGroup);
router.get('/reportByCategoryAndService', [middleware_1.validateJWT, middleware_1.validateFields], appointmentService_1.getEarningsByCategoryAndService);
router.get('/:id', [middleware_1.validateJWT, middleware_1.validateFields], appointmentService_1.getAppointmentServiceByAppointment);
router.get('/byClient/:id', [middleware_1.validateJWT, middleware_1.validateFields], appointmentService_1.getAppointmentServiceByClient);
router.get('/onebyClient/:id', [middleware_1.validateJWT, middleware_1.validateFields], appointmentService_1.getAppointmentServiceOneByClient);
exports.default = router;
//# sourceMappingURL=appointmentService.js.map