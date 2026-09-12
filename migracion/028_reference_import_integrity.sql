-- =============================================================================
-- 028 - Integridad para la futura importacion masiva de referencias
--
-- Ejecutar completa y manualmente. No crea colecciones, anos, lineas, procesos
-- ni codigos. Conserva code_pool, reference_codes y code_log como legado de
-- solo lectura. La importacion es parcial por fila y exclusiva de Administrador.
-- =============================================================================

BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '5min';
SET LOCAL search_path = jo, public;

-- -----------------------------------------------------------------------------
-- 1. Preflight: abortar antes de cualquier DDL si el esquema o los datos no
--    permiten una conversion determinista.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    missing_objects TEXT;
    details TEXT;
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

    SELECT string_agg(format('rc=%s,code=%s', rc.id, rc.code), ', ' ORDER BY rc.id)
    INTO details
    FROM jo.reference_codes AS rc
    LEFT JOIN jo.code_pool AS cp ON cp.id = rc.pool_code_id
    WHERE rc.code IS NULL
       OR (cp.id IS NOT NULL AND (cp.code IS DISTINCT FROM rc.code OR cp.code_type IS DISTINCT FROM rc.code_type))
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
    assigned_at                 TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    assigned_by                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    legacy_assigned_by          TEXT,
    notes                       TEXT,
    active                      BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at              TIMESTAMPTZ,
    legacy_reference_code_id    INTEGER UNIQUE,
    CHECK ((active AND deactivated_at IS NULL) OR NOT active)
);
CREATE TABLE IF NOT EXISTS jo.pt_code_assignments (
    id                          BIGSERIAL PRIMARY KEY,
    reference_id                INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE RESTRICT,
    code_id                     BIGINT NOT NULL REFERENCES jo.pt_codes(id) ON DELETE RESTRICT,
    assigned_at                 TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    assigned_by                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    legacy_assigned_by          TEXT,
    notes                       TEXT,
    active                      BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at              TIMESTAMPTZ,
    legacy_reference_code_id    INTEGER UNIQUE,
    CHECK ((active AND deactivated_at IS NULL) OR NOT active)
);

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

INSERT INTO jo.md_codes (code, prefix, sequential_num, status, notes, legacy_pool_id, created_at, updated_at)
SELECT code, prefix, sequential_num, status, notes, id, created_at, updated_at
FROM jo.code_pool WHERE code_type = 'MD'
ON CONFLICT (code) DO NOTHING;
INSERT INTO jo.pt_codes (code, prefix, sequential_num, status, notes, legacy_pool_id, created_at, updated_at)
SELECT code, prefix, sequential_num, status, notes, id, created_at, updated_at
FROM jo.code_pool WHERE code_type = 'PT'
ON CONFLICT (code) DO NOTHING;

-- 013 podia crear un codigo desde reference_codes. Esos registros tambien son
-- legado valido durante el backfill; esto no es comportamiento del importador.
INSERT INTO jo.md_codes (code, status, prefix)
SELECT DISTINCT rc.code, CASE WHEN bool_or(rc.active) THEN 'ASIGNADO' ELSE 'DISPONIBLE' END,
       split_part(rc.code, '-', 1)
FROM jo.reference_codes AS rc WHERE rc.code_type = 'MD'
GROUP BY rc.code ON CONFLICT (code) DO NOTHING;
INSERT INTO jo.pt_codes (code, status, prefix)
SELECT DISTINCT rc.code, CASE WHEN bool_or(rc.active) THEN 'ASIGNADO' ELSE 'DISPONIBLE' END,
       split_part(rc.code, '-', 1)
FROM jo.reference_codes AS rc WHERE rc.code_type = 'PT'
GROUP BY rc.code ON CONFLICT (code) DO NOTHING;

INSERT INTO jo.md_code_assignments
    (reference_id, code_id, assigned_at, legacy_assigned_by, notes, active, deactivated_at, legacy_reference_code_id)
