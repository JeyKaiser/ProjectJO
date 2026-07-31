-- ===========================================================================
-- Migracion consolidada: Tablas y campos para el workflow del Trazador
-- Incluye: jo.trazos, campos en jo.consumos, fecha_inicio en jo.entregables,
-- y jo.comparativo_trazos.
-- ===========================================================================

-- 1. Tabla de trazos individuales
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

-- 2. Campos de trazabilidad en consumos
ALTER TABLE jo.consumos 
ADD COLUMN IF NOT EXISTS veces_trazadas INTEGER,
ADD COLUMN IF NOT EXISTS cantidad_piezas INTEGER,
ADD COLUMN IF NOT EXISTS trazo_id INTEGER REFERENCES jo.trazos(id) ON DELETE SET NULL;

-- 3. Fecha de inicio en entregables
ALTER TABLE jo.entregables 
ADD COLUMN IF NOT EXISTS fecha_inicio DATE;

-- 4. Tabla de comparativo de trazos
CREATE TABLE IF NOT EXISTS jo.comparativo_trazos (
    id                     SERIAL PRIMARY KEY,
    reference_id           INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    trazo_costeo_id        INTEGER REFERENCES jo.trazos(id) ON DELETE SET NULL,
    trazo_contramuestra_id INTEGER REFERENCES jo.trazos(id) ON DELETE SET NULL,
    difiere_veces          BOOLEAN DEFAULT FALSE,
    justificacion_veces    TEXT,
    difiere_piezas         BOOLEAN DEFAULT FALSE,
    justificacion_piezas   TEXT,
    difiere_ancho          BOOLEAN DEFAULT FALSE,
    justificacion_ancho    TEXT,
    difiere_molderia       BOOLEAN DEFAULT FALSE,
    justificacion_molderia TEXT,
    difiere_sesgo          BOOLEAN DEFAULT FALSE,
    justificacion_sesgo    TEXT,
    difiere_ancho_sesgo    BOOLEAN DEFAULT FALSE,
    justificacion_ancho_sesgo TEXT,
    difiere_telas          BOOLEAN DEFAULT FALSE,
    justificacion_telas    TEXT,
    trazador_id            INTEGER REFERENCES jo.persons(id),
    fecha_comparativo      DATE DEFAULT CURRENT_DATE,
    observaciones          TEXT,
    created_at             TIMESTAMPTZ DEFAULT NOW(),
    updated_at             TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (reference_id, trazo_costeo_id, trazo_contramuestra_id)
);

CREATE INDEX IF NOT EXISTS idx_comparativo_reference ON jo.comparativo_trazos(reference_id);
