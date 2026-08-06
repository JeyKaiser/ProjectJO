-- ===========================================================================
-- 015: Catálogo de Referentes — tabla plana con 11 campos
--      Cada fila = una combinación de tela validada en producción
-- ===========================================================================

-- NOTA: Ejecutar primero el DROP si ya existen las tablas anteriores:
-- DROP TABLE IF EXISTS jo.referent_fabrics CASCADE;
-- DROP TABLE IF EXISTS jo.referents CASCADE;

CREATE TABLE IF NOT EXISTS jo.referents (
    id              SERIAL PRIMARY KEY,
    tipo_prenda     TEXT NOT NULL,
    cantidad_telas  INTEGER NOT NULL CHECK (cantidad_telas > 0),
    variante        INTEGER NOT NULL DEFAULT 1 CHECK (variante > 0),
    tela            INTEGER NOT NULL CHECK (tela > 0),
    uso_prenda      TEXT NOT NULL,
    base_textil     TEXT NOT NULL,
    color           TEXT DEFAULT 'SOLIDO',
    ancho_tela      TEXT NOT NULL,
    consumo         TEXT NOT NULL,
    descripcion     TEXT,
    terminacion     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tipo_prenda, cantidad_telas, variante, tela, uso_prenda, base_textil, color, ancho_tela)
);

-- ===========================================================================
-- Seed: migrar los 2 referentes de ejemplo desde src/data/referentes.js
-- ===========================================================================

INSERT INTO jo.referents (tipo_prenda, cantidad_telas, variante, tela, uso_prenda, base_textil, color, ancho_tela, consumo, descripcion, terminacion)
VALUES
  ('BIKINI BOTTOM - ALTO',   2, 1, 1, 'LUCIR',  'LYCRA VITA',  'SOLIDO',       '1,45', '0,17', 'LUCIR Y FORRO', 'EMBONADO'),
  ('BIKINI BOTTOM - ALTO',   2, 1, 1, 'LUCIR',  'LYCRA VITA',  'MODIFICACION', '1,45', '0,36', 'LUCIR Y FORRO', 'EMBONADO'),
  ('BIKINI BOTTOM - ALTO',   2, 1, 2, 'FORRO',  'LYCRA BAHIA', 'SOLIDO',       '1,48', '0,18', 'LUCIR Y FORRO', 'EMBONADO'),
  ('BIKINI BOTTOM - PANTY',  1, 1, 1, 'LUCIR',       'LYCRA BAHIA', 'SOLIDO', '1,48', '0,19', 'LUCIR, FORRO Y SESGO TIRAS. EN LA MISMA TELA', 'EMBONADO'),
  ('BIKINI BOTTOM - PANTY',  1, 1, 1, 'SESGO LUCIR', 'LYCRA BAHIA', 'SOLIDO', '1,48', '0,04', 'LUCIR, FORRO Y SESGO TIRAS. EN LA MISMA TELA', 'EMBONADO')
ON CONFLICT (tipo_prenda, cantidad_telas, variante, tela, uso_prenda, base_textil, color, ancho_tela) DO NOTHING;

-- ===========================================================================
-- Comentario
-- ===========================================================================

COMMENT ON TABLE jo.referents IS 'Catálogo de referentes: patrones validados de consumo textil. Tabla plana con 11 campos. Cada fila = una combinación tela + uso + base + color + ancho = consumo.';

-- ===========================================================================
-- Fotos de referentes (cards Nivel 1 y Nivel 2)
-- ===========================================================================

CREATE TABLE IF NOT EXISTS jo.referent_photos (
    id              SERIAL PRIMARY KEY,
    tipo_prenda     TEXT NOT NULL,
    cantidad_telas  INTEGER,
    variante        INTEGER,
    foto_url        TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tipo_prenda, cantidad_telas, variante)
);

COMMENT ON TABLE jo.referent_photos IS 'Fotos asociadas a cards de referentes: NULL en cant_telas/variante = Nivel 1 (tipo_prenda), con valores = Nivel 2 (combinación específica).';
