-- Retirada operativa SEGURA de la superficie 028; no es un rollback de datos.
-- Conserva tablas, columnas, historial y catalogos. Aborta si 028 ya recibio
-- importaciones o escrituras no representadas en legacy: primero se requiere
-- reconciliacion manual. En 028 legacy nunca dejo de ser la autoridad escribible.
BEGIN;
SET LOCAL search_path = jo, public;

DO $$
DECLARE reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- La retirada no debe reintroducir los bloqueadores F-001/F-002. Los indices
  -- parciales y el ledger se conservan como integridad/historia durable.
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    WHERE c.conrelid='jo.reference_codes'::regclass AND c.contype='u'
      AND (c.conname IN ('reference_codes_reference_id_code_type_key','reference_codes_code_type_code_key')
           OR pg_get_constraintdef(c.oid) IN ('UNIQUE (reference_id, code_type)','UNIQUE (code_type, code)'))
  ) THEN
    reasons := array_append(reasons,'persisten UNIQUE globales legacy; reutilizacion historica MD/PT bloqueada');
  END IF;
  IF EXISTS (
    SELECT 1
    FROM unnest(ARRAY['reference_codes_one_active_type_per_reference_idx','reference_codes_one_active_owner_per_code_idx']) x(index_name)
    LEFT JOIN pg_index i ON i.indexrelid=to_regclass('jo.'||x.index_name)
    WHERE i.indexrelid IS NULL OR NOT i.indisunique OR NOT i.indisvalid OR i.indpred IS NULL
      OR pg_get_expr(i.indpred,i.indrelid)<>'COALESCE(active, true)'
      OR (x.index_name='reference_codes_one_active_type_per_reference_idx'
          AND (pg_get_indexdef(i.indexrelid,1,TRUE)<>'reference_id' OR pg_get_indexdef(i.indexrelid,2,TRUE)<>'code_type'))
      OR (x.index_name='reference_codes_one_active_owner_per_code_idx'
          AND (pg_get_indexdef(i.indexrelid,1,TRUE)<>'code_type' OR pg_get_indexdef(i.indexrelid,2,TRUE)<>'code'))
  ) OR EXISTS (
    SELECT reference_id,code_type FROM jo.reference_codes WHERE COALESCE(active,TRUE)
    GROUP BY reference_id,code_type HAVING count(*)>1
  ) OR EXISTS (
    SELECT code_type,code FROM jo.reference_codes WHERE COALESCE(active,TRUE)
    GROUP BY code_type,code HAVING count(*)>1
  ) THEN
    reasons := array_append(reasons,'indices parciales/reutilizacion activa de reference_codes no son integros');
  END IF;
  IF EXISTS (
    SELECT 1 FROM jo.references r LEFT JOIN jo.import_batch_rows br
      ON br.batch_id=r.import_batch_id AND br.source_row=r.import_source_row AND br.reference_id=r.id
    WHERE r.import_batch_id IS NOT NULL AND br.id IS NULL
  ) OR EXISTS (
    SELECT 1 FROM jo.state_history h JOIN jo.references r ON r.id=h.reference_id
    LEFT JOIN jo.import_batch_rows br ON br.batch_id=h.import_batch_id AND br.source_row=r.import_source_row
      AND br.reference_id=r.id AND br.outcome='EXITOSO'
    WHERE h.event='IMPORTACION_CSV' AND br.id IS NULL
  ) OR EXISTS (
    SELECT 1 FROM jo.import_issues i LEFT JOIN jo.import_batch_rows br
      ON br.batch_id=i.batch_id AND br.source_row=i.source_row AND br.issue_id=i.id AND br.outcome='INVALIDO'
    WHERE i.source_row IS NULL OR br.id IS NULL
  ) OR EXISTS (
    SELECT 1 FROM jo.import_batches b LEFT JOIN LATERAL (
      SELECT count(*) FILTER(WHERE outcome='EXITOSO') ok,count(*) FILTER(WHERE outcome='INVALIDO') bad
      FROM jo.import_batch_rows br WHERE br.batch_id=b.id
    ) x ON TRUE WHERE b.successful_rows<>x.ok OR b.invalid_rows<>x.bad
  ) THEN
    reasons := array_append(reasons,'ledger reconstruido/procedencia/contadores no son coherentes');
  END IF;
  IF EXISTS (SELECT 1 FROM jo.import_batches) OR
     EXISTS (SELECT 1 FROM jo.references WHERE import_batch_id IS NOT NULL) OR
     EXISTS (SELECT 1 FROM jo.state_history WHERE import_batch_id IS NOT NULL) THEN
    reasons := array_append(reasons,'existen importaciones 028');
  END IF;
  IF EXISTS (SELECT 1 FROM jo.md_code_assignments WHERE legacy_reference_code_id IS NULL)
     OR EXISTS (SELECT 1 FROM jo.pt_code_assignments WHERE legacy_reference_code_id IS NULL) THEN
    reasons := array_append(reasons,'existen asignaciones sin contraparte legacy');
  END IF;
  -- Reconciliacion completa antes de retirar los triggers: conteos, identidad,
  -- pool, titular, active y status deben coincidir en ambos sentidos.
  IF (SELECT count(*) FROM jo.code_pool WHERE code_type='MD'::jo.reference_code_type)
       <> (SELECT count(*) FROM jo.md_codes WHERE legacy_pool_id IS NOT NULL)
     OR (SELECT count(*) FROM jo.code_pool WHERE code_type='PT'::jo.reference_code_type)
       <> (SELECT count(*) FROM jo.pt_codes WHERE legacy_pool_id IS NOT NULL)
     OR (SELECT count(*) FROM jo.reference_codes WHERE code_type='MD'::jo.reference_code_type)
       <> (SELECT count(*) FROM jo.md_code_assignments WHERE legacy_reference_code_id IS NOT NULL)
     OR (SELECT count(*) FROM jo.reference_codes WHERE code_type='PT'::jo.reference_code_type)
       <> (SELECT count(*) FROM jo.pt_code_assignments WHERE legacy_reference_code_id IS NOT NULL) THEN
    reasons := array_append(reasons,'conteos legacy/proyeccion MD/PT no coinciden');
  END IF;
  IF EXISTS (
    SELECT 1 FROM jo.code_pool cp LEFT JOIN jo.md_codes c ON c.legacy_pool_id=cp.id
    WHERE cp.code_type='MD'::jo.reference_code_type AND
      (c.id IS NULL OR c.code IS DISTINCT FROM cp.code OR c.status IS DISTINCT FROM cp.status)
  ) OR EXISTS (
    SELECT 1 FROM jo.md_codes c LEFT JOIN jo.code_pool cp ON cp.id=c.legacy_pool_id
    WHERE cp.id IS NULL OR cp.code_type<>'MD'::jo.reference_code_type
       OR cp.code IS DISTINCT FROM c.code OR cp.status IS DISTINCT FROM c.status
  ) OR EXISTS (
    SELECT 1 FROM jo.code_pool cp LEFT JOIN jo.pt_codes c ON c.legacy_pool_id=cp.id
    WHERE cp.code_type='PT'::jo.reference_code_type AND
      (c.id IS NULL OR c.code IS DISTINCT FROM cp.code OR c.status IS DISTINCT FROM cp.status)
  ) OR EXISTS (
    SELECT 1 FROM jo.pt_codes c LEFT JOIN jo.code_pool cp ON cp.id=c.legacy_pool_id
    WHERE cp.id IS NULL OR cp.code_type<>'PT'::jo.reference_code_type
       OR cp.code IS DISTINCT FROM c.code OR cp.status IS DISTINCT FROM c.status
  ) THEN reasons := array_append(reasons,'identidad code/code_type o status de catalogos no coincide'); END IF;
  IF EXISTS (
    SELECT 1 FROM jo.reference_codes rc
    LEFT JOIN jo.md_code_assignments a ON a.legacy_reference_code_id=rc.id
    LEFT JOIN jo.md_codes c ON c.id=a.code_id
    WHERE rc.code_type='MD'::jo.reference_code_type AND
      (a.id IS NULL OR a.reference_id IS DISTINCT FROM rc.reference_id
       OR c.code IS DISTINCT FROM rc.code OR c.legacy_pool_id IS DISTINCT FROM rc.pool_code_id
       OR a.active IS DISTINCT FROM COALESCE(rc.active,TRUE))
  ) OR EXISTS (
    SELECT 1 FROM jo.md_code_assignments a
    LEFT JOIN jo.reference_codes rc ON rc.id=a.legacy_reference_code_id
    LEFT JOIN jo.md_codes c ON c.id=a.code_id
    WHERE rc.id IS NULL OR rc.code_type<>'MD'::jo.reference_code_type
       OR a.reference_id IS DISTINCT FROM rc.reference_id OR c.code IS DISTINCT FROM rc.code
       OR c.legacy_pool_id IS DISTINCT FROM rc.pool_code_id
       OR a.active IS DISTINCT FROM COALESCE(rc.active,TRUE)
  ) OR EXISTS (
    SELECT 1 FROM jo.reference_codes rc
    LEFT JOIN jo.pt_code_assignments a ON a.legacy_reference_code_id=rc.id
    LEFT JOIN jo.pt_codes c ON c.id=a.code_id
    WHERE rc.code_type='PT'::jo.reference_code_type AND
      (a.id IS NULL OR a.reference_id IS DISTINCT FROM rc.reference_id
       OR c.code IS DISTINCT FROM rc.code OR c.legacy_pool_id IS DISTINCT FROM rc.pool_code_id
       OR a.active IS DISTINCT FROM COALESCE(rc.active,TRUE))
  ) OR EXISTS (
    SELECT 1 FROM jo.pt_code_assignments a
    LEFT JOIN jo.reference_codes rc ON rc.id=a.legacy_reference_code_id
    LEFT JOIN jo.pt_codes c ON c.id=a.code_id
    WHERE rc.id IS NULL OR rc.code_type<>'PT'::jo.reference_code_type
       OR a.reference_id IS DISTINCT FROM rc.reference_id OR c.code IS DISTINCT FROM rc.code
       OR c.legacy_pool_id IS DISTINCT FROM rc.pool_code_id
       OR a.active IS DISTINCT FROM COALESCE(rc.active,TRUE)
  ) THEN reasons := array_append(reasons,'pool_code_id/reference_id/active/titulares no coinciden'); END IF;
  IF EXISTS (
    SELECT 1 FROM jo.code_pool cp
    WHERE (cp.status='ASIGNADO') IS DISTINCT FROM EXISTS (
      SELECT 1 FROM jo.reference_codes rc WHERE rc.pool_code_id=cp.id
        AND rc.code=cp.code AND rc.code_type=cp.code_type AND COALESCE(rc.active,TRUE)
    )
  ) OR EXISTS (
    SELECT 1 FROM jo.md_codes c WHERE (c.status='ASIGNADO') IS DISTINCT FROM
      EXISTS (SELECT 1 FROM jo.md_code_assignments a WHERE a.code_id=c.id AND a.active)
  ) OR EXISTS (
    SELECT 1 FROM jo.pt_codes c WHERE (c.status='ASIGNADO') IS DISTINCT FROM
      EXISTS (SELECT 1 FROM jo.pt_code_assignments a WHERE a.code_id=c.id AND a.active)
  ) THEN reasons := array_append(reasons,'status y titulares activos no coinciden'); END IF;
  IF reasons<>ARRAY[]::TEXT[] THEN
    RAISE EXCEPTION 'Retirada 028 abortada: %. Reconciliar y documentar manualmente antes de reintentar.',array_to_string(reasons,'; ') USING ERRCODE='55000';
  END IF;
