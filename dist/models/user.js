"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection")); // Importa tu instancia de Sequelize
const role_1 = __importDefault(require("./role")); // Importa el modelo de Role si es necesario
const client_1 = __importDefault(require("./client"));
const User = conection_1.default.define('Users', {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        // autoIncrement: true,
        references: {
        // model: Client,
        // key: 'user_id'
        }
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    role_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: role_1.default,
            key: 'id'
        },
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    }
});
// Sobrescribir el método toJSON en el prototipo del modelo
User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
};
// Definir la relación con Role si es necesario
User.belongsTo(role_1.default, { foreignKey: 'role_id' });
User.hasOne(client_1.default, { keyType: 'id' });
exports.default = User;
//# sourceMappingURL=user.js.map