-- ===========================================================================
-- AtelierData v2.0 — Migración: Consumos Creativos (Fase B)
--  1. Confirmación de telas usadas en la muestra (reference_fabrics.usada)
--  2. Consumo de insumos POR TALLA (reference_supplies.talla)
-- Ejecutar en el SQL Editor de Supabase.
-- ===========================================================================
SET search_path = jo, public;

-- ---------------------------------------------------------------------------
-- 1. TELAS USADAS EN MUESTRA
--    El creativo confirma cuáles telas de la ficha se usaron realmente.
-- ---------------------------------------------------------------------------
ALTER TABLE jo.reference_fabrics ADD COLUMN IF NOT EXISTS usada BOOLEAN DEFAULT FALSE;
ALTER TABLE jo.reference_fabrics ADD COLUMN IF NOT EXISTS confirmada_por TEXT;

COMMENT ON COLUMN jo.reference_fabrics.usada IS 'TRUE cuando el creativo confirma que la tela se usó en la muestra.';
COMMENT ON COLUMN jo.reference_fabrics.confirmada_por IS 'Persona que confirmó la tela como usada.';

-- ---------------------------------------------------------------------------
-- 2. INSUMOS POR TALLA
--    reference_supplies pasa a soportar consumo de insumo por talla.
--    talla NULL = consumo global de la referencia (Fase A / confirmar usado).
-- ---------------------------------------------------------------------------
ALTER TABLE jo.reference_supplies ADD COLUMN IF NOT EXISTS talla TEXT;
ALTER TABLE jo.reference_supplies ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE jo.reference_supplies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN jo.reference_supplies.talla IS 'Talla para consumo de insumo por talla. NULL = consumo global de la referencia.';

-- Trigger de actualizacion de updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_reference_supplies_updated'
    ) THEN
        CREATE TRIGGER trg_reference_supplies_updated
            BEFORE UPDATE ON jo.reference_supplies
            FOR EACH ROW EXECUTE FUNCTION jo.update_timestamp();
    END IF;
END $$;

-- Indices de apoyo para consultas por talla
CREATE INDEX IF NOT EXISTS idx_reference_supplies_reference ON jo.reference_supplies(reference_id);
CREATE INDEX IF NOT EXISTS idx_reference_supplies_supply ON jo.reference_supplies(supply_id);
