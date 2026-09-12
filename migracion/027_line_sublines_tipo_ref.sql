-- =============================================================================
-- 027 - Catálogo oficial de líneas, sublíneas y tipo de referencia
--
-- EJECUCIÓN MANUAL EN SUPABASE: ejecutar este archivo completo después de las
-- migraciones 022_auth_rbac.sql y 023_rbac_policies.sql, y ANTES de desplegar
-- el frontend que consulta jo.line_sublines. No elimina líneas, sublíneas ni
-- referencias previas.
-- Las combinaciones históricas que no estén en la matriz se conservan y quedan
-- identificables en jo.reference_line_subline_validation.
-- =============================================================================

BEGIN;

SET search_path = jo, public;

-- `code` es el tipo ref oficial de la línea. Se deja nullable para conservar
-- líneas históricas que no forman parte del catálogo oficial.
ALTER TABLE jo.lines ADD COLUMN IF NOT EXISTS code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS lines_code_unique
    ON jo.lines (code)
    WHERE code IS NOT NULL;
ALTER TABLE jo.lines DROP CONSTRAINT IF EXISTS lines_official_code_check;
ALTER TABLE jo.lines ADD CONSTRAINT lines_official_code_check CHECK (
    code IS NULL OR code IN ('DS', 'SK', 'TP', 'OW', 'SW', 'PS', 'JP', 'TN')
);

-- La relación de propiedad anterior deja de ser obligatoria. Se conserva como
-- dato legado para no alterar referencias ni IDs existentes; la relación válida
-- para uso actual es jo.line_sublines.
ALTER TABLE jo.sublines
    ALTER COLUMN line_id DROP NOT NULL;

CREATE TABLE IF NOT EXISTS jo.line_sublines (
    line_id     INTEGER NOT NULL REFERENCES jo.lines(id) ON DELETE CASCADE,
    subline_id  INTEGER NOT NULL REFERENCES jo.sublines(id) ON DELETE CASCADE,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (line_id, subline_id)
);

CREATE INDEX IF NOT EXISTS line_sublines_subline_id_idx
    ON jo.line_sublines (subline_id)
    WHERE active IS TRUE;

-- Las referencias nuevas reciben el tipo ref desde el código de su línea.
-- Las referencias históricas sin una línea oficial conservan NULL.
ALTER TABLE jo.references ADD COLUMN IF NOT EXISTS tipo_ref TEXT;

-- Una sublínea oficial debe tener exactamente una fila canónica. Ante
-- ambigüedad se aborta sin modificar ni borrar registros históricos.
DO $$
DECLARE duplicate_names TEXT;
BEGIN
    SELECT string_agg(name, ', ' ORDER BY name) INTO duplicate_names
    FROM (
        SELECT UPPER(name) AS name
        FROM jo.sublines
        WHERE UPPER(name) = ANY (ARRAY[
            'ANKLE', 'MAXI', 'MIDI', 'MINI', 'SHIRTDRESS', 'TUNIC', 'WRAP',
            'BODYSUIT', 'CROP TOP', 'POLO', 'SHIRT', 'T-SHIRT', 'TOP',
            'CARDIGAN', 'COAT', 'JACKET', 'KIMONO', 'PONCHO', 'SWEATER',
            'TRENCHCOAT', 'VEST', 'BIKINI BOTTOM', 'BIKINI TOP', 'ONEPIECE',
            'PANT', 'SHORT', 'JUMPSUIT'
        ])
        GROUP BY UPPER(name)
        HAVING COUNT(*) > 1
    ) AS duplicates;
    IF duplicate_names IS NOT NULL THEN
        RAISE EXCEPTION 'Canonical official sublines are ambiguous: %. Resolve duplicates explicitly before migration 027.', duplicate_names;
    END IF;
END;
$$;

-- Normaliza únicamente la capitalización de una fila ya canónica; el chequeo
-- anterior garantiza que no haya una segunda fila que pueda colisionar.
UPDATE jo.sublines
SET name = UPPER(name)
WHERE UPPER(name) = ANY (ARRAY[
    'ANKLE', 'MAXI', 'MIDI', 'MINI', 'SHIRTDRESS', 'TUNIC', 'WRAP',
    'BODYSUIT', 'CROP TOP', 'POLO', 'SHIRT', 'T-SHIRT', 'TOP',
    'CARDIGAN', 'COAT', 'JACKET', 'KIMONO', 'PONCHO', 'SWEATER',
    'TRENCHCOAT', 'VEST', 'BIKINI BOTTOM', 'BIKINI TOP', 'ONEPIECE',
    'PANT', 'SHORT', 'JUMPSUIT'
])
  AND name IS DISTINCT FROM UPPER(name);

