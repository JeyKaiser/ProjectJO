-- ===========================================================================
-- AtelierData v2.0 — Migración: Tabla de Corte (Cut Requests)
-- ===========================================================================
SET search_path = jo, public;

CREATE TABLE IF NOT EXISTS jo.cut_requests (
    id                SERIAL PRIMARY KEY,
    reference_id      INTEGER REFERENCES jo.references(id) ON DELETE CASCADE,
    collection_id     INTEGER REFERENCES jo.collections(id),
    type              TEXT NOT NULL DEFAULT 'muestra',
    fabric_handling   TEXT DEFAULT 'solido',
    requester_name    TEXT,
    requester_role    TEXT,
    cortador_names    TEXT[],
    fecha_recepcion   TIMESTAMPTZ DEFAULT NOW(),
    fecha_entrega     TIMESTAMPTZ,
    status            TEXT DEFAULT 'en_cola',
    observations      TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE jo.cut_requests ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

COMMENT ON TABLE jo.cut_requests IS 'Solicitudes de corte: muestras, contramuestras, piezas, forros, sesgos. Reemplaza Google Sheets.';
COMMENT ON COLUMN jo.cut_requests.type IS 'muestra | contramuestra | pieza | laboratorio | forro | pedido_especial | sesgo';
COMMENT ON COLUMN jo.cut_requests.fabric_handling IS 'solido | mod_arte | ubic_trazo | cuero | all_over';
COMMENT ON COLUMN jo.cut_requests.status IS 'en_cola | en_corte | cortado | entregado';

ALTER TABLE jo.cut_requests DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_cut_requests_status ON jo.cut_requests(status);
CREATE INDEX IF NOT EXISTS idx_cut_requests_reference ON jo.cut_requests(reference_id);