SELECT rc.reference_id, c.id, COALESCE(rc.assigned_at, clock_timestamp()), rc.assigned_by, rc.notes,
       COALESCE(rc.active, TRUE), CASE WHEN COALESCE(rc.active, TRUE) THEN NULL ELSE COALESCE(rc.assigned_at, clock_timestamp()) END, rc.id
FROM jo.reference_codes AS rc JOIN jo.md_codes AS c ON c.code = rc.code
WHERE rc.code_type = 'MD' ON CONFLICT (legacy_reference_code_id) DO NOTHING;
INSERT INTO jo.pt_code_assignments
    (reference_id, code_id, assigned_at, legacy_assigned_by, notes, active, deactivated_at, legacy_reference_code_id)
SELECT rc.reference_id, c.id, COALESCE(rc.assigned_at, clock_timestamp()), rc.assigned_by, rc.notes,
       COALESCE(rc.active, TRUE), CASE WHEN COALESCE(rc.active, TRUE) THEN NULL ELSE COALESCE(rc.assigned_at, clock_timestamp()) END, rc.id
FROM jo.reference_codes AS rc JOIN jo.pt_codes AS c ON c.code = rc.code
WHERE rc.code_type = 'PT' ON CONFLICT (legacy_reference_code_id) DO NOTHING;

UPDATE jo.md_codes AS c SET status = 'ASIGNADO', updated_at = clock_timestamp()
WHERE EXISTS (SELECT 1 FROM jo.md_code_assignments AS a WHERE a.code_id = c.id AND a.active);
UPDATE jo.pt_codes AS c SET status = 'ASIGNADO', updated_at = clock_timestamp()
WHERE EXISTS (SELECT 1 FROM jo.pt_code_assignments AS a WHERE a.code_id = c.id AND a.active);

CREATE OR REPLACE FUNCTION jo.enforce_authoritative_code_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE has_active BOOLEAN;
BEGIN
  IF TG_TABLE_NAME = 'md_codes' THEN
    SELECT EXISTS (SELECT 1 FROM jo.md_code_assignments WHERE code_id=NEW.id AND active) INTO has_active;
  ELSE
    SELECT EXISTS (SELECT 1 FROM jo.pt_code_assignments WHERE code_id=NEW.id AND active) INTO has_active;
  END IF;
  IF NEW.status='ASIGNADO' AND NOT has_active THEN
    RAISE EXCEPTION 'ASIGNADO requiere una asignacion activa' USING ERRCODE='23514';
  END IF;
  IF NEW.status<>'ASIGNADO' AND has_active THEN
    RAISE EXCEPTION 'Un codigo con asignacion activa debe permanecer ASIGNADO' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION jo.enforce_authoritative_code_status() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS trg_md_codes_status_integrity ON jo.md_codes;
CREATE TRIGGER trg_md_codes_status_integrity BEFORE INSERT OR UPDATE OF status ON jo.md_codes
FOR EACH ROW EXECUTE FUNCTION jo.enforce_authoritative_code_status();
DROP TRIGGER IF EXISTS trg_pt_codes_status_integrity ON jo.pt_codes;
CREATE TRIGGER trg_pt_codes_status_integrity BEFORE INSERT OR UPDATE OF status ON jo.pt_codes
FOR EACH ROW EXECUTE FUNCTION jo.enforce_authoritative_code_status();

