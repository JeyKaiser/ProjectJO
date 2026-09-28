-- =============================================================================
-- 028 - Integridad para la futura importacion masiva de referencias
--
-- Ejecutar completa y manualmente. No crea colecciones, anos, lineas, procesos
-- ni codigos. En 028 code_pool/reference_codes siguen siendo la autoridad
-- escribible para no romper el frontend actual; las tablas MD/PT son una
-- proyeccion compatible. El cambio de autoridad queda para una migracion
-- posterior coordinada con frontend. Importacion exclusiva de Administrador.
-- =============================================================================

BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '5min';
SET LOCAL search_path = jo, public;

-- Ruta de instalacion/upgrade. Una revision anterior de 028 congelaba legacy y
-- revocaba su escritura. Esos restos deben retirarse antes del preflight y antes
-- de los backfills que normalizan code_pool. Solo se retiran los dos guards 028
-- conocidos; cualquier otro trigger, incluidas las integraciones 013, se conserva.
DO $$
DECLARE previous_028 BOOLEAN;
BEGIN
  previous_028 := to_regclass('jo.md_codes') IS NOT NULL
    OR to_regclass('jo.import_batches') IS NOT NULL
    OR EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE (tgrelid=to_regclass('jo.code_pool') AND tgname='trg_028_freeze_code_pool')
         OR (tgrelid=to_regclass('jo.reference_codes') AND tgname='trg_028_freeze_reference_codes')
    );
  IF previous_028 THEN
    RAISE NOTICE '028 UPGRADE: detectada instalacion previa; se retiraran temporalmente solo los guards freeze 028 y se restauraran grants legacy minimos';
  ELSE
    RAISE NOTICE '028 FRESH_INSTALL: no se detectaron objetos ni guards de una instalacion 028 previa';
  END IF;
END;
$$;
DROP TRIGGER IF EXISTS trg_028_freeze_code_pool ON jo.code_pool;
DROP TRIGGER IF EXISTS trg_028_freeze_reference_codes ON jo.reference_codes;
-- Minimo requerido por la autoridad legacy compatible. RLS sigue siendo la
-- barrera de Administrador y se valida inmediatamente en el preflight.
GRANT INSERT,UPDATE,DELETE ON jo.code_pool,jo.reference_codes TO authenticated;

-- -----------------------------------------------------------------------------
-- 1. Preflight: abortar antes de cualquier DDL si el esquema o los datos no
--    permiten una conversion determinista.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    missing_objects TEXT;
    details TEXT;
    unresolved_import_history BOOLEAN;
BEGIN
    SELECT string_agg(object_name, ', ' ORDER BY object_name)
    INTO missing_objects
    FROM unnest(ARRAY[
        'jo.collections', 'jo.collection_years', 'jo.lines', 'jo.sublines',
        'jo.line_sublines', 'jo.references', 'jo.reference_statuses',
        'jo.code_pool', 'jo.reference_codes', 'jo.code_log',
        'jo.reference_states', 'jo.state_history', 'jo.user_accounts'
    ]) AS required(object_name)
    WHERE to_regclass(object_name) IS NULL;

    IF missing_objects IS NOT NULL THEN
        RAISE EXCEPTION '028 preflight: faltan objetos requeridos: %', missing_objects;
    END IF;

    IF to_regprocedure('jo.current_user_has_role(text)') IS NULL
       OR to_regprocedure('jo.current_user_is_active()') IS NULL
       OR to_regprocedure('jo.guard_reference_status_change()') IS NULL THEN
        RAISE EXCEPTION '028 preflight: faltan helpers RBAC/status de 022/023/026';
    END IF;

    -- Legacy sigue siendo escribible en 028, pero solamente para Administrador.
    -- Se valida la combinacion efectiva de privilegios + RLS antes de conservarla.
    IF EXISTS (
        SELECT 1
        FROM unnest(ARRAY['code_pool','reference_codes']) AS required(table_name)
        LEFT JOIN pg_class AS c ON c.oid=to_regclass(format('jo.%I',required.table_name))
        WHERE c.oid IS NULL OR c.relrowsecurity IS NOT TRUE
    ) THEN
        RAISE EXCEPTION '028 preflight: code_pool/reference_codes deben tener RLS habilitada';
    END IF;
    IF NOT has_table_privilege('authenticated','jo.code_pool','INSERT,UPDATE,DELETE')
       OR NOT has_table_privilege('authenticated','jo.reference_codes','INSERT,UPDATE,DELETE') THEN
        RAISE EXCEPTION '028 preflight: faltan privilegios legacy de escritura para authenticated; no se puede conservar compatibilidad';
    END IF;
    IF EXISTS (
        SELECT 1
        FROM (VALUES ('code_pool'),('reference_codes')) AS t(table_name)
        CROSS JOIN (VALUES ('INSERT'),('UPDATE'),('DELETE')) AS operation(cmd)
        WHERE NOT EXISTS (
            SELECT 1 FROM pg_policies AS p
            WHERE p.schemaname='jo' AND p.tablename=t.table_name
              AND p.permissive='PERMISSIVE' AND p.cmd IN ('ALL',operation.cmd)
              AND ('authenticated'=ANY(p.roles) OR 'public'=ANY(p.roles))
        ) OR EXISTS (
            SELECT 1 FROM pg_policies AS p
            WHERE p.schemaname='jo' AND p.tablename=t.table_name
              AND p.permissive='PERMISSIVE' AND p.cmd IN ('ALL',operation.cmd)
              AND ('authenticated'=ANY(p.roles) OR 'public'=ANY(p.roles))
              AND concat_ws(' ',p.qual,p.with_check) NOT ILIKE '%current_user_has_role%Administrador%'
              AND NOT EXISTS (
                  SELECT 1 FROM pg_policies AS guard
                  WHERE guard.schemaname='jo' AND guard.tablename=t.table_name
                    AND guard.permissive='RESTRICTIVE' AND guard.cmd IN ('ALL',operation.cmd)
                    AND ('authenticated'=ANY(guard.roles) OR 'public'=ANY(guard.roles))
                    AND concat_ws(' ',guard.qual,guard.with_check) ILIKE '%current_user_has_role%Administrador%'
              )
        )
    ) THEN
        RAISE EXCEPTION '028 preflight: las politicas efectivas de code_pool/reference_codes no restringen toda escritura authenticated a Administrador';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='jo' AND table_name='reference_statuses' AND column_name='is_cancelled'
    ) THEN
        RAISE EXCEPTION '028 preflight: falta jo.reference_statuses.is_cancelled (migracion 025)';
    END IF;

    SELECT string_agg(format('%s(season=%s,year=%s)', code, season, year), ', ' ORDER BY code)
    INTO details
    FROM jo.collections
    WHERE season IS NULL
       OR season NOT IN ('WS', 'SS', 'SV', 'RS', 'PF', 'FW')
       OR code IS NULL
       OR (code !~ '^(WS|SS|SV|RS|PF|FW)[0-9]{2}$'
           AND NOT (code = season AND code ~ '^(WS|SS|SV|RS|PF|FW)$' AND year IS NOT NULL))
       OR (code ~ '^(WS|SS|SV|RS|PF|FW)[0-9]{2}$' AND left(code,2) <> season);
    IF details IS NOT NULL THEN
        RAISE EXCEPTION '028 preflight: colecciones no normalizables: %', details;
    END IF;

    SELECT string_agg(candidate, ', ' ORDER BY candidate)
    INTO details
    FROM (
        SELECT candidate
        FROM (
            SELECT CASE WHEN code ~ '^[A-Z]{2}$'
                        THEN code || right(year::TEXT, 2) ELSE code END AS candidate
            FROM jo.collections
        ) AS candidates
        GROUP BY candidate
        HAVING count(*) > 1
    ) AS normalized
    ;
    IF details IS NOT NULL THEN
        RAISE EXCEPTION '028 preflight: la normalizacion colisionaria en collections.code: %', details;
    END IF;

    SELECT string_agg(format('reference=%s,line=%s,subline=%s', r.id, r.line_id, r.subline_id), '; ' ORDER BY r.id)
    INTO details
    FROM jo.references AS r
    LEFT JOIN jo.lines AS l ON l.id = r.line_id
    LEFT JOIN jo.line_sublines AS ls
      ON ls.line_id = r.line_id AND ls.subline_id = r.subline_id AND ls.active IS TRUE
    WHERE (r.subline_id IS NOT NULL AND r.line_id IS NULL)
       OR (r.line_id IS NOT NULL AND l.code IS NULL)
       OR (r.line_id IS NOT NULL AND r.subline_id IS NOT NULL AND ls.line_id IS NULL);
    IF details IS NOT NULL THEN
        RAISE EXCEPTION '028 preflight: referencias con linea/sublínea insegura: %', details;
    END IF;

    IF EXISTS (SELECT 1 FROM jo.references WHERE name IS NULL) THEN
        RAISE EXCEPTION '028 preflight: references.name contiene NULL';
    END IF;

    -- Una ejecucion nueva no puede atribuir eventos IMPORTACION_CSV legacy a un
    -- lote por inferencia. En una reejecucion parcial solo se acepta el backfill
    -- determinista desde la procedencia ya guardada en references.
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='jo' AND table_name='state_history' AND column_name='import_batch_id'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='jo' AND table_name='references' AND column_name='import_batch_id'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='jo' AND table_name='references' AND column_name='import_source_row'
        ) THEN
            EXECUTE 'SELECT EXISTS (
              SELECT 1 FROM jo.state_history h LEFT JOIN jo.references r ON r.id=h.reference_id
              WHERE h.event=''IMPORTACION_CSV'' AND h.import_batch_id IS NULL
                AND (r.import_batch_id IS NULL OR r.import_source_row IS NULL)
            )' INTO unresolved_import_history;
        ELSE
            EXECUTE 'SELECT EXISTS (SELECT 1 FROM jo.state_history WHERE event=''IMPORTACION_CSV'' AND import_batch_id IS NULL)'
              INTO unresolved_import_history;
        END IF;
    ELSE
        -- La revision previa de 028 aun no tenia state_history.import_batch_id,
        -- pero si guardaba lote/fila en references. Esa procedencia permite el
        -- upgrade F-002 sin inferir por fecha, archivo ni orden de insercion.
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='jo' AND table_name='references' AND column_name='import_batch_id'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='jo' AND table_name='references' AND column_name='import_source_row'
        ) THEN
            EXECUTE 'SELECT EXISTS (
              SELECT 1 FROM jo.state_history h LEFT JOIN jo.references r ON r.id=h.reference_id
              WHERE h.event=''IMPORTACION_CSV''
                AND (r.import_batch_id IS NULL OR r.import_source_row IS NULL)
            )' INTO unresolved_import_history;
        ELSE
            SELECT EXISTS (SELECT 1 FROM jo.state_history WHERE event='IMPORTACION_CSV')
              INTO unresolved_import_history;
        END IF;
    END IF;
    IF unresolved_import_history THEN
        RAISE EXCEPTION '028 preflight: existen eventos IMPORTACION_CSV sin lote atribuible de forma determinista';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='jo' AND table_name='references' AND column_name='import_batch_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='jo' AND table_name='references' AND column_name='import_source_row'
    ) THEN
        EXECUTE 'SELECT EXISTS (SELECT 1 FROM jo.references WHERE (import_batch_id IS NULL)<>(import_source_row IS NULL))'
          INTO unresolved_import_history;
        IF unresolved_import_history THEN
            RAISE EXCEPTION '028 preflight: references contiene procedencia de importacion parcial';
        END IF;
    END IF;

    SELECT string_agg(format('rc=%s,code=%s', rc.id, rc.code), ', ' ORDER BY rc.id)
    INTO details
    FROM jo.reference_codes AS rc
    LEFT JOIN jo.code_pool AS cp ON cp.id = rc.pool_code_id
    WHERE rc.code IS NULL
       OR cp.id IS NULL
       OR cp.code IS DISTINCT FROM rc.code
       OR cp.code_type IS DISTINCT FROM rc.code_type
       OR (COALESCE(rc.active, TRUE) AND cp.status IN ('RESERVADO', 'RETIRADO'));
    IF details IS NOT NULL THEN
        RAISE EXCEPTION '028 preflight: asignaciones legacy inconsistentes: %', details;
    END IF;

    SELECT string_agg(format('%s:%s', cp.code_type, cp.code), ', ' ORDER BY cp.code_type, cp.code)
    INTO details
    FROM jo.code_pool AS cp
    WHERE cp.status = 'ASIGNADO'
      AND NOT EXISTS (
        SELECT 1 FROM jo.reference_codes AS rc
        WHERE rc.code = cp.code AND rc.code_type = cp.code_type AND COALESCE(rc.active, TRUE)
      );
    IF details IS NOT NULL THEN
        RAISE EXCEPTION '028 preflight: code_pool marca ASIGNADO sin asignacion activa: %', details;
    END IF;

    -- F-001: esta comprobacion precede deliberadamente a la retirada de los
    -- UNIQUE globales heredados de apply_all.sql. Tambien protege upgrades
    -- parciales donde esos constraints ya no existan.
    SELECT string_agg(format('reference=%s,type=%s,count=%s',reference_id,code_type,n),'; ' ORDER BY reference_id,code_type)
      INTO details
    FROM (
      SELECT reference_id,code_type,count(*) AS n
      FROM jo.reference_codes WHERE COALESCE(active,TRUE)
      GROUP BY reference_id,code_type HAVING count(*)>1
    ) AS duplicated_active_reference;
    IF details IS NOT NULL THEN
      RAISE EXCEPTION '028 preflight F-001: mas de un codigo activo por referencia/tipo: %',details;
    END IF;
    SELECT string_agg(format('type=%s,code=%s,count=%s',code_type,code,n),'; ' ORDER BY code_type,code)
      INTO details
    FROM (
      SELECT code_type,code,count(*) AS n
      FROM jo.reference_codes WHERE COALESCE(active,TRUE)
      GROUP BY code_type,code HAVING count(*)>1
    ) AS duplicated_active_code;
    IF details IS NOT NULL THEN
      RAISE EXCEPTION '028 preflight F-001: codigo activo asignado mas de una vez: %',details;
    END IF;
