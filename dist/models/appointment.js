"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
const Appointment = conection_1.default.define('Appointments', {
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    client_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    start: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    end: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    price: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    backgroundColor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    className: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    state: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
});
exports.default = Appointment;
//# sourceMappingURL=appointment.js.map