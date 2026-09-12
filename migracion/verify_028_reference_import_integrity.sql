-- Verificacion no destructiva de 028. Debe terminar sin excepciones.
BEGIN;
SET LOCAL search_path = jo, public;

DO $$
DECLARE failures TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF EXISTS (SELECT 1 FROM jo.collections WHERE season NOT IN ('WS','SS','SV','RS','PF','FW') OR code !~ '^(WS|SS|SV|RS|PF|FW)[0-9]{2}$' OR left(code,2)<>season) THEN failures := array_append(failures,'colecciones fuera de dominio'); END IF;
  IF EXISTS (SELECT 1 FROM jo.references WHERE name IS NULL) THEN failures := array_append(failures,'references.name contiene NULL'); END IF;
  IF EXISTS (SELECT 1 FROM jo.references WHERE subline_id IS NOT NULL AND line_id IS NULL) THEN failures := array_append(failures,'sublínea sin linea'); END IF;
  IF EXISTS (
    SELECT 1 FROM jo.references r LEFT JOIN jo.line_sublines ls ON ls.line_id=r.line_id AND ls.subline_id=r.subline_id AND ls.active
    WHERE r.line_id IS NOT NULL AND r.subline_id IS NOT NULL AND ls.line_id IS NULL
  ) THEN failures := array_append(failures,'pareja linea/sublínea invalida'); END IF;
  IF EXISTS (SELECT code_id FROM jo.md_code_assignments WHERE active GROUP BY code_id HAVING count(*)>1) THEN failures := array_append(failures,'MD activo duplicado'); END IF;
  IF EXISTS (SELECT reference_id FROM jo.md_code_assignments WHERE active GROUP BY reference_id HAVING count(*)>1) THEN failures := array_append(failures,'referencia con dos MD activos'); END IF;
  IF EXISTS (SELECT code_id FROM jo.pt_code_assignments WHERE active GROUP BY code_id HAVING count(*)>1) THEN failures := array_append(failures,'PT activo duplicado'); END IF;
  IF EXISTS (SELECT reference_id FROM jo.pt_code_assignments WHERE active GROUP BY reference_id HAVING count(*)>1) THEN failures := array_append(failures,'referencia con dos PT activos'); END IF;
  IF EXISTS (SELECT 1 FROM jo.md_code_assignments a JOIN jo.md_codes c ON c.id=a.code_id WHERE a.active AND c.status<>'ASIGNADO') THEN failures := array_append(failures,'estado MD no sincronizado'); END IF;
  IF EXISTS (SELECT 1 FROM jo.pt_code_assignments a JOIN jo.pt_codes c ON c.id=a.code_id WHERE a.active AND c.status<>'ASIGNADO') THEN failures := array_append(failures,'estado PT no sincronizado'); END IF;
  IF EXISTS (
    SELECT 1 FROM jo.references r JOIN jo.reference_statuses s ON s.id=r.status_id AND s.is_cancelled
    JOIN jo.reference_states rs ON rs.reference_id=r.id
    WHERE rs.current_state<>'cancelado' OR rs.lifecycle_status<>'cancelled'
  ) THEN failures := array_append(failures,'Status Global cancelado no sincronizado'); END IF;
  IF (SELECT count(*) FROM jo.reference_codes WHERE code_type='MD') <> (SELECT count(*) FROM jo.md_code_assignments WHERE legacy_reference_code_id IS NOT NULL) THEN failures := array_append(failures,'backfill MD incompleto'); END IF;
  IF (SELECT count(*) FROM jo.reference_codes WHERE code_type='PT') <> (SELECT count(*) FROM jo.pt_code_assignments WHERE legacy_reference_code_id IS NOT NULL) THEN failures := array_append(failures,'backfill PT incompleto'); END IF;
  IF to_regclass('jo.code_log') IS NULL THEN failures := array_append(failures,'code_log no preservado'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='jo.code_pool'::regclass AND tgname='trg_028_freeze_code_pool' AND tgenabled<>'D') THEN failures := array_append(failures,'code_pool no congelado'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='jo.reference_codes'::regclass AND tgname='trg_028_freeze_reference_codes' AND tgenabled<>'D') THEN failures := array_append(failures,'reference_codes no congelado'); END IF;
  IF EXISTS (SELECT 1 FROM unnest(ARRAY['md_codes','pt_codes','md_code_assignments','pt_code_assignments','import_batches','import_issues']) t(name)
             LEFT JOIN pg_class c ON c.oid=to_regclass('jo.'||t.name) WHERE c.oid IS NULL OR NOT c.relrowsecurity) THEN failures := array_append(failures,'tabla faltante o RLS deshabilitada'); END IF;
  IF failures <> ARRAY[]::TEXT[] THEN RAISE EXCEPTION 'Verificacion 028 fallo: %', array_to_string(failures,'; '); END IF;
END;
$$;

