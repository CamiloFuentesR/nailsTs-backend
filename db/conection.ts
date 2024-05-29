import { Sequelize, Dialect } from 'sequelize';
import dotenv from 'dotenv'
dotenv.config();

const dbDatabase = process.env.DB_DATABASE || 'nails';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbDialect = (process.env.DB_DIALECT) as Dialect;

const db = new Sequelize(dbDatabase, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: dbDialect,
    define:{
        timestamps: true,
        underscored: true,
    }
    // logging: false
});

export default db;
