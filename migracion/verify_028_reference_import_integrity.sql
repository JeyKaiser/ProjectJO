-- Verificacion no destructiva de 028. Las pruebas de datos temporales terminan
-- en ROLLBACK. SS27 se reporta como readiness externo, no como fallo de 028.
BEGIN;
SET LOCAL search_path = jo, public;

CREATE TEMP TABLE verify_028_status (
  validation TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('PASS','NOT_VALIDATED')),
  detail TEXT NOT NULL
) ON COMMIT DROP;
INSERT INTO verify_028_status(validation,status,detail) VALUES
  ('STRUCTURAL_AND_DATA','NOT_VALIDATED','Verificacion aun no ejecutada'),
  ('MD_PT_STATIC','NOT_VALIDATED','Verificacion estructural aun no ejecutada'),
  ('EFFECTIVE_RLS_AUTHENTICATED','NOT_VALIDATED','Pendiente: requiere current_user=authenticated'),
  ('FUNCTIONAL_RPC_ADMIN_JWT','NOT_VALIDATED','Pendiente: requiere JWT Administrador'),
  ('RUNTIME_ASSIGNMENT_MD','NOT_VALIDATED','Pendiente: requiere JWT Administrador y codigo MD DISPONIBLE'),
  ('RUNTIME_ASSIGNMENT_PT','NOT_VALIDATED','Pendiente: requiere JWT Administrador y codigo PT DISPONIBLE');