-- Inspeccion humana / evidencia de conteos y politicas.
SELECT 'MD' AS type, count(*) AS codes, count(*) FILTER (WHERE status='ASIGNADO') AS assigned FROM jo.md_codes
UNION ALL SELECT 'PT',count(*),count(*) FILTER (WHERE status='ASIGNADO') FROM jo.pt_codes;
SELECT 'MD' AS type, count(*) AS assignments, count(*) FILTER (WHERE active) AS active FROM jo.md_code_assignments
UNION ALL SELECT 'PT',count(*),count(*) FILTER (WHERE active) FROM jo.pt_code_assignments;
SELECT tablename, policyname, cmd, roles FROM pg_policies
WHERE schemaname='jo' AND tablename IN ('md_codes','pt_codes','md_code_assignments','pt_code_assignments','import_batches','import_issues')
ORDER BY tablename,policyname;

-- Pruebas transaccionales: no dejan datos. Deben producir dos NOTICE y ninguna
-- excepcion no controlada. Comprueban '' valido, NULL invalido y subline sin line.
DO $$
DECLARE collection_id INTEGER; ref_id INTEGER; official_line_id INTEGER; official_line_code TEXT; valid_subline_id INTEGER; invalid_subline_id INTEGER;
BEGIN
  SELECT id INTO collection_id FROM jo.collections ORDER BY id LIMIT 1;
  IF collection_id IS NULL THEN RAISE NOTICE 'Pruebas de references omitidas: no hay colecciones'; RETURN; END IF;
  BEGIN
    INSERT INTO jo.references(collection_id,reference_number,name,line_id,subline_id)
    VALUES(collection_id,'__VERIFY_028_EMPTY_NAME__','',NULL,NULL) RETURNING id INTO ref_id;
    DELETE FROM jo.references WHERE id=ref_id;
  EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'Prueba name vacio omitida: referencia temporal ya existe'; END;
  BEGIN
    INSERT INTO jo.references(collection_id,reference_number,name) VALUES(collection_id,'__VERIFY_028_NULL_NAME__',NULL);
    RAISE EXCEPTION 'name NULL fue aceptado indebidamente';
  EXCEPTION WHEN not_null_violation THEN RAISE NOTICE 'OK: name NULL rechazado'; END;
  BEGIN
    INSERT INTO jo.references(collection_id,reference_number,name,subline_id)
    SELECT collection_id,'__VERIFY_028_ORPHAN_SUBLINE__','',id FROM jo.sublines ORDER BY id LIMIT 1;
    IF FOUND THEN RAISE EXCEPTION 'sublínea sin linea fue aceptada'; ELSE RAISE NOTICE 'Prueba subline omitida: catalogo vacio'; END IF;
  EXCEPTION WHEN check_violation THEN RAISE NOTICE 'OK: subline sin linea rechazada'; END;
  SELECT id,code INTO official_line_id,official_line_code FROM jo.lines WHERE active AND code IS NOT NULL ORDER BY id LIMIT 1;
  IF official_line_id IS NOT NULL THEN
    INSERT INTO jo.references(collection_id,reference_number,name,line_id,subline_id)
    VALUES(collection_id,'__VERIFY_028_LINE_ONLY__','',official_line_id,NULL) RETURNING id INTO ref_id;
    IF (SELECT tipo_ref FROM jo.references WHERE id=ref_id) IS DISTINCT FROM official_line_code THEN RAISE EXCEPTION 'tipo_ref no se derivo para linea sin sublinea'; END IF;
    DELETE FROM jo.references WHERE id=ref_id;
    SELECT subline_id INTO valid_subline_id FROM jo.line_sublines WHERE line_id=official_line_id AND active ORDER BY subline_id LIMIT 1;
    IF valid_subline_id IS NOT NULL THEN
      INSERT INTO jo.references(collection_id,reference_number,name,line_id,subline_id)
      VALUES(collection_id,'__VERIFY_028_VALID_PAIR__','',official_line_id,valid_subline_id) RETURNING id INTO ref_id;
      DELETE FROM jo.references WHERE id=ref_id;
    END IF;
    SELECT id INTO invalid_subline_id FROM jo.sublines s
    WHERE NOT EXISTS (SELECT 1 FROM jo.line_sublines ls WHERE ls.line_id=official_line_id AND ls.subline_id=s.id AND ls.active)
    ORDER BY id LIMIT 1;
    IF invalid_subline_id IS NOT NULL THEN
      BEGIN
        INSERT INTO jo.references(collection_id,reference_number,name,line_id,subline_id)
        VALUES(collection_id,'__VERIFY_028_INVALID_PAIR__','',official_line_id,invalid_subline_id);
        RAISE EXCEPTION 'pareja linea/sublínea invalida fue aceptada';
      EXCEPTION WHEN check_violation THEN RAISE NOTICE 'OK: pareja invalida rechazada'; END;
    END IF;
  END IF;
END;
$$;

ROLLBACK;
