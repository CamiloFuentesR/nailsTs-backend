"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const googleAnalytics_1 = require("../controllers/googleAnalytics");
const router = (0, express_1.Router)();
router.get('/', middleware_1.validateJWT, googleAnalytics_1.getGoogleAnalyticsEventsByPage);
exports.default = router;
//# sourceMappingURL=googleAnalytics.js.map