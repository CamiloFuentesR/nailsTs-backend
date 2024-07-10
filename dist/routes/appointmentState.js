"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const appointmentsState_1 = require("../controllers/appointmentsState");
const router = (0, express_1.Router)();
router.post('/', middleware_1.validateJWT, appointmentsState_1.createAppointmentState);
exports.default = router;
//# sourceMappingURL=appointmentState.js.map