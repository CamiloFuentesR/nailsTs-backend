"use strict";
/**
 * Validaciones de reglas de horario y excepciones.
 * Funciones puras: no tocan la base de datos ni Express.
 * Devuelven null si está todo bien, o el mensaje de error en español.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarExcepcion = exports.hayReglasSolapadas = exports.validarRegla = exports.esUuidValido = void 0;
const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * Los ids de estas tablas son UUID. Si llega otra cosa, Postgres falla al
 * castear y devuelve un 500 que parece un error del servidor cuando en
 * realidad es una petición mal formada.
 */
const esUuidValido = (id) => FORMATO_UUID.test(id);
exports.esUuidValido = esUuidValido;
const validarRegla = (regla) => {
    if (!Number.isInteger(regla.dayOfWeek) ||
        regla.dayOfWeek < 0 ||
        regla.dayOfWeek > 6) {
        return 'El día de la semana debe estar entre 0 y 6';
    }
    if (!FORMATO_HORA.test(regla.startTime) || !FORMATO_HORA.test(regla.endTime)) {
        return 'Las horas deben tener formato HH:mm';
    }
    if (regla.endTime <= regla.startTime) {
        return 'La hora de término debe ser posterior a la de inicio';
    }
    if (!FORMATO_HORA.test(regla.blockDuration)) {
        return 'La duración mínima debe tener formato HH:mm';
    }
    if (!FORMATO_FECHA.test(regla.validFrom)) {
        return 'La fecha de inicio de vigencia debe tener formato YYYY-MM-DD';
    }
    if (regla.validUntil !== null && regla.validUntil !== undefined) {
        if (!FORMATO_FECHA.test(regla.validUntil)) {
            return 'La fecha de término de vigencia debe tener formato YYYY-MM-DD';
        }
        if (regla.validUntil < regla.validFrom) {
            return 'La vigencia no puede terminar antes de comenzar';
        }
    }
    return null;
};
exports.validarRegla = validarRegla;
/** ¿Se cruzan las vigencias de dos reglas? validUntil null = sin tope. */
const vigenciasSeCruzan = (a, b) => {
    var _a, _b;
    const finA = (_a = a.validUntil) !== null && _a !== void 0 ? _a : '9999-12-31';
    const finB = (_b = b.validUntil) !== null && _b !== void 0 ? _b : '9999-12-31';
    return a.validFrom <= finB && b.validFrom <= finA;
};
/**
 * Detecta si dos reglas del mismo día pisan el mismo tramo horario mientras
 * ambas están vigentes. Bloques consecutivos (uno termina 13:00 y el otro
 * empieza 13:00) no se consideran solapados.
 */
const hayReglasSolapadas = (reglas) => {
    for (let i = 0; i < reglas.length; i++) {
        for (let j = i + 1; j < reglas.length; j++) {
            const a = reglas[i];
            const b = reglas[j];
            if (a.dayOfWeek !== b.dayOfWeek)
                continue;
            if (!vigenciasSeCruzan(a, b))
                continue;
            if (a.startTime < b.endTime && b.startTime < a.endTime)
                return true;
        }
    }
    return false;
};
exports.hayReglasSolapadas = hayReglasSolapadas;
const validarExcepcion = (exc) => {
    if (!FORMATO_FECHA.test(exc.date)) {
        return 'La fecha debe tener formato YYYY-MM-DD';
    }
    const tieneInicio = exc.startTime !== null && exc.startTime !== undefined;
    const tieneFin = exc.endTime !== null && exc.endTime !== undefined;
    if (tieneInicio !== tieneFin) {
        return 'Debes enviar ambas horas o ninguna';
    }
    if (tieneInicio && tieneFin) {
        if (!FORMATO_HORA.test(exc.startTime) ||
            !FORMATO_HORA.test(exc.endTime)) {
            return 'Las horas deben tener formato HH:mm';
        }
        if (exc.endTime <= exc.startTime) {
            return 'La hora de término debe ser posterior a la de inicio';
        }
    }
    return null;
};
exports.validarExcepcion = validarExcepcion;
//# sourceMappingURL=scheduleValidation.js.map