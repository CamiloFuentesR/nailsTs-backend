-- Citas sin solape: dos citas activas no pueden ocupar el mismo horario.
--
-- RESPALDO: normalmente no hace falta correrlo. Al arrancar, el backend llama a
-- helpers/ensureNoOverlapConstraint.ts, que hace exactamente esto. Este script
-- queda por si hay que instalarla sin levantar la aplicación.
--
-- CUIDADO: el ALTER TABLE FALLA si ya existen citas solapadas. Revisar primero
-- con la consulta de diagnóstico de más abajo.
--
-- NO es idempotente: correrlo dos veces falla con "constraint already exists",
-- sin efecto sobre los datos. Postgres no soporta ADD CONSTRAINT IF NOT EXISTS.

-- Diagnóstico (correr ANTES; debe devolver cero filas):
--
-- SELECT a.id, a."start", a."end", b.id, b."start", b."end"
-- FROM "Appointments" a
-- JOIN "Appointments" b
--   ON a.id < b.id
--  AND a."start" < b."end" AND a."end" > b."start"
-- WHERE a.state NOT IN (-1,4) AND b.state NOT IN (-1,4);

BEGIN;

-- La restricción no necesita btree_gist mientras excluya una sola expresión de
-- rango: gist ya sabe indexar tstzrange. Se deja instalada por si más adelante
-- se le suma una columna con `WITH =`. Si el rol no tiene permiso para crear
-- extensiones, esta línea se puede borrar y el resto funciona igual.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- tstzrange y no tsrange: las columnas son TIMESTAMP WITH TIME ZONE.
-- El rango es semiabierto, así que dos citas que se tocan en el borde
-- (una termina 11:00 y la otra empieza 11:00) NO cuentan como solape.
--
-- Los estados -1 (cancelada) y 4 no ocupan agenda, mismo criterio que
-- getAllAppointment y helpers/haySolape.ts. Las citas con state NULL quedan
-- fuera de la restricción: `state NOT IN (-1,4)` da NULL para ellas, no true.
ALTER TABLE "Appointments" ADD CONSTRAINT citas_sin_solape
  EXCLUDE USING gist (tstzrange("start", "end") WITH &&)
  WHERE (state NOT IN (-1, 4));

COMMIT;

-- Para deshacerla:
-- ALTER TABLE "Appointments" DROP CONSTRAINT citas_sin_solape;
