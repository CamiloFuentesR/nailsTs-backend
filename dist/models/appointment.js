"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
const service_1 = __importDefault(require("./service"));
const servicesCategory_1 = __importDefault(require("./servicesCategory"));
const Appointment = conection_1.default.define('Appointments', {
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        autoIncrement: true,
    },
    client_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
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
    // time: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    // },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    service_type: {
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
    category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: servicesCategory_1.default,
            key: 'id',
        },
    },
});
exports.default = Appointment;
//# sourceMappingURL=appointment.js.map