-- Congelar las tablas legacy: siguen disponibles para lectura/auditoria, pero
-- no pueden convertirse nuevamente en una autoridad escribible.
CREATE OR REPLACE FUNCTION jo.reject_legacy_code_write()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    RAISE EXCEPTION 'Tabla legacy de solo lectura; use catalogos MD/PT y RPC de 028' USING ERRCODE = '55000';
END;
$$;
REVOKE ALL ON FUNCTION jo.reject_legacy_code_write() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_028_freeze_code_pool ON jo.code_pool;
CREATE TRIGGER trg_028_freeze_code_pool BEFORE INSERT OR UPDATE OR DELETE ON jo.code_pool
FOR EACH ROW EXECUTE FUNCTION jo.reject_legacy_code_write();
DROP TRIGGER IF EXISTS trg_028_freeze_reference_codes ON jo.reference_codes;
CREATE TRIGGER trg_028_freeze_reference_codes BEFORE INSERT OR UPDATE OR DELETE ON jo.reference_codes
FOR EACH ROW EXECUTE FUNCTION jo.reject_legacy_code_write();
REVOKE INSERT, UPDATE, DELETE ON jo.code_pool, jo.reference_codes FROM anon, authenticated;

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
ALTER TABLE jo.references ADD COLUMN IF NOT EXISTS import_batch_id BIGINT REFERENCES jo.import_batches(id) ON DELETE SET NULL;
ALTER TABLE jo.references ADD COLUMN IF NOT EXISTS import_source_row INTEGER CHECK (import_source_row IS NULL OR import_source_row > 0);
CREATE INDEX IF NOT EXISTS import_batches_date_idx ON jo.import_batches(imported_at DESC);
CREATE INDEX IF NOT EXISTS import_batches_creator_idx ON jo.import_batches(created_by, imported_at DESC);
CREATE INDEX IF NOT EXISTS import_issues_batch_row_idx ON jo.import_issues(batch_id, source_row);
CREATE INDEX IF NOT EXISTS import_issues_reference_idx ON jo.import_issues(reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS references_import_batch_idx ON jo.references(import_batch_id) WHERE import_batch_id IS NOT NULL;

CREATE OR REPLACE FUNCTION jo.guard_reference_import_metadata()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF (TG_OP='INSERT' AND (NEW.import_batch_id IS NOT NULL OR NEW.import_source_row IS NOT NULL))
     OR (TG_OP='UPDATE' AND (NEW.import_batch_id IS DISTINCT FROM OLD.import_batch_id OR NEW.import_source_row IS DISTINCT FROM OLD.import_source_row)) THEN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'),FALSE) THEN
      RAISE EXCEPTION 'Solo Administrador puede registrar metadatos de importacion' USING ERRCODE='42501';
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
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION jo.admin_create_reference_code(
    p_code_type TEXT, p_code TEXT, p_status TEXT DEFAULT 'DISPONIBLE', p_notes TEXT DEFAULT NULL
) RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE new_id BIGINT;
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    IF p_code_type IS NULL OR p_code_type NOT IN ('MD','PT') OR p_code IS NULL OR btrim(p_code) = '' THEN RAISE EXCEPTION 'Tipo/codigo invalido' USING ERRCODE='22023'; END IF;
    IF p_status IS NULL OR p_status NOT IN ('DISPONIBLE','RESERVADO','RETIRADO') THEN RAISE EXCEPTION 'Estado inicial invalido' USING ERRCODE='22023'; END IF;
    IF p_code_type = 'MD' THEN
        INSERT INTO jo.md_codes(code,status,notes,prefix) VALUES (btrim(p_code),p_status,p_notes,split_part(btrim(p_code),'-',1)) RETURNING id INTO new_id;
    ELSE
        INSERT INTO jo.pt_codes(code,status,notes,prefix) VALUES (btrim(p_code),p_status,p_notes,split_part(btrim(p_code),'-',1)) RETURNING id INTO new_id;
    END IF;
    RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION jo.assign_existing_reference_code(p_reference_id INTEGER, p_code_type TEXT, p_code TEXT, p_notes TEXT DEFAULT NULL)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE code_row RECORD; assignment_id BIGINT; occupied_reference INTEGER;
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    PERFORM 1 FROM jo.references WHERE id=p_reference_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Referencia inexistente' USING ERRCODE='23503'; END IF;
    IF p_code_type = 'MD' THEN
        SELECT * INTO code_row FROM jo.md_codes WHERE code=p_code FOR UPDATE;
        IF NOT FOUND THEN RAISE EXCEPTION 'Codigo MD inexistente; no se crea automaticamente' USING ERRCODE='23503'; END IF;
        SELECT id INTO assignment_id FROM jo.md_code_assignments WHERE reference_id=p_reference_id AND code_id=code_row.id AND active;
        IF assignment_id IS NOT NULL THEN RETURN assignment_id; END IF;
        SELECT reference_id INTO occupied_reference FROM jo.md_code_assignments WHERE code_id=code_row.id AND active;
        IF code_row.status <> 'DISPONIBLE' OR occupied_reference IS NOT NULL THEN RAISE EXCEPTION 'Codigo MD no disponible' USING ERRCODE='23514'; END IF;
        IF EXISTS (SELECT 1 FROM jo.md_code_assignments WHERE reference_id=p_reference_id AND active) THEN RAISE EXCEPTION 'Referencia ya tiene MD activo' USING ERRCODE='23505'; END IF;
        INSERT INTO jo.md_code_assignments(reference_id,code_id,assigned_by,notes) VALUES(p_reference_id,code_row.id,auth.uid(),p_notes) RETURNING id INTO assignment_id;
        UPDATE jo.md_codes SET status='ASIGNADO',updated_at=clock_timestamp() WHERE id=code_row.id;
        INSERT INTO jo.code_log(reference_id,code_type,old_code,new_code,action,changed_by,notes)
        VALUES(p_reference_id,'MD',NULL,p_code,'ASIGNAR',auth.uid()::TEXT,p_notes);
    ELSIF p_code_type = 'PT' THEN
        SELECT * INTO code_row FROM jo.pt_codes WHERE code=p_code FOR UPDATE;
        IF NOT FOUND THEN RAISE EXCEPTION 'Codigo PT inexistente; no se crea automaticamente' USING ERRCODE='23503'; END IF;
        SELECT id INTO assignment_id FROM jo.pt_code_assignments WHERE reference_id=p_reference_id AND code_id=code_row.id AND active;
        IF assignment_id IS NOT NULL THEN RETURN assignment_id; END IF;
        SELECT reference_id INTO occupied_reference FROM jo.pt_code_assignments WHERE code_id=code_row.id AND active;
        IF code_row.status <> 'DISPONIBLE' OR occupied_reference IS NOT NULL THEN RAISE EXCEPTION 'Codigo PT no disponible' USING ERRCODE='23514'; END IF;
        IF EXISTS (SELECT 1 FROM jo.pt_code_assignments WHERE reference_id=p_reference_id AND active) THEN RAISE EXCEPTION 'Referencia ya tiene PT activo' USING ERRCODE='23505'; END IF;
        INSERT INTO jo.pt_code_assignments(reference_id,code_id,assigned_by,notes) VALUES(p_reference_id,code_row.id,auth.uid(),p_notes) RETURNING id INTO assignment_id;
        UPDATE jo.pt_codes SET status='ASIGNADO',updated_at=clock_timestamp() WHERE id=code_row.id;
        INSERT INTO jo.code_log(reference_id,code_type,old_code,new_code,action,changed_by,notes)
        VALUES(p_reference_id,'PT',NULL,p_code,'ASIGNAR',auth.uid()::TEXT,p_notes);
    ELSE RAISE EXCEPTION 'code_type debe ser MD o PT' USING ERRCODE='22023';
    END IF;
    RETURN assignment_id;
END;
$$;

CREATE OR REPLACE FUNCTION jo.unassign_reference_code(p_reference_id INTEGER, p_code_type TEXT, p_notes TEXT DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected_id BIGINT;
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    IF p_code_type='MD' THEN
      UPDATE jo.md_code_assignments SET active=FALSE,deactivated_at=clock_timestamp(),notes=COALESCE(p_notes,notes)
       WHERE reference_id=p_reference_id AND active RETURNING code_id INTO affected_id;
      IF affected_id IS NOT NULL THEN
        UPDATE jo.md_codes SET status='DISPONIBLE',updated_at=clock_timestamp() WHERE id=affected_id;
        INSERT INTO jo.code_log(reference_id,code_type,old_code,new_code,action,changed_by,notes)
        SELECT p_reference_id,'MD',code,NULL,'LIBERAR',auth.uid()::TEXT,p_notes FROM jo.md_codes WHERE id=affected_id;
      END IF;
    ELSIF p_code_type='PT' THEN
      UPDATE jo.pt_code_assignments SET active=FALSE,deactivated_at=clock_timestamp(),notes=COALESCE(p_notes,notes)
       WHERE reference_id=p_reference_id AND active RETURNING code_id INTO affected_id;
      IF affected_id IS NOT NULL THEN
        UPDATE jo.pt_codes SET status='DISPONIBLE',updated_at=clock_timestamp() WHERE id=affected_id;
        INSERT INTO jo.code_log(reference_id,code_type,old_code,new_code,action,changed_by,notes)
        SELECT p_reference_id,'PT',code,NULL,'LIBERAR',auth.uid()::TEXT,p_notes FROM jo.pt_codes WHERE id=affected_id;
      END IF;
    ELSE RAISE EXCEPTION 'code_type debe ser MD o PT' USING ERRCODE='22023'; END IF;
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
      WHERE c.code=p_code AND c.season=p_season AND cy.year=p_year
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
DECLARE issue_id BIGINT;
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    INSERT INTO jo.import_issues(batch_id,source_row,reference_id,issue_code,message,row_payload)
    VALUES(p_batch_id,p_source_row,p_reference_id,p_issue_code,p_message,p_row_payload) RETURNING id INTO issue_id;
    UPDATE jo.import_batches SET invalid_rows=invalid_rows+1 WHERE id=p_batch_id;
    RETURN issue_id;
END;
$$;

CREATE OR REPLACE FUNCTION jo.register_reference_import(p_batch_id BIGINT, p_reference_id INTEGER, p_source_row INTEGER, p_process_state TEXT DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE is_cancelled BOOLEAN; valid_process BOOLEAN; source_name TEXT;
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    SELECT source_file INTO source_name FROM jo.import_batches WHERE id=p_batch_id AND status='EN_PROCESO' FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Lote inexistente o cerrado' USING ERRCODE='23503'; END IF;
    UPDATE jo.references SET import_batch_id=p_batch_id,import_source_row=p_source_row WHERE id=p_reference_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Referencia inexistente' USING ERRCODE='23503'; END IF;
    valid_process := p_process_state IN ('concepto','diseno','costeo','industrializacion','produccion','comercial','bordado','sublimado','proceso_externo','union');
    IF NOT COALESCE(valid_process,FALSE) THEN
      INSERT INTO jo.import_issues(batch_id,source_row,reference_id,issue_code,message)
      VALUES(p_batch_id,p_source_row,p_reference_id,'PROCESO_INVALIDO_O_AUSENTE','Referencia creada sin reference_states; no se invento un proceso');
      UPDATE jo.import_batches SET invalid_rows=invalid_rows+1 WHERE id=p_batch_id;
      RETURN FALSE;
    END IF;
    SELECT COALESCE(s.is_cancelled,FALSE) INTO is_cancelled
      FROM jo.references r LEFT JOIN jo.reference_statuses s ON s.id=r.status_id WHERE r.id=p_reference_id;
    INSERT INTO jo.reference_states(reference_id,collection_id,current_state,previous_state,main_trunk_state,lifecycle_status,last_process_state)
    SELECT r.id,r.collection_id,CASE WHEN is_cancelled THEN 'cancelado' ELSE p_process_state END,
           CASE WHEN is_cancelled THEN p_process_state ELSE NULL END,p_process_state,
           CASE WHEN is_cancelled THEN 'cancelled' ELSE 'active' END,p_process_state
      FROM jo.references r WHERE r.id=p_reference_id
    ON CONFLICT(reference_id) DO NOTHING;
    INSERT INTO jo.state_history(reference_id,from_state,to_state,event,"timestamp",user_id,user_role,justification)
    VALUES(p_reference_id,p_process_state,CASE WHEN is_cancelled THEN 'cancelado' ELSE p_process_state END,
           'IMPORTACION_CSV',clock_timestamp(),auth.uid()::TEXT,'Administrador','Archivo: '||source_name||'; fila: '||p_source_row);
    UPDATE jo.import_batches SET successful_rows=successful_rows+1 WHERE id=p_batch_id;
    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION jo.finish_reference_import(p_batch_id BIGINT, p_failed BOOLEAN DEFAULT FALSE)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF NOT COALESCE(jo.current_user_has_role('Administrador'), FALSE) THEN RAISE EXCEPTION 'Solo Administrador' USING ERRCODE='42501'; END IF;
    UPDATE jo.import_batches SET status=CASE WHEN p_failed THEN 'FALLIDO' WHEN invalid_rows>0 THEN 'COMPLETADO_CON_INCIDENCIAS' ELSE 'COMPLETADO' END,
      finished_at=clock_timestamp() WHERE id=p_batch_id AND status='EN_PROCESO';
    IF NOT FOUND THEN RAISE EXCEPTION 'Lote inexistente o ya cerrado' USING ERRCODE='23503'; END IF;
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

GRANT USAGE ON SCHEMA jo TO authenticated;
GRANT SELECT ON jo.md_codes,jo.pt_codes,jo.md_code_assignments,jo.pt_code_assignments TO authenticated;
GRANT SELECT ON jo.import_batches,jo.import_issues TO authenticated;
REVOKE INSERT,UPDATE,DELETE ON jo.md_code_assignments,jo.pt_code_assignments,jo.import_batches,jo.import_issues FROM anon,authenticated;
REVOKE ALL ON jo.md_codes,jo.pt_codes FROM anon;
GRANT SELECT,INSERT,UPDATE ON jo.md_codes,jo.pt_codes TO authenticated;
GRANT USAGE,SELECT ON SEQUENCE jo.md_codes_id_seq,jo.pt_codes_id_seq TO authenticated;

DO $$
DECLARE table_name TEXT; policy_row RECORD;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['md_codes','pt_codes','md_code_assignments','pt_code_assignments','import_batches','import_issues'] LOOP
    FOR policy_row IN SELECT policyname FROM pg_policies WHERE schemaname='jo' AND tablename=table_name LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON jo.%I',policy_row.policyname,table_name);
    END LOOP;
  END LOOP;
END;
$$;
CREATE POLICY rbac_active_select ON jo.md_codes FOR SELECT TO authenticated USING ((SELECT jo.current_user_is_active()));
CREATE POLICY rbac_admin_write ON jo.md_codes FOR ALL TO authenticated USING ((SELECT jo.current_user_has_role('Administrador'))) WITH CHECK ((SELECT jo.current_user_has_role('Administrador')));
CREATE POLICY rbac_active_select ON jo.pt_codes FOR SELECT TO authenticated USING ((SELECT jo.current_user_is_active()));
CREATE POLICY rbac_admin_write ON jo.pt_codes FOR ALL TO authenticated USING ((SELECT jo.current_user_has_role('Administrador'))) WITH CHECK ((SELECT jo.current_user_has_role('Administrador')));
CREATE POLICY rbac_active_select ON jo.md_code_assignments FOR SELECT TO authenticated USING ((SELECT jo.current_user_is_active()));
CREATE POLICY rbac_active_select ON jo.pt_code_assignments FOR SELECT TO authenticated USING ((SELECT jo.current_user_is_active()));
CREATE POLICY rbac_admin_select ON jo.import_batches FOR SELECT TO authenticated USING ((SELECT jo.current_user_has_role('Administrador')));
CREATE POLICY rbac_admin_select ON jo.import_issues FOR SELECT TO authenticated USING ((SELECT jo.current_user_has_role('Administrador')));

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
    'jo.register_reference_import(bigint,integer,integer,text)',
    'jo.finish_reference_import(bigint,boolean)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon',signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated',signature);
  END LOOP;
END;
$$;

COMMENT ON TABLE jo.md_codes IS 'Catalogo autoritativo de codigos MD; solo Administrador crea codigos.';
COMMENT ON TABLE jo.pt_codes IS 'Catalogo autoritativo de codigos PT; solo Administrador crea codigos.';
COMMENT ON TABLE jo.import_batches IS 'Lotes auditables de importacion CSV parcial por fila.';
COMMENT ON TABLE jo.import_issues IS 'Incidencias por fila; una incidencia no revierte las filas validas del lote.';

COMMIT;
