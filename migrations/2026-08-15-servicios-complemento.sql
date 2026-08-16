-- Servicios complemento: distinguir el servicio principal del que se le suma.
--
-- RESPALDO: normalmente no hace falta correrlo. Al arrancar, el backend llama a
-- helpers/ensureServiceColumns.ts, que aplica exactamente este ALTER. Este
-- script queda por si hay que agregar la columna sin levantar la aplicación.
--
-- Idempotente: se puede correr más de una vez sin efecto.
-- NO modifica ni borra nada existente.
--
-- Los servicios que ya están quedan todos en false, o sea principales, que es
-- como se comportan hoy: nada cambia al desplegar. La administradora marca
-- después desde el panel los que son complementos (retiro, parafinoterapia,
-- largos adicionales de uña, parche por uña).

BEGIN;

ALTER TABLE "Services"
  ADD COLUMN IF NOT EXISTS es_complemento BOOLEAN NOT NULL DEFAULT false;

COMMIT;

-- Para deshacerla:
-- ALTER TABLE "Services" DROP COLUMN IF EXISTS es_complemento;
