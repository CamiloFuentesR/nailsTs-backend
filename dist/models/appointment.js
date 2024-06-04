"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
const Appointment = conection_1.default.define('Appointments', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    date_appointment: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    time: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    service_type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    state: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
});
// Definir la relación con Client
// Appointment.belongsTo(Client, { foreignKey: 'client_id' });
exports.default = Appointment;
//# sourceMappingURL=appointment.js.map