DO $$
DECLARE failures TEXT[] := ARRAY[]::TEXT[]; ss27_ready BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM jo.collections c JOIN jo.collection_years cy ON cy.collection_id=c.id
    WHERE c.code='SS27' AND c.season='SS' AND c.year=2027 AND cy.year=2027
      AND c.active IS TRUE AND cy.is_hidden IS FALSE
  ) INTO ss27_ready;
  IF NOT ss27_ready THEN
    RAISE WARNING 'NOT_READY: importacion SS27 requiere collection.code=SS27, season=SS, collections.year=2027 y collection_years.year=2027 visible. 028 no crea catalogo.';
  END IF;

  IF EXISTS (SELECT 1 FROM jo.collections WHERE season NOT IN ('WS','SS','SV','RS','PF','FW') OR code !~ '^(WS|SS|SV|RS|PF|FW)[0-9]{2}$' OR left(code,2)<>season) THEN failures:=array_append(failures,'colecciones fuera de dominio'); END IF;
  IF EXISTS (SELECT 1 FROM jo.references WHERE name IS NULL) THEN failures:=array_append(failures,'references.name contiene NULL'); END IF;
  IF EXISTS (SELECT 1 FROM jo.references WHERE (import_batch_id IS NULL)<>(import_source_row IS NULL)) THEN failures:=array_append(failures,'procedencia parcial en references'); END IF;
  IF EXISTS (SELECT 1 FROM jo.references r LEFT JOIN jo.import_batch_rows br ON br.batch_id=r.import_batch_id AND br.source_row=r.import_source_row AND br.reference_id=r.id WHERE r.import_batch_id IS NOT NULL AND br.id IS NULL) THEN failures:=array_append(failures,'referencia con procedencia sin ledger coherente'); END IF;
  IF EXISTS (SELECT 1 FROM jo.import_batch_rows br LEFT JOIN jo.references r ON r.id=br.reference_id WHERE br.reference_id IS NOT NULL AND (r.id IS NULL OR r.import_batch_id IS DISTINCT FROM br.batch_id OR r.import_source_row IS DISTINCT FROM br.source_row)) THEN failures:=array_append(failures,'ledger con referencia/procedencia incoherente'); END IF;
  IF EXISTS (SELECT 1 FROM jo.references WHERE subline_id IS NOT NULL AND line_id IS NULL) THEN failures:=array_append(failures,'sublinea sin linea'); END IF;
  IF EXISTS (SELECT 1 FROM jo.references r LEFT JOIN jo.line_sublines ls ON ls.line_id=r.line_id AND ls.subline_id=r.subline_id AND ls.active WHERE r.line_id IS NOT NULL AND r.subline_id IS NOT NULL AND ls.line_id IS NULL) THEN failures:=array_append(failures,'pareja linea/sublinea invalida'); END IF;
  IF EXISTS (SELECT code_id FROM jo.md_code_assignments WHERE active GROUP BY code_id HAVING count(*)>1) OR EXISTS (SELECT reference_id FROM jo.md_code_assignments WHERE active GROUP BY reference_id HAVING count(*)>1) THEN failures:=array_append(failures,'duplicidad activa MD'); END IF;
  IF EXISTS (SELECT code_id FROM jo.pt_code_assignments WHERE active GROUP BY code_id HAVING count(*)>1) OR EXISTS (SELECT reference_id FROM jo.pt_code_assignments WHERE active GROUP BY reference_id HAVING count(*)>1) THEN failures:=array_append(failures,'duplicidad activa PT'); END IF;
  IF EXISTS (SELECT reference_id,code_type FROM jo.reference_codes WHERE COALESCE(active,TRUE) GROUP BY reference_id,code_type HAVING count(*)>1)
     OR EXISTS (SELECT code_type,code FROM jo.reference_codes WHERE COALESCE(active,TRUE) GROUP BY code_type,code HAVING count(*)>1) THEN failures:=array_append(failures,'duplicidad activa legacy MD/PT'); END IF;
  IF EXISTS (SELECT 1 FROM jo.md_codes c WHERE (c.status='ASIGNADO') IS DISTINCT FROM EXISTS(SELECT 1 FROM jo.md_code_assignments a WHERE a.code_id=c.id AND a.active)) OR EXISTS (SELECT 1 FROM jo.pt_codes c WHERE (c.status='ASIGNADO') IS DISTINCT FROM EXISTS(SELECT 1 FROM jo.pt_code_assignments a WHERE a.code_id=c.id AND a.active)) THEN failures:=array_append(failures,'estado/titular de proyeccion MD/PT inconsistente'); END IF;
  IF EXISTS (SELECT 1 FROM jo.md_code_assignments WHERE legacy_reference_code_id IS NOT NULL AND deactivated_at IS NOT NULL) OR EXISTS (SELECT 1 FROM jo.pt_code_assignments WHERE legacy_reference_code_id IS NOT NULL AND deactivated_at IS NOT NULL) THEN failures:=array_append(failures,'fecha de desactivacion legacy inventada'); END IF;
  IF EXISTS (SELECT 1 FROM jo.md_code_assignments a JOIN jo.reference_codes rc ON rc.id=a.legacy_reference_code_id WHERE rc.assigned_at IS NULL AND a.assigned_at IS NOT NULL) OR EXISTS (SELECT 1 FROM jo.pt_code_assignments a JOIN jo.reference_codes rc ON rc.id=a.legacy_reference_code_id WHERE rc.assigned_at IS NULL AND a.assigned_at IS NOT NULL) THEN failures:=array_append(failures,'fecha de asignacion legacy inventada'); END IF;
  IF EXISTS (SELECT 1 FROM jo.md_code_assignments WHERE legacy_reference_code_id IS NOT NULL AND migrated_at IS NULL) OR EXISTS (SELECT 1 FROM jo.pt_code_assignments WHERE legacy_reference_code_id IS NOT NULL AND migrated_at IS NULL) THEN failures:=array_append(failures,'origen temporal tecnico de migracion ausente'); END IF;
  IF (SELECT count(*) FROM jo.reference_codes WHERE code_type='MD'::jo.reference_code_type)<>(SELECT count(*) FROM jo.md_code_assignments WHERE legacy_reference_code_id IS NOT NULL) THEN failures:=array_append(failures,'proyeccion MD incompleta'); END IF;
  IF (SELECT count(*) FROM jo.reference_codes WHERE code_type='PT'::jo.reference_code_type)<>(SELECT count(*) FROM jo.pt_code_assignments WHERE legacy_reference_code_id IS NOT NULL) THEN failures:=array_append(failures,'proyeccion PT incompleta'); END IF;
  IF EXISTS (SELECT 1 FROM jo.code_pool cp LEFT JOIN jo.md_codes c ON c.legacy_pool_id=cp.id WHERE cp.code_type='MD'::jo.reference_code_type AND (c.id IS NULL OR c.code IS DISTINCT FROM cp.code OR c.status IS DISTINCT FROM cp.status OR c.prefix IS DISTINCT FROM cp.prefix OR c.sequential_num IS DISTINCT FROM cp.sequential_num OR c.notes IS DISTINCT FROM cp.notes))
     OR EXISTS (SELECT 1 FROM jo.md_codes c LEFT JOIN jo.code_pool cp ON cp.id=c.legacy_pool_id WHERE cp.id IS NULL OR cp.code_type<>'MD'::jo.reference_code_type OR cp.code IS DISTINCT FROM c.code OR cp.status IS DISTINCT FROM c.status OR cp.prefix IS DISTINCT FROM c.prefix OR cp.sequential_num IS DISTINCT FROM c.sequential_num OR cp.notes IS DISTINCT FROM c.notes)
     OR EXISTS (SELECT 1 FROM jo.code_pool cp LEFT JOIN jo.pt_codes c ON c.legacy_pool_id=cp.id WHERE cp.code_type='PT'::jo.reference_code_type AND (c.id IS NULL OR c.code IS DISTINCT FROM cp.code OR c.status IS DISTINCT FROM cp.status OR c.prefix IS DISTINCT FROM cp.prefix OR c.sequential_num IS DISTINCT FROM cp.sequential_num OR c.notes IS DISTINCT FROM cp.notes))
     OR EXISTS (SELECT 1 FROM jo.pt_codes c LEFT JOIN jo.code_pool cp ON cp.id=c.legacy_pool_id WHERE cp.id IS NULL OR cp.code_type<>'PT'::jo.reference_code_type OR cp.code IS DISTINCT FROM c.code OR cp.status IS DISTINCT FROM c.status OR cp.prefix IS DISTINCT FROM c.prefix OR cp.sequential_num IS DISTINCT FROM c.sequential_num OR cp.notes IS DISTINCT FROM c.notes) THEN failures:=array_append(failures,'paridad bidireccional code_pool/proyeccion ausente'); END IF;
  IF EXISTS (SELECT 1 FROM jo.code_pool cp WHERE (cp.status='ASIGNADO') IS DISTINCT FROM EXISTS(SELECT 1 FROM jo.reference_codes rc WHERE rc.pool_code_id=cp.id AND rc.code=cp.code AND rc.code_type=cp.code_type AND COALESCE(rc.active,TRUE))) THEN failures:=array_append(failures,'estado/titular legacy inconsistente'); END IF;
  IF EXISTS (SELECT 1 FROM jo.reference_codes rc LEFT JOIN jo.md_code_assignments a ON a.legacy_reference_code_id=rc.id LEFT JOIN jo.md_codes c ON c.id=a.code_id WHERE rc.code_type='MD'::jo.reference_code_type AND (a.id IS NULL OR a.reference_id IS DISTINCT FROM rc.reference_id OR c.code IS DISTINCT FROM rc.code OR c.legacy_pool_id IS DISTINCT FROM rc.pool_code_id OR a.active IS DISTINCT FROM COALESCE(rc.active,TRUE)))
     OR EXISTS (SELECT 1 FROM jo.md_code_assignments a LEFT JOIN jo.reference_codes rc ON rc.id=a.legacy_reference_code_id LEFT JOIN jo.md_codes c ON c.id=a.code_id WHERE rc.id IS NULL OR rc.code_type<>'MD'::jo.reference_code_type OR a.reference_id IS DISTINCT FROM rc.reference_id OR c.code IS DISTINCT FROM rc.code OR c.legacy_pool_id IS DISTINCT FROM rc.pool_code_id OR a.active IS DISTINCT FROM COALESCE(rc.active,TRUE))
     OR EXISTS (SELECT 1 FROM jo.reference_codes rc LEFT JOIN jo.pt_code_assignments a ON a.legacy_reference_code_id=rc.id LEFT JOIN jo.pt_codes c ON c.id=a.code_id WHERE rc.code_type='PT'::jo.reference_code_type AND (a.id IS NULL OR a.reference_id IS DISTINCT FROM rc.reference_id OR c.code IS DISTINCT FROM rc.code OR c.legacy_pool_id IS DISTINCT FROM rc.pool_code_id OR a.active IS DISTINCT FROM COALESCE(rc.active,TRUE)))
     OR EXISTS (SELECT 1 FROM jo.pt_code_assignments a LEFT JOIN jo.reference_codes rc ON rc.id=a.legacy_reference_code_id LEFT JOIN jo.pt_codes c ON c.id=a.code_id WHERE rc.id IS NULL OR rc.code_type<>'PT'::jo.reference_code_type OR a.reference_id IS DISTINCT FROM rc.reference_id OR c.code IS DISTINCT FROM rc.code OR c.legacy_pool_id IS DISTINCT FROM rc.pool_code_id OR a.active IS DISTINCT FROM COALESCE(rc.active,TRUE)) THEN failures:=array_append(failures,'paridad bidireccional reference_codes/asignaciones o titulares ausente'); END IF;
  IF EXISTS (SELECT 1 FROM jo.state_history WHERE event='IMPORTACION_CSV' AND import_batch_id IS NULL) THEN failures:=array_append(failures,'historia de importacion sin import_batch_id'); END IF;
  IF EXISTS (
    SELECT 1 FROM jo.state_history h JOIN jo.references r ON r.id=h.reference_id
    LEFT JOIN jo.import_batch_rows br ON br.batch_id=h.import_batch_id AND br.reference_id=h.reference_id
      AND br.source_row=r.import_source_row AND br.outcome='EXITOSO'
    WHERE h.event='IMPORTACION_CSV' AND (r.import_batch_id IS DISTINCT FROM h.import_batch_id OR br.id IS NULL)
  ) THEN failures:=array_append(failures,'historia/importacion previa sin ledger EXITOSO reconstruido'); END IF;
  IF EXISTS (
    SELECT 1 FROM jo.import_issues i LEFT JOIN jo.import_batch_rows br
      ON br.batch_id=i.batch_id AND br.source_row=i.source_row AND br.issue_id=i.id AND br.outcome='INVALIDO'
    WHERE i.source_row IS NULL OR br.id IS NULL
  ) THEN failures:=array_append(failures,'incidencia previa sin ledger INVALIDO inequivoco'); END IF;
  IF EXISTS (SELECT 1 FROM jo.references r JOIN jo.reference_statuses s ON s.id=r.status_id AND s.is_cancelled JOIN jo.reference_states rs ON rs.reference_id=r.id WHERE rs.current_state<>'cancelado' OR rs.lifecycle_status<>'cancelled') THEN failures:=array_append(failures,'Status Global cancelado no sincronizado'); END IF;
  IF EXISTS (SELECT batch_id,source_row FROM jo.import_batch_rows GROUP BY batch_id,source_row HAVING count(*)>1) THEN failures:=array_append(failures,'ledger no idempotente'); END IF;
  IF EXISTS (
    SELECT 1 FROM jo.import_batches b LEFT JOIN LATERAL (
      SELECT count(*) FILTER(WHERE outcome='EXITOSO') ok,count(*) FILTER(WHERE outcome='INVALIDO') bad
      FROM jo.import_batch_rows br WHERE br.batch_id=b.id
    ) x ON TRUE WHERE b.successful_rows<>x.ok OR b.invalid_rows<>x.bad
  ) THEN failures:=array_append(failures,'contadores de lote distintos del ledger'); END IF;
  IF EXISTS (SELECT 1 FROM jo.import_issues i JOIN jo.import_batches b ON b.id=i.batch_id WHERE b.status<>'EN_PROCESO' AND i.created_at>b.finished_at) THEN failures:=array_append(failures,'incidencia posterior al cierre'); END IF;
  IF to_regclass('jo.code_log') IS NULL THEN failures:=array_append(failures,'code_log no preservado'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='jo.code_pool'::regclass AND tgname='trg_028_project_code_pool' AND tgenabled<>'D' AND tgfoid='jo.project_legacy_code_pool_028()'::regprocedure) OR NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='jo.reference_codes'::regclass AND tgname='trg_028_project_reference_codes' AND tgenabled<>'D' AND tgfoid='jo.project_legacy_reference_code_028()'::regprocedure) THEN failures:=array_append(failures,'capa compatible legacy/proyeccion ausente o tgfoid inesperado'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='jo.code_pool'::regclass AND tgname='trg_028_guard_code_pool_mutation' AND tgenabled<>'D' AND tgfoid='jo.guard_legacy_code_mutation_028()'::regprocedure) OR NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='jo.reference_codes'::regclass AND tgname='trg_028_guard_reference_code_mutation' AND tgenabled<>'D' AND tgfoid='jo.guard_legacy_code_mutation_028()'::regprocedure) OR NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='jo.code_pool'::regclass AND tgname='trg_028_assert_code_pool_integrity' AND tgdeferrable AND tginitdeferred AND tgenabled<>'D' AND tgfoid='jo.run_code_projection_integrity_028()'::regprocedure) OR NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='jo.reference_codes'::regclass AND tgname='trg_028_assert_reference_codes_integrity' AND tgdeferrable AND tginitdeferred AND tgenabled<>'D' AND tgfoid='jo.run_code_projection_integrity_028()'::regprocedure) THEN failures:=array_append(failures,'guards de mutacion/estado legacy ausentes o tgfoid inesperado'); END IF;
  IF EXISTS (SELECT 1 FROM unnest(ARRAY['md_codes','pt_codes','md_code_assignments','pt_code_assignments','import_batches','import_issues','import_batch_rows']) t(name) LEFT JOIN pg_class c ON c.oid=to_regclass('jo.'||t.name) WHERE c.oid IS NULL OR NOT c.relrowsecurity) THEN failures:=array_append(failures,'tabla faltante o RLS deshabilitada'); END IF;
  IF EXISTS (SELECT 1 FROM unnest(ARRAY['code_pool','reference_codes']) t(name) LEFT JOIN pg_class c ON c.oid=to_regclass('jo.'||t.name) WHERE c.oid IS NULL OR NOT c.relrowsecurity) THEN failures:=array_append(failures,'RLS legacy de codigos deshabilitada'); END IF;
  IF NOT has_table_privilege('authenticated','jo.code_pool','INSERT,UPDATE,DELETE') OR NOT has_table_privilege('authenticated','jo.reference_codes','INSERT,UPDATE,DELETE') THEN failures:=array_append(failures,'compatibilidad de privilegios legacy ausente'); END IF;
  IF EXISTS (
    SELECT 1
    FROM (VALUES ('code_pool'),('reference_codes')) AS t(table_name)
    CROSS JOIN (VALUES ('INSERT'),('UPDATE'),('DELETE')) AS operation(cmd)
    WHERE NOT EXISTS (
      SELECT 1 FROM pg_policies p WHERE p.schemaname='jo' AND p.tablename=t.table_name
        AND p.permissive='PERMISSIVE' AND p.cmd IN ('ALL',operation.cmd)
        AND ('authenticated'=ANY(p.roles) OR 'public'=ANY(p.roles))
    ) OR EXISTS (
      SELECT 1 FROM pg_policies p WHERE p.schemaname='jo' AND p.tablename=t.table_name
        AND p.permissive='PERMISSIVE' AND p.cmd IN ('ALL',operation.cmd)
        AND ('authenticated'=ANY(p.roles) OR 'public'=ANY(p.roles))
        AND concat_ws(' ',p.qual,p.with_check) NOT ILIKE '%current_user_has_role%Administrador%'
        AND NOT EXISTS (
          SELECT 1 FROM pg_policies guard WHERE guard.schemaname='jo' AND guard.tablename=t.table_name
            AND guard.permissive='RESTRICTIVE' AND guard.cmd IN ('ALL',operation.cmd)
            AND ('authenticated'=ANY(guard.roles) OR 'public'=ANY(guard.roles))
            AND concat_ws(' ',guard.qual,guard.with_check) ILIKE '%current_user_has_role%Administrador%'
        )
    )
  ) THEN failures:=array_append(failures,'politicas legacy permiten escritura fuera de Administrador'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='jo.references'::regclass AND conname='references_import_provenance_pair_check' AND convalidated)
     OR NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='jo.state_history'::regclass AND conname='state_history_import_batch_required_check' AND convalidated) THEN failures:=array_append(failures,'constraints de procedencia de importacion ausentes'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='jo.references'::regclass AND tgname='trg_028_guard_reference_import_metadata_insert' AND tgenabled<>'D' AND tgfoid='jo.guard_reference_import_metadata()'::regprocedure)
     OR NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='jo.references'::regclass AND tgname='trg_028_guard_reference_import_metadata_update' AND tgenabled<>'D' AND tgfoid='jo.guard_reference_import_metadata()'::regprocedure) THEN failures:=array_append(failures,'guard de procedencia/ledger ausente o tgfoid inesperado'); END IF;
  IF to_regprocedure('jo.commit_reference_import_row(bigint,integer,text,text,integer,jsonb,text,text,text)') IS NULL OR to_regprocedure('jo.register_reference_import(bigint,integer,integer,text)') IS NULL OR to_regprocedure('jo.record_import_issue(bigint,integer,text,text,integer,jsonb)') IS NULL THEN failures:=array_append(failures,'RPC atomica/idempotente ausente'); END IF;
  IF has_function_privilege('anon','jo.commit_reference_import_row(bigint,integer,text,text,integer,jsonb,text,text,text)','EXECUTE') OR NOT has_function_privilege('authenticated','jo.commit_reference_import_row(bigint,integer,text,text,integer,jsonb,text,text,text)','EXECUTE') THEN failures:=array_append(failures,'privilegios RPC atomica incorrectos'); END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl,acldefault('f',p.proowner))) acl WHERE p.oid='jo.register_reference_import(bigint,integer,integer,text)'::regprocedure AND acl.grantee=0 AND acl.privilege_type='EXECUTE') OR has_function_privilege('anon','jo.register_reference_import(bigint,integer,integer,text)','EXECUTE') OR has_function_privilege('authenticated','jo.register_reference_import(bigint,integer,integer,text)','EXECUTE') THEN failures:=array_append(failures,'auxiliar register_reference_import expuesta al cliente'); END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conrelid='jo.reference_codes'::regclass AND c.contype='u' AND (c.conname IN ('reference_codes_reference_id_code_type_key','reference_codes_code_type_code_key') OR pg_get_constraintdef(c.oid) IN ('UNIQUE (reference_id, code_type)','UNIQUE (code_type, code)'))) THEN failures:=array_append(failures,'persisten UNIQUE globales legacy en reference_codes'); END IF;
  IF EXISTS (SELECT 1 FROM unnest(ARRAY['reference_codes_one_active_type_per_reference_idx','reference_codes_one_active_owner_per_code_idx','md_code_one_active_assignment_idx','md_reference_one_active_code_idx','pt_code_one_active_assignment_idx','pt_reference_one_active_code_idx','references_import_row_unique_idx','state_history_import_once_idx']) AS x(index_name) LEFT JOIN pg_index i ON i.indexrelid=to_regclass('jo.'||x.index_name) WHERE i.indexrelid IS NULL OR NOT i.indisunique OR NOT i.indisvalid OR i.indpred IS NULL) THEN failures:=array_append(failures,'indices unicos/parciales requeridos ausentes o invalidos'); END IF;
  IF EXISTS (
    SELECT 1 FROM unnest(ARRAY['reference_codes_one_active_type_per_reference_idx','reference_codes_one_active_owner_per_code_idx']) x(index_name)
    JOIN pg_index i ON i.indexrelid=to_regclass('jo.'||x.index_name)
    WHERE pg_get_expr(i.indpred,i.indrelid)<>'COALESCE(active, true)'
       OR (x.index_name='reference_codes_one_active_type_per_reference_idx' AND (pg_get_indexdef(i.indexrelid,1,TRUE)<>'reference_id' OR pg_get_indexdef(i.indexrelid,2,TRUE)<>'code_type'))
       OR (x.index_name='reference_codes_one_active_owner_per_code_idx' AND (pg_get_indexdef(i.indexrelid,1,TRUE)<>'code_type' OR pg_get_indexdef(i.indexrelid,2,TRUE)<>'code'))
  ) THEN failures:=array_append(failures,'indices parciales legacy no filtran active ni cubren las claves esperadas'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc p WHERE p.oid='jo.run_code_projection_integrity_028()'::regprocedure AND p.prosecdef AND pg_get_functiondef(p.oid) ILIKE '%check_code_projection_key_028%') THEN failures:=array_append(failures,'guard diferido no esta acotado a claves afectadas'); END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p WHERE p.oid='jo.guard_legacy_code_mutation_028()'::regprocedure
      AND pg_get_functiondef(p.oid) ILIKE '%NEW.reference_id IS DISTINCT FROM OLD.reference_id%'
      AND pg_get_functiondef(p.oid) NOT ILIKE '%COALESCE(OLD.active%'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_proc p WHERE p.oid='jo.assign_existing_reference_code(integer,text,text,text)'::regprocedure
      AND pg_get_functiondef(p.oid) ILIKE '%INSERT INTO jo.reference_codes%'
      AND pg_get_functiondef(p.oid) NOT ILIKE '%UPDATE jo.reference_codes SET code=%'
  ) THEN failures:=array_append(failures,'historia inactiva legacy puede reciclarse/sobrescribirse'); END IF;
  IF EXISTS (
    SELECT 1 FROM unnest(ARRAY[
      'jo.guard_legacy_code_mutation_028()','jo.project_legacy_code_pool_028()',
      'jo.project_legacy_reference_code_028()','jo.check_code_projection_integrity_028()',
      'jo.check_code_projection_key_028(integer,integer)','jo.run_code_projection_integrity_028()',
      'jo.guard_reference_import_metadata()','jo.commit_reference_import_row(bigint,integer,text,text,integer,jsonb,text,text,text)',
      'jo.register_reference_import(bigint,integer,integer,text)'
    ]) AS expected(signature)
    LEFT JOIN pg_proc p ON p.oid=to_regprocedure(expected.signature)
    WHERE p.oid IS NULL OR NOT p.prosecdef OR COALESCE(array_to_string(p.proconfig,','),'') NOT LIKE '%search_path=%'
  ) THEN failures:=array_append(failures,'funcion critica ausente, sin SECURITY DEFINER o sin search_path fijado'); END IF;
  IF failures<>ARRAY[]::TEXT[] THEN RAISE EXCEPTION 'Verificacion 028 fallo: %',array_to_string(failures,'; '); END IF;
  UPDATE verify_028_status SET status='PASS',detail='Estructura, constraints y paridad de datos verificadas' WHERE validation='STRUCTURAL_AND_DATA';
  UPDATE verify_028_status SET status='PASS',detail='RPC, indices, tgfoid/funciones, guards diferidos por clave y paridad MD/PT verificados' WHERE validation='MD_PT_STATIC';
