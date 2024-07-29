"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
const service_1 = __importDefault(require("./service"));
const appointment_1 = __importDefault(require("./appointment"));
const AppointmentService = conection_1.default.define('appointment_services', {
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    appointment_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: appointment_1.default,
            key: 'id',
        },
    },
    state: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: false,
    },
    price: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    service_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: service_1.default,
            key: 'id',
        },
    },
});
exports.default = AppointmentService;
//# sourceMappingURL=AppointmentService.js.map