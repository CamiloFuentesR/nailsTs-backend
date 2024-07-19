"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
const BusinessHour = conection_1.default.define('business_hour', {
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        autoIncrement: true,
    },
    start: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    end: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    daysOfWeek: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        allowNull: false,
    },
    endTime: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    startTime: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    backgroundColor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    display: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    blockDuration: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: false,
});
exports.default = BusinessHour;
//# sourceMappingURL=businessHour.js.map