CREATE UNIQUE INDEX IF NOT EXISTS sublines_official_canonical_name_unique
    ON jo.sublines (UPPER(name))
    WHERE UPPER(name) = ANY (ARRAY[
        'ANKLE', 'MAXI', 'MIDI', 'MINI', 'SHIRTDRESS', 'TUNIC', 'WRAP',
        'BODYSUIT', 'CROP TOP', 'POLO', 'SHIRT', 'T-SHIRT', 'TOP',
        'CARDIGAN', 'COAT', 'JACKET', 'KIMONO', 'PONCHO', 'SWEATER',
        'TRENCHCOAT', 'VEST', 'BIKINI BOTTOM', 'BIKINI TOP', 'ONEPIECE',
        'PANT', 'SHORT', 'JUMPSUIT'
    ]);

-- Se conservan las líneas antiguas, pero dejan de aparecer como opciones de
-- creación. SWIMWEAR ya es una línea oficial y se actualiza en el upsert.
UPDATE jo.lines
SET active = FALSE
WHERE name IN ('READY TO WEAR', 'ACCESSORIES', 'RESORT', 'COCKTAIL', 'BRIDAL');

INSERT INTO jo.lines (name, code, description, active)
VALUES
    ('DRESSES', 'DS', 'Official reference line for dresses', TRUE),
    ('SKIRTS', 'SK', 'Official reference line for skirts', TRUE),
    ('TOPS', 'TP', 'Official reference line for tops', TRUE),
    ('OUTERWEAR', 'OW', 'Official reference line for outerwear', TRUE),
    ('SWIMWEAR', 'SW', 'Official reference line for swimwear', TRUE),
    ('PANTS', 'PS', 'Official reference line for pants', TRUE),
    ('JUMPSUITS', 'JP', 'Official reference line for jumpsuits', TRUE),
    ('TUNIC', 'TN', 'Official reference line for tunics', TRUE)
ON CONFLICT (name) DO UPDATE
SET code = EXCLUDED.code,
    description = EXCLUDED.description,
    active = TRUE;

-- Las sublíneas oficiales se crean una sola vez. line_id queda NULL porque la
-- asociación vigente está normalizada en line_sublines; las filas legadas no
-- se borran ni se reasignan implícitamente.
WITH official_sublines(name) AS (
    VALUES
        ('ANKLE'), ('MAXI'), ('MIDI'), ('MINI'), ('SHIRTDRESS'), ('TUNIC'), ('WRAP'),
        ('BODYSUIT'), ('CROP TOP'), ('POLO'), ('SHIRT'), ('T-SHIRT'), ('TOP'),
        ('CARDIGAN'), ('COAT'), ('JACKET'), ('KIMONO'), ('PONCHO'), ('SWEATER'),
        ('TRENCHCOAT'), ('VEST'),
        ('BIKINI BOTTOM'), ('BIKINI TOP'), ('ONEPIECE'),
        ('PANT'), ('SHORT'), ('JUMPSUIT')
)
INSERT INTO jo.sublines (line_id, name, description, active)
SELECT NULL, name, 'Official subline', TRUE
FROM official_sublines AS source
WHERE NOT EXISTS (
    SELECT 1 FROM jo.sublines AS target WHERE target.name = source.name
);

WITH matrix(line_code, subline_name) AS (
    VALUES
        ('DS', 'ANKLE'), ('DS', 'MAXI'), ('DS', 'MIDI'), ('DS', 'MINI'),
        ('DS', 'SHIRTDRESS'), ('DS', 'TUNIC'), ('DS', 'WRAP'),
        ('SK', 'ANKLE'), ('SK', 'MAXI'), ('SK', 'MIDI'), ('SK', 'MINI'), ('SK', 'WRAP'),
        ('TP', 'BODYSUIT'), ('TP', 'CROP TOP'), ('TP', 'POLO'), ('TP', 'SHIRT'),
        ('TP', 'T-SHIRT'), ('TP', 'TOP'),
        ('OW', 'CARDIGAN'), ('OW', 'COAT'), ('OW', 'JACKET'), ('OW', 'KIMONO'),
        ('OW', 'PONCHO'), ('OW', 'SWEATER'), ('OW', 'TRENCHCOAT'), ('OW', 'VEST'),
        ('SW', 'BIKINI BOTTOM'), ('SW', 'BIKINI TOP'), ('SW', 'ONEPIECE'),
        ('PS', 'PANT'), ('PS', 'SHORT'),
        ('JP', 'JUMPSUIT'),
        ('TN', 'TUNIC')
)
INSERT INTO jo.line_sublines (line_id, subline_id, active)
SELECT line_catalog.id, subline_catalog.id, TRUE
FROM matrix
JOIN jo.lines AS line_catalog ON line_catalog.code = matrix.line_code
JOIN jo.sublines AS subline_catalog ON subline_catalog.name = matrix.subline_name
ON CONFLICT (line_id, subline_id) DO UPDATE SET active = TRUE;

UPDATE jo.references AS reference
SET tipo_ref = line_catalog.code
FROM jo.lines AS line_catalog
WHERE reference.line_id = line_catalog.id
  AND line_catalog.code IS NOT NULL;

