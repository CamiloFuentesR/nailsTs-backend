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
exports.ensureNoOverlapConstraint = void 0;
const conection_1 = __importDefault(require("../db/conection"));
const haySolape_1 = require("./haySolape");
/**
 * Instala la restricción que hace imposible grabar dos citas encima, incluso
 * escribiendo por fuera de la API.
 *
 * Es la última capa de la validación de solape. El controlador ya la hace con
 * un lock consultivo, pero eso solo cubre lo que pasa por createAppointment y
 * updateAppointment; esta restricción la aplica la base a cualquier escritura.
 *
 * `tstzrange` y no `tsrange`: el modelo declara DataTypes.DATE, que en Postgres
 * es TIMESTAMP WITH TIME ZONE. Con tsrange el ALTER falla por tipos.
 *
 * El rango es semiabierto, así que dos citas que se tocan en el borde (una
 * termina 11:00 y la otra empieza 11:00) NO cuentan como solape. Es el mismo
 * criterio de helpers/haySolape.ts.
 *
 * Los estados -1 (cancelada) y 4 no ocupan agenda y quedan fuera, igual que en
 * getAllAppointment y haySolape. Ojo: una cita con state NULL también queda
 * fuera, porque en SQL `state NOT IN (-1, 4)` da NULL y no true. Es a propósito:
 * la restricción no debe ser más estricta que la validación del controlador, que
 * descarta esas mismas citas por el mismo motivo.
 *
 * NUNCA impide levantar la aplicación: si la tabla ya tiene citas solapadas el
 * ALTER falla, y en ese caso se registra el motivo y se sigue. La validación
 * del controlador cubre igual el camino normal.
 */
const ensureNoOverlapConstraint = () => __awaiter(void 0, void 0, void 0, function* () {
    // Va en su propio try: en un Postgres administrado el rol puede no tener
    // permiso para crear extensiones, y esa falla no debe impedir el ALTER. La
    // restricción no necesita btree_gist mientras excluya una sola expresión de
    // rango; haría falta recién si algún día se le suma una columna con `WITH =`.
    try {
        yield conection_1.default.query('CREATE EXTENSION IF NOT EXISTS btree_gist');
    }
    catch (error) {
        console.warn('No se pudo crear la extensión btree_gist:', error.message);
    }
    try {
        // Postgres no soporta ADD CONSTRAINT IF NOT EXISTS, así que se consulta
        // antes, igual que en ensureScheduleTables. Se filtra también por conrelid
        // porque conname es único por tabla y no por base: sin ese filtro, una
        // restricción con el mismo nombre en otra tabla daría un falso positivo y
        // la de citas nunca se instalaría.
        const [filas] = yield conection_1.default.query(`
      SELECT 1 FROM pg_constraint
      WHERE conname = 'citas_sin_solape'
        AND conrelid = '"Appointments"'::regclass
    `);
        if (filas.length > 0)
            return;
        // El ALTER va con tope de espera y dentro de una transacción propia.
        // ADD CONSTRAINT ... EXCLUDE toma ACCESS EXCLUSIVE sobre la tabla, y en
        // Postgres un pedido de lock pendiente bloquea a todos los que llegan
        // detrás: en un despliegue con la instancia vieja todavía atendiendo, eso
        // congela la agenda entera mientras espera. Con el tope se rinde a los 3s y
        // lo reintenta el siguiente arranque.
        //
        // Tiene que ser SET LOCAL dentro de transacción: un SET suelto se queda
        // pegado a la conexión, y el pool de Sequelize la recicla para consultas
        // ajenas. El DDL transaccional no es problema en Postgres.
        //
        // La tabla lleva mayúscula inicial porque Sequelize pluraliza el nombre del
        // modelo, y "end" es palabra reservada: las dos van entre comillas. "start"
        // no es reservada, pero se cita igual para que el par se lea parejo.
        yield conection_1.default.transaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
            yield conection_1.default.query(`SET LOCAL lock_timeout = '${haySolape_1.LOCK_TIMEOUT_AGENDA}'`, {
                transaction,
            });
            yield conection_1.default.query(`
        ALTER TABLE "Appointments" ADD CONSTRAINT citas_sin_solape
          EXCLUDE USING gist (tstzrange("start", "end") WITH &&)
          WHERE (state NOT IN (-1, 4))
        `, { transaction });
        }));
        console.log('Restricción citas_sin_solape instalada');
    }
    catch (error) {
        console.warn('No se pudo instalar citas_sin_solape (la agenda sigue funcionando):', error.message);
    }
});
exports.ensureNoOverlapConstraint = ensureNoOverlapConstraint;
exports.default = exports.ensureNoOverlapConstraint;
//# sourceMappingURL=ensureNoOverlapConstraint.js.map