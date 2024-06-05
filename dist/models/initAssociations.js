"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appointment_1 = __importDefault(require("./appointment"));
const client_1 = __importDefault(require("./client"));
const role_1 = __importDefault(require("./role"));
const service_1 = __importDefault(require("./service"));
const servicesCategory_1 = __importDefault(require("./servicesCategory"));
const user_1 = __importDefault(require("./user"));
user_1.default.belongsTo(role_1.default, { foreignKey: 'role_id' });
user_1.default.hasOne(client_1.default, { foreignKey: 'user_id' });
client_1.default.hasOne(user_1.default, { foreignKey: 'id' });
client_1.default.belongsTo(user_1.default, { foreignKey: 'user_id' });
client_1.default.hasMany(appointment_1.default, { foreignKey: 'cliente_id' });
service_1.default.belongsTo(servicesCategory_1.default, { foreignKey: 'services_category_id' });
//# sourceMappingURL=initAssociations.js.map