CREATE OR REPLACE FUNCTION jo.sync_and_validate_reference_line_subline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = jo, public
AS $$
BEGIN
    IF NEW.line_id IS NOT NULL THEN
        SELECT code INTO NEW.tipo_ref
        FROM jo.lines
        WHERE id = NEW.line_id;
        IF NEW.tipo_ref IS NULL THEN
            RAISE EXCEPTION 'line_id % does not have an official tipo_ref code', NEW.line_id USING ERRCODE = '23514';
        END IF;
    ELSE
        NEW.tipo_ref := NULL;
    END IF;

    -- Los INSERT requieren la pareja completa. Los históricos nullable o
    -- inválidos se preservan mientras no se modifique dicha pareja.
    IF TG_OP = 'INSERT'
       OR NEW.line_id IS DISTINCT FROM OLD.line_id
       OR NEW.subline_id IS DISTINCT FROM OLD.subline_id THEN
        IF NEW.line_id IS NULL OR NEW.subline_id IS NULL THEN
            RAISE EXCEPTION 'New references require line_id and subline_id' USING ERRCODE = '23514';
        END IF;
        IF NOT EXISTS (
           SELECT 1
           FROM jo.line_sublines
           WHERE line_id = NEW.line_id
             AND subline_id = NEW.subline_id
             AND active IS TRUE
        ) THEN
        RAISE EXCEPTION 'Invalid line/subline combination: line_id %, subline_id %',
            NEW.line_id, NEW.subline_id
            USING ERRCODE = '23514';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_references_line_subline_matrix ON jo.references;
CREATE TRIGGER trg_references_line_subline_matrix
    BEFORE INSERT OR UPDATE
    ON jo.references
    FOR EACH ROW
    EXECUTE FUNCTION jo.sync_and_validate_reference_line_subline();

CREATE OR REPLACE FUNCTION jo.sync_reference_tipo_ref_on_line_code_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = jo, public
AS $$
BEGIN
    IF NEW.code IS DISTINCT FROM OLD.code THEN
        UPDATE jo.references SET tipo_ref = NEW.code WHERE line_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lines_sync_reference_tipo_ref ON jo.lines;
CREATE TRIGGER trg_lines_sync_reference_tipo_ref
    AFTER UPDATE OF code ON jo.lines
    FOR EACH ROW
    EXECUTE FUNCTION jo.sync_reference_tipo_ref_on_line_code_change();

CREATE OR REPLACE VIEW jo.reference_line_subline_validation
WITH (security_invoker = true) AS
SELECT
    reference.id AS reference_id,
    reference.line_id,
    reference.subline_id,
    line_catalog.name AS line_name,
    subline_catalog.name AS subline_name,
    reference.tipo_ref,
    CASE
        WHEN reference.line_id IS NULL OR reference.subline_id IS NULL THEN 'INCOMPLETE'
        WHEN linked.line_id IS NULL THEN 'INVALID'
        ELSE 'VALID'
    END AS validation_status
FROM jo.references AS reference
LEFT JOIN jo.lines AS line_catalog ON line_catalog.id = reference.line_id
LEFT JOIN jo.sublines AS subline_catalog ON subline_catalog.id = reference.subline_id
LEFT JOIN jo.line_sublines AS linked
    ON linked.line_id = reference.line_id
   AND linked.subline_id = reference.subline_id
   AND linked.active IS TRUE;

-- RLS y privilegios explícitos para PostgREST/Supabase. RLS no sustituye GRANT.
ALTER TABLE jo.line_sublines ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA jo TO authenticated;
GRANT SELECT ON jo.line_sublines TO authenticated;
GRANT SELECT ON jo.reference_line_subline_validation TO authenticated;
DROP POLICY IF EXISTS rbac_line_sublines_select ON jo.line_sublines;
DROP POLICY IF EXISTS rbac_line_sublines_admin_all ON jo.line_sublines;
CREATE POLICY rbac_line_sublines_select ON jo.line_sublines
    FOR SELECT TO authenticated
    USING ((SELECT jo.current_user_is_active()));
CREATE POLICY rbac_line_sublines_admin_all ON jo.line_sublines
    FOR ALL TO authenticated
    USING ((SELECT jo.current_user_has_role('Administrador')))
    WITH CHECK ((SELECT jo.current_user_has_role('Administrador')));

DO $$
BEGIN
    IF NOT has_table_privilege('authenticated', 'jo.line_sublines', 'SELECT') THEN
        RAISE EXCEPTION 'authenticated requires SELECT on jo.line_sublines';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_class
        WHERE oid = 'jo.line_sublines'::regclass AND relrowsecurity IS TRUE
    ) THEN
        RAISE EXCEPTION 'RLS must be enabled on jo.line_sublines';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'jo' AND tablename = 'line_sublines'
          AND policyname = 'rbac_line_sublines_select'
    ) THEN
        RAISE EXCEPTION 'Missing RLS SELECT policy for jo.line_sublines';
    END IF;
END;
$$;

COMMIT;
