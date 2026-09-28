-- =============================================================================
-- 029 - Contrato CSV v0.1 para importacion de referencias
-- Correctiva forward-only sobre 028. Ejecucion exclusivamente manual.
-- No crea catalogos ni importa procesos, telas, estados por area, bordados,
-- semielaborados o procesos externos.
-- =============================================================================
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '5min';
SET LOCAL search_path = jo, public;

-- Preflight antes de DDL. 029 depende deliberadamente de 027/028 y RBAC.
DO $$
DECLARE missing TEXT;
BEGIN
  SELECT string_agg(name, ', ' ORDER BY name) INTO missing
  FROM unnest(ARRAY[
    'jo.collections','jo.collection_years','jo.references','jo.lines','jo.sublines',
    'jo.line_sublines','jo.reference_statuses','jo.code_pool','jo.reference_codes',
    'jo.persons','jo.person_roles','jo.person_role_assignments','jo.import_batches'
  ]) AS required(name)
  WHERE to_regclass(name) IS NULL;
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION '029 preflight: faltan objetos de 027/028: %', missing;
  END IF;
  IF to_regprocedure('jo.current_user_has_role(text)') IS NULL
     OR to_regprocedure('jo.assign_existing_reference_code(integer,text,text,text)') IS NULL THEN
    RAISE EXCEPTION '029 preflight: faltan helpers RBAC/codigos de 028';
  END IF;
  IF EXISTS (SELECT 1 FROM jo.references WHERE reference_number IS NULL OR btrim(reference_number::TEXT)='') THEN
    RAISE EXCEPTION '029 preflight: existen referencias sin reference_number';
  END IF;
  IF EXISTS (SELECT 1 FROM jo.references WHERE year IS NULL) THEN
    RAISE EXCEPTION '029 preflight: existen referencias sin year; no se modificaron datos';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM jo.references r
    JOIN jo.collections c ON c.id=r.collection_id
    WHERE r.year IS DISTINCT FROM c.year
  ) THEN
    RAISE EXCEPTION '029 preflight: references.year no coincide con el ano canonico de su coleccion; no se modificaron datos';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jo.references
    WHERE CASE
      WHEN btrim(reference_number::TEXT) ~ '^[0-9]+$'
        THEN (btrim(reference_number::TEXT))::NUMERIC NOT BETWEEN 1 AND 2147483647
      ELSE TRUE
    END
  ) THEN
    RAISE EXCEPTION '029 preflight: reference_number historico debe ser un entero positivo entre 1 y 2147483647; no se modificaron datos';
  END IF;
  -- Se evalúa la identidad lógica antes de retirar constraints o convertir el
  -- tipo. Tanto duplicados exactos como 1/01 abortan: nunca se fusionan datos.
  IF EXISTS (
    SELECT collection_id,year,(btrim(reference_number::TEXT))::NUMERIC
    FROM jo.references
    GROUP BY collection_id,year,(btrim(reference_number::TEXT))::NUMERIC
    HAVING count(*)>1
  ) THEN
    RAISE EXCEPTION '029 preflight: colision historica en coleccion+ano+referencia canonical (por ejemplo 1/01 o duplicados); no se modificaron datos';
  END IF;
END;
$$;

-- La identidad contractual sustituye la unicidad global de 003. Los NULL
-- históricos siguen permitidos por la semántica UNIQUE de PostgreSQL; el índice
-- completo permite además que clientes legacy usen ON CONFLICT con las 3 columnas.
ALTER TABLE jo.references DROP CONSTRAINT IF EXISTS references_reference_number_unique;
ALTER TABLE jo.references DROP CONSTRAINT IF EXISTS references_collection_id_reference_number_key;
ALTER TABLE jo.references ALTER COLUMN reference_number TYPE INTEGER
  USING (btrim(reference_number::TEXT))::INTEGER;
ALTER TABLE jo.references DROP CONSTRAINT IF EXISTS references_reference_number_positive;
ALTER TABLE jo.references ADD CONSTRAINT references_reference_number_positive CHECK(reference_number>0);
CREATE UNIQUE INDEX IF NOT EXISTS references_collection_year_number_uidx
  ON jo.references(collection_id,year,reference_number);
CREATE INDEX IF NOT EXISTS references_import_identity_lookup_idx
  ON jo.references(collection_id,year,reference_number,id);

-- 028 dejaba NULL al insertar sin línea. El contrato 0.1 exige '' solo para
-- nuevas; no se reescriben históricos ni se borra una línea con una celda vacía.
CREATE OR REPLACE FUNCTION jo.sync_and_validate_reference_line_subline()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NEW.line_id IS NULL THEN
    IF NEW.subline_id IS NOT NULL THEN
      RAISE EXCEPTION 'subline_id requiere line_id' USING ERRCODE='23514';
    END IF;
    IF TG_OP='INSERT' OR NEW.line_id IS DISTINCT FROM OLD.line_id THEN NEW.tipo_ref := ''; END IF;
    RETURN NEW;
  END IF;
  SELECT l.code INTO NEW.tipo_ref FROM jo.lines l WHERE l.id=NEW.line_id AND l.active IS TRUE;
  IF NEW.tipo_ref IS NULL THEN RAISE EXCEPTION 'line_id no es una linea oficial activa' USING ERRCODE='23514'; END IF;
  IF NEW.subline_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM jo.line_sublines ls WHERE ls.line_id=NEW.line_id AND ls.subline_id=NEW.subline_id AND ls.active
  ) THEN RAISE EXCEPTION 'Combinacion linea/sublinea invalida' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION jo.sync_and_validate_reference_line_subline() FROM PUBLIC,anon,authenticated;