END;
$$;

-- Evidencia explicita: SS27 es un gate del importador resuelto exclusivamente
-- por resolve_import_collection. NOT_READY no constituye un fallo de 028.
SELECT CASE WHEN EXISTS(
  SELECT 1 FROM jo.collections c JOIN jo.collection_years cy ON cy.collection_id=c.id
  WHERE c.code='SS27' AND c.season='SS' AND c.year=2027 AND cy.year=2027
    AND c.active IS TRUE AND cy.is_hidden IS FALSE
) THEN 'READY' ELSE 'NOT_READY' END AS ss27_import_status,
to_regprocedure('jo.resolve_import_collection(text,text,integer)') IS NOT NULL AS gated_by_resolve_import_collection,
'028 no crea SS27 automaticamente' AS scope;
SELECT tc.table_name,kcu.column_name,ccu.table_name AS foreign_table
FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON kcu.constraint_name=tc.constraint_name AND kcu.constraint_schema=tc.constraint_schema
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name=tc.constraint_name AND ccu.constraint_schema=tc.constraint_schema
WHERE tc.constraint_schema='jo' AND tc.constraint_type='FOREIGN KEY' AND tc.table_name='state_history' AND kcu.column_name='import_batch_id';
SELECT p.proname,p.prosecdef,has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute,has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='jo' AND p.proname IN ('commit_reference_import_row','register_reference_import','record_import_issue','finish_reference_import') ORDER BY p.proname;
SELECT tablename,policyname,cmd,roles FROM pg_policies WHERE schemaname='jo' AND tablename IN ('md_codes','pt_codes','md_code_assignments','pt_code_assignments','import_batches','import_issues','import_batch_rows') ORDER BY tablename,policyname;
SELECT c.relname AS table_name,c.relrowsecurity AS rls_enabled,
  has_table_privilege('authenticated',c.oid,'INSERT') AS authenticated_insert,
  has_table_privilege('authenticated',c.oid,'UPDATE') AS authenticated_update,
  has_table_privilege('authenticated',c.oid,'DELETE') AS authenticated_delete
