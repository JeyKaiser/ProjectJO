-- ===========================================================================
-- Migracion: Crear tabla jo.trazos
-- Registro de trazos individuales del trazador en Audaces.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS jo.trazos (
    id                   SERIAL PRIMARY KEY,
    reference_id         INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    reference_fabric_id  INTEGER REFERENCES jo.reference_fabrics(id) ON DELETE SET NULL,
    tipo_tela            jo.consumo_tipo_tela,
    fase                 TEXT NOT NULL CHECK (fase IN ('costeo', 'contramuestra')),
    opcion_num           INTEGER NOT NULL DEFAULT 1,
    veces_trazadas       INTEGER DEFAULT 1,
    cantidad_piezas      INTEGER,
    consumo_valor        NUMERIC(10,4),
    talla                TEXT,
    ancho_tela           TEXT,
    ancho_sesgo          TEXT,
    consumo_lineal       NUMERIC(10,4),
    archivo_audaces      TEXT,
    fecha_inicio         DATE,
    fecha_fin            DATE,
    trazador_id          INTEGER REFERENCES jo.persons(id),
    observaciones        TEXT,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (reference_id, tipo_tela, fase, opcion_num)
);

CREATE INDEX IF NOT EXISTS idx_trazos_reference ON jo.trazos(reference_id);
CREATE INDEX IF NOT EXISTS idx_trazos_fase ON jo.trazos(reference_id, fase);
CREATE INDEX IF NOT EXISTS idx_trazos_trazador ON jo.trazos(trazador_id);