END;
$$;

-- apply_all.sql crea exactamente estos dos constraints. Se sustituyen por
-- unicidad parcial para que las filas inactivas sigan siendo historia inmutable
-- y el mismo codigo pueda asignarse de nuevo sin reciclar ni sobrescribir filas.
ALTER TABLE jo.reference_codes
  DROP CONSTRAINT IF EXISTS reference_codes_reference_id_code_type_key;
ALTER TABLE jo.reference_codes
  DROP CONSTRAINT IF EXISTS reference_codes_code_type_code_key;
CREATE UNIQUE INDEX IF NOT EXISTS reference_codes_one_active_type_per_reference_idx
  ON jo.reference_codes(reference_id,code_type) WHERE COALESCE(active,TRUE);
CREATE UNIQUE INDEX IF NOT EXISTS reference_codes_one_active_owner_per_code_idx
  ON jo.reference_codes(code_type,code) WHERE COALESCE(active,TRUE);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    WHERE conrelid='jo.reference_codes'::regclass
      AND contype='u'
      AND (conname IN ('reference_codes_reference_id_code_type_key','reference_codes_code_type_code_key')
           OR pg_get_constraintdef(c.oid) IN ('UNIQUE (reference_id, code_type)','UNIQUE (code_type, code)'))
  ) THEN
    RAISE EXCEPTION '028 F-001: persiste un UNIQUE global legacy en reference_codes';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM unnest(ARRAY['reference_codes_one_active_type_per_reference_idx','reference_codes_one_active_owner_per_code_idx']) AS expected(index_name)
    LEFT JOIN pg_index i ON i.indexrelid=to_regclass('jo.'||expected.index_name)
    WHERE i.indexrelid IS NULL OR NOT i.indisunique OR NOT i.indisvalid OR i.indpred IS NULL
      OR pg_get_expr(i.indpred,i.indrelid)<>'COALESCE(active, true)'
      OR (expected.index_name='reference_codes_one_active_type_per_reference_idx'
          AND (pg_get_indexdef(i.indexrelid,1,TRUE)<>'reference_id' OR pg_get_indexdef(i.indexrelid,2,TRUE)<>'code_type'))
      OR (expected.index_name='reference_codes_one_active_owner_per_code_idx'
          AND (pg_get_indexdef(i.indexrelid,1,TRUE)<>'code_type' OR pg_get_indexdef(i.indexrelid,2,TRUE)<>'code'))
  ) THEN
    RAISE EXCEPTION '028 F-001: indices unicos parciales de reference_codes ausentes o invalidos';
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. Colecciones: normalizar el codigo legacy de temporada y cerrar el dominio.
--    No se crea ningun catalogo ni collection_year.
-- -----------------------------------------------------------------------------
UPDATE jo.collections
SET code = season || right(year::TEXT, 2)
WHERE code = season
  AND code ~ '^(WS|SS|SV|RS|PF|FW)$';

-- SS27 es una precondicion del importador, pero su catalogo se administra fuera
-- de 028. No se crea ni se aborta esta migracion si aun no esta disponible.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM jo.collections AS c
    JOIN jo.collection_years AS cy ON cy.collection_id = c.id
    WHERE c.code = 'SS27' AND c.season = 'SS' AND c.year = 2027
      AND cy.year = 2027 AND c.active IS TRUE AND cy.is_hidden IS FALSE
  ) THEN
    RAISE WARNING '028: SS27 no esta lista. Antes de importar SS27 debe existir collections(code=SS27, season=SS, year=2027) con collection_years.year=2027 visible; 028 no la crea.';
  END IF;
END;
$$;

ALTER TABLE jo.collections ALTER COLUMN season SET NOT NULL;
ALTER TABLE jo.collections DROP CONSTRAINT IF EXISTS collections_season_check;
ALTER TABLE jo.collections ADD CONSTRAINT collections_season_check
    CHECK (season IN ('WS', 'SS', 'SV', 'RS', 'PF', 'FW'));
ALTER TABLE jo.collections DROP CONSTRAINT IF EXISTS collections_code_format_check;
ALTER TABLE jo.collections ADD CONSTRAINT collections_code_format_check
    CHECK (code ~ '^(WS|SS|SV|RS|PF|FW)[0-9]{2}$' AND left(code,2) = season);

-- name ya es NOT NULL y deliberadamente no se agrega CHECK de longitud:
-- references.name = '' sigue siendo valido, NULL sigue rechazado.
ALTER TABLE jo.references ALTER COLUMN name SET NOT NULL;

-- -----------------------------------------------------------------------------
-- 3. Corregir las cinco reglas linea/sublínea y derivar tipo_ref de la linea.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jo.sync_and_validate_reference_line_subline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NEW.line_id IS NULL THEN
        IF NEW.subline_id IS NOT NULL THEN
            RAISE EXCEPTION 'subline_id requiere line_id' USING ERRCODE = '23514';
        END IF;
        NEW.tipo_ref := NULL;
        RETURN NEW;
    END IF;

    SELECT line_catalog.code
      INTO NEW.tipo_ref
      FROM jo.lines AS line_catalog
     WHERE line_catalog.id = NEW.line_id
       AND line_catalog.active IS TRUE;

    IF NEW.tipo_ref IS NULL THEN
        RAISE EXCEPTION 'line_id % no es una linea oficial activa', NEW.line_id USING ERRCODE = '23514';
    END IF;

    -- line_id con subline_id NULL es valido.
    IF NEW.subline_id IS NOT NULL AND NOT EXISTS (
        SELECT 1
          FROM jo.line_sublines AS linked
         WHERE linked.line_id = NEW.line_id
           AND linked.subline_id = NEW.subline_id
           AND linked.active IS TRUE
    ) THEN
        RAISE EXCEPTION 'Combinacion linea/sublínea inactiva o inexistente: %, %',
            NEW.line_id, NEW.subline_id USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION jo.sync_and_validate_reference_line_subline() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_references_line_subline_matrix ON jo.references;
CREATE TRIGGER trg_references_line_subline_matrix
BEFORE INSERT OR UPDATE ON jo.references
FOR EACH ROW EXECUTE FUNCTION jo.sync_and_validate_reference_line_subline();

ALTER TABLE jo.references DROP CONSTRAINT IF EXISTS references_subline_requires_line_check;
ALTER TABLE jo.references ADD CONSTRAINT references_subline_requires_line_check
    CHECK (subline_id IS NULL OR line_id IS NOT NULL);

CREATE OR REPLACE FUNCTION jo.sync_reference_tipo_ref_on_line_code_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NEW.code IS DISTINCT FROM OLD.code THEN
        UPDATE jo.references SET tipo_ref = NEW.code WHERE line_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION jo.sync_reference_tipo_ref_on_line_code_change() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_lines_sync_reference_tipo_ref ON jo.lines;
CREATE TRIGGER trg_lines_sync_reference_tipo_ref AFTER UPDATE OF code ON jo.lines
FOR EACH ROW EXECUTE FUNCTION jo.sync_reference_tipo_ref_on_line_code_change();

-- Endurecer tambien el guard de Status Global creado por 026.
ALTER FUNCTION jo.guard_reference_status_change() SECURITY DEFINER SET search_path = '';
REVOKE ALL ON FUNCTION jo.guard_reference_status_change() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION jo.guard_reference_status_change() TO authenticated;