-- Auditoria v0.1 separada del ledger insert-only de 028 para soportar CREATE,
-- UPDATE y NO_CHANGE sin sobrescribir la procedencia histórica de references.
ALTER TABLE jo.import_batches ADD COLUMN IF NOT EXISTS collection_id INTEGER REFERENCES jo.collections(id) ON DELETE RESTRICT;
ALTER TABLE jo.import_batches ADD COLUMN IF NOT EXISTS collection_year_id INTEGER REFERENCES jo.collection_years(id) ON DELETE RESTRICT;
ALTER TABLE jo.import_batches ADD COLUMN IF NOT EXISTS template_version TEXT;
ALTER TABLE jo.import_batches ADD COLUMN IF NOT EXISTS confirmation_id UUID;
ALTER TABLE jo.import_batches ADD COLUMN IF NOT EXISTS confirmation_request_hash TEXT;
ALTER TABLE jo.import_batches ADD COLUMN IF NOT EXISTS confirmation_result JSONB;
CREATE UNIQUE INDEX IF NOT EXISTS import_batches_created_by_confirmation_uidx
  ON jo.import_batches(created_by,confirmation_id) WHERE confirmation_id IS NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='jo.import_batches'::regclass AND conname='import_batches_confirmation_integrity_check') THEN
    ALTER TABLE jo.import_batches ADD CONSTRAINT import_batches_confirmation_integrity_check CHECK (
      (confirmation_id IS NULL AND confirmation_request_hash IS NULL AND confirmation_result IS NULL)
      OR (confirmation_id IS NOT NULL AND confirmation_request_hash IS NOT NULL AND (status='EN_PROCESO' OR confirmation_result IS NOT NULL))
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS jo.csv_reference_import_rows (
  id BIGSERIAL PRIMARY KEY,
  batch_id BIGINT NOT NULL REFERENCES jo.import_batches(id) ON DELETE RESTRICT,
  source_row INTEGER NOT NULL CHECK(source_row>1),
  identity_collection_id INTEGER REFERENCES jo.collections(id) ON DELETE RESTRICT,
  identity_year INTEGER,
  identity_reference INTEGER,
  action TEXT NOT NULL CHECK(action IN ('CREATE','UPDATE','NO_CHANGE','ROW_ERROR')),
  reference_id INTEGER REFERENCES jo.references(id) ON DELETE RESTRICT,
  row_payload JSONB NOT NULL,
  designer_informative TEXT,
  tipo_ref_informative TEXT,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(batch_id,source_row),
  CHECK ((action='ROW_ERROR' AND applied_at IS NULL) OR (action<>'ROW_ERROR' AND reference_id IS NOT NULL AND applied_at IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS jo.csv_reference_import_issues (
  id BIGSERIAL PRIMARY KEY,
  batch_id BIGINT NOT NULL REFERENCES jo.import_batches(id) ON DELETE RESTRICT,
  row_id BIGINT REFERENCES jo.csv_reference_import_rows(id) ON DELETE RESTRICT,
  source_row INTEGER,
  severity TEXT NOT NULL CHECK(severity IN ('ERROR','WARNING')),
  classification TEXT NOT NULL CHECK(classification IN ('FILE_ERROR','LOT_ERROR','ROW_ERROR')),
  field TEXT,
  requirement TEXT NOT NULL CHECK(requirement ~ '^CSV-[0-9]{3}$'),
  message TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS csv_reference_import_rows_batch_idx ON jo.csv_reference_import_rows(batch_id,source_row);
CREATE INDEX IF NOT EXISTS csv_reference_import_rows_identity_idx ON jo.csv_reference_import_rows(identity_collection_id,identity_year,identity_reference);
CREATE INDEX IF NOT EXISTS csv_reference_import_issues_batch_idx ON jo.csv_reference_import_issues(batch_id,source_row);

-- Vista previa pura: SECURITY DEFINER solo para atravesar RLS de catalogos; es
-- STABLE, no contiene DML y comprueba Administrador dentro del servidor.
CREATE OR REPLACE FUNCTION jo.preview_csv_reference_import(p_document JSONB)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE
  expected_headers JSONB := '["Colección","Año","referencia","Nombre","Línea","Sublínea","Status General","Código MD","Código PT","Tipo Ref","Diseñador"]'::JSONB;
  required_headers JSONB := '["Colección","Año","referencia"]'::JSONB;
  top_issues JSONB := '[]'::JSONB; output_rows JSONB := '[]'::JSONB;
  item JSONB; value JSONB; row_issues JSONB; source_row INTEGER; ref_number INTEGER;
  collection_value TEXT; year_value TEXT; line_value TEXT; subline_value TEXT; collection_season_value TEXT;
  status_value TEXT; md_value TEXT; pt_value TEXT; designer_value TEXT; csv_type TEXT;
  collection_id_value INTEGER; collection_year_id_value INTEGER; contract_year_value INTEGER; line_id_value INTEGER;
  subline_id_value INTEGER; status_id_value INTEGER; reference_id_value INTEGER;
  official_type TEXT; action_value TEXT; fingerprint_value TEXT;
  existing jo.references%ROWTYPE; total_count INTEGER := 0; create_count INTEGER := 0;
  update_count INTEGER := 0; no_change_count INTEGER := 0; error_count INTEGER := 0;
  warning_count INTEGER := 0; row_warning_count INTEGER := 0; blocked BOOLEAN := FALSE; mixed BOOLEAN := FALSE;
BEGIN
  IF NOT COALESCE(jo.current_user_has_role('Administrador'),FALSE) THEN
    RAISE EXCEPTION 'Solo Administrador puede previsualizar importaciones CSV' USING ERRCODE='42501';
  END IF;
  IF p_document IS NULL OR jsonb_typeof(p_document)<>'object' THEN
    RETURN jsonb_build_object('can_confirm',FALSE,'issues',jsonb_build_array(jsonb_build_object(
      'severity','ERROR','classification','FILE_ERROR','requirement','CSV-001','message','Documento de importacion invalido')),'rows','[]'::JSONB);
  END IF;
  -- Límites internos: 5000 filas y 8 MiB de documento JSON (el CSV crudo se
  -- limita a 5 MiB en parser/UI). No alteran el contrato de columnas.
  IF octet_length(p_document::TEXT)>8*1024*1024 THEN
    RETURN jsonb_build_object('can_confirm',FALSE,'issues',jsonb_build_array(jsonb_build_object(
      'severity','ERROR','classification','FILE_ERROR','requirement','CSV-001','message','El documento supera el límite operativo de 8 MiB')),'rows','[]'::JSONB,'summary',jsonb_build_object('total',0));
  END IF;
  IF p_document->>'template_version' IS DISTINCT FROM '0.1' THEN
    top_issues:=top_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','FILE_ERROR','requirement','CSV-021','message','La version de plantilla debe ser 0.1 y solo metadata'));
  END IF;
  IF jsonb_typeof(p_document->'headers') IS DISTINCT FROM 'array' THEN
    top_issues:=top_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','FILE_ERROR','requirement','CSV-001','message','La estructura de encabezados es inválida'));
    RETURN jsonb_build_object('can_confirm',FALSE,'issues',top_issues,'rows','[]'::JSONB,'summary',jsonb_build_object('total',0));
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_document->'headers') h WHERE jsonb_typeof(h)<>'string')
     OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(p_document->'headers','[]'::JSONB)) h WHERE NOT expected_headers ? h)
     OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(required_headers) h WHERE NOT COALESCE(p_document->'headers','[]'::JSONB) ? h)
     OR EXISTS (SELECT h FROM jsonb_array_elements_text(COALESCE(p_document->'headers','[]'::JSONB)) h GROUP BY h HAVING count(*)>1) THEN
    top_issues:=top_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','FILE_ERROR','requirement','CSV-001','message','Encabezados desconocidos, duplicados o sin las columnas obligatorias'));
  END IF;
  IF jsonb_typeof(p_document->'rows') IS DISTINCT FROM 'array' THEN
    top_issues:=top_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','FILE_ERROR','requirement','CSV-001','message','La estructura de filas es inválida'));
    RETURN jsonb_build_object('can_confirm',FALSE,'issues',top_issues,'rows','[]'::JSONB,'summary',jsonb_build_object('total',0));
  ELSIF jsonb_array_length(p_document->'rows')=0 THEN
    top_issues:=top_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','FILE_ERROR','requirement','CSV-001','message','El archivo no contiene filas'));
  ELSIF jsonb_array_length(p_document->'rows')>5000 THEN
    top_issues:=top_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','FILE_ERROR','requirement','CSV-001','message','El archivo supera el límite operativo de 5000 filas'));
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_document->'rows') r
    WHERE jsonb_typeof(r)<>'object' OR jsonb_typeof(r->'values')<>'object'
  ) THEN
    top_issues:=top_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','FILE_ERROR','requirement','CSV-001','message','La estructura de una fila es inválida'));
    RETURN jsonb_build_object('can_confirm',FALSE,'issues',top_issues,'rows','[]'::JSONB,'summary',jsonb_build_object('total',0));
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(COALESCE(p_document->'rows','[]'::JSONB)) r
    WHERE COALESCE(r->>'source_row','') !~ '^[0-9]+$' OR length(r->>'source_row')>9
       OR CASE WHEN COALESCE(r->>'source_row','') ~ '^[0-9]+$' THEN (r->>'source_row')::NUMERIC<2 ELSE FALSE END
       OR (SELECT jsonb_agg(k ORDER BY k) FROM jsonb_object_keys(r->'values') k)
          IS DISTINCT FROM (SELECT jsonb_agg(k ORDER BY k) FROM jsonb_array_elements_text(p_document->'headers') k)
  ) OR EXISTS (
    SELECT r->>'source_row' FROM jsonb_array_elements(COALESCE(p_document->'rows','[]'::JSONB)) r
    GROUP BY r->>'source_row' HAVING count(*)>1
  ) THEN
    top_issues:=top_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','FILE_ERROR','requirement','CSV-001','message','Estructura, campos o números de fila del documento son inválidos'));
  END IF;
  IF jsonb_array_length(top_issues)>0 THEN
    RETURN jsonb_build_object('can_confirm',FALSE,'issues',top_issues,'rows','[]'::JSONB,'summary',jsonb_build_object('total',0));
  END IF;

  SELECT NULLIF(btrim(r->'values'->>'Colección'),'') INTO collection_value
  FROM jsonb_array_elements(p_document->'rows') r LIMIT 1;
  SELECT NULLIF(btrim(r->'values'->>'Año'),'') INTO year_value
  FROM jsonb_array_elements(p_document->'rows') r LIMIT 1;

  SELECT count(DISTINCT concat(COALESCE(NULLIF(btrim(r->'values'->>'Colección'),''),'∅'),'|',COALESCE(NULLIF(btrim(r->'values'->>'Año'),''),'∅'))) > 1
    INTO mixed FROM jsonb_array_elements(p_document->'rows') r;
  IF mixed OR collection_value IS NULL OR year_value IS NULL OR year_value !~ '^[0-9]+$'
     OR length(year_value)>4 OR year_value::NUMERIC NOT BETWEEN 1 AND 9999 THEN
    top_issues:=top_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','LOT_ERROR','requirement','CSV-002','message','Todas las filas deben pertenecer a una única Colección y Año contractual válidos'));
    blocked:=TRUE;
  ELSE
    contract_year_value:=year_value::INTEGER;
    collection_season_value:=left(collection_value,2);
  END IF;

  -- La colección se resuelve exclusivamente por su código completo. La
  -- temporada canónica y el año deben coincidir con collections y con el año
  -- visible de collection_years; no se crean catálogos durante la importación.
  SELECT c.id,cy.id INTO collection_id_value,collection_year_id_value
  FROM jo.collections c JOIN jo.collection_years cy ON cy.collection_id=c.id
  WHERE c.code=collection_value AND c.season=collection_season_value
    AND c.year=contract_year_value AND cy.year=contract_year_value
    AND c.active IS TRUE AND cy.is_hidden IS FALSE;
  IF NOT blocked AND collection_id_value IS NULL THEN
    top_issues:=top_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','LOT_ERROR','requirement','CSV-003','field','Colección','message','No existe una colección activa con código, temporada y año contractual coincidentes en collection_years'));
    blocked:=TRUE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_document->'rows') r
    WHERE NULLIF(btrim(r->'values'->>'Colección'),'') IS DISTINCT FROM collection_value
       OR NULLIF(btrim(r->'values'->>'Año'),'') IS DISTINCT FROM year_value
  ) THEN
    top_issues:=top_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','LOT_ERROR','requirement','CSV-002','message','Todas las filas deben pertenecer a la misma Colección y Año'));
    blocked:=TRUE;
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_document->'rows') LOOP
    total_count:=total_count+1; row_issues:='[]'::JSONB; value:=item->'values';
    source_row:=(item->>'source_row')::INTEGER;
    collection_value:=CASE WHEN btrim(COALESCE(value->>'Colección',''))='' OR btrim(value->>'Colección')~*'^(N/A|NULL)$' THEN NULL ELSE btrim(value->>'Colección') END;
    year_value:=CASE WHEN btrim(COALESCE(value->>'Año',''))='' OR btrim(value->>'Año')~*'^(N/A|NULL)$' THEN NULL ELSE btrim(value->>'Año') END;
    line_value:=CASE WHEN btrim(COALESCE(value->>'Línea',''))='' OR btrim(value->>'Línea')~*'^(N/A|NULL)$' THEN NULL ELSE btrim(value->>'Línea') END;
    subline_value:=CASE WHEN btrim(COALESCE(value->>'Sublínea',''))='' OR btrim(value->>'Sublínea')~*'^(N/A|NULL)$' THEN NULL ELSE btrim(value->>'Sublínea') END;
    status_value:=CASE WHEN btrim(COALESCE(value->>'Status General',''))='' OR btrim(value->>'Status General')~*'^(N/A|NULL)$' THEN NULL ELSE btrim(value->>'Status General') END;
    md_value:=CASE WHEN btrim(COALESCE(value->>'Código MD',''))='' OR btrim(value->>'Código MD')~*'^(N/A|NULL)$' THEN NULL ELSE upper(btrim(value->>'Código MD')) END;
    pt_value:=CASE WHEN btrim(COALESCE(value->>'Código PT',''))='' OR btrim(value->>'Código PT')~*'^(N/A|NULL)$' THEN NULL ELSE upper(btrim(value->>'Código PT')) END;
    designer_value:=CASE WHEN btrim(COALESCE(value->>'Diseñador',''))='' OR btrim(value->>'Diseñador')~*'^(N/A|NULL)$' THEN NULL ELSE btrim(value->>'Diseñador') END;
    csv_type:=CASE WHEN btrim(COALESCE(value->>'Tipo Ref',''))='' OR btrim(value->>'Tipo Ref')~*'^(N/A|NULL)$' THEN NULL ELSE btrim(value->>'Tipo Ref') END;
    -- Repite la normalización contractual en el límite de confianza RPC; no se
    -- confía exclusivamente en que el navegador haya usado el parser oficial.
    value:=value||jsonb_build_object(
      'Colección',collection_value,'Año',year_value,
      'Nombre',CASE WHEN btrim(COALESCE(value->>'Nombre',''))='' OR btrim(value->>'Nombre')~*'^(N/A|NULL)$' THEN NULL ELSE btrim(value->>'Nombre') END,
      'Línea',line_value,'Sublínea',subline_value,'Status General',status_value,
      'Código MD',md_value,'Código PT',pt_value,'Tipo Ref',csv_type,'Diseñador',designer_value);
    ref_number:=NULL; line_id_value:=NULL; subline_id_value:=NULL; status_id_value:=NULL;
    reference_id_value:=NULL; official_type:=NULL; fingerprint_value:=NULL;

    IF source_row IS NULL OR source_row<=1 THEN
      row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','referencia','requirement','CSV-001','message','Numero de fila fuente invalido'));
    END IF;
    IF COALESCE(btrim(value->>'referencia'),'') !~ '^[0-9]+$' THEN
      row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','referencia','requirement','CSV-023','message','referencia debe ser un entero positivo'));
    ELSIF (btrim(value->>'referencia'))::NUMERIC NOT BETWEEN 1 AND 2147483647 THEN
      row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','referencia','requirement','CSV-023','message','referencia debe ser un entero positivo'));
    ELSE ref_number:=(btrim(value->>'referencia'))::NUMERIC::INTEGER; value:=jsonb_set(value,'{referencia}',to_jsonb(ref_number::TEXT)); END IF;
    IF ref_number IS NOT NULL AND (SELECT count(*) FROM jsonb_array_elements(p_document->'rows') d
      WHERE CASE WHEN COALESCE(btrim(d->'values'->>'referencia'),'')~'^[0-9]+$'
        THEN (btrim(d->'values'->>'referencia'))::NUMERIC END=ref_number)>1 THEN
      row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','referencia','requirement','CSV-023','message','Identidad duplicada dentro del archivo'));
    END IF;

    IF line_value IS NOT NULL THEN
      SELECT id,code INTO line_id_value,official_type FROM jo.lines WHERE name=line_value AND active IS TRUE;
      IF line_id_value IS NULL THEN row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','Línea','requirement','CSV-006','message','Línea inexistente o inactiva')); END IF;
    END IF;
    IF subline_value IS NOT NULL THEN
      IF line_id_value IS NULL THEN
        row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','Sublínea','requirement','CSV-006','message','Sublínea requiere una Línea informada y válida'));
      ELSE
        SELECT s.id INTO subline_id_value FROM jo.sublines s JOIN jo.line_sublines ls ON ls.subline_id=s.id
        WHERE s.name=subline_value AND s.active IS TRUE AND ls.line_id=line_id_value AND ls.active IS TRUE;
        IF subline_id_value IS NULL THEN row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','Sublínea','requirement','CSV-006','message','Sublínea inexistente o incompatible con Línea')); END IF;
      END IF;
    END IF;
    IF status_value IS NOT NULL THEN
      SELECT id INTO status_id_value FROM jo.reference_statuses WHERE status::TEXT=status_value AND active IS TRUE;
      IF status_id_value IS NULL THEN row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','Status General','requirement','CSV-007','message','Status General inexistente o inactivo')); END IF;
    END IF;
    IF designer_value IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM jo.persons p
      JOIN jo.person_role_assignments pra ON pra.person_id=p.id
      JOIN jo.person_roles pr ON pr.id=pra.role_id AND pr.name='CREATIVO'
      WHERE p.active IS TRUE AND (p.first_name=designer_value OR concat_ws(' ',p.first_name,p.last_name)=designer_value)
    ) THEN
      row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','WARNING','classification','ROW_ERROR','row',source_row,'field','Diseñador','requirement','CSV-011','message','Diseñador inexistente; se conserva solo como informacion del lote'));
    END IF;
    IF csv_type IS NOT NULL AND line_id_value IS NOT NULL AND csv_type IS DISTINCT FROM official_type THEN
      row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','WARNING','classification','ROW_ERROR','row',source_row,'field','Tipo Ref','requirement','CSV-010','message','Tipo Ref informativo contradice el tipo derivado de Línea; prevalece el derivado'));
    END IF;

    IF ref_number IS NOT NULL AND collection_id_value IS NOT NULL THEN
      SELECT * INTO existing FROM jo.references r WHERE r.collection_id=collection_id_value AND r.year=contract_year_value AND r.reference_number=ref_number;
      IF FOUND THEN
        reference_id_value:=existing.id;
        IF line_id_value IS NOT NULL AND subline_value IS NULL AND existing.subline_id IS NOT NULL AND NOT EXISTS(
          SELECT 1 FROM jo.line_sublines ls WHERE ls.line_id=line_id_value AND ls.subline_id=existing.subline_id AND ls.active
        ) THEN row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','Línea','requirement','CSV-006','message','La Línea nueva es incompatible con la Sublínea existente que una celda vacía debe conservar')); END IF;
      END IF;
    END IF;

    IF md_value IS NOT NULL THEN
      IF (SELECT count(*) FROM jsonb_array_elements(p_document->'rows') d WHERE upper(btrim(d->'values'->>'Código MD'))=md_value)>1 THEN
        row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','Código MD','requirement','CSV-009','message','Código MD repetido dentro del archivo'));
      ELSIF NOT EXISTS (SELECT 1 FROM jo.code_pool cp WHERE cp.code_type='MD'::jo.reference_code_type AND cp.code=md_value) THEN
        row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','Código MD','requirement','CSV-009','message','Código MD inexistente'));
      ELSIF EXISTS (SELECT 1 FROM jo.reference_codes rc WHERE rc.code_type='MD'::jo.reference_code_type AND rc.code=md_value AND COALESCE(rc.active,TRUE) AND rc.reference_id IS DISTINCT FROM reference_id_value) OR
            EXISTS (SELECT 1 FROM jo.code_pool cp WHERE cp.code_type='MD'::jo.reference_code_type AND cp.code=md_value AND cp.status<>'DISPONIBLE' AND NOT EXISTS(SELECT 1 FROM jo.reference_codes rc WHERE rc.reference_id=reference_id_value AND rc.code_type=cp.code_type AND rc.code=cp.code AND COALESCE(rc.active,TRUE))) OR
            EXISTS (SELECT 1 FROM jo.reference_codes rc WHERE rc.reference_id=reference_id_value AND rc.code_type='MD'::jo.reference_code_type AND rc.code<>md_value AND COALESCE(rc.active,TRUE)) THEN
        row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','Código MD','requirement','CSV-009','message','Código MD no disponible o incompatible'));
      END IF;
    END IF;
    IF pt_value IS NOT NULL THEN
      IF (SELECT count(*) FROM jsonb_array_elements(p_document->'rows') d WHERE upper(btrim(d->'values'->>'Código PT'))=pt_value)>1 THEN
        row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','Código PT','requirement','CSV-009','message','Código PT repetido dentro del archivo'));
      ELSIF NOT EXISTS (SELECT 1 FROM jo.code_pool cp WHERE cp.code_type='PT'::jo.reference_code_type AND cp.code=pt_value) THEN
        row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','Código PT','requirement','CSV-009','message','Código PT inexistente'));
      ELSIF EXISTS (SELECT 1 FROM jo.reference_codes rc WHERE rc.code_type='PT'::jo.reference_code_type AND rc.code=pt_value AND COALESCE(rc.active,TRUE) AND rc.reference_id IS DISTINCT FROM reference_id_value) OR
            EXISTS (SELECT 1 FROM jo.code_pool cp WHERE cp.code_type='PT'::jo.reference_code_type AND cp.code=pt_value AND cp.status<>'DISPONIBLE' AND NOT EXISTS(SELECT 1 FROM jo.reference_codes rc WHERE rc.reference_id=reference_id_value AND rc.code_type=cp.code_type AND rc.code=cp.code AND COALESCE(rc.active,TRUE))) OR
            EXISTS (SELECT 1 FROM jo.reference_codes rc WHERE rc.reference_id=reference_id_value AND rc.code_type='PT'::jo.reference_code_type AND rc.code<>pt_value AND COALESCE(rc.active,TRUE)) THEN
        row_issues:=row_issues||jsonb_build_array(jsonb_build_object('severity','ERROR','classification','ROW_ERROR','row',source_row,'field','Código PT','requirement','CSV-009','message','Código PT no disponible o incompatible'));
      END IF;
    END IF;

    SELECT count(*) INTO row_warning_count FROM jsonb_array_elements(row_issues) i WHERE i->>'severity'='WARNING';
    warning_count:=warning_count+row_warning_count;
    IF EXISTS(SELECT 1 FROM jsonb_array_elements(row_issues) i WHERE i->>'severity'='ERROR') THEN
      action_value:='ROW_ERROR'; error_count:=error_count+1;
    ELSIF reference_id_value IS NULL THEN action_value:='CREATE'; create_count:=create_count+1;
    ELSIF (value->>'Nombre' IS NOT NULL AND value->>'Nombre' IS DISTINCT FROM existing.name)
       OR (line_id_value IS NOT NULL AND line_id_value IS DISTINCT FROM existing.line_id)
       OR (subline_id_value IS NOT NULL AND subline_id_value IS DISTINCT FROM existing.subline_id)
       OR (status_id_value IS NOT NULL AND status_id_value IS DISTINCT FROM existing.status_id)
       OR (md_value IS NOT NULL AND NOT EXISTS(SELECT 1 FROM jo.reference_codes rc WHERE rc.reference_id=existing.id AND rc.code_type='MD'::jo.reference_code_type AND rc.code=md_value AND COALESCE(rc.active,TRUE)))
       OR (pt_value IS NOT NULL AND NOT EXISTS(SELECT 1 FROM jo.reference_codes rc WHERE rc.reference_id=existing.id AND rc.code_type='PT'::jo.reference_code_type AND rc.code=pt_value AND COALESCE(rc.active,TRUE))) THEN
      action_value:='UPDATE'; update_count:=update_count+1;
    ELSE action_value:='NO_CHANGE'; no_change_count:=no_change_count+1; END IF;

    IF reference_id_value IS NOT NULL THEN
      SELECT md5(to_jsonb(r)::TEXT||COALESCE((SELECT jsonb_agg(jsonb_build_array(rc.code_type,rc.code,rc.active) ORDER BY rc.code_type,rc.id)::TEXT FROM jo.reference_codes rc WHERE rc.reference_id=r.id),'[]'))
        INTO fingerprint_value FROM jo.references r WHERE r.id=reference_id_value;
    END IF;
    output_rows:=output_rows||jsonb_build_array(jsonb_build_object('source_row',source_row,'action',action_value,
      'reference_id',reference_id_value,'fingerprint',fingerprint_value,'derived_tipo_ref',COALESCE(official_type,CASE WHEN reference_id_value IS NULL THEN '' ELSE existing.tipo_ref END),
      'payload',value,'issues',row_issues));
  END LOOP;
  RETURN jsonb_build_object('can_confirm',NOT blocked,'collection_code',collection_value,'collection_id',collection_id_value,
    'collection_year_id',collection_year_id_value,'year',contract_year_value,'issues',top_issues,'rows',output_rows,
    'summary',jsonb_build_object('total',total_count,'create',create_count,'update',update_count,'no_change',no_change_count,'row_error',error_count,'warnings',warning_count));
