"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
const ScheduleRule = conection_1.default.define('schedule_rule', {
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
    },
    dayOfWeek: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: false,
    },
    // TIME sin zona: es hora de pared. La conversión a instante la hace el
    // frontend con la zona del negocio, en el momento de expandir cada fecha.
    startTime: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    endTime: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    // DATEONLY devuelve 'YYYY-MM-DD' como string y no lo convierte a instante,
    // que es justo lo que se necesita para no arrastrar zona horaria.
    validFrom: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    validUntil: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    blockDuration: {
        type: sequelize_1.DataTypes.STRING(5),
        allowNull: false,
        defaultValue: '01:00',
    },
});
exports.default = ScheduleRule;
//# sourceMappingURL=scheduleRule.js.map