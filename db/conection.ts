import { Sequelize, Dialect } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const dbDatabase = process.env.POSTGRES_DATABASE || 'nails';
const dbUser = process.env.POSTGRES_USER || 'postgres';
const dbPassword = process.env.POSTGRES_PASSWORD;
const dbHost = process.env.POSTGRES_HOST;
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbDialect = process.env.DB_DIALECT as Dialect;

const db = new Sequelize(dbDatabase, dbUser, dbPassword, {
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

export default db;
