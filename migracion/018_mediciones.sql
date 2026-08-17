-- ===========================================================================
-- AtelierData v2.0 — Migración: Medición y Aprobación de Muestra (Fase C)
--  La prenda terminada se mide sobre modelo de tallaje, se analizan largos,
--  horma, posicion de estampado y cambios de molderia; se define si queda
--  APROBADA (pasa al rack de aprobadas) o RECHAZADA (requiere cambios).
-- Ejecutar en el SQL Editor de Supabase.
-- ===========================================================================
SET search_path = jo, public;

-- ---------------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medicion_resultado') THEN
        CREATE TYPE jo.medicion_resultado AS ENUM ('APROBADA','RECHAZADA');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medicion_cambio') THEN
        CREATE TYPE jo.medicion_cambio AS ENUM ('NINGUNO','MENOR','MAYOR');
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. TABLA MEDICIONES
--    Una fila por sesion de medicion de la muestra.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jo.mediciones (
    id                     SERIAL PRIMARY KEY,
    reference_id           INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    fecha                  DATE DEFAULT CURRENT_DATE,
    talla_medida           TEXT,
    resultado              jo.medicion_resultado NOT NULL DEFAULT 'RECHAZADA',
    tipo_cambio            jo.medicion_cambio DEFAULT 'NINGUNO',
    requiere_nueva_muestra BOOLEAN DEFAULT FALSE,
    analisis_largos        TEXT,
    analisis_horma         TEXT,
    posicion_estampado     TEXT,
    cambios_molderia       TEXT,
    observaciones          TEXT,
    medido_por             TEXT,
    ubicacion_rack         TEXT,
    created_at             TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE jo.mediciones IS
    'Sesiones de medicion de la muestra terminada. APROBADA ubica la referencia en el rack de aprobadas; RECHAZADA indica cambios de molderia (menores o mayores que exigen cortar otra muestra).';
COMMENT ON COLUMN jo.mediciones.tipo_cambio IS 'NINGUNO | MENOR (ajustes minimos) | MAYOR (requiere cortar otra muestra)';
COMMENT ON COLUMN jo.mediciones.requiere_nueva_muestra IS 'TRUE cuando los cambios son drasticos y se debe cortar otra muestra.';
COMMENT ON COLUMN jo.mediciones.ubicacion_rack IS 'Ubicacion en el rack de referencias aprobadas (si resultado = APROBADA).';

CREATE INDEX IF NOT EXISTS idx_mediciones_reference ON jo.mediciones(reference_id);
CREATE INDEX IF NOT EXISTS idx_mediciones_resultado ON jo.mediciones(resultado);

-- Consistencia con el patron de la app (anon key, como cut_requests/supply_requests)
ALTER TABLE jo.mediciones DISABLE ROW LEVEL SECURITY;
