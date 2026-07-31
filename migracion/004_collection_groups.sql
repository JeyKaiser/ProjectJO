-- ===========================================================================
-- AtelierData v2.0 — Migración: Grupos Canónicos de Colecciones
-- ===========================================================================
SET search_path = jo, public;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. CREAR TABLA collection_groups
--    6 temporadas canonicas. Cada coleccion pertenece a 1 grupo via season.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS jo.collection_groups (
    id          SERIAL PRIMARY KEY,
    code        TEXT UNIQUE NOT NULL,   -- 'WS', 'RS', 'SS', 'SV', 'PF', 'FW'
    name        TEXT NOT NULL,          -- 'WINTER SUN', 'RESORT RTW'...
    image_url   TEXT,                   -- Imagen compartida por todas las colecciones del grupo
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE jo.collection_groups IS 'Temporadas canonicas (6 grupos fijos). Cada coleccion se asocia via season.';

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. SEED DE GRUPOS CANONICOS
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.collection_groups (code, name, image_url) VALUES
('WS', 'WINTER SUN',       '/images/colecciones/winter_sun.png'),
('RS', 'RESORT RTW',       '/images/colecciones/resort_rtw.png'),
('SS', 'SPRING SUMMER',    '/images/colecciones/spring_summer.png'),
('SV', 'SUMMER VACATION',  '/images/colecciones/summer_vacation.png'),
('PF', 'PREFALL RTW',      '/images/colecciones/prefall_rtw.png'),
('FW', 'FALL WINTER',      '/images/colecciones/fall_winter.png')
ON CONFLICT (code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. DESACTIVAR RLS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE jo.collection_groups DISABLE ROW LEVEL SECURITY;
