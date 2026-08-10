/**
 * Validaciones de reglas de horario y excepciones.
 * Funciones puras: no tocan la base de datos ni Express.
 * Devuelven null si está todo bien, o el mensaje de error en español.
 */

interface ReglaValidable {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  validFrom: string;
  validUntil: string | null;
  blockDuration: string;
}

interface ExcepcionValidable {
  date: string;
  startTime: string | null;
  endTime: string | null;
}

const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Los ids de estas tablas son UUID. Si llega otra cosa, Postgres falla al
 * castear y devuelve un 500 que parece un error del servidor cuando en
 * realidad es una petición mal formada.
 */
export const esUuidValido = (id: string): boolean => FORMATO_UUID.test(id);

export const validarRegla = (regla: ReglaValidable): string | null => {
  if (
    !Number.isInteger(regla.dayOfWeek) ||
    regla.dayOfWeek < 0 ||
    regla.dayOfWeek > 6
  ) {
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

/** ¿Se cruzan las vigencias de dos reglas? validUntil null = sin tope. */
const vigenciasSeCruzan = (a: ReglaValidable, b: ReglaValidable): boolean => {
  const finA = a.validUntil ?? '9999-12-31';
  const finB = b.validUntil ?? '9999-12-31';
  return a.validFrom <= finB && b.validFrom <= finA;
};

/**
 * Detecta si dos reglas del mismo día pisan el mismo tramo horario mientras
 * ambas están vigentes. Bloques consecutivos (uno termina 13:00 y el otro
 * empieza 13:00) no se consideran solapados.
 */
export const hayReglasSolapadas = (reglas: ReglaValidable[]): boolean => {
  for (let i = 0; i < reglas.length; i++) {
    for (let j = i + 1; j < reglas.length; j++) {
      const a = reglas[i];
      const b = reglas[j];
      if (a.dayOfWeek !== b.dayOfWeek) continue;
      if (!vigenciasSeCruzan(a, b)) continue;
      if (a.startTime < b.endTime && b.startTime < a.endTime) return true;
    }
  }
  return false;
};

export const validarExcepcion = (exc: ExcepcionValidable): string | null => {
  if (!FORMATO_FECHA.test(exc.date)) {
    return 'La fecha debe tener formato YYYY-MM-DD';
  }
  const tieneInicio = exc.startTime !== null && exc.startTime !== undefined;
  const tieneFin = exc.endTime !== null && exc.endTime !== undefined;

  if (tieneInicio !== tieneFin) {
    return 'Debes enviar ambas horas o ninguna';
  }
  if (tieneInicio && tieneFin) {
    if (
      !FORMATO_HORA.test(exc.startTime as string) ||
      !FORMATO_HORA.test(exc.endTime as string)
    ) {
      return 'Las horas deben tener formato HH:mm';
    }
    if ((exc.endTime as string) <= (exc.startTime as string)) {
      return 'La hora de término debe ser posterior a la de inicio';
    }
  }
  return null;
};