-- -----------------------------------------------------------------------------
-- 4. Catalogos y asignaciones MD/PT fisicamente separados.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jo.md_codes (
    id                  BIGSERIAL PRIMARY KEY,
    code                TEXT NOT NULL UNIQUE CHECK (btrim(code) <> ''),
    prefix              TEXT,
    sequential_num      INTEGER,
    status              TEXT NOT NULL DEFAULT 'DISPONIBLE'
                        CHECK (status IN ('DISPONIBLE','ASIGNADO','RESERVADO','RETIRADO')),
    notes               TEXT,
    legacy_pool_id      INTEGER UNIQUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE IF NOT EXISTS jo.pt_codes (
    id                  BIGSERIAL PRIMARY KEY,
    code                TEXT NOT NULL UNIQUE CHECK (btrim(code) <> ''),
    prefix              TEXT,
    sequential_num      INTEGER,
    status              TEXT NOT NULL DEFAULT 'DISPONIBLE'
                        CHECK (status IN ('DISPONIBLE','ASIGNADO','RESERVADO','RETIRADO')),
    notes               TEXT,
    legacy_pool_id      INTEGER UNIQUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS jo.md_code_assignments (
    id                          BIGSERIAL PRIMARY KEY,
    reference_id                INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE RESTRICT,
    code_id                     BIGINT NOT NULL REFERENCES jo.md_codes(id) ON DELETE RESTRICT,
    assigned_at                 TIMESTAMPTZ DEFAULT clock_timestamp(),
    assigned_by                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    legacy_assigned_by          TEXT,
    notes                       TEXT,
    active                      BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at              TIMESTAMPTZ,
    migrated_at                 TIMESTAMPTZ,
    legacy_reference_code_id    INTEGER UNIQUE,
    CHECK ((active AND deactivated_at IS NULL) OR NOT active)
);
CREATE TABLE IF NOT EXISTS jo.pt_code_assignments (
    id                          BIGSERIAL PRIMARY KEY,
    reference_id                INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE RESTRICT,
    code_id                     BIGINT NOT NULL REFERENCES jo.pt_codes(id) ON DELETE RESTRICT,
    assigned_at                 TIMESTAMPTZ DEFAULT clock_timestamp(),
    assigned_by                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    legacy_assigned_by          TEXT,
    notes                       TEXT,
    active                      BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at              TIMESTAMPTZ,
    migrated_at                 TIMESTAMPTZ,
    legacy_reference_code_id    INTEGER UNIQUE,
    CHECK ((active AND deactivated_at IS NULL) OR NOT active)
);

-- Compatibilidad con una ejecucion parcial de una version previa de 028.
ALTER TABLE jo.md_code_assignments ALTER COLUMN assigned_at DROP NOT NULL;
ALTER TABLE jo.pt_code_assignments ALTER COLUMN assigned_at DROP NOT NULL;
ALTER TABLE jo.md_code_assignments ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMPTZ;
ALTER TABLE jo.pt_code_assignments ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS md_code_one_active_assignment_idx
    ON jo.md_code_assignments(code_id) WHERE active IS TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS md_reference_one_active_code_idx
    ON jo.md_code_assignments(reference_id) WHERE active IS TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS pt_code_one_active_assignment_idx
    ON jo.pt_code_assignments(code_id) WHERE active IS TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS pt_reference_one_active_code_idx
    ON jo.pt_code_assignments(reference_id) WHERE active IS TRUE;
CREATE INDEX IF NOT EXISTS md_code_assignments_reference_idx ON jo.md_code_assignments(reference_id, assigned_at DESC);
CREATE INDEX IF NOT EXISTS pt_code_assignments_reference_idx ON jo.pt_code_assignments(reference_id, assigned_at DESC);
CREATE INDEX IF NOT EXISTS md_codes_status_idx ON jo.md_codes(status, code);
CREATE INDEX IF NOT EXISTS pt_codes_status_idx ON jo.pt_codes(status, code);

-- El estado legacy se normaliza exclusivamente desde asignaciones reales. El
-- preflight anterior ya rechazo ASIGNADO sin titular y codigos sin pool.
UPDATE jo.code_pool AS cp
SET status='ASIGNADO',updated_at=clock_timestamp()
WHERE EXISTS (
  SELECT 1 FROM jo.reference_codes AS rc
  WHERE rc.pool_code_id=cp.id AND rc.code=cp.code AND rc.code_type=cp.code_type
    AND COALESCE(rc.active,TRUE)
) AND cp.status<>'ASIGNADO';

INSERT INTO jo.md_codes (code, prefix, sequential_num, status, notes, legacy_pool_id, created_at, updated_at)
SELECT code, prefix, sequential_num, status, notes, id, created_at, updated_at
FROM jo.code_pool WHERE code_type = 'MD'
ON CONFLICT (code) DO UPDATE SET prefix=EXCLUDED.prefix,sequential_num=EXCLUDED.sequential_num,
  status=EXCLUDED.status,notes=EXCLUDED.notes,legacy_pool_id=EXCLUDED.legacy_pool_id,
  created_at=EXCLUDED.created_at,updated_at=EXCLUDED.updated_at;
INSERT INTO jo.pt_codes (code, prefix, sequential_num, status, notes, legacy_pool_id, created_at, updated_at)
SELECT code, prefix, sequential_num, status, notes, id, created_at, updated_at
FROM jo.code_pool WHERE code_type = 'PT'
ON CONFLICT (code) DO UPDATE SET prefix=EXCLUDED.prefix,sequential_num=EXCLUDED.sequential_num,
  status=EXCLUDED.status,notes=EXCLUDED.notes,legacy_pool_id=EXCLUDED.legacy_pool_id,
  created_at=EXCLUDED.created_at,updated_at=EXCLUDED.updated_at;

-- 013 podia crear un codigo desde reference_codes. Esos registros tambien son
-- legado valido durante el backfill; esto no es comportamiento del importador.
INSERT INTO jo.md_codes (code, status, prefix)
SELECT DISTINCT rc.code, CASE WHEN bool_or(COALESCE(rc.active,TRUE)) THEN 'ASIGNADO' ELSE 'DISPONIBLE' END,
       split_part(rc.code, '-', 1)
FROM jo.reference_codes AS rc WHERE rc.code_type = 'MD'
GROUP BY rc.code ON CONFLICT (code) DO NOTHING;
INSERT INTO jo.pt_codes (code, status, prefix)
SELECT DISTINCT rc.code, CASE WHEN bool_or(COALESCE(rc.active,TRUE)) THEN 'ASIGNADO' ELSE 'DISPONIBLE' END,
       split_part(rc.code, '-', 1)
FROM jo.reference_codes AS rc WHERE rc.code_type = 'PT'
GROUP BY rc.code ON CONFLICT (code) DO NOTHING;

INSERT INTO jo.md_code_assignments
    (reference_id, code_id, assigned_at, legacy_assigned_by, notes, active, deactivated_at, migrated_at, legacy_reference_code_id)
SELECT rc.reference_id, c.id, rc.assigned_at, rc.assigned_by, rc.notes,
       COALESCE(rc.active, TRUE), NULL, clock_timestamp(), rc.id
FROM jo.reference_codes AS rc JOIN jo.md_codes AS c ON c.code = rc.code
WHERE rc.code_type = 'MD' ON CONFLICT (legacy_reference_code_id) DO NOTHING;
INSERT INTO jo.pt_code_assignments
    (reference_id, code_id, assigned_at, legacy_assigned_by, notes, active, deactivated_at, migrated_at, legacy_reference_code_id)
SELECT rc.reference_id, c.id, rc.assigned_at, rc.assigned_by, rc.notes,
       COALESCE(rc.active, TRUE), NULL, clock_timestamp(), rc.id
FROM jo.reference_codes AS rc JOIN jo.pt_codes AS c ON c.code = rc.code
WHERE rc.code_type = 'PT' ON CONFLICT (legacy_reference_code_id) DO NOTHING;

-- Reparar tambien una eventual ejecucion parcial de la version revisada: la
-- fecha tecnica de 028 nunca sustituye fechas historicas desconocidas.
UPDATE jo.md_code_assignments AS a
SET reference_id=rc.reference_id,code_id=c.id,assigned_at=rc.assigned_at,
    legacy_assigned_by=rc.assigned_by,notes=rc.notes,active=COALESCE(rc.active,TRUE),
    deactivated_at=NULL,migrated_at=COALESCE(a.migrated_at,clock_timestamp())
FROM jo.reference_codes AS rc JOIN jo.md_codes AS c ON c.code=rc.code
WHERE a.legacy_reference_code_id=rc.id AND rc.code_type='MD'::jo.reference_code_type;
UPDATE jo.pt_code_assignments AS a
SET reference_id=rc.reference_id,code_id=c.id,assigned_at=rc.assigned_at,
    legacy_assigned_by=rc.assigned_by,notes=rc.notes,active=COALESCE(rc.active,TRUE),
    deactivated_at=NULL,migrated_at=COALESCE(a.migrated_at,clock_timestamp())
FROM jo.reference_codes AS rc JOIN jo.pt_codes AS c ON c.code=rc.code
WHERE a.legacy_reference_code_id=rc.id AND rc.code_type='PT'::jo.reference_code_type;

UPDATE jo.md_codes AS c SET status = 'ASIGNADO', updated_at = clock_timestamp()
WHERE EXISTS (SELECT 1 FROM jo.md_code_assignments AS a WHERE a.code_id = c.id AND a.active);
UPDATE jo.pt_codes AS c SET status = 'ASIGNADO', updated_at = clock_timestamp()
WHERE EXISTS (SELECT 1 FROM jo.pt_code_assignments AS a WHERE a.code_id = c.id AND a.active);

-- En 028 estas tablas son proyecciones de la autoridad legacy. No se permite
-- escritura directa y por eso no se instala un segundo guard autoritativo.
DROP TRIGGER IF EXISTS trg_md_codes_status_integrity ON jo.md_codes;
DROP TRIGGER IF EXISTS trg_pt_codes_status_integrity ON jo.pt_codes;

-- Capa compatible: todo cambio de la autoridad code_pool/reference_codes se
-- refleja en las tablas separadas. No crea codigos fuera de code_pool.
CREATE OR REPLACE FUNCTION jo.guard_legacy_code_mutation_028()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF TG_TABLE_NAME='code_pool' THEN
    IF TG_OP='DELETE' THEN
      RAISE EXCEPTION 'code_pool no admite DELETE; retire o libere mediante las operaciones soportadas' USING ERRCODE='55000';
    END IF;
    IF TG_OP='UPDATE' AND (NEW.code IS DISTINCT FROM OLD.code OR NEW.code_type IS DISTINCT FROM OLD.code_type) THEN
      RAISE EXCEPTION 'La identidad code/code_type de code_pool es inmutable' USING ERRCODE='55000';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP='DELETE' THEN
    RAISE EXCEPTION 'reference_codes no admite DELETE; use unassign_reference_code' USING ERRCODE='55000';
  END IF;
  -- La identidad de una fila tambien queda congelada cuando esta inactiva: es
  -- historia, no un slot reciclable. Una nueva asignacion siempre inserta fila.
  IF TG_OP='UPDATE' AND (
       NEW.reference_id IS DISTINCT FROM OLD.reference_id
    OR NEW.code IS DISTINCT FROM OLD.code
    OR NEW.code_type IS DISTINCT FROM OLD.code_type
    OR NEW.pool_code_id IS DISTINCT FROM OLD.pool_code_id
  ) THEN
    RAISE EXCEPTION 'La identidad/titular de una asignacion historica es inmutable; libere e inserte una nueva fila' USING ERRCODE='55000';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION jo.project_legacy_code_pool_028()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.code_type = 'MD'::jo.reference_code_type THEN
      IF EXISTS (SELECT 1 FROM jo.md_code_assignments a JOIN jo.md_codes c ON c.id=a.code_id WHERE c.legacy_pool_id=OLD.id) THEN
        RAISE EXCEPTION 'No se puede retirar la proyeccion MD con asignaciones historicas' USING ERRCODE='55000';
      END IF;
      DELETE FROM jo.md_codes WHERE legacy_pool_id=OLD.id;
    ELSE
      IF EXISTS (SELECT 1 FROM jo.pt_code_assignments a JOIN jo.pt_codes c ON c.id=a.code_id WHERE c.legacy_pool_id=OLD.id) THEN
        RAISE EXCEPTION 'No se puede retirar la proyeccion PT con asignaciones historicas' USING ERRCODE='55000';
      END IF;
      DELETE FROM jo.pt_codes WHERE legacy_pool_id=OLD.id;
    END IF;
    RETURN OLD;
  END IF;
  IF TG_OP='UPDATE' AND (NEW.code_type IS DISTINCT FROM OLD.code_type OR NEW.code IS DISTINCT FROM OLD.code) THEN
    IF OLD.code_type='MD'::jo.reference_code_type THEN
      IF EXISTS (SELECT 1 FROM jo.md_code_assignments a JOIN jo.md_codes c ON c.id=a.code_id WHERE c.legacy_pool_id=OLD.id) THEN
        RAISE EXCEPTION 'No se puede reemplazar la proyeccion MD con asignaciones historicas' USING ERRCODE='55000';
      END IF;
      DELETE FROM jo.md_codes WHERE legacy_pool_id=OLD.id;
    ELSE
      IF EXISTS (SELECT 1 FROM jo.pt_code_assignments a JOIN jo.pt_codes c ON c.id=a.code_id WHERE c.legacy_pool_id=OLD.id) THEN
        RAISE EXCEPTION 'No se puede reemplazar la proyeccion PT con asignaciones historicas' USING ERRCODE='55000';
      END IF;
      DELETE FROM jo.pt_codes WHERE legacy_pool_id=OLD.id;
    END IF;
  END IF;
  IF NEW.code_type = 'MD'::jo.reference_code_type THEN
    INSERT INTO jo.md_codes(code,prefix,sequential_num,status,notes,legacy_pool_id,created_at,updated_at)
    VALUES(NEW.code,NEW.prefix,NEW.sequential_num,NEW.status,NEW.notes,NEW.id,NEW.created_at,NEW.updated_at)
    ON CONFLICT (code) DO UPDATE SET prefix=EXCLUDED.prefix,sequential_num=EXCLUDED.sequential_num,
      status=EXCLUDED.status,notes=EXCLUDED.notes,legacy_pool_id=EXCLUDED.legacy_pool_id,updated_at=EXCLUDED.updated_at;
  ELSE
    INSERT INTO jo.pt_codes(code,prefix,sequential_num,status,notes,legacy_pool_id,created_at,updated_at)
    VALUES(NEW.code,NEW.prefix,NEW.sequential_num,NEW.status,NEW.notes,NEW.id,NEW.created_at,NEW.updated_at)
    ON CONFLICT (code) DO UPDATE SET prefix=EXCLUDED.prefix,sequential_num=EXCLUDED.sequential_num,
      status=EXCLUDED.status,notes=EXCLUDED.notes,legacy_pool_id=EXCLUDED.legacy_pool_id,updated_at=EXCLUDED.updated_at;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION jo.project_legacy_reference_code_028()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE projected_code_id BIGINT;
BEGIN
  IF TG_OP='DELETE' OR (TG_OP='UPDATE' AND NEW.code_type IS DISTINCT FROM OLD.code_type) THEN
    IF OLD.code_type = 'MD'::jo.reference_code_type THEN
      DELETE FROM jo.md_code_assignments WHERE legacy_reference_code_id=OLD.id;
    ELSE
      DELETE FROM jo.pt_code_assignments WHERE legacy_reference_code_id=OLD.id;
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  IF NEW.code_type = 'MD'::jo.reference_code_type THEN
    SELECT id INTO projected_code_id FROM jo.md_codes WHERE code=NEW.code;
    IF projected_code_id IS NULL THEN RAISE EXCEPTION 'Proyeccion MD ausente para codigo legacy %',NEW.code USING ERRCODE='23503'; END IF;
    INSERT INTO jo.md_code_assignments(reference_id,code_id,assigned_at,legacy_assigned_by,notes,active,deactivated_at,migrated_at,legacy_reference_code_id)
    VALUES(NEW.reference_id,projected_code_id,NEW.assigned_at,NEW.assigned_by,NEW.notes,COALESCE(NEW.active,TRUE),NULL,clock_timestamp(),NEW.id)
    ON CONFLICT (legacy_reference_code_id) DO UPDATE SET reference_id=EXCLUDED.reference_id,
      code_id=EXCLUDED.code_id,assigned_at=EXCLUDED.assigned_at,legacy_assigned_by=EXCLUDED.legacy_assigned_by,
      notes=EXCLUDED.notes,active=EXCLUDED.active,deactivated_at=NULL;
  ELSE
    SELECT id INTO projected_code_id FROM jo.pt_codes WHERE code=NEW.code;
    IF projected_code_id IS NULL THEN RAISE EXCEPTION 'Proyeccion PT ausente para codigo legacy %',NEW.code USING ERRCODE='23503'; END IF;
    INSERT INTO jo.pt_code_assignments(reference_id,code_id,assigned_at,legacy_assigned_by,notes,active,deactivated_at,migrated_at,legacy_reference_code_id)
    VALUES(NEW.reference_id,projected_code_id,NEW.assigned_at,NEW.assigned_by,NEW.notes,COALESCE(NEW.active,TRUE),NULL,clock_timestamp(),NEW.id)
    ON CONFLICT (legacy_reference_code_id) DO UPDATE SET reference_id=EXCLUDED.reference_id,
      code_id=EXCLUDED.code_id,assigned_at=EXCLUDED.assigned_at,legacy_assigned_by=EXCLUDED.legacy_assigned_by,
      notes=EXCLUDED.notes,active=EXCLUDED.active,deactivated_at=NULL;
  END IF;
  IF NEW.pool_code_id IS NOT NULL THEN
    UPDATE jo.code_pool
       SET status=CASE WHEN COALESCE(NEW.active,TRUE) THEN 'ASIGNADO' ELSE 'DISPONIBLE' END
     WHERE id=NEW.pool_code_id
       AND status IS DISTINCT FROM CASE WHEN COALESCE(NEW.active,TRUE) THEN 'ASIGNADO' ELSE 'DISPONIBLE' END;
  END IF;
  RETURN NEW;
END;
$$;

-- Auditoria completa invocada una sola vez durante instalacion/verificacion.
-- No se conecta directamente a triggers por fila: su alcance global no escala.
CREATE OR REPLACE FUNCTION jo.check_code_projection_integrity_028()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM jo.reference_codes rc LEFT JOIN jo.code_pool cp ON cp.id=rc.pool_code_id
    WHERE cp.id IS NULL OR cp.code IS DISTINCT FROM rc.code OR cp.code_type IS DISTINCT FROM rc.code_type
       OR (COALESCE(rc.active,TRUE) AND cp.status<>'ASIGNADO')
  ) OR EXISTS (
    SELECT 1 FROM jo.code_pool cp
    WHERE (cp.status='ASIGNADO') IS DISTINCT FROM EXISTS (
      SELECT 1 FROM jo.reference_codes rc WHERE rc.pool_code_id=cp.id AND rc.code=cp.code
        AND rc.code_type=cp.code_type AND COALESCE(rc.active,TRUE)
    )
  ) THEN
    RAISE EXCEPTION 'Integridad legacy de codigos/estados/titulares violada' USING ERRCODE='23514';
  END IF;

  IF EXISTS (
    SELECT 1 FROM jo.code_pool cp LEFT JOIN jo.md_codes c ON c.legacy_pool_id=cp.id
    WHERE cp.code_type='MD'::jo.reference_code_type AND
      (c.id IS NULL OR c.code IS DISTINCT FROM cp.code OR c.status IS DISTINCT FROM cp.status
       OR c.prefix IS DISTINCT FROM cp.prefix OR c.sequential_num IS DISTINCT FROM cp.sequential_num OR c.notes IS DISTINCT FROM cp.notes)
  ) OR EXISTS (
    SELECT 1 FROM jo.md_codes c LEFT JOIN jo.code_pool cp ON cp.id=c.legacy_pool_id
    WHERE cp.id IS NULL OR cp.code_type<>'MD'::jo.reference_code_type OR cp.code IS DISTINCT FROM c.code OR cp.status IS DISTINCT FROM c.status
       OR cp.prefix IS DISTINCT FROM c.prefix OR cp.sequential_num IS DISTINCT FROM c.sequential_num OR cp.notes IS DISTINCT FROM c.notes
  ) OR EXISTS (
    SELECT 1 FROM jo.code_pool cp LEFT JOIN jo.pt_codes c ON c.legacy_pool_id=cp.id
    WHERE cp.code_type='PT'::jo.reference_code_type AND
      (c.id IS NULL OR c.code IS DISTINCT FROM cp.code OR c.status IS DISTINCT FROM cp.status
       OR c.prefix IS DISTINCT FROM cp.prefix OR c.sequential_num IS DISTINCT FROM cp.sequential_num OR c.notes IS DISTINCT FROM cp.notes)
  ) OR EXISTS (
    SELECT 1 FROM jo.pt_codes c LEFT JOIN jo.code_pool cp ON cp.id=c.legacy_pool_id
    WHERE cp.id IS NULL OR cp.code_type<>'PT'::jo.reference_code_type OR cp.code IS DISTINCT FROM c.code OR cp.status IS DISTINCT FROM c.status
       OR cp.prefix IS DISTINCT FROM c.prefix OR cp.sequential_num IS DISTINCT FROM c.sequential_num OR cp.notes IS DISTINCT FROM c.notes
  ) THEN
    RAISE EXCEPTION 'Paridad bidireccional code_pool/proyeccion MD-PT violada' USING ERRCODE='23514';
  END IF;

  IF EXISTS (
    SELECT 1 FROM jo.reference_codes rc
    LEFT JOIN jo.md_code_assignments a ON a.legacy_reference_code_id=rc.id
    LEFT JOIN jo.md_codes c ON c.id=a.code_id
    WHERE rc.code_type='MD'::jo.reference_code_type AND
      (a.id IS NULL OR a.reference_id IS DISTINCT FROM rc.reference_id OR c.code IS DISTINCT FROM rc.code
       OR c.legacy_pool_id IS DISTINCT FROM rc.pool_code_id OR a.active IS DISTINCT FROM COALESCE(rc.active,TRUE))
  ) OR EXISTS (
    SELECT 1 FROM jo.md_code_assignments a LEFT JOIN jo.reference_codes rc ON rc.id=a.legacy_reference_code_id
    LEFT JOIN jo.md_codes c ON c.id=a.code_id
    WHERE rc.id IS NULL OR rc.code_type<>'MD'::jo.reference_code_type OR a.reference_id IS DISTINCT FROM rc.reference_id
       OR c.code IS DISTINCT FROM rc.code OR c.legacy_pool_id IS DISTINCT FROM rc.pool_code_id OR a.active IS DISTINCT FROM COALESCE(rc.active,TRUE)
  ) OR EXISTS (
    SELECT 1 FROM jo.reference_codes rc
    LEFT JOIN jo.pt_code_assignments a ON a.legacy_reference_code_id=rc.id
    LEFT JOIN jo.pt_codes c ON c.id=a.code_id
    WHERE rc.code_type='PT'::jo.reference_code_type AND
      (a.id IS NULL OR a.reference_id IS DISTINCT FROM rc.reference_id OR c.code IS DISTINCT FROM rc.code
       OR c.legacy_pool_id IS DISTINCT FROM rc.pool_code_id OR a.active IS DISTINCT FROM COALESCE(rc.active,TRUE))
  ) OR EXISTS (
    SELECT 1 FROM jo.pt_code_assignments a LEFT JOIN jo.reference_codes rc ON rc.id=a.legacy_reference_code_id
    LEFT JOIN jo.pt_codes c ON c.id=a.code_id
    WHERE rc.id IS NULL OR rc.code_type<>'PT'::jo.reference_code_type OR a.reference_id IS DISTINCT FROM rc.reference_id
       OR c.code IS DISTINCT FROM rc.code OR c.legacy_pool_id IS DISTINCT FROM rc.pool_code_id OR a.active IS DISTINCT FROM COALESCE(rc.active,TRUE)
  ) OR EXISTS (
    SELECT 1 FROM jo.md_codes c WHERE (c.status='ASIGNADO') IS DISTINCT FROM EXISTS (SELECT 1 FROM jo.md_code_assignments a WHERE a.code_id=c.id AND a.active)
  ) OR EXISTS (
    SELECT 1 FROM jo.pt_codes c WHERE (c.status='ASIGNADO') IS DISTINCT FROM EXISTS (SELECT 1 FROM jo.pt_code_assignments a WHERE a.code_id=c.id AND a.active)
  ) THEN
    RAISE EXCEPTION 'Paridad bidireccional reference_codes/asignaciones MD-PT violada' USING ERRCODE='23514';
  END IF;
  RETURN;
END;
$$;

-- Guard diferido acotado a las claves tocadas. Conserva la validacion al final
-- de la transaccion sin reescanear las cuatro tablas por cada fila modificada.
CREATE OR REPLACE FUNCTION jo.check_code_projection_key_028(p_pool_id INTEGER, p_reference_code_id INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE pool_row jo.code_pool%ROWTYPE; rc_row jo.reference_codes%ROWTYPE;
BEGIN
  IF p_pool_id IS NOT NULL THEN
    SELECT * INTO pool_row FROM jo.code_pool WHERE id=p_pool_id;
    IF FOUND THEN
      IF (pool_row.status='ASIGNADO') IS DISTINCT FROM EXISTS (
        SELECT 1 FROM jo.reference_codes rc
        WHERE rc.pool_code_id=pool_row.id AND rc.code=pool_row.code
          AND rc.code_type=pool_row.code_type AND COALESCE(rc.active,TRUE)
      ) THEN
        RAISE EXCEPTION 'Estado/titular legacy inconsistente para pool %',p_pool_id USING ERRCODE='23514';
      END IF;
      IF pool_row.code_type='MD'::jo.reference_code_type THEN
        IF NOT EXISTS (SELECT 1 FROM jo.md_codes c WHERE c.legacy_pool_id=pool_row.id
          AND c.code IS NOT DISTINCT FROM pool_row.code AND c.status IS NOT DISTINCT FROM pool_row.status
          AND c.prefix IS NOT DISTINCT FROM pool_row.prefix AND c.sequential_num IS NOT DISTINCT FROM pool_row.sequential_num
          AND c.notes IS NOT DISTINCT FROM pool_row.notes) THEN
          RAISE EXCEPTION 'Proyeccion MD inconsistente para pool %',p_pool_id USING ERRCODE='23514';
        END IF;
      ELSE
        IF NOT EXISTS (SELECT 1 FROM jo.pt_codes c WHERE c.legacy_pool_id=pool_row.id
          AND c.code IS NOT DISTINCT FROM pool_row.code AND c.status IS NOT DISTINCT FROM pool_row.status
          AND c.prefix IS NOT DISTINCT FROM pool_row.prefix AND c.sequential_num IS NOT DISTINCT FROM pool_row.sequential_num
          AND c.notes IS NOT DISTINCT FROM pool_row.notes) THEN
          RAISE EXCEPTION 'Proyeccion PT inconsistente para pool %',p_pool_id USING ERRCODE='23514';
        END IF;
      END IF;
    END IF;
  END IF;

  IF p_reference_code_id IS NOT NULL THEN
    SELECT * INTO rc_row FROM jo.reference_codes WHERE id=p_reference_code_id;
    IF FOUND THEN
      IF NOT EXISTS (SELECT 1 FROM jo.code_pool cp WHERE cp.id=rc_row.pool_code_id
        AND cp.code IS NOT DISTINCT FROM rc_row.code AND cp.code_type IS NOT DISTINCT FROM rc_row.code_type) THEN
        RAISE EXCEPTION 'Pool/identidad inconsistente para reference_code %',p_reference_code_id USING ERRCODE='23514';
      END IF;
      IF rc_row.code_type='MD'::jo.reference_code_type THEN
        IF NOT EXISTS (SELECT 1 FROM jo.md_code_assignments a JOIN jo.md_codes c ON c.id=a.code_id
          WHERE a.legacy_reference_code_id=rc_row.id AND a.reference_id IS NOT DISTINCT FROM rc_row.reference_id
            AND c.code IS NOT DISTINCT FROM rc_row.code AND c.legacy_pool_id IS NOT DISTINCT FROM rc_row.pool_code_id
            AND a.active IS NOT DISTINCT FROM COALESCE(rc_row.active,TRUE)) THEN
          RAISE EXCEPTION 'Asignacion MD inconsistente para reference_code %',p_reference_code_id USING ERRCODE='23514';
        END IF;
      ELSE
        IF NOT EXISTS (SELECT 1 FROM jo.pt_code_assignments a JOIN jo.pt_codes c ON c.id=a.code_id
          WHERE a.legacy_reference_code_id=rc_row.id AND a.reference_id IS NOT DISTINCT FROM rc_row.reference_id
            AND c.code IS NOT DISTINCT FROM rc_row.code AND c.legacy_pool_id IS NOT DISTINCT FROM rc_row.pool_code_id
            AND a.active IS NOT DISTINCT FROM COALESCE(rc_row.active,TRUE)) THEN
          RAISE EXCEPTION 'Asignacion PT inconsistente para reference_code %',p_reference_code_id USING ERRCODE='23514';
        END IF;
      END IF;
    END IF;
  END IF;
END;
$$;
CREATE OR REPLACE FUNCTION jo.run_code_projection_integrity_028()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF TG_TABLE_NAME='code_pool' THEN
    IF TG_OP<>'INSERT' THEN PERFORM jo.check_code_projection_key_028(OLD.id,NULL); END IF;
    IF TG_OP<>'DELETE' THEN PERFORM jo.check_code_projection_key_028(NEW.id,NULL); END IF;
  ELSE
    IF TG_OP<>'INSERT' THEN PERFORM jo.check_code_projection_key_028(OLD.pool_code_id,OLD.id); END IF;
    IF TG_OP<>'DELETE' THEN PERFORM jo.check_code_projection_key_028(NEW.pool_code_id,NEW.id); END IF;
  END IF;
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION jo.project_legacy_code_pool_028() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION jo.project_legacy_reference_code_028() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION jo.guard_legacy_code_mutation_028() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION jo.check_code_projection_integrity_028() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION jo.check_code_projection_key_028(integer,integer) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION jo.run_code_projection_integrity_028() FROM PUBLIC,anon,authenticated;

DROP TRIGGER IF EXISTS trg_028_guard_code_pool_mutation ON jo.code_pool;
CREATE TRIGGER trg_028_guard_code_pool_mutation BEFORE UPDATE OR DELETE ON jo.code_pool
FOR EACH ROW EXECUTE FUNCTION jo.guard_legacy_code_mutation_028();
DROP TRIGGER IF EXISTS trg_028_guard_reference_code_mutation ON jo.reference_codes;
CREATE TRIGGER trg_028_guard_reference_code_mutation BEFORE UPDATE OR DELETE ON jo.reference_codes
FOR EACH ROW EXECUTE FUNCTION jo.guard_legacy_code_mutation_028();
DROP TRIGGER IF EXISTS trg_028_project_code_pool ON jo.code_pool;
CREATE TRIGGER trg_028_project_code_pool AFTER INSERT OR UPDATE OR DELETE ON jo.code_pool
FOR EACH ROW EXECUTE FUNCTION jo.project_legacy_code_pool_028();
DROP TRIGGER IF EXISTS trg_028_project_reference_codes ON jo.reference_codes;
CREATE TRIGGER trg_028_project_reference_codes AFTER INSERT OR UPDATE OR DELETE ON jo.reference_codes
FOR EACH ROW EXECUTE FUNCTION jo.project_legacy_reference_code_028();
DROP TRIGGER IF EXISTS trg_028_assert_code_pool_integrity ON jo.code_pool;
CREATE CONSTRAINT TRIGGER trg_028_assert_code_pool_integrity AFTER INSERT OR UPDATE OR DELETE ON jo.code_pool
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION jo.run_code_projection_integrity_028();
DROP TRIGGER IF EXISTS trg_028_assert_reference_codes_integrity ON jo.reference_codes;
CREATE CONSTRAINT TRIGGER trg_028_assert_reference_codes_integrity AFTER INSERT OR UPDATE OR DELETE ON jo.reference_codes
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION jo.run_code_projection_integrity_028();
DO $$ BEGIN PERFORM jo.check_code_projection_integrity_028(); END; $$;
REVOKE INSERT,UPDATE,DELETE ON jo.code_pool,jo.reference_codes FROM anon;
GRANT INSERT,UPDATE,DELETE ON jo.code_pool,jo.reference_codes TO authenticated;

-- -----------------------------------------------------------------------------
-- 5. Trazabilidad de importacion.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jo.import_batches (
    id              BIGSERIAL PRIMARY KEY,
    event           TEXT NOT NULL DEFAULT 'IMPORTACION_CSV' CHECK (event = 'IMPORTACION_CSV'),
    source_file     TEXT NOT NULL CHECK (btrim(source_file) <> ''),
    imported_at     TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    created_by      UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    mode            TEXT NOT NULL DEFAULT 'PARCIAL_POR_FILA' CHECK (mode = 'PARCIAL_POR_FILA'),
    status          TEXT NOT NULL DEFAULT 'EN_PROCESO' CHECK (status IN ('EN_PROCESO','COMPLETADO','COMPLETADO_CON_INCIDENCIAS','FALLIDO')),
    total_rows      INTEGER CHECK (total_rows IS NULL OR total_rows >= 0),
    successful_rows INTEGER NOT NULL DEFAULT 0 CHECK (successful_rows >= 0),
    invalid_rows    INTEGER NOT NULL DEFAULT 0 CHECK (invalid_rows >= 0),
    finished_at     TIMESTAMPTZ,
    metadata        JSONB NOT NULL DEFAULT '{}'::JSONB
);
ALTER TABLE jo.import_batches DROP CONSTRAINT IF EXISTS import_batches_close_state_check;
ALTER TABLE jo.import_batches ADD CONSTRAINT import_batches_close_state_check CHECK (
  (status='EN_PROCESO' AND finished_at IS NULL) OR
  (status<>'EN_PROCESO' AND finished_at IS NOT NULL)
);
ALTER TABLE jo.import_batches DROP CONSTRAINT IF EXISTS import_batches_counter_bounds_check;
ALTER TABLE jo.import_batches ADD CONSTRAINT import_batches_counter_bounds_check CHECK (
  total_rows IS NULL OR successful_rows+invalid_rows<=total_rows
);
CREATE TABLE IF NOT EXISTS jo.import_issues (
    id              BIGSERIAL PRIMARY KEY,
    batch_id        BIGINT NOT NULL REFERENCES jo.import_batches(id) ON DELETE RESTRICT,
    source_row      INTEGER CHECK (source_row IS NULL OR source_row > 0),
    reference_id    INTEGER REFERENCES jo.references(id) ON DELETE SET NULL,
    issue_code      TEXT NOT NULL CHECK (btrim(issue_code) <> ''),
    message         TEXT NOT NULL,
    row_payload     JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    resolved_at     TIMESTAMPTZ,
    resolved_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT
);
CREATE TABLE IF NOT EXISTS jo.import_batch_rows (
    id              BIGSERIAL PRIMARY KEY,
    batch_id        BIGINT NOT NULL REFERENCES jo.import_batches(id) ON DELETE RESTRICT,
    source_row      INTEGER NOT NULL CHECK (source_row > 0),
    outcome         TEXT NOT NULL CHECK (outcome IN ('EXITOSO','INVALIDO')),
    reference_id    INTEGER REFERENCES jo.references(id) ON DELETE RESTRICT,
    issue_id        BIGINT REFERENCES jo.import_issues(id) ON DELETE RESTRICT,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(batch_id,source_row),
    CHECK ((outcome='EXITOSO' AND reference_id IS NOT NULL AND issue_id IS NULL)
        OR (outcome='INVALIDO' AND issue_id IS NOT NULL))
);
ALTER TABLE jo.references ADD COLUMN IF NOT EXISTS import_batch_id BIGINT REFERENCES jo.import_batches(id) ON DELETE SET NULL;
ALTER TABLE jo.references ADD COLUMN IF NOT EXISTS import_source_row INTEGER CHECK (import_source_row IS NULL OR import_source_row > 0);
ALTER TABLE jo.state_history ADD COLUMN IF NOT EXISTS import_batch_id BIGINT REFERENCES jo.import_batches(id) ON DELETE SET NULL;
UPDATE jo.state_history AS h
SET import_batch_id=r.import_batch_id
FROM jo.references AS r
WHERE h.reference_id=r.id AND h.event='IMPORTACION_CSV'
  AND h.import_batch_id IS NULL AND r.import_batch_id IS NOT NULL;

-- F-002: upgrade versionado desde la revision que ya tenia batches,
-- procedencia e historias, pero no ledger. Solo se reconstruyen resultados que
-- tienen una clasificacion inequivoca. recorded_at es el instante tecnico de
-- reconstruccion; no se copia ni se fabrica una fecha historica de importacion.
DO $$
DECLARE details TEXT;
BEGIN
  SELECT string_agg(problem,'; ' ORDER BY problem) INTO details
  FROM (
    SELECT format('reference=%s: lote %s inexistente',r.id,r.import_batch_id) AS problem
    FROM jo.references r LEFT JOIN jo.import_batches b ON b.id=r.import_batch_id
    WHERE r.import_batch_id IS NOT NULL AND b.id IS NULL
    UNION ALL
    SELECT format('reference=%s: historia IMPORTACION_CSV no coincide con lote %s',r.id,r.import_batch_id)
    FROM jo.references r JOIN jo.state_history h ON h.reference_id=r.id AND h.event='IMPORTACION_CSV'
    WHERE r.import_batch_id IS NOT NULL AND h.import_batch_id IS DISTINCT FROM r.import_batch_id
    UNION ALL
    SELECT format('batch=%s,row=%s: multiples referencias reclaman la misma procedencia',r.import_batch_id,r.import_source_row)
    FROM jo.references r WHERE r.import_batch_id IS NOT NULL
    GROUP BY r.import_batch_id,r.import_source_row HAVING count(*)>1
    UNION ALL
    SELECT format('batch=%s,row=%s: multiples incidencias no permiten elegir issue_id',i.batch_id,COALESCE(i.source_row,0))
    FROM jo.import_issues i GROUP BY i.batch_id,i.source_row HAVING count(*)>1
    UNION ALL
    SELECT format('issue=%s: source_row ausente',i.id) FROM jo.import_issues i WHERE i.source_row IS NULL
    UNION ALL
    SELECT format('issue=%s: reference=%s tiene procedencia distinta o ausente',i.id,i.reference_id)
    FROM jo.import_issues i JOIN jo.references r ON r.id=i.reference_id
    WHERE r.import_batch_id IS DISTINCT FROM i.batch_id OR r.import_source_row IS DISTINCT FROM i.source_row
    UNION ALL
    SELECT format('batch=%s,row=%s: historia exitosa e incidencia son incompatibles',r.import_batch_id,r.import_source_row)
    FROM jo.references r
    WHERE r.import_batch_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM jo.state_history h WHERE h.reference_id=r.id AND h.event='IMPORTACION_CSV' AND h.import_batch_id=r.import_batch_id)
      AND EXISTS (SELECT 1 FROM jo.import_issues i WHERE i.batch_id=r.import_batch_id AND i.source_row=r.import_source_row)
    UNION ALL
    SELECT format('reference=%s,batch=%s,row=%s: sin historia ni incidencia inequivoca',r.id,r.import_batch_id,r.import_source_row)
    FROM jo.references r
    WHERE r.import_batch_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM jo.import_batch_rows br WHERE br.batch_id=r.import_batch_id AND br.source_row=r.import_source_row AND br.reference_id=r.id)
      AND NOT EXISTS (SELECT 1 FROM jo.state_history h WHERE h.reference_id=r.id AND h.event='IMPORTACION_CSV' AND h.import_batch_id=r.import_batch_id)
      AND NOT EXISTS (SELECT 1 FROM jo.import_issues i WHERE i.batch_id=r.import_batch_id AND i.source_row=r.import_source_row)
    UNION ALL
    SELECT format('batch=%s,row=%s: ledger existente contradice procedencia/clasificacion',br.batch_id,br.source_row)
    FROM jo.import_batch_rows br
    LEFT JOIN jo.references r ON r.id=br.reference_id
    LEFT JOIN jo.import_issues i ON i.id=br.issue_id
    WHERE (br.outcome='EXITOSO' AND (r.id IS NULL OR r.import_batch_id IS DISTINCT FROM br.batch_id OR r.import_source_row IS DISTINCT FROM br.source_row
           OR NOT EXISTS (SELECT 1 FROM jo.state_history h WHERE h.reference_id=r.id AND h.event='IMPORTACION_CSV' AND h.import_batch_id=br.batch_id)))
       OR (br.outcome='INVALIDO' AND (i.id IS NULL OR i.batch_id IS DISTINCT FROM br.batch_id OR i.source_row IS DISTINCT FROM br.source_row
           OR (br.reference_id IS NOT NULL AND (r.id IS NULL OR r.import_batch_id IS DISTINCT FROM br.batch_id OR r.import_source_row IS DISTINCT FROM br.source_row))))
  ) AS unsafe;
  IF details IS NOT NULL THEN
    RAISE EXCEPTION '028 upgrade F-002 no reconstruible automaticamente: %. Procedimiento 028-F002: corregir/documentar procedencia e incidencias en la version previa y reejecutar; no inventar filas ni fechas.',details;
  END IF;

  INSERT INTO jo.import_batch_rows(batch_id,source_row,outcome,reference_id,issue_id,recorded_at)
  SELECT r.import_batch_id,r.import_source_row,'EXITOSO',r.id,NULL,clock_timestamp()
  FROM jo.references r
  WHERE r.import_batch_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM jo.state_history h WHERE h.reference_id=r.id AND h.event='IMPORTACION_CSV' AND h.import_batch_id=r.import_batch_id)
  ON CONFLICT (batch_id,source_row) DO NOTHING;

  INSERT INTO jo.import_batch_rows(batch_id,source_row,outcome,reference_id,issue_id,recorded_at)
  SELECT i.batch_id,i.source_row,'INVALIDO',r.id,i.id,clock_timestamp()
  FROM jo.import_issues i
  LEFT JOIN jo.references r ON r.import_batch_id=i.batch_id AND r.import_source_row=i.source_row
  WHERE i.source_row IS NOT NULL
  ON CONFLICT (batch_id,source_row) DO NOTHING;

  IF EXISTS (
    SELECT 1 FROM jo.import_batches b
    JOIN LATERAL (SELECT count(*) AS n FROM jo.import_batch_rows br WHERE br.batch_id=b.id) x ON TRUE
    WHERE b.total_rows IS NOT NULL AND x.n>b.total_rows
  ) THEN
    RAISE EXCEPTION '028 upgrade F-002: el ledger reconstruido excede total_rows; corregir el lote previo sin inventar contadores';
  END IF;
  UPDATE jo.import_batches b SET
    successful_rows=x.ok,invalid_rows=x.bad
  FROM (
    SELECT b0.id,count(br.id) FILTER(WHERE br.outcome='EXITOSO')::INTEGER AS ok,
           count(br.id) FILTER(WHERE br.outcome='INVALIDO')::INTEGER AS bad
    FROM jo.import_batches b0 LEFT JOIN jo.import_batch_rows br ON br.batch_id=b0.id
    GROUP BY b0.id
  ) x WHERE x.id=b.id AND (b.successful_rows IS DISTINCT FROM x.ok OR b.invalid_rows IS DISTINCT FROM x.bad);
