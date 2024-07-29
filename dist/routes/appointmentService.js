"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const appointmentService_1 = require("../controllers/appointmentService");
const router = (0, express_1.Router)();
router.post('/', [middleware_1.validateJWT, middleware_1.validateFields], appointmentService_1.createAppointmentService);
router.get('/', [middleware_1.validateJWT, middleware_1.validateFields], appointmentService_1.getAppointmentService);
router.get('/:id', [middleware_1.validateJWT, middleware_1.validateFields], appointmentService_1.getAppointmentServiceById);
exports.default = router;
//# sourceMappingURL=appointmentService.js.map