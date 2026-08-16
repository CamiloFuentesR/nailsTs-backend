-- Servicios por unidad y servicios con precio distinto al agregarse a otro.
--
-- RESPALDO: normalmente no hace falta correrlo. Al arrancar, el backend llama a
-- helpers/ensureServiceColumns.ts, que aplica exactamente estos ALTER. Este
-- script queda por si hay que agregar las columnas sin levantar la aplicación.
--
-- CUÁNDO SÍ HAY QUE CORRERLO A MANO, que es el caso que a nadie se le ocurre
-- hasta que pasa: si el usuario con el que la aplicación se conecta a la base
-- NO tiene permiso de ALTER sobre estas tablas. Ahí el helper falla al arrancar,
-- el servidor levanta igual (el error solo queda en el log, a propósito) pero
-- los modelos declaran columnas que no existen, y entonces NO se cae solo lo
-- nuevo: se cae TODO /api/services y todo lo que lea una cita con sus
-- servicios, con un 500 por columna inexistente.
--
-- O sea: si después de desplegar el panel de servicios responde 500, mira el
-- log del arranque antes que nada, y si dice que no se pudieron verificar las
-- columnas, corre este script con un usuario que sí pueda hacer ALTER.
--
-- Idempotente: se puede correr más de una vez sin efecto.
-- NO modifica ni borra nada existente.
--
-- Incluye también es_complemento, que agrega el mismo helper y ya tiene su
-- propio script. Si la columna está, el IF NOT EXISTS la deja como está.
--
-- LO QUE RESUELVE, que no se lee en los nombres de las columnas:
--
-- 1. precio_agregado — el mismo servicio con dos precios según el contexto.
--    Hoy la parafinoterapia son dos filas y el nombre carga la condición:
--      "Manicure SPA al finalizar un servicio"   $2.000
--      "Manicure SPA sin esmaltado permanente"  $10.000
--    Con la columna es una sola fila: `price` es lo que cuesta pedida sola y
--    `precio_agregado` lo que cuesta cuando acompaña a otro servicio.
--    Nullable a propósito: null = sin precio condicional, se cobra `price`
--    siempre. El vacío se guarda como null y nunca como 0, porque 0 sería un
--    cobro real (gratis al agregarse) y no "no aplica".
--
-- 2. por_unidad / unidad / maximo_unidades — servicios que se repiten dentro de
--    la misma cita. El parche de polygel vale $1.000 por uña y quien necesita
--    tres paga $3.000; hasta ahora solo se podía pedir uno.
--    `unidad` es el sustantivo en singular ("uña") para que la pantalla escriba
--    "3 uñas" y no "3". `maximo_unidades` nulo es sin tope.
--    El precio se multiplica por la cantidad; la DURACIÓN NO. Hacer tres
--    parches no toma el triple de tiempo: la duración es la de la sesión y la
--    fija la administradora en `duration`.
--
-- 3. appointment_services.cantidad — dónde se anota cuántas se hicieron. Va en
--    la cita y no en el servicio porque el servicio dice que se cobra por
--    unidad y la cita dice cuántas. Una fila con cantidad en vez de N filas
--    repetidas, porque los informes por categoría cuentan filas y tres parches
--    repetidos se leerían como tres servicios distintos.
--
-- Los valores por omisión son lo que hace que el despliegue no cambie nada:
-- precio_agregado nulo y por_unidad false reproducen el comportamiento actual
-- exacto, y cantidad 1 es lo que ya significan las citas guardadas.
--
-- Los datos los carga la administradora desde el panel; esta migración no
-- precarga ninguno. Las dos filas de parafinoterapia siguen existiendo tal cual
-- hasta que ella las unifique a mano.

BEGIN;

ALTER TABLE "Services"
  ADD COLUMN IF NOT EXISTS es_complemento BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS precio_agregado INTEGER,
  ADD COLUMN IF NOT EXISTS por_unidad BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS unidad VARCHAR(20),
  ADD COLUMN IF NOT EXISTS maximo_unidades INTEGER;

ALTER TABLE "appointment_services"
  ADD COLUMN IF NOT EXISTS cantidad INTEGER NOT NULL DEFAULT 1;

COMMIT;

-- Para deshacerlas:
-- ALTER TABLE "Services"
--   DROP COLUMN IF EXISTS precio_agregado,
--   DROP COLUMN IF EXISTS por_unidad,
--   DROP COLUMN IF EXISTS unidad,
--   DROP COLUMN IF EXISTS maximo_unidades;
-- ALTER TABLE "appointment_services" DROP COLUMN IF EXISTS cantidad;
