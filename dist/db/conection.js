"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pg_1 = __importDefault(require("pg"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbDatabase = process.env.DB_DATABASE || 'nails';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbDialect = process.env.DB_DIALECT;
const isProduction = process.env.NODE_ENV === 'production';
const db = new sequelize_1.Sequelize(dbDatabase, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: dbDialect,
    protocol: dbDialect,
    dialectModule: pg_1.default,
    define: {
        timestamps: true,
        underscored: true,
    },
    timezone: 'America/Santiago',
    dialectOptions: {
        useUTC: false, // Para que no use UTC
        timezone: 'America/Santiago',
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
        logging: false,
        // ssl: isProduction
        //   ? {
        //       require: true,
        //       rejectUnauthorized: false,
        //     }
        //   : null,
    },
});
exports.default = db;
//# sourceMappingURL=conection.js.map