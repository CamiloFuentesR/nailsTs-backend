-- Horarios recurrentes: reglas semanales + cierres puntuales.
--
-- RESPALDO: normalmente no hace falta correrlo. Al arrancar, el backend llama
-- a helpers/ensureScheduleTables.ts, que crea estas mismas tablas y constraints.
-- Este script queda por si hay que crearlas sin levantar la aplicación.
--
-- Idempotente: se puede correr más de una vez sin efecto.
-- NO modifica ni borra nada existente. business_hours queda intacta.

BEGIN;

CREATE TABLE IF NOT EXISTS schedule_rules (
  id             UUID PRIMARY KEY,
  day_of_week    SMALLINT     NOT NULL,
  start_time     TIME         NOT NULL,
  end_time       TIME         NOT NULL,
  valid_from     DATE         NOT NULL DEFAULT CURRENT_DATE,
  valid_until    DATE         NULL,
  block_duration VARCHAR(5)   NOT NULL DEFAULT '01:00',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT schedule_rules_dia_valido CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT schedule_rules_horario_valido CHECK (end_time > start_time),
  CONSTRAINT schedule_rules_vigencia_valida CHECK (valid_until IS NULL OR valid_until >= valid_from)
);

CREATE INDEX IF NOT EXISTS schedule_rules_dia_vigencia_idx
  ON schedule_rules (day_of_week, valid_from, valid_until);

CREATE TABLE IF NOT EXISTS schedule_exceptions (
  id          UUID PRIMARY KEY,
  date        DATE         NOT NULL,
  start_time  TIME         NULL,
  end_time    TIME         NULL,
  reason      VARCHAR(120) NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  -- Los dos tiempos van juntos: ambos nulos (día completo) o ambos presentes
  CONSTRAINT schedule_exceptions_horas_coherentes CHECK (
    (start_time IS NULL AND end_time IS NULL)
    OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

CREATE INDEX IF NOT EXISTS schedule_exceptions_fecha_idx
  ON schedule_exceptions (date);

COMMIT;
