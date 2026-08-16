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
    /*
     * El mismo servicio con dos precios según con qué se pida. La parafinoterapia
     * son hoy dos filas cuyo nombre carga la condición ("al finalizar un
     * servicio" $2.000 / "sin esmaltado permanente" $10.000), y la clienta tiene
     * que darse cuenta sola de cuál le toca. Con esta columna es una sola fila:
     * `price` es lo que cuesta sola y `precio_agregado` lo que cuesta acompañada.
     *
     * Nullable y sin defaultValue: el caso normal es no tener precio condicional,
     * y ahí null significa "se cobra `price` siempre". Un 0 por omisión sería un
     * servicio gratis al agregarse, que es un cobro real y distinto de "no
     * aplica"; por eso el vacío se guarda como null y nunca como 0.
     *
     * INTEGER aunque `price` sea DECIMAL(10,2): los precios del salón son pesos
     * redondos y la columna donde termina esta cifra
     * (appointment_services.appointment_service_price) ya es INTEGER. Ojo con la
     * diferencia al comparar: Sequelize devuelve DECIMAL como string.
     *
     * La columna la agrega helpers/ensureServiceColumns al arrancar.
     */
    precio_agregado: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },
    /*
     * Servicios que se repiten dentro de la misma cita: el parche de polygel vale
     * $1.000 por uña, y quien necesita tres paga $3.000. Hasta ahora solo se
     * podía pedir uno.
     *
     * Multiplica el precio y NO la duración: hacer tres parches no toma el triple
     * de tiempo. La duración del servicio es la de la sesión y la decide la
     * administradora, así que `duration` se sigue usando tal cual.
     *
     * NOT NULL DEFAULT false: los servicios que ya existen se cobran una vez, que
     * es como se comportan hoy.
     */
    por_unidad: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    /*
     * El sustantivo de lo que se cuenta, en singular: "uña". Va como texto y no
     * como enum porque lo escribe la administradora y hoy solo existe un caso; un
     * enum obligaría a tocar código la primera vez que aparezca otro.
     *
     * Existe para que la pantalla pueda escribir "3 uñas" en vez de "3": sin el
     * sustantivo la clienta no sabe qué está eligiendo.
     */
    unidad: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
    },
    /*
     * Tope de unidades por cita. Nullable a propósito: null es "sin tope", que es
     * lo razonable por omisión. Diez sería el tope obvio para las uñas de las
     * manos, pero el tope lo pone ella según el servicio y no el código.
     */
    maximo_unidades: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
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