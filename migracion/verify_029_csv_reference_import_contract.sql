-- Verificación no destructiva de 029. No aplica la migración ni conserva datos.
BEGIN;
SET LOCAL search_path = jo, public;

DO $$
DECLARE failures TEXT[]:=ARRAY[]::TEXT[];
BEGIN
  IF to_regprocedure('jo.preview_csv_reference_import(jsonb)') IS NULL THEN failures:=array_append(failures,'RPC preview ausente'); END IF;
  IF to_regprocedure('jo.confirm_csv_reference_import(jsonb,text,jsonb,uuid)') IS NULL THEN failures:=array_append(failures,'RPC confirmacion idempotente ausente'); END IF;
  IF to_regclass('jo.csv_reference_import_rows') IS NULL OR to_regclass('jo.csv_reference_import_issues') IS NULL THEN failures:=array_append(failures,'auditoria estructurada ausente'); END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_index WHERE indexrelid=to_regclass('jo.references_collection_year_number_uidx') AND indisunique AND indisvalid AND indpred IS NULL) THEN failures:=array_append(failures,'identidad compuesta completa (usable por ON CONFLICT legacy) ausente'); END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='jo.references'::regclass AND attname='reference_number' AND atttypid='integer'::regtype AND NOT attisdropped) THEN failures:=array_append(failures,'reference_number no esta persistida como INTEGER'); END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='jo.references'::regclass AND conname='references_reference_number_positive' AND contype='c') THEN failures:=array_append(failures,'constraint de referencia positiva ausente'); END IF;
  IF EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='jo.references'::regclass AND conname='references_reference_number_unique') THEN failures:=array_append(failures,'unicidad global legacy persiste'); END IF;
  IF has_function_privilege('anon','jo.preview_csv_reference_import(jsonb)','EXECUTE') OR has_function_privilege('anon','jo.confirm_csv_reference_import(jsonb,text,jsonb,uuid)','EXECUTE') THEN failures:=array_append(failures,'anon puede ejecutar RPC'); END IF;
  IF NOT has_function_privilege('authenticated','jo.preview_csv_reference_import(jsonb)','EXECUTE') OR NOT has_function_privilege('authenticated','jo.confirm_csv_reference_import(jsonb,text,jsonb,uuid)','EXECUTE') THEN failures:=array_append(failures,'authenticated no puede alcanzar RPC protegidas'); END IF;
  IF to_regprocedure('jo.confirm_csv_reference_import(jsonb,text,jsonb)') IS NOT NULL AND has_function_privilege('authenticated','jo.confirm_csv_reference_import(jsonb,text,jsonb)','EXECUTE') THEN failures:=array_append(failures,'firma legacy de confirmacion conserva EXECUTE'); END IF;
  IF EXISTS(SELECT 1 FROM unnest(ARRAY['csv_reference_import_rows','csv_reference_import_issues']) n(name) LEFT JOIN pg_class c ON c.oid=to_regclass('jo.'||n.name) WHERE c.oid IS NULL OR NOT c.relrowsecurity) THEN failures:=array_append(failures,'RLS de auditoria ausente'); END IF;
  IF EXISTS(SELECT 1 FROM jo.references WHERE year IS NULL) THEN failures:=array_append(failures,'preflight incumplido: references.year nulo'); END IF;
  IF EXISTS(SELECT 1 FROM jo.references r JOIN jo.collections c ON c.id=r.collection_id WHERE r.year IS DISTINCT FROM c.year) THEN failures:=array_append(failures,'preflight incumplido: year distinto del ano canonico'); END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='jo.import_batches'::regclass AND attname='confirmation_id' AND atttypid='uuid'::regtype AND NOT attisdropped) THEN failures:=array_append(failures,'confirmation_id UUID ausente'); END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_index WHERE indexrelid=to_regclass('jo.import_batches_created_by_confirmation_uidx') AND indisunique AND indisvalid AND indpred IS NOT NULL) THEN failures:=array_append(failures,'unicidad parcial de confirmation_id por usuario ausente'); END IF;
  IF failures<>ARRAY[]::TEXT[] THEN RAISE EXCEPTION 'Verificacion 029 fallo: %',array_to_string(failures,'; '); END IF;
END;
$$;