FROM pg_class c WHERE c.oid IN ('jo.code_pool'::regclass,'jo.reference_codes'::regclass)
ORDER BY c.relname;
SELECT tablename,policyname,permissive,cmd,roles,qual,with_check
FROM pg_policies WHERE schemaname='jo' AND tablename IN ('code_pool','reference_codes')
ORDER BY tablename,cmd,policyname;
SELECT conrelid::regclass AS table_name,conname,pg_get_constraintdef(oid) AS definition,convalidated
FROM pg_constraint WHERE (conrelid IN ('jo.references'::regclass,'jo.state_history'::regclass)
  AND conname IN ('references_import_provenance_pair_check','state_history_import_batch_required_check'))
  OR (conrelid='jo.reference_codes'::regclass AND contype='u')
ORDER BY conrelid::regclass::TEXT,conname;
SELECT t.tgrelid::regclass AS table_name,t.tgname,t.tgfoid::regprocedure AS function_name,
       t.tgenabled,t.tgdeferrable,t.tginitdeferred,pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t
WHERE NOT t.tgisinternal AND t.tgname LIKE 'trg_028_%'
ORDER BY t.tgrelid::regclass::TEXT,t.tgname;
SELECT p.oid::regprocedure AS function_name,p.prosecdef,p.proconfig,
       pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='jo' AND p.proname IN (
  'guard_legacy_code_mutation_028','project_legacy_code_pool_028',
  'project_legacy_reference_code_028','check_code_projection_integrity_028',
  'check_code_projection_key_028','run_code_projection_integrity_028',
  'guard_reference_import_metadata','commit_reference_import_row','register_reference_import'
)
ORDER BY p.proname;
SELECT i.indexrelid::regclass AS index_name,i.indisunique,i.indisvalid,
       pg_get_indexdef(i.indexrelid) AS definition
