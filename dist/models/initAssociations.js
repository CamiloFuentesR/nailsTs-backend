"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const appointment_1 = __importDefault(require("./appointment"));
const appointmentState_1 = __importDefault(require("./appointmentState"));
const client_1 = __importDefault(require("./client"));
const role_1 = __importDefault(require("./role"));
const service_1 = __importDefault(require("./service"));
const serviceCategorySecondary_1 = __importDefault(require("./serviceCategorySecondary"));
const servicesCategory_1 = __importDefault(require("./servicesCategory"));
const user_1 = __importDefault(require("./user"));
user_1.default.belongsTo(role_1.default, { foreignKey: 'role_id' });
user_1.default.hasOne(client_1.default, { foreignKey: 'user_id' });
client_1.default.hasOne(user_1.default, { foreignKey: 'id' });
client_1.default.belongsTo(user_1.default, { foreignKey: 'user_id' });
service_1.default.belongsTo(servicesCategory_1.default, { foreignKey: 'id' });
_1.ServicesSecondary.belongsTo(serviceCategorySecondary_1.default, { foreignKey: 'id' });
client_1.default.hasMany(appointment_1.default, { foreignKey: 'client_id' });
appointment_1.default.belongsTo(appointmentState_1.default, { foreignKey: 'state' });
_1.AppointmentService.belongsTo(service_1.default, { foreignKey: 'service_id' });
// AppointmentService.belongsTo(ServicesCategory, { foreignKey: 'id' });
//# sourceMappingURL=initAssociations.js.map