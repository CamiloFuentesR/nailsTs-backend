"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbDatabase = process.env.POSTGRES_DATABASE || 'nails';
const dbUser = process.env.POSTGRES_USER || 'postgres';
const dbPassword = process.env.POSTGRES_PASSWORD;
const dbHost = process.env.POSTGRES_HOST;
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbDialect = process.env.DB_DIALECT;
const db = new sequelize_1.Sequelize(dbDatabase, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: dbDialect,
    define: {
        timestamps: true,
        underscored: true,
        // freezeTableName: true,
    },
    timezone: 'America/Santiago',
    dialectOptions: {
        useUTC: false, // Para que no use UTC
        timezone: 'America/Santiago',
    },
    // logging: false
});
exports.default = db;
//# sourceMappingURL=conection.js.map