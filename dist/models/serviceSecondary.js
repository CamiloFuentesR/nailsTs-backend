"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
const serviceCategorySecondary_1 = __importDefault(require("./serviceCategorySecondary"));
const ServiceSecondary = conection_1.default.define('Services_secondary', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    state: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    duration: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: true,
    },
    category_secondary_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: serviceCategorySecondary_1.default,
            key: 'id',
        },
    },
});
exports.default = ServiceSecondary;
//# sourceMappingURL=serviceSecondary.js.map