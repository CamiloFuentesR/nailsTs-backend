"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
// Definición del modelo en Sequelize
const ServicesCategory = conection_1.default.define('services_category', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    state: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    information: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    img: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: false, // Desactiva las marcas de tiempo automáticas
});
exports.default = ServicesCategory;
//# sourceMappingURL=servicesCategory.js.map