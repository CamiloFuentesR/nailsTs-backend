"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
const user_1 = __importDefault(require("./user"));
const appointment_1 = __importDefault(require("./appointment"));
const Client = conection_1.default.define('Clients', {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    phone_number: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    user_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: user_1.default,
            key: 'id'
        }
    },
    state: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
});
Client.hasMany(appointment_1.default, { foreignKey: 'cliente_id' });
Client.hasOne(user_1.default, { foreignKey: 'user_id' });
exports.default = Client;
//# sourceMappingURL=client.js.map