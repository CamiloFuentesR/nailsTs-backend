"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
const servicesCategory_1 = __importDefault(require("./servicesCategory"));
const Service = conection_1.default.define('Services', {
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
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    /*
     * Separa los servicios que se piden solos de los que se agregan a otro: el
     * retiro, la parafinoterapia, los largos adicionales de uña o el parche por
     * uña no son una cita, son un extra de la cita.
     *
     * Va por servicio y no por categoría porque dentro de una misma categoría
     * conviven las dos cosas (en POLYGEL están la extensión y los largos M y L).
     * Con la marca acá, qué categorías se ofrecen como opción principal se
     * deduce: son las que tienen al menos un servicio sin marcar.
     *
     * La columna la agrega helpers/ensureServiceColumns al arrancar.
     */
    es_complemento: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    services_category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: servicesCategory_1.default,
            key: 'id',
        },
    },
});
exports.default = Service;
//# sourceMappingURL=service.js.map