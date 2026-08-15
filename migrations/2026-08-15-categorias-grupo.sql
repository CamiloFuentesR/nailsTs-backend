-- Grupo de la categoría: qué categorías no se pueden pedir juntas.
--
-- RESPALDO: normalmente no hace falta correrlo. Al arrancar, el backend llama a
-- helpers/ensureCategoryColumns.ts, que aplica exactamente este ALTER. Este
-- script queda por si hay que agregar las columnas sin levantar la aplicación.
--
-- Idempotente: se puede correr más de una vez sin efecto.
-- NO modifica ni borra nada existente.
--
-- Incluye también `incluye`, que la agrega el mismo helper y nunca tuvo script
-- de respaldo. Si ya está, el IF NOT EXISTS la deja como está.
--
-- LA REGLA, que no es obvia leyendo la columna:
--
--   Dos categorías con el mismo `grupo` son excluyentes: se elige una. Sin
--   grupo, o con grupos distintos, se pueden combinar.
--
-- Nullable a propósito: sin grupo significa "se combina con todo", que es el
-- caso del retiro, la parafinoterapia y el lifting de pestañas. El lifting no es
-- complemento de nada, se pide solo, pero convive con una manicure porque va en
-- otra parte del cuerpo. Lo que se pisa es lo que compite por el mismo lugar:
-- esmaltado permanente, manicure rusa, extensión con polygel y recubrimiento
-- van todos sobre la misma uña.
--
-- No hace falta una matriz servicio por servicio porque las combinaciones que sí
-- valen ya existen como servicios propios: "extensión con polygel + esmaltado
-- permanente" es una fila con su precio y su duración, no dos servicios sumados.
--
-- Los valores los carga la administradora desde el panel; esta migración no
-- precarga ninguno.

BEGIN;

ALTER TABLE "services_categories"
  ADD COLUMN IF NOT EXISTS incluye JSONB,
  ADD COLUMN IF NOT EXISTS grupo VARCHAR(40);

COMMIT;

-- Para deshacerla:
-- ALTER TABLE "services_categories" DROP COLUMN IF EXISTS grupo;
