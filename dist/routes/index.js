"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = exports.servicesCategory = exports.services = exports.roleRoutes = exports.clientRoutes = exports.businessHourRoutes = exports.authRoutes = exports.appointmentStateRoutes = exports.appointmentRoutes = void 0;
const appointment_1 = __importDefault(require("../routes/appointment"));
exports.appointmentRoutes = appointment_1.default;
const appointmentState_1 = __importDefault(require("../routes/appointmentState"));
exports.appointmentStateRoutes = appointmentState_1.default;
const auth_1 = __importDefault(require("../routes/auth"));
exports.authRoutes = auth_1.default;
const businessHour_1 = __importDefault(require("../routes/businessHour"));
exports.businessHourRoutes = businessHour_1.default;
const client_1 = __importDefault(require("../routes/client"));
exports.clientRoutes = client_1.default;
const roles_1 = __importDefault(require("../routes/roles"));
exports.roleRoutes = roles_1.default;
const services_category_1 = __importDefault(require("../routes/services_category"));
exports.servicesCategory = services_category_1.default;
const services_1 = __importDefault(require("../routes/services"));
exports.services = services_1.default;
const user_1 = __importDefault(require("../routes/user"));
exports.userRoutes = user_1.default;
//# sourceMappingURL=index.js.map