-- ===========================================================================
-- AtelierData v2.0 — Migración: Años por Colección + Soft-Delete
-- ===========================================================================
SET search_path = jo, public;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. CREAR TABLA collection_years
--    Cada colección puede tener N años. Cada año es independientemente ocultable.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS jo.collection_years (
    id          SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES jo.collections(id) ON DELETE CASCADE,
    year        INTEGER NOT NULL,
    is_hidden   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (collection_id, year)
);

COMMENT ON TABLE jo.collection_years IS 'Años asociados a cada colección. Cada año puede ocultarse independientemente.';
COMMENT ON COLUMN jo.collection_years.is_hidden IS 'TRUE = año oculto (solo visible para administradores)';

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. MIGRAR DATOS EXISTENTES: collections.year → collection_years
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.collection_years (collection_id, year)
SELECT id, year FROM jo.collections
WHERE year IS NOT NULL
ON CONFLICT (collection_id, year) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. AÑADIR year A references
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE jo.references ADD COLUMN IF NOT EXISTS year INTEGER;

-- Poblar el year en referencias existentes desde su colección padre
UPDATE jo.references r
SET year = c.year
FROM jo.collections c
WHERE r.collection_id = c.id
  AND r.year IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. CAMBIAR CONSTRAINT DE UNICIDAD EN references
--    reference_number debe ser ÚNICO GLOBAL (no se repite entre colecciones ni años)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE jo.references DROP CONSTRAINT IF EXISTS references_collection_id_reference_number_key;
ALTER TABLE jo.references ADD CONSTRAINT references_reference_number_unique UNIQUE (reference_number);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. DESACTIVAR RLS EN TABLAS AFECTADAS (anon key necesita escritura)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE jo.collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE jo.references DISABLE ROW LEVEL SECURITY;
ALTER TABLE jo.collection_years DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. CREAR ÍNDICES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_references_year ON jo.references(year);
CREATE INDEX IF NOT EXISTS idx_references_is_hidden ON jo.references(is_hidden);
CREATE INDEX IF NOT EXISTS idx_collection_years_collection ON jo.collection_years(collection_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. ACTUALIZAR SEED: Añadir Winter Sun 2025 como año adicional
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.collection_years (collection_id, year)
SELECT id, 2025 FROM jo.collections WHERE code = 'WS'
ON CONFLICT (collection_id, year) DO NOTHING;
