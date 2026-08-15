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
    /*
     * JSONB y no una tabla aparte: es una lista corta de texto que solo se lee
     * completa, nunca se consulta ni se ordena por sus elementos. Una tabla
     * hija seria mas peso del que resuelve.
     * La columna la agrega helpers/ensureCategoryColumns al arrancar.
     */
    incluye: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
        defaultValue: null,
    },
    /*
     * Que categorias se pisan entre si. Dos categorias con el mismo grupo son
     * excluyentes: se elige una. Sin grupo, o con grupos distintos, se pueden
     * combinar.
     *
     * Es texto libre y no un enum ni una tabla aparte: los grupos los define la
     * administradora desde el panel y son un puñado. Un enum obligaria a tocar
     * codigo cada vez que aparece una linea nueva de servicios.
     *
     * Nullable y sin defaultValue: sin grupo es el caso normal (retiro,
     * parafinoterapia, lifting de pestañas se combinan con todo) y solo las
     * categorias que compiten por el mismo lugar llevan un valor.
     *
     * La columna la agrega helpers/ensureCategoryColumns al arrancar.
     */
    grupo: {
        type: sequelize_1.DataTypes.STRING(40),
        allowNull: true,
        defaultValue: null,
    },
}, {
    timestamps: false, // Desactiva las marcas de tiempo automáticas
});
exports.default = ServicesCategory;
//# sourceMappingURL=servicesCategory.js.map