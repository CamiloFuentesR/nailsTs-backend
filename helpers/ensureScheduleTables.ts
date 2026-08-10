import db from '../db/conection';
import ScheduleException from '../models/scheduleException';
import ScheduleRule from '../models/scheduleRule';

/**
 * Crea las tablas de horarios si no existen y les aplica sus constraints.
 *
 * Acotado a propósito a los dos modelos nuevos: un db.sync() global crearía
 * tablas para CUALQUIER modelo registrado en Sequelize, incluidos los que no
 * están en el barrel de models (conditionalService, serviceProvisions), y
 * dejaría tablas basura en la base.
 *
 * Nunca usar force ni alter: el primero hace DROP TABLE y el segundo puede
 * borrar columnas al inferir diferencias contra modelos desalineados.
 * .sync() sin argumentos es CREATE TABLE IF NOT EXISTS y no toca lo existente.
 */
export const ensureScheduleTables = async (): Promise<void> => {
  await ScheduleRule.sync();
  await ScheduleException.sync();

  // Los CHECK no los genera Sequelize. Se aplican con un bloque idempotente
  // porque Postgres no soporta ADD CONSTRAINT IF NOT EXISTS.
  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'schedule_rules_horario_valido'
      ) THEN
        ALTER TABLE schedule_rules
          ADD CONSTRAINT schedule_rules_horario_valido CHECK (end_time > start_time);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'schedule_rules_dia_valido'
      ) THEN
        ALTER TABLE schedule_rules
          ADD CONSTRAINT schedule_rules_dia_valido CHECK (day_of_week BETWEEN 0 AND 6);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'schedule_rules_vigencia_valida'
      ) THEN
        ALTER TABLE schedule_rules
          ADD CONSTRAINT schedule_rules_vigencia_valida
          CHECK (valid_until IS NULL OR valid_until >= valid_from);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'schedule_exceptions_horas_coherentes'
      ) THEN
        ALTER TABLE schedule_exceptions
          ADD CONSTRAINT schedule_exceptions_horas_coherentes CHECK (
            (start_time IS NULL AND end_time IS NULL)
            OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
          );
      END IF;
    END $$;
  `);

  console.log('Tablas de horarios verificadas');
};