END;
$$;

-- Tras el preflight se retira la proyeccion automatica. No se reactiva ninguna
-- autoridad: al quedar las proyecciones potencialmente obsoletas, toda escritura
-- cliente sobre legacy y MD/PT se revoca hasta una reconciliacion/migracion nueva.
DROP TRIGGER IF EXISTS trg_028_global_status_state_machine ON jo.references;
DROP TRIGGER IF EXISTS trg_028_guard_reference_import_metadata_insert ON jo.references;
DROP TRIGGER IF EXISTS trg_028_guard_reference_import_metadata_update ON jo.references;
DROP TRIGGER IF EXISTS trg_028_assert_code_pool_integrity ON jo.code_pool;
DROP TRIGGER IF EXISTS trg_028_assert_reference_codes_integrity ON jo.reference_codes;
DROP TRIGGER IF EXISTS trg_028_guard_code_pool_mutation ON jo.code_pool;
DROP TRIGGER IF EXISTS trg_028_guard_reference_code_mutation ON jo.reference_codes;
DROP TRIGGER IF EXISTS trg_028_project_code_pool ON jo.code_pool;
DROP TRIGGER IF EXISTS trg_028_project_reference_codes ON jo.reference_codes;

REVOKE INSERT,UPDATE,DELETE ON jo.code_pool,jo.reference_codes,
  jo.md_codes,jo.pt_codes,jo.md_code_assignments,jo.pt_code_assignments FROM anon,authenticated;
