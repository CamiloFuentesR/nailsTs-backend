"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const scheduleException_1 = require("../controllers/scheduleException");
const router = (0, express_1.Router)();
router.get('/', scheduleException_1.getScheduleExceptions);
router.post('/', middleware_1.validateJWT, middleware_1.isAdminRole, scheduleException_1.createScheduleException);
router.delete('/:id', middleware_1.validateJWT, middleware_1.isAdminRole, scheduleException_1.deleteScheduleException);
exports.default = router;
//# sourceMappingURL=scheduleException.js.map