END;
$$;

-- Fallar con diagnostico antes de constraints/indices si una ejecucion parcial
-- dejo incidencias o claves de idempotencia ambiguas.
DO $$
DECLARE details TEXT;
BEGIN
  SELECT string_agg(format('batch=%s,row=%s,code=%s,reference=%s,count=%s',batch_id,
      COALESCE(source_row,0),issue_code,COALESCE(reference_id,0),duplicate_count),'; ')
    INTO details
  FROM (
    SELECT batch_id,source_row,issue_code,reference_id,count(*) AS duplicate_count
    FROM jo.import_issues
    GROUP BY batch_id,source_row,issue_code,reference_id HAVING count(*)>1
  ) AS duplicates;
  IF details IS NOT NULL THEN
    RAISE EXCEPTION '028 preflight de indices: incidencias duplicadas: %',details;
  END IF;
  IF EXISTS (SELECT 1 FROM jo.references WHERE (import_batch_id IS NULL)<>(import_source_row IS NULL)) THEN
    RAISE EXCEPTION '028 preflight de constraints: procedencia parcial en references';
  END IF;
  IF EXISTS (SELECT 1 FROM jo.state_history WHERE event='IMPORTACION_CSV' AND import_batch_id IS NULL) THEN
    RAISE EXCEPTION '028 preflight de constraints: state_history IMPORTACION_CSV sin lote';
  END IF;
  IF EXISTS (SELECT import_batch_id,import_source_row FROM jo.references
             WHERE import_batch_id IS NOT NULL GROUP BY import_batch_id,import_source_row HAVING count(*)>1) THEN
    RAISE EXCEPTION '028 preflight de indices: filas de importacion duplicadas en references';
  END IF;
  IF EXISTS (SELECT import_batch_id,reference_id FROM jo.state_history
             WHERE event='IMPORTACION_CSV' GROUP BY import_batch_id,reference_id HAVING count(*)>1) THEN
    RAISE EXCEPTION '028 preflight de indices: historias IMPORTACION_CSV duplicadas';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jo.references r
    LEFT JOIN jo.import_batch_rows br ON br.batch_id=r.import_batch_id
      AND br.source_row=r.import_source_row AND br.reference_id=r.id
    WHERE r.import_batch_id IS NOT NULL AND br.id IS NULL
  ) THEN
    RAISE EXCEPTION '028 preflight de procedencia: referencia importada sin fila ledger coherente';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jo.import_batch_rows br
    LEFT JOIN jo.references r ON r.id=br.reference_id
    WHERE br.reference_id IS NOT NULL AND
      (r.id IS NULL OR r.import_batch_id IS DISTINCT FROM br.batch_id OR r.import_source_row IS DISTINCT FROM br.source_row)
  ) THEN
    RAISE EXCEPTION '028 preflight de procedencia: fila ledger con referencia/procedencia incoherente';
  END IF;
