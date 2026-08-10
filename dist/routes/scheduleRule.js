"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const scheduleRule_1 = require("../controllers/scheduleRule");
const router = (0, express_1.Router)();
// GET público: los clientes deben ver la disponibilidad sin iniciar sesión,
// mismo criterio que businessHour.
router.get('/', scheduleRule_1.getScheduleRules);
// '/week' va antes que '/:id' y que el POST raíz, si no Express nunca la alcanza
router.post('/week', middleware_1.validateJWT, middleware_1.isAdminRole, scheduleRule_1.replaceWeek);
router.post('/', middleware_1.validateJWT, middleware_1.isAdminRole, scheduleRule_1.createScheduleRule);
router.put('/:id', middleware_1.validateJWT, middleware_1.isAdminRole, scheduleRule_1.updateScheduleRule);
router.delete('/:id', middleware_1.validateJWT, middleware_1.isAdminRole, scheduleRule_1.deleteScheduleRule);
exports.default = router;
//# sourceMappingURL=scheduleRule.js.map