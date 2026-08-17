-- ===========================================================================
-- AtelierData v2.0 — Migración: Solicitudes de Insumos a Bodega
-- Fase A: Insumos y Bodega (flujo del diseñador creativo)
-- Ejecutar en el SQL Editor de Supabase.
-- ===========================================================================
SET search_path = jo, public;

-- ---------------------------------------------------------------------------
-- 1. SOLICITUDES DE INSUMOS (supply_requests)
--    El creativo solicita (metros/unidades) -> bodega entrega con codigo y cantidad.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jo.supply_requests (
    id                  SERIAL PRIMARY KEY,
    reference_id        INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    supply_id           INTEGER REFERENCES jo.supplies(id) ON DELETE SET NULL,
    description         TEXT,
    quantity_requested  NUMERIC(10,4),
    unit_of_measure     TEXT,
    status              TEXT NOT NULL DEFAULT 'SOLICITADO'
                        CHECK (status IN ('SOLICITADO','ENTREGADO','CANCELADO')),
    requested_by        TEXT,
    requested_at        TIMESTAMPTZ DEFAULT NOW(),
    delivered_by        TEXT,
    delivered_code      TEXT,
    quantity_delivered  NUMERIC(10,4),
    delivered_at        TIMESTAMPTZ,
    used_confirmed      BOOLEAN DEFAULT FALSE,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE jo.supply_requests IS
    'Solicitudes de insumos del diseñador creativo a bodega. SOLICITADO -> ENTREGADO (con codigo y cantidad) -> confirmados como usados en reference_supplies.';
COMMENT ON COLUMN jo.supply_requests.status IS 'SOLICITADO | ENTREGADO | CANCELADO';
COMMENT ON COLUMN jo.supply_requests.used_confirmed IS 'TRUE cuando el creativo confirma el insumo como usado en la referencia (reference_supplies).';

CREATE INDEX IF NOT EXISTS idx_supply_requests_reference ON jo.supply_requests(reference_id);
CREATE INDEX IF NOT EXISTS idx_supply_requests_status ON jo.supply_requests(status);

-- Trigger de actualizacion de updated_at (reutiliza jo.update_timestamp existente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_supply_requests_updated'
    ) THEN
        CREATE TRIGGER trg_supply_requests_updated
            BEFORE UPDATE ON jo.supply_requests
            FOR EACH ROW EXECUTE FUNCTION jo.update_timestamp();
    END IF;
END $$;

-- Consistencia con el patron de la app (anon key, como cut_requests)
ALTER TABLE jo.supply_requests DISABLE ROW LEVEL SECURITY;