FROM pg_index i
WHERE i.indexrelid IN (
  'jo.md_code_one_active_assignment_idx'::regclass,'jo.md_reference_one_active_code_idx'::regclass,
  'jo.pt_code_one_active_assignment_idx'::regclass,'jo.pt_reference_one_active_code_idx'::regclass,
  'jo.reference_codes_one_active_type_per_reference_idx'::regclass,
  'jo.reference_codes_one_active_owner_per_code_idx'::regclass,
  'jo.references_import_row_unique_idx'::regclass,'jo.state_history_import_once_idx'::regclass
)
ORDER BY i.indexrelid::regclass::TEXT;

-- Prueba efectiva opcional de RLS. Solo se ejecuta cuando la conexion realmente
-- usa el rol JWT authenticated; evita falsos positivos del SQL Editor/owner.
DO $$
DECLARE target_id BIGINT; affected INTEGER; is_admin BOOLEAN; has_pool_fixture BOOLEAN; has_assignment_fixture BOOLEAN;
BEGIN
  IF current_user<>'authenticated' OR auth.uid() IS NULL THEN
    UPDATE verify_028_status SET status='NOT_VALIDATED',detail='NOT_VALIDATED: current_user no es authenticated o JWT ausente' WHERE validation='EFFECTIVE_RLS_AUTHENTICATED';
    RAISE NOTICE 'NOT_VALIDATED: prueba efectiva RLS legacy requiere sesion JWT con current_user=authenticated'; RETURN;
  END IF;
  is_admin:=COALESCE(jo.current_user_has_role('Administrador'),FALSE);
  SELECT EXISTS(SELECT 1 FROM jo.code_pool),EXISTS(SELECT 1 FROM jo.reference_codes)
    INTO has_pool_fixture,has_assignment_fixture;
  IF NOT has_pool_fixture OR NOT has_assignment_fixture THEN
    UPDATE verify_028_status SET status='NOT_VALIDATED',detail='NOT_VALIDATED: faltan filas visibles en code_pool o reference_codes para probar ambas politicas' WHERE validation='EFFECTIVE_RLS_AUTHENTICATED';
    RAISE NOTICE 'NOT_VALIDATED: RLS efectiva requiere fixtures visibles en code_pool y reference_codes'; RETURN;
  END IF;
  IF NOT is_admin THEN
    -- No depende de visibilidad SELECT: una politica de escritura amplia haria
    -- ROW_COUNT > 0 cuando exista al menos una fila.
    UPDATE jo.code_pool SET notes=notes;
    GET DIAGNOSTICS affected=ROW_COUNT;
    IF affected<>0 THEN RAISE EXCEPTION 'RLS permitio UPDATE de code_pool a usuario no Administrador'; END IF;
    UPDATE jo.reference_codes SET notes=notes;
    GET DIAGNOSTICS affected=ROW_COUNT;
    IF affected<>0 THEN RAISE EXCEPTION 'RLS permitio UPDATE de reference_codes a usuario no Administrador'; END IF;
    UPDATE verify_028_status SET status='PASS',detail='RLS efectiva validada con current_user=authenticated no Administrador' WHERE validation='EFFECTIVE_RLS_AUTHENTICATED';
    RETURN;
  END IF;
  SELECT id INTO target_id FROM jo.code_pool ORDER BY id LIMIT 1;
  IF target_id IS NOT NULL THEN
    UPDATE jo.code_pool SET notes=notes WHERE id=target_id;
    GET DIAGNOSTICS affected=ROW_COUNT;
    IF affected<>1 THEN RAISE EXCEPTION 'RLS impidio UPDATE de code_pool a Administrador'; END IF;
  END IF;
  SELECT id INTO target_id FROM jo.reference_codes ORDER BY id LIMIT 1;
  IF target_id IS NOT NULL THEN
    UPDATE jo.reference_codes SET notes=notes WHERE id=target_id;
    GET DIAGNOSTICS affected=ROW_COUNT;
    IF affected<>1 THEN RAISE EXCEPTION 'RLS impidio UPDATE de reference_codes a Administrador'; END IF;
  END IF;
  UPDATE verify_028_status SET status='PASS',detail='RLS efectiva validada con current_user=authenticated Administrador' WHERE validation='EFFECTIVE_RLS_AUTHENTICATED';
