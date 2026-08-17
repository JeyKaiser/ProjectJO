-- ===========================================================================
-- AtelierData v2.0 — Migración: Corte y Confección de Muestra (Fase E)
--  El creativo corta la muestra (o la manda al equipo de corte) y la pasa a
--  confección con la lider de modistas. Reutiliza jo.cuts y jo.sewings.
-- Ejecutar en el SQL Editor de Supabase.
-- ===========================================================================
SET search_path = jo, public;

-- ---------------------------------------------------------------------------
-- 1. CUTS (corte de muestra)
-- ---------------------------------------------------------------------------
ALTER TABLE jo.cuts ADD COLUMN IF NOT EXISTS quien_corto  TEXT;
ALTER TABLE jo.cuts ADD COLUMN IF NOT EXISTS origen_corte TEXT; -- 'CREATIVO' | 'EQUIPO_CORTE'
ALTER TABLE jo.cuts ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE jo.cuts ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN jo.cuts.quien_corto  IS 'Persona (creativo) o "Equipo de corte" que realizó el corte.';
COMMENT ON COLUMN jo.cuts.origen_corte IS 'CREATIVO si lo cortó el diseñador; EQUIPO_CORTE si se mandó al equipo de corte.';

-- ---------------------------------------------------------------------------
-- 2. SEWINGS (confeccion de muestra / laboratorio)
-- ---------------------------------------------------------------------------
ALTER TABLE jo.sewings ADD COLUMN IF NOT EXISTS modista_nombre  TEXT;
ALTER TABLE jo.sewings ADD COLUMN IF NOT EXISTS tipo_muestra    TEXT; -- 'LABORATORIO' | 'MUESTRA'
ALTER TABLE jo.sewings ADD COLUMN IF NOT EXISTS created_at      TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE jo.sewings ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN jo.sewings.modista_nombre IS 'Nombre de la lider/modista que confecciona la muestra (personas en localStorage).';
COMMENT ON COLUMN jo.sewings.tipo_muestra   IS 'LABORATORIO (prueba parcial) | MUESTRA (muestra inicial).';

-- ---------------------------------------------------------------------------
-- 3. INDICES + TRIGGERS + RLS
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cuts_reference ON jo.cuts(reference_id);
CREATE INDEX IF NOT EXISTS idx_sewings_reference ON jo.sewings(reference_id);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cuts_updated') THEN
        CREATE TRIGGER trg_cuts_updated
            BEFORE UPDATE ON jo.cuts
            FOR EACH ROW EXECUTE FUNCTION jo.update_timestamp();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sewings_updated') THEN
        CREATE TRIGGER trg_sewings_updated
            BEFORE UPDATE ON jo.sewings
            FOR EACH ROW EXECUTE FUNCTION jo.update_timestamp();
    END IF;
END $$;

-- Consistencia con el patron de la app (anon key)
ALTER TABLE jo.cuts DISABLE ROW LEVEL SECURITY;
ALTER TABLE jo.sewings DISABLE ROW LEVEL SECURITY;