END;
$$;

-- Una sola RPC = una sola transaccion Postgres. Los ROW_ERROR se auditan y las
-- demás filas continúan; cualquier excepción técnica o bloqueante no capturada
-- revierte lote, referencias, códigos y auditoría completos.
CREATE OR REPLACE FUNCTION jo.confirm_csv_reference_import(p_document JSONB,p_source_file TEXT,p_expected_preview JSONB,p_confirmation_id UUID)
RETURNS JSONB LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' AS $$
DECLARE preview JSONB; item JSONB; expected JSONB; value JSONB; batch_id_value BIGINT;
  audit_row_id BIGINT; reference_id_value INTEGER; collection_id_value INTEGER; collection_year_id_value INTEGER;
  line_id_value INTEGER; subline_id_value INTEGER; status_id_value INTEGER; source_row INTEGER; ref_number INTEGER; contract_year_value INTEGER;
  collection_code_value TEXT;
  action_value TEXT; issue JSONB; successful INTEGER:=0; rejected INTEGER:=0; warnings INTEGER:=0;
  request_hash_value TEXT; stored_request_hash TEXT; result_value JSONB; business_message TEXT;
BEGIN
  IF NOT COALESCE(jo.current_user_has_role('Administrador'),FALSE) THEN
    RAISE EXCEPTION 'Solo Administrador puede confirmar importaciones CSV' USING ERRCODE='42501';
  END IF;
  IF p_confirmation_id IS NULL THEN
    RAISE EXCEPTION 'confirmation_id es obligatorio' USING ERRCODE='22023';
  END IF;
  request_hash_value:=md5(jsonb_build_object('document',p_document,'source_file',p_source_file,'expected_preview',p_expected_preview)::TEXT);
  -- Serializa tanto reintentos simultáneos como secuenciales del mismo usuario.
  -- El índice único sigue siendo la garantía persistente de última instancia.
  PERFORM pg_advisory_xact_lock(hashtextextended('CSVCONFIRM|'||auth.uid()::TEXT||'|'||p_confirmation_id::TEXT,0));
  SELECT confirmation_request_hash,confirmation_result INTO stored_request_hash,result_value
  FROM jo.import_batches
  WHERE created_by=auth.uid() AND confirmation_id=p_confirmation_id;
  IF FOUND THEN
    IF stored_request_hash IS DISTINCT FROM request_hash_value THEN
      RAISE EXCEPTION 'confirmation_id ya fue utilizado con otra solicitud' USING ERRCODE='22023';
    END IF;
    IF result_value IS NULL THEN
      RAISE EXCEPTION 'Confirmacion idempotente sin resultado persistido' USING ERRCODE='55000';
    END IF;
    RETURN result_value;
  END IF;
  IF NULLIF(btrim(p_source_file),'') IS NULL OR length(p_source_file)>255 THEN RAISE EXCEPTION 'Nombre de archivo invalido' USING ERRCODE='22023'; END IF;
  IF p_document IS NULL OR jsonb_typeof(p_document)<>'object' OR jsonb_typeof(p_document->'rows') IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Documento excede límites o tiene estructura inválida' USING ERRCODE='22023';
  END IF;
  IF jsonb_array_length(p_document->'rows')>5000 OR octet_length(p_document::TEXT)>8*1024*1024 THEN
    RAISE EXCEPTION 'Documento excede límites o tiene estructura inválida' USING ERRCODE='22023';
  END IF;

  -- Una primera evaluación obtiene la identidad contractual sin escribir. Tras
  -- adquirir locks se repite el preview para revalidar contra el estado actual.
  preview:=jo.preview_csv_reference_import(p_document);
  IF NOT COALESCE((preview->>'can_confirm')::BOOLEAN,FALSE) OR EXISTS(
    SELECT 1 FROM jsonb_array_elements(preview->'issues') i WHERE i->>'classification' IN ('FILE_ERROR','LOT_ERROR')
  ) THEN RAISE EXCEPTION 'Lote bloqueado por FILE_ERROR/LOT_ERROR' USING ERRCODE='22023',DETAIL=preview::TEXT; END IF;
  collection_id_value:=(preview->>'collection_id')::INTEGER;
  collection_year_id_value:=(preview->>'collection_year_id')::INTEGER;
  contract_year_value:=(preview->>'year')::INTEGER;
  collection_code_value:=preview->>'collection_code';

  FOR item IN SELECT d FROM jsonb_array_elements(COALESCE(p_document->'rows','[]'::JSONB)) d
    ORDER BY CASE WHEN COALESCE(btrim(d->'values'->>'referencia'),'')~'^[0-9]+$' THEN (btrim(d->'values'->>'referencia'))::NUMERIC END LOOP
    value:=item->'values';
    IF CASE WHEN COALESCE(btrim(value->>'referencia'),'')~'^[0-9]+$' THEN (btrim(value->>'referencia'))::NUMERIC BETWEEN 1 AND 2147483647 ELSE FALSE END THEN
      PERFORM pg_advisory_xact_lock(hashtextextended('CSVREF|'||collection_code_value||'|'||contract_year_value||'|'||((btrim(value->>'referencia'))::NUMERIC::INTEGER),0));
    END IF;
  END LOOP;
  PERFORM 1 FROM jo.references r
  WHERE r.collection_id=collection_id_value AND r.year=contract_year_value
    AND r.reference_number IN (SELECT canonical::INTEGER FROM jsonb_array_elements(p_document->'rows') d
      CROSS JOIN LATERAL (SELECT CASE WHEN COALESCE(btrim(d->'values'->>'referencia'),'')~'^[0-9]+$' THEN (btrim(d->'values'->>'referencia'))::NUMERIC END canonical) normalized
      WHERE canonical BETWEEN 1 AND 2147483647)
  ORDER BY r.id FOR UPDATE;
  PERFORM 1 FROM jo.code_pool cp WHERE cp.code IN (
    SELECT upper(btrim(v)) FROM jsonb_array_elements(p_document->'rows') d CROSS JOIN LATERAL unnest(ARRAY[d->'values'->>'Código MD',d->'values'->>'Código PT']) v
    WHERE NULLIF(btrim(v),'') IS NOT NULL AND btrim(v)!~*'^(N/A|NULL)$'
  ) ORDER BY cp.id FOR UPDATE;

  preview:=jo.preview_csv_reference_import(p_document);
  IF NOT COALESCE((preview->>'can_confirm')::BOOLEAN,FALSE) OR EXISTS(
    SELECT 1 FROM jsonb_array_elements(preview->'issues') i WHERE i->>'classification' IN ('FILE_ERROR','LOT_ERROR')
  ) THEN RAISE EXCEPTION 'Lote bloqueado por FILE_ERROR/LOT_ERROR' USING ERRCODE='22023',DETAIL=preview::TEXT; END IF;
  collection_id_value:=(preview->>'collection_id')::INTEGER; collection_year_id_value:=(preview->>'collection_year_id')::INTEGER;
  contract_year_value:=(preview->>'year')::INTEGER;

  INSERT INTO jo.import_batches(source_file,created_by,total_rows,collection_id,collection_year_id,template_version,confirmation_id,confirmation_request_hash,metadata)
  VALUES(btrim(p_source_file),auth.uid(),jsonb_array_length(preview->'rows'),collection_id_value,collection_year_id_value,'0.1',p_confirmation_id,request_hash_value,
    jsonb_build_object('operation','IMPORTACION_CSV','contract','CSV','template_version','0.1','headers',p_document->'headers')) RETURNING id INTO batch_id_value;

  FOR item IN SELECT * FROM jsonb_array_elements(preview->'rows') LOOP
    source_row:=(item->>'source_row')::INTEGER; value:=item->'payload'; action_value:=item->>'action';
    SELECT e INTO expected FROM jsonb_array_elements(COALESCE(p_expected_preview->'rows','[]'::JSONB)) e WHERE (e->>'source_row')::INTEGER=source_row;
    IF item->>'fingerprint' IS DISTINCT FROM expected->>'fingerprint' OR item->>'action' IS DISTINCT FROM expected->>'action' THEN
      action_value:='ROW_ERROR';
      item:=jsonb_set(item,'{issues}',COALESCE(item->'issues','[]'::JSONB)||jsonb_build_array(jsonb_build_object(
        'severity','ERROR','classification','ROW_ERROR','row',source_row,'field','referencia','requirement','CSV-017','message','La referencia o sus códigos cambiaron desde la vista previa')));
    END IF;
    ref_number:=CASE WHEN COALESCE(value->>'referencia','')~'^[1-9][0-9]*$' AND (value->>'referencia')::NUMERIC<=2147483647 THEN (value->>'referencia')::INTEGER END;
    reference_id_value:=NULL;
    IF action_value<>'ROW_ERROR' THEN
      -- Este bloque crea una subtransacción PL/pgSQL. Solo P2001 representa una
      -- incidencia de negocio esperada; cualquier otro error se relanza y hace
      -- rollback de toda la confirmación.
      BEGIN
        line_id_value:=NULL; subline_id_value:=NULL; status_id_value:=NULL;
        IF value->>'Línea' IS NOT NULL THEN
          SELECT id INTO line_id_value FROM jo.lines WHERE name=value->>'Línea' AND active FOR KEY SHARE;
          IF line_id_value IS NULL THEN RAISE EXCEPTION 'El catálogo de Línea cambió desde la vista previa' USING ERRCODE='P2001'; END IF;
        END IF;
        IF value->>'Sublínea' IS NOT NULL THEN
          SELECT s.id INTO subline_id_value FROM jo.sublines s JOIN jo.line_sublines ls ON ls.subline_id=s.id
            WHERE s.name=value->>'Sublínea' AND ls.line_id=line_id_value AND s.active AND ls.active
            FOR KEY SHARE OF s,ls;
          IF subline_id_value IS NULL THEN RAISE EXCEPTION 'El catálogo o relación de Sublínea cambió desde la vista previa' USING ERRCODE='P2001'; END IF;
        END IF;
        IF value->>'Status General' IS NOT NULL THEN
          SELECT id INTO status_id_value FROM jo.reference_statuses WHERE status::TEXT=value->>'Status General' AND active FOR KEY SHARE;
          IF status_id_value IS NULL THEN RAISE EXCEPTION 'El catálogo de Status General cambió desde la vista previa' USING ERRCODE='P2001'; END IF;
        END IF;
        SELECT id INTO reference_id_value FROM jo.references WHERE collection_id=collection_id_value AND year=contract_year_value AND reference_number=ref_number FOR UPDATE;
        IF reference_id_value IS NULL THEN
          BEGIN
            INSERT INTO jo.references(collection_id,year,reference_number,name,line_id,subline_id,status_id,tipo_ref)
            VALUES(collection_id_value,contract_year_value,ref_number,COALESCE(value->>'Nombre',''),line_id_value,subline_id_value,status_id_value,COALESCE(item->>'derived_tipo_ref',''))
            RETURNING id INTO reference_id_value;
          EXCEPTION WHEN unique_violation THEN
            RAISE EXCEPTION 'La identidad de referencia fue creada concurrentemente' USING ERRCODE='P2001';
          END;
        ELSIF action_value='UPDATE' THEN
          UPDATE jo.references SET
            name=CASE WHEN value->>'Nombre' IS NULL THEN name ELSE value->>'Nombre' END,
            line_id=CASE WHEN value->>'Línea' IS NULL THEN line_id ELSE line_id_value END,
            subline_id=CASE WHEN value->>'Sublínea' IS NULL THEN subline_id ELSE subline_id_value END,
            status_id=CASE WHEN value->>'Status General' IS NULL THEN status_id ELSE status_id_value END,
            updated_at=clock_timestamp()
          WHERE id=reference_id_value;
        END IF;
        -- NO_CHANGE solo se audita: no ejecuta UPDATE ni reasigna códigos.
        IF action_value IN ('CREATE','UPDATE') AND value->>'Código MD' IS NOT NULL THEN
          BEGIN
            PERFORM jo.assign_existing_reference_code(reference_id_value,'MD',upper(value->>'Código MD'),'IMPORTACION_CSV lote '||batch_id_value);
          EXCEPTION WHEN foreign_key_violation OR check_violation OR unique_violation THEN
            RAISE EXCEPTION 'Código MD no disponible o catálogo modificado durante la confirmación' USING ERRCODE='P2001';
          END;
        END IF;
        IF action_value IN ('CREATE','UPDATE') AND value->>'Código PT' IS NOT NULL THEN
          BEGIN
            PERFORM jo.assign_existing_reference_code(reference_id_value,'PT',upper(value->>'Código PT'),'IMPORTACION_CSV lote '||batch_id_value);
          EXCEPTION WHEN foreign_key_violation OR check_violation OR unique_violation THEN
            RAISE EXCEPTION 'Código PT no disponible o catálogo modificado durante la confirmación' USING ERRCODE='P2001';
          END;
        END IF;
      EXCEPTION WHEN SQLSTATE 'P2001' THEN
        GET STACKED DIAGNOSTICS business_message=MESSAGE_TEXT;
        action_value:='ROW_ERROR'; reference_id_value:=NULL;
        item:=jsonb_set(item,'{issues}',COALESCE(item->'issues','[]'::JSONB)||jsonb_build_array(jsonb_build_object(
          'severity','ERROR','classification','ROW_ERROR','row',source_row,'field','referencia','requirement','CSV-017','message',business_message)));
      END;
      IF action_value='ROW_ERROR' THEN rejected:=rejected+1; ELSE successful:=successful+1; END IF;
    ELSE rejected:=rejected+1; END IF;

    INSERT INTO jo.csv_reference_import_rows(batch_id,source_row,identity_collection_id,identity_year,identity_reference,action,reference_id,row_payload,designer_informative,tipo_ref_informative,applied_at)
    VALUES(batch_id_value,source_row,collection_id_value,contract_year_value,ref_number,action_value,reference_id_value,value,value->>'Diseñador',value->>'Tipo Ref',CASE WHEN action_value='ROW_ERROR' THEN NULL ELSE clock_timestamp() END)
    RETURNING id INTO audit_row_id;
    FOR issue IN SELECT * FROM jsonb_array_elements(COALESCE(item->'issues','[]'::JSONB)) LOOP
      INSERT INTO jo.csv_reference_import_issues(batch_id,row_id,source_row,severity,classification,field,requirement,message,payload)
      VALUES(batch_id_value,audit_row_id,source_row,issue->>'severity',issue->>'classification',issue->>'field',issue->>'requirement',issue->>'message',value);
      IF issue->>'severity'='WARNING' THEN warnings:=warnings+1; END IF;
    END LOOP;
  END LOOP;
  result_value:=jsonb_build_object('batch_id',batch_id_value,'confirmation_id',p_confirmation_id,'status',CASE WHEN rejected>0 OR warnings>0 THEN 'COMPLETADO_CON_INCIDENCIAS' ELSE 'COMPLETADO' END,
    'summary',jsonb_build_object('successful',successful,'row_error',rejected,'warnings',warnings));
  UPDATE jo.import_batches SET successful_rows=successful,invalid_rows=rejected,
    status=CASE WHEN rejected>0 OR warnings>0 THEN 'COMPLETADO_CON_INCIDENCIAS' ELSE 'COMPLETADO' END,finished_at=clock_timestamp(),
    metadata=metadata||jsonb_build_object('warnings',warnings,'designer_informative',TRUE),confirmation_result=result_value
  WHERE id=batch_id_value;
  RETURN result_value;
