-- ===========================================================================
-- AtelierData v2.0 — Migración: Laboratorios de Molde y Molderia (Fase D)
--  Pruebas de molde del diseñador creativo (laboratorios): molde papel/digital,
--  digitalizacion, confeccion, medicion, aprobacion e integracion a molderia base.
-- Ejecutar en el SQL Editor de Supabase.
-- ===========================================================================
SET search_path = jo, public;

-- ---------------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'laboratorio_estado') THEN
        CREATE TYPE jo.laboratorio_estado AS ENUM (
            'EN_PREPARACION','EN_DIGITALIZACION','EN_CONFECCION','EN_MEDICION','APROBADO','RECHAZADO'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'laboratorio_tipo') THEN
        CREATE TYPE jo.laboratorio_tipo AS ENUM ('PAPEL','DIGITAL');
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. EXTENDER LABORATORIOS (workflow de la prueba de molde)
-- ---------------------------------------------------------------------------
ALTER TABLE jo.laboratorios ADD COLUMN IF NOT EXISTS estado             jo.laboratorio_estado DEFAULT 'EN_PREPARACION';
ALTER TABLE jo.laboratorios ADD COLUMN IF NOT EXISTS tipo_molde         jo.laboratorio_tipo;
ALTER TABLE jo.laboratorios ADD COLUMN IF NOT EXISTS fecha_inicio       DATE;
ALTER TABLE jo.laboratorios ADD COLUMN IF NOT EXISTS fecha_medicion     DATE;
ALTER TABLE jo.laboratorios ADD COLUMN IF NOT EXISTS resultado_medicion TEXT;
ALTER TABLE jo.laboratorios ADD COLUMN IF NOT EXISTS integrado_molderia BOOLEAN DEFAULT FALSE;
ALTER TABLE jo.laboratorios ADD COLUMN IF NOT EXISTS fecha_integracion  DATE;
ALTER TABLE jo.laboratorios ADD COLUMN IF NOT EXISTS realizado_por_nombre TEXT;
ALTER TABLE jo.laboratorios ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ DEFAULT NOW();

COMMENT ON TABLE jo.laboratorios IS
    'Pruebas de molde del creativo. EN_PREPARACION -> (PAPEL: EN_DIGITALIZACION) -> EN_CONFECCION -> EN_MEDICION -> APROBADO (se integra a molderia base) / RECHAZADO.';
COMMENT ON COLUMN jo.laboratorios.estado IS 'EN_PREPARACION | EN_DIGITALIZACION | EN_CONFECCION | EN_MEDICION | APROBADO | RECHAZADO';
COMMENT ON COLUMN jo.laboratorios.tipo_molde IS 'PAPEL (requiere digitalizar) | DIGITAL';
COMMENT ON COLUMN jo.laboratorios.integrado_molderia IS 'TRUE cuando el laboratorio aprobado se integra a la molderia base digital.';

-- ---------------------------------------------------------------------------
-- 3. EXTENDER MOLDERIA (registro por nombre, personas en localStorage)
-- ---------------------------------------------------------------------------
ALTER TABLE jo.molderia ADD COLUMN IF NOT EXISTS disenador TEXT;

-- ---------------------------------------------------------------------------
-- 4. INDICES + TRIGGERS + RLS
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_laboratorios_reference ON jo.laboratorios(reference_id);
CREATE INDEX IF NOT EXISTS idx_molderia_reference ON jo.molderia(reference_id);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_laboratorios_updated') THEN
        CREATE TRIGGER trg_laboratorios_updated
            BEFORE UPDATE ON jo.laboratorios
            FOR EACH ROW EXECUTE FUNCTION jo.update_timestamp();
    END IF;
END $$;

-- Consistencia con el patron de la app (anon key)
ALTER TABLE jo.laboratorios DISABLE ROW LEVEL SECURITY;
ALTER TABLE jo.molderia DISABLE ROW LEVEL SECURITY;