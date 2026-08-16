import db from '../db/conection';
import ServicesCategory from '../models/servicesCategory';

/**
 * Agrega a services_category las columnas nuevas que falten.
 *
 * El proyecto no usa sequelize-cli y las tablas se crearon a mano, así que no
 * hay migraciones donde poner esto. Se sigue el mismo camino que
 * ensureScheduleTables: una sentencia idempotente al arrancar, que en Koyeb se
 * ejecuta una vez por despliegue y no por request.
 *
 * ADD COLUMN IF NOT EXISTS es de Postgres y no toca la tabla si la columna ya
 * está. Nunca usar sync({ alter: true }) acá: infiere diferencias contra los
 * modelos y puede llegar a borrar columnas.
 *
 * El nombre de la tabla se pide al modelo en vez de escribirlo: Sequelize
 * pluraliza 'services_category', y hardcodearlo se rompería en silencio si
 * alguna vez cambia esa convención.
 */
export const ensureCategoryColumns = async (): Promise<void> => {
  // getTableName devuelve un objeto cuando la tabla lleva esquema. Sin este
  // caso, el template literal escribiría "[object Object]" y el ALTER fallaría.
  const nombre = ServicesCategory.getTableName();
  const tabla = typeof nombre === 'string' ? nombre : nombre.tableName;

  /*
   * `grupo` es nullable a propósito, y la regla completa es esta:
   *
   *   Dos categorías con el mismo `grupo` son excluyentes: se elige una. Sin
   *   grupo, o con grupos distintos, se pueden combinar.
   *
   * Sin grupo significa "se combina con todo", que es el caso del retiro, la
   * parafinoterapia y el lifting de pestañas: el lifting no es complemento de
   * nada, se pide solo, pero convive con una manicure porque va en otra parte
   * del cuerpo. Lo que se pisa es lo que compite por el mismo lugar: esmaltado
   * permanente, manicure rusa, extensión con polygel y recubrimiento van todos
   * sobre la misma uña.
   *
   * No hace falta una matriz de compatibilidad servicio por servicio porque las
   * combinaciones que sí valen ya existen como servicios propios: "polygel +
   * esmaltado permanente" es una fila con su precio y su duración, no dos
   * servicios sumados.
   */
  await db.query(`
    ALTER TABLE "${tabla}"
      ADD COLUMN IF NOT EXISTS incluye JSONB,
      ADD COLUMN IF NOT EXISTS grupo VARCHAR(40);
  `);
};

export default ensureCategoryColumns;