-- Gate funcional opcional: exige una sesión JWT Administrador. Preview no debe
-- modificar ninguna tabla; los conteos se comparan antes y después.
DO $$
DECLARE before_batches BIGINT; before_refs BIGINT; result JSONB; duplicate_result JSONB;
  alternate_result JSONB; alternate_code TEXT; alternate_year INTEGER;
  test_code TEXT; test_year INTEGER; test_reference INTEGER; test_document JSONB; test_preview JSONB;
  first_confirmation JSONB; retry_confirmation JSONB; test_confirmation_id UUID;
BEGIN
  IF current_user<>'authenticated' OR auth.uid() IS NULL OR NOT COALESCE(jo.current_user_has_role('Administrador'),FALSE) THEN
    RAISE NOTICE 'NOT_VALIDATED: preview funcional requiere JWT Administrador'; RETURN;
  END IF;
  SELECT count(*) INTO before_batches FROM jo.import_batches;
  SELECT count(*) INTO before_refs FROM jo.references;
  result:=jo.preview_csv_reference_import(jsonb_build_object(
    'template_version','0.1',
    'headers',jsonb_build_array('Colección','Año','referencia','Nombre','Línea','Sublínea','Status General','Código MD','Código PT','Tipo Ref','Diseñador'),
    'rows',jsonb_build_array(jsonb_build_object('source_row',2,'values',jsonb_build_object(
      'Colección','SS27','Año','2027','referencia','999999999','Nombre',NULL,'Línea',NULL,'Sublínea',NULL,
      'Status General',NULL,'Código MD',NULL,'Código PT',NULL,'Tipo Ref',NULL,'Diseñador',NULL)))));
  IF (SELECT count(*) FROM jo.import_batches)<>before_batches OR (SELECT count(*) FROM jo.references)<>before_refs THEN
    RAISE EXCEPTION 'Preview realizó escrituras';
  END IF;
  duplicate_result:=jo.preview_csv_reference_import(jsonb_build_object(
    'template_version','0.1',
    'headers',jsonb_build_array('referencia','Año','Colección'),
    'rows',jsonb_build_array(
      jsonb_build_object('source_row',2,'values',jsonb_build_object('referencia','1','Año','2027','Colección','SS27')),
      jsonb_build_object('source_row',3,'values',jsonb_build_object('referencia','01','Año','2027','Colección','SS27')))));
  IF jsonb_array_length(duplicate_result->'rows')<>2 OR EXISTS(
    SELECT 1 FROM jsonb_array_elements(duplicate_result->'rows') r WHERE r->>'action'<>'ROW_ERROR'
  ) THEN
    RAISE EXCEPTION 'La identidad canonical 1/01 no produjo ROW_ERROR determinista: %',duplicate_result;
  END IF;
  IF (SELECT count(*) FROM jo.import_batches)<>before_batches OR (SELECT count(*) FROM jo.references)<>before_refs THEN
    RAISE EXCEPTION 'Preview canonical/reordenado realizó escrituras';
  END IF;
  SELECT c.code,cy.year INTO alternate_code,alternate_year
  FROM jo.collections c JOIN jo.collection_years cy ON cy.collection_id=c.id
  WHERE c.active IS TRUE AND cy.is_hidden IS FALSE AND c.year=cy.year AND c.code<>'SS27'
  ORDER BY c.id,cy.year LIMIT 1;
  IF alternate_code IS NOT NULL THEN
    alternate_result:=jo.preview_csv_reference_import(jsonb_build_object(
      'template_version','0.1','headers',jsonb_build_array('Colección','Año','referencia'),
      'rows',jsonb_build_array(jsonb_build_object('source_row',2,'values',jsonb_build_object(
        'Colección',alternate_code,'Año',alternate_year::TEXT,'referencia','2147483647')))));
    IF alternate_result->>'collection_code' IS DISTINCT FROM alternate_code
       OR (alternate_result->>'year')::INTEGER IS DISTINCT FROM alternate_year THEN
      RAISE EXCEPTION 'Preview no resolvió colección contractual alternativa: %',alternate_result;
    END IF;
  ELSE
    RAISE NOTICE 'NOT_VALIDATED: no hay una segunda colección/año visible para probar resolución genérica';
  END IF;

  SELECT c.code,c.year INTO test_code,test_year
  FROM jo.collections c JOIN jo.collection_years cy ON cy.collection_id=c.id AND cy.year=c.year
  WHERE c.active IS TRUE AND cy.is_hidden IS FALSE ORDER BY c.id LIMIT 1;
  IF test_code IS NULL THEN
    RAISE NOTICE 'NOT_VALIDATED: confirmación/reintento requiere una colección canónica activa y visible';
  ELSE
    SELECT candidate INTO test_reference
    FROM generate_series(2147483647,2147483000,-1) candidate
    WHERE NOT EXISTS(SELECT 1 FROM jo.references r WHERE r.collection_id=(SELECT id FROM jo.collections WHERE code=test_code AND year=test_year LIMIT 1) AND r.year=test_year AND r.reference_number=candidate)
      AND NOT EXISTS(SELECT 1 FROM jo.references r WHERE r.collection_id=(SELECT id FROM jo.collections WHERE code=test_code AND year=test_year LIMIT 1) AND r.year=test_year AND r.reference_number=candidate-1)
    LIMIT 1;
    IF test_reference IS NULL THEN
      RAISE NOTICE 'NOT_VALIDATED: no hay identidad temporal libre para confirmación/reintento';
    ELSE
      test_document:=jsonb_build_object(
        'template_version','0.1','headers',jsonb_build_array('Colección','Año','referencia','Línea'),
        'rows',jsonb_build_array(
          jsonb_build_object('source_row',2,'values',jsonb_build_object('Colección',test_code,'Año',test_year::TEXT,'referencia',test_reference::TEXT,'Línea',NULL)),
          jsonb_build_object('source_row',3,'values',jsonb_build_object('Colección',test_code,'Año',test_year::TEXT,'referencia',(test_reference-1)::TEXT,'Línea','__VERIFY_029_LINEA_INEXISTENTE__'))));
      test_preview:=jo.preview_csv_reference_import(test_document);
      IF NOT COALESCE((test_preview->>'can_confirm')::BOOLEAN,FALSE) OR test_preview#>>'{summary,row_error}'<>'1' THEN
        RAISE EXCEPTION 'Preview de incidencia por fila inesperado: %',test_preview;
      END IF;
      test_confirmation_id:=md5(clock_timestamp()::TEXT||random()::TEXT||auth.uid()::TEXT)::UUID;
      SELECT count(*) INTO before_batches FROM jo.import_batches;
      first_confirmation:=jo.confirm_csv_reference_import(test_document,'verify_029.csv',test_preview,test_confirmation_id);
      retry_confirmation:=jo.confirm_csv_reference_import(test_document,'verify_029.csv',test_preview,test_confirmation_id);
      IF first_confirmation IS DISTINCT FROM retry_confirmation OR (SELECT count(*) FROM jo.import_batches)<>before_batches+1 THEN
        RAISE EXCEPTION 'El reintento idempotente creó otro lote o cambió el resultado';
      END IF;
      IF first_confirmation#>>'{summary,successful}'<>'1' OR first_confirmation#>>'{summary,row_error}'<>'1'
         OR (SELECT count(*) FROM jo.csv_reference_import_rows WHERE batch_id=(first_confirmation->>'batch_id')::BIGINT)<>2 THEN
        RAISE EXCEPTION 'La confirmación no continuó las válidas ante incidencias por fila: %',first_confirmation;
      END IF;
      IF NOT EXISTS(SELECT 1 FROM jo.references r JOIN jo.collections c ON c.id=r.collection_id WHERE c.code=test_code AND r.year=test_year AND r.reference_number=test_reference)
         OR EXISTS(SELECT 1 FROM jo.references r JOIN jo.collections c ON c.id=r.collection_id WHERE c.code=test_code AND r.year=test_year AND r.reference_number=test_reference-1) THEN
        RAISE EXCEPTION 'Aplicación parcial incorrecta por fila';
      END IF;
      RAISE NOTICE 'Confirmación, incidencia y reintento idempotente verificados; todos los cambios se revertirán';
    END IF;
  END IF;
  RAISE NOTICE 'Preview read-only verificado: %',result;
END;
$$;

SELECT p.oid::regprocedure,p.provolatile,p.prosecdef,p.proconfig
FROM pg_proc p WHERE p.oid IN ('jo.preview_csv_reference_import(jsonb)'::regprocedure,'jo.confirm_csv_reference_import(jsonb,text,jsonb,uuid)'::regprocedure);
SELECT tablename,policyname,cmd,roles FROM pg_policies WHERE schemaname='jo' AND tablename IN ('csv_reference_import_rows','csv_reference_import_issues');
ROLLBACK;