COMMENT ON TABLE jo.md_codes IS 'OBSOLETA TRAS RETIRADA 028: snapshot no sincronizado; no usar como autoridad ni habilitar escritura sin reconciliacion.';
COMMENT ON TABLE jo.pt_codes IS 'OBSOLETA TRAS RETIRADA 028: snapshot no sincronizado; no usar como autoridad ni habilitar escritura sin reconciliacion.';
COMMENT ON TABLE jo.md_code_assignments IS 'OBSOLETA TRAS RETIRADA 028: snapshot no sincronizado; escritura revocada.';
COMMENT ON TABLE jo.pt_code_assignments IS 'OBSOLETA TRAS RETIRADA 028: snapshot no sincronizado; escritura revocada.';
DO $$ BEGIN RAISE NOTICE 'RETIRED_STALE_PROJECTIONS: retirada funcional completada; legacy y proyecciones quedan sin escritura cliente'; END $$;

DO $$
DECLARE signature TEXT;
BEGIN
  FOREACH signature IN ARRAY ARRAY[
    'jo.admin_create_reference_code(text,text,text,text)','jo.assign_existing_reference_code(integer,text,text,text)',
    'jo.unassign_reference_code(integer,text,text)','jo.resolve_import_collection(text,text,integer)',
    'jo.begin_reference_import(text,integer,jsonb)','jo.record_import_issue(bigint,integer,text,text,integer,jsonb)',
    'jo.register_reference_import(bigint,integer,integer,text)',
    'jo.commit_reference_import_row(bigint,integer,text,text,integer,jsonb,text,text,text)',
    'jo.finish_reference_import(bigint,boolean)'
  ] LOOP EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated',signature); END LOOP;
END;
$$;

COMMIT;

-- Resultado deliberado: retirada funcional, NO rollback completo. Se conservan
-- tambien los constraints de procedencia (par de columnas y lote obligatorio en
-- IMPORTACION_CSV), el ledger y los indices unicos parciales de reference_codes,
-- ademas de la seguridad RLS legacy; debilitarlos no es una retirada segura. Las
-- proyecciones quedan marcadas OBSOLETAS y legacy sin escritura de
-- cliente. Para revertir DDL/datos o reabrir escritura se requiere reconciliacion
-- bidireccional, respaldo y una migracion explicita aparte.
