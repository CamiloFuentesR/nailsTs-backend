"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureServiceColumns = void 0;
const conection_1 = __importDefault(require("../db/conection"));
const service_1 = __importDefault(require("../models/service"));
/**
 * Agrega a Services las columnas nuevas que falten.
 *
 * Mismo camino que ensureCategoryColumns: el proyecto no usa sequelize-cli y
 * las tablas se crearon a mano, así que no hay migraciones donde poner esto.
 * Una sentencia idempotente al arrancar, que en Koyeb se ejecuta una vez por
 * despliegue y no por request.
 *
 * ADD COLUMN IF NOT EXISTS es de Postgres y no toca la tabla si la columna ya
 * está. Nunca usar sync({ alter: true }) acá: infiere diferencias contra los
 * modelos y puede llegar a borrar columnas.
 *
 * NOT NULL DEFAULT false y no nullable: los servicios que ya existen quedan
 * todos como principales, que es exactamente cómo se comportan hoy. Nada cambia
 * al desplegar; la administradora marca después los que son complementos
 * (retiro, parafinoterapia, largos adicionales, parche por uña).
 *
 * El nombre de la tabla se pide al modelo en vez de escribirlo: Sequelize
 * pluraliza el nombre del modelo, y hardcodearlo se rompería en silencio si
 * alguna vez cambia esa convención.
 */
const ensureServiceColumns = () => __awaiter(void 0, void 0, void 0, function* () {
    // getTableName devuelve un objeto cuando la tabla lleva esquema. Sin este
    // caso, el template literal escribiría "[object Object]" y el ALTER fallaría.
    const nombre = service_1.default.getTableName();
    const tabla = typeof nombre === 'string' ? nombre : nombre.tableName;
    yield conection_1.default.query(`
    ALTER TABLE "${tabla}"
      ADD COLUMN IF NOT EXISTS es_complemento BOOLEAN NOT NULL DEFAULT false;
  `);
});
exports.ensureServiceColumns = ensureServiceColumns;
exports.default = exports.ensureServiceColumns;
//# sourceMappingURL=ensureServiceColumns.js.map