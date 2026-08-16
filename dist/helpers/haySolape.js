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
exports.rangoValido = exports.buscarCitaSolapada = exports.tomarLockAgenda = exports.LOCK_TIMEOUT_AGENDA = exports.ESTADOS_QUE_NO_OCUPAN = void 0;
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
const appointment_1 = __importDefault(require("../models/appointment"));
/**
 * Estados que NO ocupan agenda: -1 es cita cancelada (borrado suave) y 4 es el
 * otro estado que `getAllAppointment` deja fuera. Se replica ese criterio para
 * que la validación vea exactamente las mismas citas que el calendario.
 */
exports.ESTADOS_QUE_NO_OCUPAN = [-1, 4];
/**
 * Tope de duración de una cita. Los servicios más largos del catálogo son de
 * 3 horas y una combinación grande no pasa de 5, así que 12 deja margen de
 * sobra. Existe para que nadie pueda grabar una cita de años que haga que
 * todas las creaciones posteriores encuentren solape.
 */
const DURACION_MAXIMA_MS = 12 * 60 * 60 * 1000;
/**
 * Cuánto puede esperar por un lock una escritura de agenda.
 *
 * Está acá y no repetido en cada llamador porque es una perilla de tuning: si
 * alguien la sube, tiene que subirla en un solo lugar. La usa también el ALTER
 * de ensureNoOverlapConstraint, que acota la espera pero no toma el lock
 * consultivo.
 */
exports.LOCK_TIMEOUT_AGENDA = '3s';
/**
 * Clave del lock de agenda. Cualquier bigint fijo sirve; un segundo lock
 * consultivo en el proyecto debe usar una clave distinta.
 */
const LOCK_AGENDA = 918273645;
/**
 * Serializa las escrituras de agenda dentro de la transacción recibida.
 *
 * El tope de espera va primero: SET LOCAL se revierte solo al cerrar la
 * transacción. Sin tope, una transacción trabada encola a todas las siguientes
 * con su conexión del pool tomada y deja sin base de datos a la API completa,
 * no solo al endpoint que la provocó. Acota cualquier espera de lock de la
 * transacción, no solo la del lock consultivo de acá abajo.
 *
 * Después toma el lock. Sin él, dos peticiones simultáneas pueden leer las dos
 * "libre" y grabar las dos: una consulta seguida de un insert no es atómica.
 * El lock se suelta solo al cerrar la transacción.
 *
 * Asume READ COMMITTED (el default de Postgres): la consulta de solape ve lo
 * que commiteó quien tenía el lock antes. Con REPEATABLE_READ dejaría de verlo
 * y se grabarían dos citas encima sin ningún error.
 */
const tomarLockAgenda = (transaction) => __awaiter(void 0, void 0, void 0, function* () {
    yield conection_1.default.query(`SET LOCAL lock_timeout = '${exports.LOCK_TIMEOUT_AGENDA}'`, {
        transaction,
    });
    yield conection_1.default.query(`SELECT pg_advisory_xact_lock(${LOCK_AGENDA})`, {
        transaction,
    });
});
exports.tomarLockAgenda = tomarLockAgenda;
/**
 * ¿Hay una cita activa que se pise con [inicio, fin)?
 *
 * La condición es `start < fin && end > inicio`. Dos citas que se tocan en el
 * borde (una termina 11:00, la otra empieza 11:00) NO solapan, que es el
 * comportamiento correcto para una agenda.
 *
 * Devuelve la cita encontrada o null.
 */
const buscarCitaSolapada = (_a) => __awaiter(void 0, [_a], void 0, function* ({ inicio, fin, ignorarId, transaction, }) {
    const where = Object.assign({ state: { [sequelize_1.Op.notIn]: exports.ESTADOS_QUE_NO_OCUPAN }, start: { [sequelize_1.Op.lt]: fin }, end: { [sequelize_1.Op.gt]: inicio } }, (ignorarId ? { id: { [sequelize_1.Op.ne]: ignorarId } } : {}));
    return appointment_1.default.findOne({ where, transaction });
});
exports.buscarCitaSolapada = buscarCitaSolapada;
/** ¿El rango es utilizable? Fechas válidas, fin posterior y duración acotada. */
const rangoValido = (inicio, fin) => !isNaN(inicio.getTime()) &&
    !isNaN(fin.getTime()) &&
    fin > inicio &&
    fin.getTime() - inicio.getTime() <= DURACION_MAXIMA_MS;
exports.rangoValido = rangoValido;
//# sourceMappingURL=haySolape.js.map