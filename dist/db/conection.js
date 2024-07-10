"use strict";
// import { Sequelize, Dialect } from 'sequelize';
// import dotenv from 'dotenv';
// dotenv.config();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const dbDatabase = process.env.POSTGRES_DATABASE || 'nails';
// const dbUser = process.env.POSTGRES_USER || 'postgres';
// const dbPassword = process.env.POSTGRES_PASSWORD;
// const dbHost = process.env.POSTGRES_HOST;
// const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
// const dbDialect = process.env.DB_DIALECT as Dialect;
// const db = new Sequelize(dbDatabase, dbUser, dbPassword, {
//   host: dbHost,
//   port: dbPort,
//   dialect: dbDialect,
//   define: {
//     timestamps: true,
//     underscored: true,
//     // freezeTableName: true,
//   },
//   timezone: 'America/Santiago',
//   dialectOptions: {
//     useUTC: false, // Para que no use UTC
//     timezone: 'America/Santiago',
//   },
//   // logging: false
// });
// export default db;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db = new sequelize_1.Sequelize(process.env.POSTGRES_DATABASE, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres', // Especifica el dialecto de PostgreSQL
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
exports.default = db;
//# sourceMappingURL=conection.js.map