END;
$$;

-- Pruebas negativas transaccionales de los guards legacy. Cada intento se
-- revierte en su subtransaccion y el script completo termina en ROLLBACK.
DO $$
DECLARE pool_id INTEGER; assignment_id INTEGER;
BEGIN
  SELECT id INTO pool_id FROM jo.code_pool ORDER BY id LIMIT 1;
  IF pool_id IS NULL THEN
    RAISE NOTICE 'NOT_VALIDATED: update de identidad code/code_type sin fixture code_pool';
  ELSE
    BEGIN
      UPDATE jo.code_pool SET code=code||'__VERIFY_FORBIDDEN__' WHERE id=pool_id;
      RAISE EXCEPTION 'update de identidad code/code_type fue aceptado';
    EXCEPTION WHEN SQLSTATE '55000' THEN
      RAISE NOTICE 'OK: update de identidad code/code_type rechazado';
    END;
  END IF;
  SELECT id INTO assignment_id FROM jo.reference_codes WHERE COALESCE(active,TRUE) ORDER BY id LIMIT 1;
  IF assignment_id IS NULL THEN
    RAISE NOTICE 'NOT_VALIDATED: DELETE activo sin fixture reference_codes';
  ELSE
    BEGIN
      DELETE FROM jo.reference_codes WHERE id=assignment_id;
      RAISE EXCEPTION 'DELETE de asignacion activa fue aceptado';
    EXCEPTION WHEN SQLSTATE '55000' THEN
      RAISE NOTICE 'OK: DELETE de asignacion activa rechazado';
    END;
  END IF;
END;
$$;

-- Pruebas de invariantes de referencia: nombre '' permitido, NULL rechazado y
-- linea/sublinea opcionales pero pareja invalida rechazada.
DO $$
DECLARE collection_id INTEGER; ref_id INTEGER; official_line_id INTEGER; official_line_code TEXT; invalid_subline_id INTEGER;
BEGIN
  SELECT id INTO collection_id FROM jo.collections ORDER BY id LIMIT 1;
  IF collection_id IS NULL THEN RAISE NOTICE 'Pruebas de references omitidas: catalogo vacio'; RETURN; END IF;
  INSERT INTO jo.references(collection_id,reference_number,name,line_id,subline_id) VALUES(collection_id,'__VERIFY_028_EMPTY_NAME__','',NULL,NULL) RETURNING id INTO ref_id;
  DELETE FROM jo.references WHERE id=ref_id;
  BEGIN
    INSERT INTO jo.references(collection_id,reference_number,name) VALUES(collection_id,'__VERIFY_028_NULL_NAME__',NULL);
    RAISE EXCEPTION 'name NULL aceptado';
  EXCEPTION WHEN not_null_violation THEN RAISE NOTICE 'OK: name NULL rechazado'; END;
  SELECT id,code INTO official_line_id,official_line_code FROM jo.lines WHERE active AND code IS NOT NULL ORDER BY id LIMIT 1;
  IF official_line_id IS NOT NULL THEN
    INSERT INTO jo.references(collection_id,reference_number,name,line_id) VALUES(collection_id,'__VERIFY_028_LINE_ONLY__','',official_line_id) RETURNING id INTO ref_id;
    IF (SELECT tipo_ref FROM jo.references WHERE id=ref_id) IS DISTINCT FROM official_line_code THEN RAISE EXCEPTION 'tipo_ref no derivado'; END IF;
    DELETE FROM jo.references WHERE id=ref_id;
    SELECT id INTO invalid_subline_id FROM jo.sublines s WHERE NOT EXISTS (SELECT 1 FROM jo.line_sublines ls WHERE ls.line_id=official_line_id AND ls.subline_id=s.id AND ls.active) ORDER BY id LIMIT 1;
    IF invalid_subline_id IS NOT NULL THEN
      BEGIN
        INSERT INTO jo.references(collection_id,reference_number,name,line_id,subline_id) VALUES(collection_id,'__VERIFY_028_BAD_PAIR__','',official_line_id,invalid_subline_id);
        RAISE EXCEPTION 'pareja invalida aceptada';
      EXCEPTION WHEN check_violation THEN RAISE NOTICE 'OK: pareja invalida rechazada'; END;
    END IF;
  END IF;
END;
$$;

-- GATE OBLIGATORIO DE STAGING: esta seccion debe ejecutarse mediante la API con
-- un JWT de un usuario activo Administrador (current_user=authenticated). En SQL
-- Editor/owner o sin JWT NO falla toda la verificacion, pero devuelve
-- FUNCTIONAL_RPC_ADMIN_JWT=NOT_VALIDATED: eso NO constituye aprobacion de staging.
-- Con JWT valida reintentos, contadores, cierre, atomicidad, procedencia y, si
-- hay fixtures DISPONIBLES, asignacion MD/PT. Todo termina en ROLLBACK.
DO $$
DECLARE batch_id BIGINT; issue_1 BIGINT; issue_2 BIGINT; result_1 JSONB; result_2 JSONB;
        missing_1 JSONB; missing_2 JSONB; invalid_1 JSONB;
        c_code TEXT; c_season TEXT; c_year INTEGER; temp_number TEXT; imported_ref INTEGER;
        missing_ref INTEGER; invalid_ref INTEGER; rogue_ref INTEGER; available_md TEXT; available_pt TEXT;
        old_assignment BIGINT; new_assignment BIGINT;
