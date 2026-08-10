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
exports.ensureScheduleTables = void 0;
const conection_1 = __importDefault(require("../db/conection"));
const scheduleException_1 = __importDefault(require("../models/scheduleException"));
const scheduleRule_1 = __importDefault(require("../models/scheduleRule"));
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
const ensureScheduleTables = () => __awaiter(void 0, void 0, void 0, function* () {
    yield scheduleRule_1.default.sync();
    yield scheduleException_1.default.sync();
    // Los CHECK no los genera Sequelize. Se aplican con un bloque idempotente
    // porque Postgres no soporta ADD CONSTRAINT IF NOT EXISTS.
    yield conection_1.default.query(`
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
});
exports.ensureScheduleTables = ensureScheduleTables;
//# sourceMappingURL=ensureScheduleTables.js.map