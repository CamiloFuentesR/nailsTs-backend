"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
const ScheduleException = conection_1.default.define('schedule_exception', {
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    startTime: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: true,
    },
    endTime: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: true,
    },
    reason: {
        type: sequelize_1.DataTypes.STRING(120),
        allowNull: true,
    },
});
exports.default = ScheduleException;
//# sourceMappingURL=scheduleException.js.map