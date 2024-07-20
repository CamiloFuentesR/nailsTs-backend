import { Sequelize, Dialect } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbDatabase = process.env.DB_DATABASE || 'nails';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbDialect = process.env.DB_DIALECT as Dialect;
const isProduction = process.env.NODE_ENV === 'production';
const db = new Sequelize(dbDatabase, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: dbDialect,
  protocol: dbDialect,
  dialectModule: pg,
  define: {
    timestamps: true,
    underscored: true,
  },
  timezone: 'America/Santiago',
  dialectOptions: {
    useUTC: false, // Para que no use UTC
    timezone: 'America/Santiago',
    ssl: isProduction
      ? {
          require: true,
          rejectUnauthorized: false,
        }
      : null,
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false,
    // },
  },
  // logging: false,
});

export default db;
