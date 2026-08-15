import db from '../db/conection';
import Service from '../models/service';

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
export const ensureServiceColumns = async (): Promise<void> => {
  // getTableName devuelve un objeto cuando la tabla lleva esquema. Sin este
  // caso, el template literal escribiría "[object Object]" y el ALTER fallaría.
  const nombre = Service.getTableName();
  const tabla = typeof nombre === 'string' ? nombre : nombre.tableName;

  await db.query(`
    ALTER TABLE "${tabla}"
      ADD COLUMN IF NOT EXISTS es_complemento BOOLEAN NOT NULL DEFAULT false;
  `);
};

export default ensureServiceColumns;
