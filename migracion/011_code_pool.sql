-- ===========================================================================
-- AtelierData v2.0 — Code Pool: Gestión centralizada de códigos MD/PT
-- Ejecutar en SQL Editor de Supabase
-- ===========================================================================
SET search_path = jo, public;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. TABLA: code_pool — Catálogo maestro de todos los códigos
-- ═══════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS jo.code_pool CASCADE;

CREATE TABLE jo.code_pool (
    id              SERIAL PRIMARY KEY,
    code            TEXT NOT NULL UNIQUE,
    code_type       jo.reference_code_type NOT NULL,
    prefix          TEXT,
    sequential_num  INTEGER,
    status          TEXT NOT NULL DEFAULT 'DISPONIBLE'
                    CHECK (status IN ('DISPONIBLE','ASIGNADO','RESERVADO','RETIRADO')),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE jo.code_pool IS 'Catálogo central de códigos MD/PT. Registra todos los códigos existentes y su estado (disponible, asignado, reservado, retirado).';
COMMENT ON COLUMN jo.code_pool.status IS 'DISPONIBLE: libre para asignar | ASIGNADO: vinculado a una referencia | RESERVADO: bloqueado para futuro | RETIRADO: dado de baja';

CREATE INDEX idx_code_pool_type   ON jo.code_pool(code_type);
CREATE INDEX idx_code_pool_status ON jo.code_pool(status);
CREATE INDEX idx_code_pool_prefix ON jo.code_pool(prefix);