END;
$$;

ALTER TABLE jo.csv_reference_import_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.csv_reference_import_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY csv_reference_import_rows_admin_select ON jo.csv_reference_import_rows FOR SELECT TO authenticated USING ((SELECT jo.current_user_has_role('Administrador')));
CREATE POLICY csv_reference_import_issues_admin_select ON jo.csv_reference_import_issues FOR SELECT TO authenticated USING ((SELECT jo.current_user_has_role('Administrador')));
GRANT SELECT ON jo.csv_reference_import_rows,jo.csv_reference_import_issues TO authenticated;
REVOKE INSERT,UPDATE,DELETE ON jo.csv_reference_import_rows,jo.csv_reference_import_issues FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION jo.preview_csv_reference_import(JSONB) FROM PUBLIC,anon;
DO $$ BEGIN
  IF to_regprocedure('jo.confirm_csv_reference_import(jsonb,text,jsonb)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION jo.confirm_csv_reference_import(JSONB,TEXT,JSONB) FROM PUBLIC,anon,authenticated;
  END IF;
END $$;
REVOKE ALL ON FUNCTION jo.confirm_csv_reference_import(JSONB,TEXT,JSONB,UUID) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION jo.preview_csv_reference_import(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION jo.confirm_csv_reference_import(JSONB,TEXT,JSONB,UUID) TO authenticated;

COMMENT ON FUNCTION jo.preview_csv_reference_import(JSONB) IS 'Vista previa read-only del contrato CSV v0.1; exclusiva de Administrador.';
COMMENT ON FUNCTION jo.confirm_csv_reference_import(JSONB,TEXT,JSONB,UUID) IS 'Confirmacion global, idempotente por usuario/confirmation_id y con subtransaccion por fila del contrato CSV v0.1.';
COMMENT ON COLUMN jo.csv_reference_import_rows.designer_informative IS 'Dato informativo del CSV; nunca asigna ni crea una persona.';

COMMIT;