BEGIN
  IF current_user<>'authenticated' OR auth.uid() IS NULL
     OR NOT COALESCE(jo.current_user_has_role('Administrador'),FALSE)
     OR NOT EXISTS (SELECT 1 FROM verify_028_status WHERE validation='EFFECTIVE_RLS_AUTHENTICATED' AND status='PASS') THEN
    UPDATE verify_028_status SET status='NOT_VALIDATED',
      detail='NOT_VALIDATED: requiere current_user=authenticated, JWT Administrador y prueba RLS efectiva PASS'
      WHERE validation='FUNCTIONAL_RPC_ADMIN_JWT';
    RAISE NOTICE 'NOT_VALIDATED: gate funcional RPC requiere current_user=authenticated, JWT Administrador y EFFECTIVE_RLS_AUTHENTICATED=PASS'; RETURN;
  END IF;
  SELECT c.code,c.season,cy.year INTO c_code,c_season,c_year
  FROM jo.collections c JOIN jo.collection_years cy ON cy.collection_id=c.id
  WHERE c.active IS TRUE AND cy.is_hidden IS FALSE AND c.year=cy.year
    AND right(c.code,2)=right(cy.year::TEXT,2) ORDER BY c.id,cy.year LIMIT 1;
  IF c_code IS NULL THEN
    UPDATE verify_028_status SET detail='Pendiente: JWT valido pero no hay coleccion importable de prueba' WHERE validation='FUNCTIONAL_RPC_ADMIN_JWT';
    RAISE NOTICE 'NOT_VALIDATED: gate funcional RPC sin coleccion importable'; RETURN;
  END IF;
  SELECT cp.code INTO available_md FROM jo.code_pool cp
   WHERE cp.code_type='MD'::jo.reference_code_type AND cp.status='DISPONIBLE'
     AND NOT EXISTS (SELECT 1 FROM jo.reference_codes rc WHERE rc.code_type=cp.code_type AND rc.code=cp.code AND COALESCE(rc.active,TRUE))
   ORDER BY cp.id LIMIT 1;
  SELECT cp.code INTO available_pt FROM jo.code_pool cp
   WHERE cp.code_type='PT'::jo.reference_code_type AND cp.status='DISPONIBLE'
     AND NOT EXISTS (SELECT 1 FROM jo.reference_codes rc WHERE rc.code_type=cp.code_type AND rc.code=cp.code AND COALESCE(rc.active,TRUE))
   ORDER BY cp.id LIMIT 1;
  temp_number := '__VERIFY_028_RPC_'||txid_current()::TEXT;
  batch_id := jo.begin_reference_import('__verify_028__.csv',4,jsonb_build_object('verify',TRUE));
  INSERT INTO jo.references(collection_id,year,reference_number,name)
  SELECT c.id,c_year,temp_number||'_NO_LEDGER','' FROM jo.collections c WHERE c.code=c_code
  RETURNING id INTO rogue_ref;
  BEGIN
    UPDATE jo.references SET import_batch_id=batch_id,import_source_row=99 WHERE id=rogue_ref;
    RAISE EXCEPTION 'procedencia arbitraria sin ledger fue aceptada';
  EXCEPTION WHEN foreign_key_violation THEN RAISE NOTICE 'OK: procedencia sin ledger rechazada'; END;
  DELETE FROM jo.references WHERE id=rogue_ref;
  issue_1 := jo.record_import_issue(batch_id,1,'VERIFY_INVALID','fila de prueba',NULL,'{}'::JSONB);
  issue_2 := jo.record_import_issue(batch_id,1,'VERIFY_INVALID','reintento',NULL,'{}'::JSONB);
  IF issue_1<>issue_2 OR (SELECT invalid_rows FROM jo.import_batches WHERE id=batch_id)<>1 THEN RAISE EXCEPTION 'record_import_issue no es idempotente'; END IF;
  result_1 := jo.commit_reference_import_row(batch_id,2,c_code,c_season,c_year,jsonb_build_object('reference_number',temp_number,'name',''),'concepto',NULL,NULL);
  result_2 := jo.commit_reference_import_row(batch_id,2,c_code,c_season,c_year,jsonb_build_object('reference_number',temp_number,'name',''),'concepto',NULL,NULL);
  imported_ref := (result_1->>'reference_id')::INTEGER;
  IF result_1->>'outcome'<>'EXITOSO' OR result_2->>'outcome'<>'EXITOSO' OR COALESCE((result_2->>'idempotent')::BOOLEAN,FALSE) IS NOT TRUE THEN RAISE EXCEPTION 'commit_reference_import_row no es idempotente'; END IF;
  IF (SELECT successful_rows FROM jo.import_batches WHERE id=batch_id)<>1 OR
     (SELECT count(*) FROM jo.state_history WHERE reference_id=imported_ref AND event='IMPORTACION_CSV' AND import_batch_id=batch_id)<>1 THEN RAISE EXCEPTION 'contador/historia de importacion duplicado o sin vinculo'; END IF;

  -- F-001/F-002: proceso ausente conserva referencia, codigos existentes y
  -- procedencia, pero omite por completo el estado de proceso.
  missing_1 := jo.commit_reference_import_row(batch_id,3,c_code,c_season,c_year,
    jsonb_build_object('reference_number',temp_number||'_NO_PROCESS','name',''),NULL,available_md,available_pt);
  missing_ref := (missing_1->>'reference_id')::INTEGER;
  IF missing_1->>'outcome'<>'INVALIDO' OR missing_ref IS NULL
     OR COALESCE((missing_1->>'reference_created')::BOOLEAN,FALSE) IS NOT TRUE
     OR COALESCE((missing_1->>'process_omitted')::BOOLEAN,FALSE) IS NOT TRUE THEN
    RAISE EXCEPTION 'proceso ausente no reporto referencia creada/proceso omitido';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM jo.references WHERE id=missing_ref AND import_batch_id=batch_id AND import_source_row=3) THEN RAISE EXCEPTION 'referencia sin proceso no conservo procedencia'; END IF;
  IF EXISTS (SELECT 1 FROM jo.reference_states WHERE reference_id=missing_ref)
     OR EXISTS (SELECT 1 FROM jo.state_history WHERE reference_id=missing_ref AND event='IMPORTACION_CSV') THEN RAISE EXCEPTION 'proceso ausente creo estado/historia'; END IF;
  IF (SELECT count(*) FROM jo.import_issues WHERE batch_id=batch_id AND source_row=3 AND reference_id=missing_ref AND issue_code='PROCESO_INVALIDO_O_AUSENTE')<>1 THEN RAISE EXCEPTION 'incidencia de proceso ausente no es unica o no esta vinculada'; END IF;
  IF NOT EXISTS (SELECT 1 FROM jo.import_batch_rows WHERE batch_id=batch_id AND source_row=3 AND outcome='INVALIDO' AND reference_id=missing_ref AND issue_id=(missing_1->>'issue_id')::BIGINT) THEN RAISE EXCEPTION 'ledger de proceso ausente incorrecto'; END IF;
  IF available_md IS NOT NULL AND NOT EXISTS (SELECT 1 FROM jo.reference_codes WHERE reference_id=missing_ref AND code_type='MD'::jo.reference_code_type AND code=available_md AND COALESCE(active,TRUE)) THEN RAISE EXCEPTION 'codigo MD valido no persistio'; END IF;
  IF available_pt IS NOT NULL AND NOT EXISTS (SELECT 1 FROM jo.reference_codes WHERE reference_id=missing_ref AND code_type='PT'::jo.reference_code_type AND code=available_pt AND COALESCE(active,TRUE)) THEN RAISE EXCEPTION 'codigo PT valido no persistio'; END IF;
  IF available_md IS NOT NULL THEN UPDATE verify_028_status SET status='PASS',detail='Asignacion MD existente validada en runtime' WHERE validation='RUNTIME_ASSIGNMENT_MD';
  ELSE UPDATE verify_028_status SET detail='NOT_VALIDATED: no existe codigo MD DISPONIBLE de fixture; validacion estatica si fue ejecutada' WHERE validation='RUNTIME_ASSIGNMENT_MD'; END IF;
  IF available_pt IS NOT NULL THEN UPDATE verify_028_status SET status='PASS',detail='Asignacion PT existente validada en runtime' WHERE validation='RUNTIME_ASSIGNMENT_PT';
  ELSE UPDATE verify_028_status SET detail='NOT_VALIDATED: no existe codigo PT DISPONIBLE de fixture; validacion estatica si fue ejecutada' WHERE validation='RUNTIME_ASSIGNMENT_PT'; END IF;
  missing_2 := jo.commit_reference_import_row(batch_id,3,c_code,c_season,c_year,
    jsonb_build_object('reference_number',temp_number||'_NO_PROCESS','name',''),NULL,available_md,available_pt);
  IF COALESCE((missing_2->>'idempotent')::BOOLEAN,FALSE) IS NOT TRUE
     OR COALESCE((missing_2->>'reference_created')::BOOLEAN,FALSE) IS NOT TRUE
     OR COALESCE((missing_2->>'process_omitted')::BOOLEAN,FALSE) IS NOT TRUE
     OR (missing_2->>'reference_id')::INTEGER<>missing_ref
     OR (SELECT count(*) FROM jo.import_issues WHERE batch_id=batch_id AND source_row=3)<>1 THEN RAISE EXCEPTION 'reintento de proceso ausente no fue idempotente'; END IF;

  -- F-001: A -> liberar -> B para ambos tipos. La fila inactiva de A debe
  -- permanecer y B debe recibir una fila distinta con el mismo codigo.
  IF available_md IS NOT NULL THEN
    SELECT id INTO old_assignment FROM jo.reference_codes WHERE reference_id=missing_ref AND code_type='MD'::jo.reference_code_type AND code=available_md AND COALESCE(active,TRUE);
    IF NOT jo.unassign_reference_code(missing_ref,'MD','verify reuse') THEN RAISE EXCEPTION 'no se libero MD de A'; END IF;
    new_assignment:=jo.assign_existing_reference_code(imported_ref,'MD',available_md,'verify reuse');
    IF new_assignment=old_assignment OR NOT EXISTS (SELECT 1 FROM jo.reference_codes WHERE id=old_assignment AND active IS FALSE)
       OR NOT EXISTS (SELECT 1 FROM jo.reference_codes WHERE id=new_assignment AND reference_id=imported_ref AND code=available_md AND COALESCE(active,TRUE)) THEN
      RAISE EXCEPTION 'reutilizacion MD no preservo historia inactiva A -> B';
    END IF;
    UPDATE verify_028_status SET status='PASS',detail='MD validado A -> liberar -> B preservando historia' WHERE validation='RUNTIME_ASSIGNMENT_MD';
  END IF;
  IF available_pt IS NOT NULL THEN
    SELECT id INTO old_assignment FROM jo.reference_codes WHERE reference_id=missing_ref AND code_type='PT'::jo.reference_code_type AND code=available_pt AND COALESCE(active,TRUE);
    IF NOT jo.unassign_reference_code(missing_ref,'PT','verify reuse') THEN RAISE EXCEPTION 'no se libero PT de A'; END IF;
    new_assignment:=jo.assign_existing_reference_code(imported_ref,'PT',available_pt,'verify reuse');
    IF new_assignment=old_assignment OR NOT EXISTS (SELECT 1 FROM jo.reference_codes WHERE id=old_assignment AND active IS FALSE)
       OR NOT EXISTS (SELECT 1 FROM jo.reference_codes WHERE id=new_assignment AND reference_id=imported_ref AND code=available_pt AND COALESCE(active,TRUE)) THEN
      RAISE EXCEPTION 'reutilizacion PT no preservo historia inactiva A -> B';
    END IF;
    UPDATE verify_028_status SET status='PASS',detail='PT validado A -> liberar -> B preservando historia' WHERE validation='RUNTIME_ASSIGNMENT_PT';
  END IF;

  invalid_1 := jo.commit_reference_import_row(batch_id,4,c_code,c_season,c_year,
    jsonb_build_object('reference_number',temp_number||'_BAD_PROCESS','name',''),'__INVALID_PROCESS__',NULL,NULL);
  invalid_ref := (invalid_1->>'reference_id')::INTEGER;
  IF invalid_1->>'outcome'<>'INVALIDO' OR invalid_ref IS NULL
     OR EXISTS (SELECT 1 FROM jo.reference_states WHERE reference_id=invalid_ref)
     OR (SELECT count(*) FROM jo.import_issues WHERE batch_id=batch_id AND source_row=4 AND reference_id=invalid_ref AND issue_code='PROCESO_INVALIDO_O_AUSENTE')<>1 THEN RAISE EXCEPTION 'proceso invalido no conservo referencia sin inventar estado'; END IF;
  IF (SELECT successful_rows FROM jo.import_batches WHERE id=batch_id)<>1
     OR (SELECT invalid_rows FROM jo.import_batches WHERE id=batch_id)<>3 THEN RAISE EXCEPTION 'contadores incorrectos para procesos ausente/invalido'; END IF;
  PERFORM jo.finish_reference_import(batch_id,FALSE);
  IF (SELECT status FROM jo.import_batches WHERE id=batch_id)<>'COMPLETADO_CON_INCIDENCIAS' THEN RAISE EXCEPTION 'finish_reference_import cerro con estado incorrecto'; END IF;
  BEGIN
    PERFORM jo.record_import_issue(batch_id,3,'VERIFY_LATE','no permitido',NULL,NULL);
    RAISE EXCEPTION 'record_import_issue permitio lote cerrado';
  EXCEPTION WHEN SQLSTATE '55000' THEN RAISE NOTICE 'OK: incidencia posterior al cierre rechazada'; END;
  IF current_user<>'authenticated' OR NOT EXISTS (
    SELECT 1 FROM verify_028_status WHERE validation='EFFECTIVE_RLS_AUTHENTICATED' AND status='PASS'
  ) THEN RAISE EXCEPTION 'Gate funcional no puede aprobar sin current_user=authenticated y RLS efectiva PASS'; END IF;
  UPDATE verify_028_status SET status='PASS',detail='Gate funcional completo con current_user=authenticated, JWT Administrador y RLS efectiva validada' WHERE validation='FUNCTIONAL_RPC_ADMIN_JWT';
END;
$$;

SELECT validation,status,detail,
  CASE WHEN validation='FUNCTIONAL_RPC_ADMIN_JWT' THEN status='PASS' ELSE NULL END AS staging_gate_satisfied
FROM verify_028_status
ORDER BY validation;

ROLLBACK;