END;
$$;
ALTER TABLE jo.references DROP CONSTRAINT IF EXISTS references_import_provenance_pair_check;
ALTER TABLE jo.references ADD CONSTRAINT references_import_provenance_pair_check
  CHECK ((import_batch_id IS NULL)=(import_source_row IS NULL));
ALTER TABLE jo.state_history DROP CONSTRAINT IF EXISTS state_history_import_batch_required_check;
ALTER TABLE jo.state_history ADD CONSTRAINT state_history_import_batch_required_check
  CHECK (event IS DISTINCT FROM 'IMPORTACION_CSV' OR import_batch_id IS NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS import_issues_idempotency_idx
  ON jo.import_issues(batch_id,COALESCE(source_row,0),issue_code,COALESCE(reference_id,0));
CREATE INDEX IF NOT EXISTS import_batches_date_idx ON jo.import_batches(imported_at DESC);
CREATE INDEX IF NOT EXISTS import_batches_creator_idx ON jo.import_batches(created_by, imported_at DESC);
CREATE INDEX IF NOT EXISTS import_issues_batch_row_idx ON jo.import_issues(batch_id, source_row);
CREATE INDEX IF NOT EXISTS import_issues_reference_idx ON jo.import_issues(reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS import_batch_rows_reference_idx ON jo.import_batch_rows(reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS references_import_batch_idx ON jo.references(import_batch_id) WHERE import_batch_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS references_import_row_unique_idx
  ON jo.references(import_batch_id,import_source_row)
  WHERE import_batch_id IS NOT NULL AND import_source_row IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS state_history_import_once_idx
  ON jo.state_history(import_batch_id,reference_id)
  WHERE import_batch_id IS NOT NULL AND event='IMPORTACION_CSV';

CREATE OR REPLACE FUNCTION jo.guard_reference_import_metadata()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP='UPDATE' AND OLD.import_batch_id IS NOT NULL AND
     (NEW.import_batch_id IS DISTINCT FROM OLD.import_batch_id OR NEW.import_source_row IS DISTINCT FROM OLD.import_source_row) THEN
    RAISE EXCEPTION 'La procedencia de importacion es inmutable; no se sobrescribe ni se elimina' USING ERRCODE='23505';
  END IF;
  IF (TG_OP='INSERT' AND (NEW.import_batch_id IS NOT NULL OR NEW.import_source_row IS NOT NULL))
     OR (TG_OP='UPDATE' AND (NEW.import_batch_id IS DISTINCT FROM OLD.import_batch_id OR NEW.import_source_row IS DISTINCT FROM OLD.import_source_row)) THEN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'),FALSE) THEN
      RAISE EXCEPTION 'Solo Administrador puede registrar metadatos de importacion' USING ERRCODE='42501';
    END IF;
    IF NEW.import_batch_id IS NULL OR NEW.import_source_row IS NULL THEN
      RAISE EXCEPTION 'La procedencia requiere lote y fila' USING ERRCODE='23514';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM jo.import_batches b
      JOIN jo.import_batch_rows br ON br.batch_id=b.id
      WHERE b.id=NEW.import_batch_id AND b.status='EN_PROCESO'
        AND br.source_row=NEW.import_source_row AND br.reference_id=NEW.id
    ) THEN
      RAISE EXCEPTION 'Procedencia sin ledger coherente, lote inexistente/cerrado o referencia equivocada' USING ERRCODE='23503';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION jo.guard_reference_import_metadata() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_028_guard_reference_import_metadata_insert ON jo.references;
CREATE TRIGGER trg_028_guard_reference_import_metadata_insert BEFORE INSERT ON jo.references
FOR EACH ROW EXECUTE FUNCTION jo.guard_reference_import_metadata();
DROP TRIGGER IF EXISTS trg_028_guard_reference_import_metadata_update ON jo.references;
CREATE TRIGGER trg_028_guard_reference_import_metadata_update BEFORE UPDATE OF import_batch_id,import_source_row ON jo.references
FOR EACH ROW EXECUTE FUNCTION jo.guard_reference_import_metadata();

-- Ultimo proceso real conocido; NULL significa desconocido y nunca se sustituye
-- por 'concepto'.
ALTER TABLE jo.reference_states ADD COLUMN IF NOT EXISTS last_process_state TEXT;
ALTER TABLE jo.reference_states DROP CONSTRAINT IF EXISTS reference_states_last_process_check;
ALTER TABLE jo.reference_states ADD CONSTRAINT reference_states_last_process_check CHECK (
    last_process_state IS NULL OR last_process_state IN (
      'concepto','diseno','costeo','industrializacion','produccion','comercial',
      'bordado','sublimado','proceso_externo','union'
    )
);

-- Alinear cancelaciones ya existentes sin crear reference_states ausentes. Solo
-- se usa proceso previamente almacenado; el historial anterior no se elimina.
WITH cancelled AS (
  SELECT rs.id,
         CASE
           WHEN rs.current_state IN ('concepto','diseno','costeo','industrializacion','produccion','comercial','bordado','sublimado','proceso_externo','union') THEN rs.current_state
           WHEN rs.previous_state IN ('concepto','diseno','costeo','industrializacion','produccion','comercial','bordado','sublimado','proceso_externo','union') THEN rs.previous_state
           WHEN rs.main_trunk_state IN ('concepto','diseno','costeo','industrializacion','produccion','comercial') THEN rs.main_trunk_state
         END AS process_state
  FROM jo.reference_states AS rs
  JOIN jo.references AS r ON r.id=rs.reference_id
  JOIN jo.reference_statuses AS s ON s.id=r.status_id AND s.is_cancelled IS TRUE
  WHERE rs.current_state <> 'cancelado'
), logged AS (
  INSERT INTO jo.state_history(reference_id,from_state,to_state,event,"timestamp",user_role,justification)
  SELECT rs.reference_id,rs.current_state,'cancelado','MIGRACION_028_STATUS_SYNC',clock_timestamp(),'Sistema',
         'Alineacion inicial con Status Global; proceso anterior preservado'
  FROM jo.reference_states AS rs JOIN cancelled AS c ON c.id=rs.id
  RETURNING reference_id
)
UPDATE jo.reference_states AS rs
SET previous_state=COALESCE(c.process_state,rs.previous_state),
    last_process_state=COALESCE(c.process_state,rs.last_process_state),
    current_state='cancelado',lifecycle_status='cancelled'
FROM cancelled AS c
WHERE rs.id=c.id
  AND EXISTS (SELECT 1 FROM logged WHERE logged.reference_id=rs.reference_id);

-- -----------------------------------------------------------------------------
-- 6. RPCs. Todos validan Administrador, fijan search_path vacio y califican
--    nombres. No existe ruta que cree automaticamente un codigo faltante.
--    Las RPC 028 usan lote -> referencia -> code_pool -> reference_codes. Los
--    triggers heredados de 013 se conservan por compatibilidad y toman locks
--    internamente; 028 no puede garantizar el orden de integraciones externas
--    que escriban las tablas directamente, por lo que deben reintentar 40P01.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jo.admin_create_reference_code(
    p_code_type TEXT, p_code TEXT, p_status TEXT DEFAULT 'DISPONIBLE', p_notes TEXT DEFAULT NULL
) RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE new_id BIGINT;
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    IF p_code_type IS NULL OR p_code_type NOT IN ('MD','PT') OR p_code IS NULL OR btrim(p_code) = '' THEN RAISE EXCEPTION 'Tipo/codigo invalido' USING ERRCODE='22023'; END IF;
    IF p_status IS NULL OR p_status NOT IN ('DISPONIBLE','RESERVADO','RETIRADO') THEN RAISE EXCEPTION 'Estado inicial invalido' USING ERRCODE='22023'; END IF;
    INSERT INTO jo.code_pool(code,code_type,status,notes,prefix)
    VALUES(btrim(p_code),p_code_type::jo.reference_code_type,p_status,p_notes,split_part(btrim(p_code),'-',1))
    RETURNING id INTO new_id;
    RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION jo.assign_existing_reference_code(p_reference_id INTEGER, p_code_type TEXT, p_code TEXT, p_notes TEXT DEFAULT NULL)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE code_row jo.code_pool%ROWTYPE; assignment_id INTEGER; occupied_reference INTEGER;
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    -- Orden comun 028: lote (si aplica) -> referencia -> pool -> asignacion.
    PERFORM 1 FROM jo.references WHERE id=p_reference_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Referencia inexistente' USING ERRCODE='23503'; END IF;
    IF p_code_type IS NULL OR p_code_type NOT IN ('MD','PT') THEN RAISE EXCEPTION 'code_type debe ser MD o PT' USING ERRCODE='22023'; END IF;
    SELECT * INTO code_row FROM jo.code_pool
      WHERE code=btrim(p_code) AND code_type=p_code_type::jo.reference_code_type FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Codigo % inexistente; no se crea automaticamente',p_code_type USING ERRCODE='23503'; END IF;
    PERFORM 1 FROM jo.reference_codes
      WHERE (reference_id=p_reference_id AND code_type=p_code_type::jo.reference_code_type)
         OR (code=code_row.code AND code_type=p_code_type::jo.reference_code_type)
      ORDER BY id FOR UPDATE;
    SELECT id INTO assignment_id FROM jo.reference_codes
      WHERE reference_id=p_reference_id AND code_type=p_code_type::jo.reference_code_type AND code=code_row.code AND COALESCE(active,TRUE);
    IF assignment_id IS NOT NULL THEN RETURN assignment_id::BIGINT; END IF;
    SELECT reference_id INTO occupied_reference FROM jo.reference_codes
      WHERE code_type=p_code_type::jo.reference_code_type AND code=code_row.code AND COALESCE(active,TRUE);
    IF code_row.status <> 'DISPONIBLE' OR occupied_reference IS NOT NULL THEN RAISE EXCEPTION 'Codigo % no disponible',p_code_type USING ERRCODE='23514'; END IF;
    IF EXISTS (SELECT 1 FROM jo.reference_codes WHERE reference_id=p_reference_id AND code_type=p_code_type::jo.reference_code_type AND COALESCE(active,TRUE)) THEN
      RAISE EXCEPTION 'Referencia ya tiene codigo % activo',p_code_type USING ERRCODE='23505';
    END IF;
    INSERT INTO jo.reference_codes(reference_id,code_type,code,pool_code_id,assigned_by,notes,active)
    VALUES(p_reference_id,p_code_type::jo.reference_code_type,code_row.code,code_row.id,auth.uid()::TEXT,p_notes,TRUE)
    RETURNING id INTO assignment_id;
    RETURN assignment_id::BIGINT;
END;
$$;

CREATE OR REPLACE FUNCTION jo.unassign_reference_code(p_reference_id INTEGER, p_code_type TEXT, p_notes TEXT DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected_id INTEGER; affected_pool_id INTEGER; affected_code TEXT;
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    IF p_code_type IS NULL OR p_code_type NOT IN ('MD','PT') THEN RAISE EXCEPTION 'code_type debe ser MD o PT' USING ERRCODE='22023'; END IF;
    -- Mismo orden que assign/commit: referencia -> pool -> reference_codes.
    PERFORM 1 FROM jo.references WHERE id=p_reference_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Referencia inexistente' USING ERRCODE='23503'; END IF;
    SELECT id,pool_code_id,code INTO affected_id,affected_pool_id,affected_code
      FROM jo.reference_codes
      WHERE reference_id=p_reference_id AND code_type=p_code_type::jo.reference_code_type AND COALESCE(active,TRUE);
    IF affected_id IS NULL THEN RETURN FALSE; END IF;
    IF affected_pool_id IS NOT NULL THEN
      PERFORM 1 FROM jo.code_pool WHERE id=affected_pool_id FOR UPDATE;
    END IF;
    PERFORM 1 FROM jo.reference_codes WHERE id=affected_id AND COALESCE(active,TRUE) FOR UPDATE;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    UPDATE jo.reference_codes SET active=FALSE,notes=COALESCE(p_notes,notes)
      WHERE id=affected_id;
    IF affected_id IS NOT NULL AND affected_pool_id IS NOT NULL THEN
      UPDATE jo.code_pool SET status='DISPONIBLE',updated_at=clock_timestamp() WHERE id=affected_pool_id;
    END IF;
    IF affected_id IS NOT NULL THEN
      INSERT INTO jo.code_log(reference_id,code_type,old_code,new_code,action,changed_by,notes)
      VALUES(p_reference_id,p_code_type::jo.reference_code_type,affected_code,NULL,'LIBERAR',auth.uid()::TEXT,p_notes);
    END IF;
    RETURN affected_id IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION jo.resolve_import_collection(p_code TEXT, p_season TEXT, p_year INTEGER)
RETURNS TABLE(collection_id INTEGER, collection_year_id INTEGER)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    RETURN QUERY
      SELECT c.id, cy.id FROM jo.collections AS c JOIN jo.collection_years AS cy ON cy.collection_id=c.id
      WHERE c.code=p_code AND c.season=p_season AND c.year=p_year AND cy.year=p_year
        AND right(p_code,2)=right(p_year::TEXT,2)
        AND c.active IS TRUE AND cy.is_hidden IS FALSE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Coleccion/temporada/ano inexistente o inactivo; no se crea automaticamente' USING ERRCODE='23503'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION jo.begin_reference_import(p_source_file TEXT, p_total_rows INTEGER DEFAULT NULL, p_metadata JSONB DEFAULT '{}'::JSONB)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE batch_id BIGINT;
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    INSERT INTO jo.import_batches(source_file,total_rows,metadata,created_by)
    VALUES(btrim(p_source_file),p_total_rows,COALESCE(p_metadata,'{}'::JSONB),auth.uid()) RETURNING id INTO batch_id;
    RETURN batch_id;
END;
$$;

CREATE OR REPLACE FUNCTION jo.record_import_issue(p_batch_id BIGINT, p_source_row INTEGER, p_issue_code TEXT, p_message TEXT, p_reference_id INTEGER DEFAULT NULL, p_row_payload JSONB DEFAULT NULL)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE issue_id BIGINT; row_result jo.import_batch_rows%ROWTYPE; inserted_issue BOOLEAN := FALSE;
        reference_batch BIGINT; reference_source_row INTEGER;
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    IF p_source_row IS NULL OR p_source_row <= 0 OR p_issue_code IS NULL OR btrim(p_issue_code)='' THEN
      RAISE EXCEPTION 'Fila e issue_code son obligatorios' USING ERRCODE='22023';
    END IF;
    PERFORM 1 FROM jo.import_batches WHERE id=p_batch_id AND status='EN_PROCESO' FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Lote inexistente o cerrado' USING ERRCODE='55000'; END IF;
    -- Orden comun: lote -> fila ledger -> referencia.
    SELECT * INTO row_result FROM jo.import_batch_rows WHERE batch_id=p_batch_id AND source_row=p_source_row FOR UPDATE;
    IF FOUND THEN
      IF row_result.outcome='INVALIDO' THEN RETURN row_result.issue_id; END IF;
      RAISE EXCEPTION 'La fila % ya fue registrada como exitosa',p_source_row USING ERRCODE='23505';
    END IF;
    IF p_reference_id IS NOT NULL THEN
      SELECT import_batch_id,import_source_row INTO reference_batch,reference_source_row
      FROM jo.references WHERE id=p_reference_id FOR UPDATE;
      IF NOT FOUND THEN RAISE EXCEPTION 'Referencia de incidencia inexistente' USING ERRCODE='23503'; END IF;
      IF reference_batch IS NOT NULL AND
         (reference_batch<>p_batch_id OR reference_source_row IS DISTINCT FROM p_source_row) THEN
        RAISE EXCEPTION 'Referencia de incidencia pertenece a otro lote/fila' USING ERRCODE='23505';
      END IF;
    END IF;
    INSERT INTO jo.import_issues(batch_id,source_row,reference_id,issue_code,message,row_payload)
    VALUES(p_batch_id,p_source_row,p_reference_id,btrim(p_issue_code),p_message,p_row_payload)
    ON CONFLICT DO NOTHING RETURNING id INTO issue_id;
    inserted_issue := issue_id IS NOT NULL;
    IF NOT inserted_issue THEN
      SELECT id INTO issue_id FROM jo.import_issues
       WHERE batch_id=p_batch_id AND COALESCE(source_row,0)=p_source_row
         AND issue_code=btrim(p_issue_code) AND COALESCE(reference_id,0)=COALESCE(p_reference_id,0);
    END IF;
    INSERT INTO jo.import_batch_rows(batch_id,source_row,outcome,reference_id,issue_id)
    VALUES(p_batch_id,p_source_row,'INVALIDO',p_reference_id,issue_id);
    UPDATE jo.import_batches SET invalid_rows=invalid_rows+1 WHERE id=p_batch_id;
    IF p_reference_id IS NOT NULL THEN
      UPDATE jo.references SET import_batch_id=p_batch_id,import_source_row=p_source_row
      WHERE id=p_reference_id AND import_batch_id IS NULL;
    END IF;
    RETURN issue_id;
END;
$$;

CREATE OR REPLACE FUNCTION jo.register_reference_import(p_batch_id BIGINT, p_reference_id INTEGER, p_source_row INTEGER, p_process_state TEXT DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE is_cancelled BOOLEAN; valid_process BOOLEAN; source_name TEXT; ref_row jo.references%ROWTYPE;
        state_created BOOLEAN := FALSE; row_result jo.import_batch_rows%ROWTYPE;
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    SELECT source_file INTO source_name FROM jo.import_batches WHERE id=p_batch_id AND status='EN_PROCESO' FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Lote inexistente o cerrado' USING ERRCODE='23503'; END IF;
    IF p_source_row IS NULL OR p_source_row <= 0 THEN RAISE EXCEPTION 'source_row invalida' USING ERRCODE='22023'; END IF;
    SELECT * INTO row_result FROM jo.import_batch_rows WHERE batch_id=p_batch_id AND source_row=p_source_row FOR UPDATE;
    IF FOUND THEN
      IF row_result.outcome='EXITOSO' AND row_result.reference_id=p_reference_id THEN RETURN TRUE; END IF;
      IF row_result.outcome='INVALIDO' THEN RETURN FALSE; END IF;
      RAISE EXCEPTION 'Fila ya vinculada a otra referencia' USING ERRCODE='23505';
    END IF;
    SELECT * INTO ref_row FROM jo.references WHERE id=p_reference_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Referencia inexistente' USING ERRCODE='23503'; END IF;
    IF ref_row.import_batch_id IS NOT NULL AND
       (ref_row.import_batch_id<>p_batch_id OR ref_row.import_source_row IS DISTINCT FROM p_source_row) THEN
      RAISE EXCEPTION 'La referencia conserva procedencia de otra importacion/fila' USING ERRCODE='23505';
    END IF;
    valid_process := p_process_state IN ('concepto','diseno','costeo','industrializacion','produccion','comercial','bordado','sublimado','proceso_externo','union');
    IF NOT COALESCE(valid_process,FALSE) THEN
      PERFORM jo.record_import_issue(p_batch_id,p_source_row,'PROCESO_INVALIDO_O_AUSENTE','Referencia sin reference_states; no se invento un proceso',p_reference_id,NULL);
      UPDATE jo.references SET import_batch_id=p_batch_id,import_source_row=p_source_row
        WHERE id=p_reference_id AND import_batch_id IS NULL;
      RETURN FALSE;
    END IF;
    -- El ledger se registra antes de la procedencia: el trigger de references
    -- nunca necesita un bypass falsificable y toda la secuencia sigue atomica.
    INSERT INTO jo.import_batch_rows(batch_id,source_row,outcome,reference_id)
    VALUES(p_batch_id,p_source_row,'EXITOSO',p_reference_id);
    UPDATE jo.import_batches SET successful_rows=successful_rows+1 WHERE id=p_batch_id;
    UPDATE jo.references SET import_batch_id=p_batch_id,import_source_row=p_source_row
      WHERE id=p_reference_id AND import_batch_id IS NULL;
    SELECT COALESCE(s.is_cancelled,FALSE) INTO is_cancelled
      FROM jo.references r LEFT JOIN jo.reference_statuses s ON s.id=r.status_id WHERE r.id=p_reference_id;
    INSERT INTO jo.reference_states(reference_id,collection_id,current_state,previous_state,main_trunk_state,lifecycle_status,last_process_state)
    SELECT r.id,r.collection_id,CASE WHEN is_cancelled THEN 'cancelado' ELSE p_process_state END,
           CASE WHEN is_cancelled THEN p_process_state ELSE NULL END,p_process_state,
           CASE WHEN is_cancelled THEN 'cancelled' ELSE 'active' END,p_process_state
      FROM jo.references r WHERE r.id=p_reference_id
    ON CONFLICT(reference_id) DO NOTHING RETURNING TRUE INTO state_created;
    IF COALESCE(state_created,FALSE) THEN
      INSERT INTO jo.state_history(reference_id,from_state,to_state,event,"timestamp",user_id,user_role,justification,import_batch_id)
      VALUES(p_reference_id,p_process_state,CASE WHEN is_cancelled THEN 'cancelado' ELSE p_process_state END,
             'IMPORTACION_CSV',clock_timestamp(),auth.uid()::TEXT,'Administrador','Archivo: '||source_name||'; fila: '||p_source_row,p_batch_id)
      ON CONFLICT DO NOTHING;
    END IF;
    RETURN TRUE;
END;
$$;

-- Unidad atomica por fila. Los errores SQL revierten los enlaces parciales. La
-- unica carga parcial deliberada es proceso ausente/invalido: conserva la
-- referencia y codigos ya validados, omite estados y deja incidencia vinculada.
-- p_reference_data admite exclusivamente: reference_number, name, status_id,
-- line_id y subline_id. No importa telas ni estados por area.
CREATE OR REPLACE FUNCTION jo.commit_reference_import_row(
  p_batch_id BIGINT,p_source_row INTEGER,p_collection_code TEXT,p_season TEXT,p_year INTEGER,
  p_reference_data JSONB,p_process_state TEXT,p_md_code TEXT DEFAULT NULL,p_pt_code TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE resolved_collection_id INTEGER; resolved_year_id INTEGER; new_reference_id INTEGER;
        existing_result jo.import_batch_rows%ROWTYPE; failure_state TEXT; failure_message TEXT;
        registered BOOLEAN; process_omitted BOOLEAN; invalid_issue_id BIGINT;
BEGIN
  IF NOT COALESCE(jo.current_user_has_role('Administrador'),FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
  IF p_source_row IS NULL OR p_source_row<=0 OR p_reference_data IS NULL OR
     NULLIF(btrim(p_reference_data->>'reference_number'),'') IS NULL THEN
    RAISE EXCEPTION 'Fila y reference_number son obligatorios' USING ERRCODE='22023';
  END IF;
  PERFORM 1 FROM jo.import_batches WHERE id=p_batch_id AND status='EN_PROCESO' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Lote inexistente o cerrado' USING ERRCODE='55000'; END IF;
  SELECT * INTO existing_result FROM jo.import_batch_rows WHERE batch_id=p_batch_id AND source_row=p_source_row;
  IF FOUND THEN
    SELECT EXISTS(
      SELECT 1 FROM jo.import_issues i WHERE i.id=existing_result.issue_id
        AND i.issue_code='PROCESO_INVALIDO_O_AUSENTE'
    ) INTO process_omitted;
    RETURN jsonb_build_object('outcome',existing_result.outcome,'reference_id',existing_result.reference_id,
      'issue_id',existing_result.issue_id,'reference_created',existing_result.reference_id IS NOT NULL,
      'process_omitted',process_omitted,'idempotent',TRUE);
  END IF;

  BEGIN
    SELECT collection_id,collection_year_id INTO STRICT resolved_collection_id,resolved_year_id
      FROM jo.resolve_import_collection(p_collection_code,p_season,p_year);
    INSERT INTO jo.references(collection_id,year,reference_number,name,status_id,line_id,subline_id)
    VALUES(resolved_collection_id,p_year,btrim(p_reference_data->>'reference_number'),COALESCE(p_reference_data->>'name',''),
      NULLIF(p_reference_data->>'status_id','')::INTEGER,NULLIF(p_reference_data->>'line_id','')::INTEGER,
      NULLIF(p_reference_data->>'subline_id','')::INTEGER)
    RETURNING id INTO new_reference_id;
    IF NULLIF(btrim(p_md_code),'') IS NOT NULL THEN
      PERFORM jo.assign_existing_reference_code(new_reference_id,'MD',btrim(p_md_code),'IMPORTACION_CSV');
    END IF;
    IF NULLIF(btrim(p_pt_code),'') IS NOT NULL THEN
      PERFORM jo.assign_existing_reference_code(new_reference_id,'PT',btrim(p_pt_code),'IMPORTACION_CSV');
    END IF;
    registered := jo.register_reference_import(p_batch_id,new_reference_id,p_source_row,p_process_state);
    IF NOT registered THEN
      SELECT issue_id INTO invalid_issue_id FROM jo.import_batch_rows
       WHERE batch_id=p_batch_id AND source_row=p_source_row AND outcome='INVALIDO';
      RETURN jsonb_build_object('outcome','INVALIDO','reference_id',new_reference_id,
        'issue_id',invalid_issue_id,'reference_created',TRUE,'process_omitted',TRUE,
        'collection_year_id',resolved_year_id,'idempotent',FALSE);
    END IF;
    RETURN jsonb_build_object('outcome','EXITOSO','reference_id',new_reference_id,
      'reference_created',TRUE,'process_omitted',FALSE,
      'collection_year_id',resolved_year_id,'idempotent',FALSE);
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS failure_state=RETURNED_SQLSTATE,failure_message=MESSAGE_TEXT;
  END;

  PERFORM jo.record_import_issue(p_batch_id,p_source_row,'SQL_'||failure_state,failure_message,NULL,p_reference_data);
  RETURN jsonb_build_object('outcome','INVALIDO','sqlstate',failure_state,'message',failure_message,
    'reference_created',FALSE,'process_omitted',FALSE,'idempotent',FALSE);
END;
$$;

CREATE OR REPLACE FUNCTION jo.finish_reference_import(p_batch_id BIGINT, p_failed BOOLEAN DEFAULT FALSE)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE batch_row jo.import_batches%ROWTYPE; actual_success INTEGER; actual_invalid INTEGER;
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    SELECT * INTO batch_row FROM jo.import_batches WHERE id=p_batch_id AND status='EN_PROCESO' FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Lote inexistente o ya cerrado' USING ERRCODE='23503'; END IF;
    SELECT count(*) FILTER(WHERE outcome='EXITOSO'),count(*) FILTER(WHERE outcome='INVALIDO')
      INTO actual_success,actual_invalid FROM jo.import_batch_rows WHERE batch_id=p_batch_id;
    IF batch_row.successful_rows<>actual_success OR batch_row.invalid_rows<>actual_invalid THEN
      RAISE EXCEPTION 'Contadores inconsistentes: almacenados %/% vs filas %/%',batch_row.successful_rows,batch_row.invalid_rows,actual_success,actual_invalid USING ERRCODE='23514';
    END IF;
    IF NOT p_failed AND batch_row.total_rows IS NOT NULL AND actual_success+actual_invalid<>batch_row.total_rows THEN
      RAISE EXCEPTION 'Lote incompleto: procesadas %, esperadas %',actual_success+actual_invalid,batch_row.total_rows USING ERRCODE='23514';
    END IF;
    UPDATE jo.import_batches SET status=CASE WHEN p_failed THEN 'FALLIDO' WHEN actual_invalid>0 THEN 'COMPLETADO_CON_INCIDENCIAS' ELSE 'COMPLETADO' END,
      finished_at=clock_timestamp() WHERE id=p_batch_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 7. Sincronizacion Status Global <-> state machine sin borrar historial.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jo.sync_reference_global_status_to_state_machine()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE old_cancelled BOOLEAN := FALSE; new_cancelled BOOLEAN := FALSE; state_row jo.reference_states%ROWTYPE; restore_state TEXT; actor_role TEXT;
BEGIN
    IF NEW.status_id IS NOT DISTINCT FROM OLD.status_id THEN RETURN NEW; END IF;
    SELECT COALESCE((SELECT is_cancelled FROM jo.reference_statuses WHERE id=OLD.status_id),FALSE) INTO old_cancelled;
    SELECT COALESCE((SELECT is_cancelled FROM jo.reference_statuses WHERE id=NEW.status_id),FALSE) INTO new_cancelled;
    IF old_cancelled = new_cancelled THEN RETURN NEW; END IF;
    SELECT account.role INTO actor_role FROM jo.user_accounts AS account WHERE account.auth_user_id=auth.uid() AND account.active IS TRUE;
    SELECT * INTO state_row FROM jo.reference_states WHERE reference_id=NEW.id FOR UPDATE;
    IF NOT FOUND THEN RETURN NEW; END IF; -- Nunca inventar proceso/estado.
    IF new_cancelled THEN
      restore_state := CASE
        WHEN state_row.current_state IN ('concepto','diseno','costeo','industrializacion','produccion','comercial','bordado','sublimado','proceso_externo','union') THEN state_row.current_state
        WHEN state_row.main_trunk_state IN ('concepto','diseno','costeo','industrializacion','produccion','comercial') THEN state_row.main_trunk_state
        ELSE state_row.last_process_state END;
      UPDATE jo.reference_states SET previous_state=COALESCE(restore_state,previous_state),last_process_state=COALESCE(restore_state,last_process_state),current_state='cancelado',lifecycle_status='cancelled' WHERE id=state_row.id;
      INSERT INTO jo.state_history(reference_id,from_state,to_state,event,"timestamp",user_id,user_role)
      VALUES(NEW.id,state_row.current_state,'cancelado','STATUS_GLOBAL_CANCELADO',clock_timestamp(),auth.uid()::TEXT,actor_role);
    ELSE
      restore_state := COALESCE(state_row.last_process_state,
        CASE WHEN state_row.previous_state IN ('concepto','diseno','costeo','industrializacion','produccion','comercial','bordado','sublimado','proceso_externo','union') THEN state_row.previous_state END);
      IF restore_state IS NULL THEN RAISE EXCEPTION 'No existe ultimo proceso valido para reactivar referencia %', NEW.id USING ERRCODE='23514'; END IF;
      UPDATE jo.reference_states SET previous_state='cancelado',current_state=restore_state,lifecycle_status='active',last_process_state=restore_state WHERE id=state_row.id;
      INSERT INTO jo.state_history(reference_id,from_state,to_state,event,"timestamp",user_id,user_role)
      VALUES(NEW.id,'cancelado',restore_state,'STATUS_GLOBAL_REACTIVADO',clock_timestamp(),auth.uid()::TEXT,actor_role);
    END IF;
    RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION jo.sync_reference_global_status_to_state_machine() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_028_global_status_state_machine ON jo.references;
CREATE TRIGGER trg_028_global_status_state_machine AFTER UPDATE OF status_id ON jo.references
FOR EACH ROW EXECUTE FUNCTION jo.sync_reference_global_status_to_state_machine();

-- -----------------------------------------------------------------------------
-- 8. RLS, privilegios y superficie RPC.
-- -----------------------------------------------------------------------------
ALTER TABLE jo.md_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.pt_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.md_code_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.pt_code_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.import_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.import_batch_rows ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA jo TO authenticated;
GRANT SELECT ON jo.md_codes,jo.pt_codes,jo.md_code_assignments,jo.pt_code_assignments TO authenticated;
GRANT SELECT ON jo.import_batches,jo.import_issues,jo.import_batch_rows TO authenticated;
REVOKE INSERT,UPDATE,DELETE ON jo.md_codes,jo.pt_codes,jo.md_code_assignments,jo.pt_code_assignments,jo.import_batches,jo.import_issues,jo.import_batch_rows FROM anon,authenticated;
REVOKE ALL ON jo.md_codes,jo.pt_codes FROM anon;
GRANT SELECT ON jo.md_codes,jo.pt_codes TO authenticated;

DO $$
DECLARE table_name TEXT; policy_row RECORD;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['md_codes','pt_codes','md_code_assignments','pt_code_assignments','import_batches','import_issues','import_batch_rows'] LOOP
    FOR policy_row IN SELECT policyname FROM pg_policies WHERE schemaname='jo' AND tablename=table_name LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON jo.%I',policy_row.policyname,table_name);
    END LOOP;
  END LOOP;
END;
$$;
CREATE POLICY rbac_active_select ON jo.md_codes FOR SELECT TO authenticated USING ((SELECT jo.current_user_is_active()));
CREATE POLICY rbac_active_select ON jo.pt_codes FOR SELECT TO authenticated USING ((SELECT jo.current_user_is_active()));
CREATE POLICY rbac_active_select ON jo.md_code_assignments FOR SELECT TO authenticated USING ((SELECT jo.current_user_is_active()));
CREATE POLICY rbac_active_select ON jo.pt_code_assignments FOR SELECT TO authenticated USING ((SELECT jo.current_user_is_active()));
CREATE POLICY rbac_admin_select ON jo.import_batches FOR SELECT TO authenticated USING ((SELECT jo.current_user_has_role('Administrador')));
CREATE POLICY rbac_admin_select ON jo.import_issues FOR SELECT TO authenticated USING ((SELECT jo.current_user_has_role('Administrador')));
CREATE POLICY rbac_admin_select ON jo.import_batch_rows FOR SELECT TO authenticated USING ((SELECT jo.current_user_has_role('Administrador')));

DO $$
DECLARE signature TEXT;
BEGIN
  FOREACH signature IN ARRAY ARRAY[
    'jo.admin_create_reference_code(text,text,text,text)',
    'jo.assign_existing_reference_code(integer,text,text,text)',
    'jo.unassign_reference_code(integer,text,text)',
    'jo.resolve_import_collection(text,text,integer)',
    'jo.begin_reference_import(text,integer,jsonb)',
    'jo.record_import_issue(bigint,integer,text,text,integer,jsonb)',
    'jo.commit_reference_import_row(bigint,integer,text,text,integer,jsonb,text,text,text)',
    'jo.finish_reference_import(bigint,boolean)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon',signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated',signature);
  END LOOP;
END;
$$;

-- Auxiliar interna de commit_reference_import_row: no forma parte de la API de
-- cliente y no tiene semantica publica para referencias preexistentes.
REVOKE ALL ON FUNCTION jo.register_reference_import(bigint,integer,integer,text)
  FROM PUBLIC,anon,authenticated;

COMMENT ON TABLE jo.md_codes IS 'Proyeccion MD separada y de solo lectura en 028; code_pool sigue siendo autoridad hasta migracion coordinada.';
COMMENT ON TABLE jo.pt_codes IS 'Proyeccion PT separada y de solo lectura en 028; code_pool sigue siendo autoridad hasta migracion coordinada.';
COMMENT ON TABLE jo.import_batches IS 'Lotes auditables de importacion CSV parcial por fila.';
COMMENT ON TABLE jo.import_issues IS 'Incidencias por fila; una incidencia no revierte las filas validas del lote.';
COMMENT ON TABLE jo.import_batch_rows IS 'Ledger idempotente: un unico resultado terminal por fila de cada lote.';
COMMENT ON COLUMN jo.state_history.import_batch_id IS 'Origen estructurado de transiciones creadas por una importacion; NULL fuera de importaciones.';

COMMIT;
