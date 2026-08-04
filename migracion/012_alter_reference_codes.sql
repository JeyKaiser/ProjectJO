-- ===========================================================================
-- AtelierData v2.0 — ALTER reference_codes: vincular con code_pool
-- Ejecutar DESPUES de 011_code_pool.sql
-- ===========================================================================
SET search_path = jo, public;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Agregar columnas a reference_codes
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE jo.reference_codes
    ADD COLUMN IF NOT EXISTS pool_code_id INTEGER REFERENCES jo.code_pool(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS assigned_by   TEXT,
    ADD COLUMN IF NOT EXISTS notes         TEXT;

COMMENT ON COLUMN jo.reference_codes.pool_code_id IS 'FK al code_pool. Vincula el código asignado con su registro en el catálogo maestro.';
COMMENT ON COLUMN jo.reference_codes.assigned_by   IS 'Usuario/rol que realizó la asignación.';
COMMENT ON COLUMN jo.reference_codes.notes         IS 'Notas del administrador sobre esta asignación.';

CREATE INDEX IF NOT EXISTS idx_reference_codes_pool ON jo.reference_codes(pool_code_id);
