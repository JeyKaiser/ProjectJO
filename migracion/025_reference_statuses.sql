-- Estados ampliados de referencias: definicion del ENUM y columnas.
-- Ejecutar por separado y confirmar la transaccion antes de ejecutar
-- 026_reference_statuses_seed.sql.

SET search_path = jo, public;

-- PostgreSQL no permite eliminar valores individuales de un ENUM de forma segura.
-- Los valores legacy se dejan en el tipo, pero se eliminan del catalogo en 026.
ALTER TYPE jo.reference_status ADD VALUE IF NOT EXISTS 'CANCELADO_COMERCIAL';
ALTER TYPE jo.reference_status ADD VALUE IF NOT EXISTS 'CANCELADO_CORTADO';
ALTER TYPE jo.reference_status ADD VALUE IF NOT EXISTS 'CANCELADO_SIN_CORTAR';
ALTER TYPE jo.reference_status ADD VALUE IF NOT EXISTS 'SE_RETOMA_PROXIMA_COLECCION';
ALTER TYPE jo.reference_status ADD VALUE IF NOT EXISTS 'CANCELADO_PAQUETE_COMPLETO';
ALTER TYPE jo.reference_status ADD VALUE IF NOT EXISTS 'APROBADO_REPROGRAMACION';
ALTER TYPE jo.reference_status ADD VALUE IF NOT EXISTS 'JUST_FOR_SHOW';

ALTER TABLE jo.reference_statuses
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE jo.reference_statuses
  ADD COLUMN IF NOT EXISTS label TEXT;

ALTER TABLE jo.reference_statuses
  ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE jo.reference_statuses
  ADD COLUMN IF NOT EXISTS sort_order INTEGER;
