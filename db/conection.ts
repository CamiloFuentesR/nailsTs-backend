// import { Sequelize, Dialect } from 'sequelize';
// import dotenv from 'dotenv';
// dotenv.config();

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
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const db = new Sequelize(
  process.env.POSTGRES_DATABASE!,
  process.env.POSTGRES_USER!,
  process.env.POSTGRES_PASSWORD!,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres', // Especifica el dialecto de PostgreSQL
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

export default db;
