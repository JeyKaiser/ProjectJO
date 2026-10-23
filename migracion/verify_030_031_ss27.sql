-- SOLO para revisor en clon SS27 aislado despues de 030 -> 031 -> 032.
-- READ ONLY. No ejecutar sobre proyecto real. No sustituye pruebas JWT/RLS.
-- NO-RUN en esta entrega. Identidad del clon y JWT/rollback son gates HUMANOS
-- independientes; el catálogo local no demuestra conexión al destino correcto.
-- DO solo lee catálogos y aborta ante incumplimiento; NO escribe datos.
-- El resultado NO certifica JWT/RLS/rollback/concurrencia ni identidad del clon.
SELECT 'CATALOG_PREFLIGHT_ONLY_NOT_RUNTIME_CERTIFICATION' AS validation_scope,
  'JWT/RLS/rollback/concurrencia NOT_VALIDATED; ejecutar gates manuales en clon aislado' AS runtime_gates;
DO $verify$
DECLARE expected record; fn record;
BEGIN
  IF to_regclass('jo.references') IS NULL OR to_regclass('jo.tipo_prendas') IS NULL
    OR to_regclass('jo.reference_embroidery') IS NULL
    OR to_regclass('jo.montage_mannequin') IS NULL
    OR to_regclass('jo.references_referents') IS NULL
    OR to_regclass('jo.pilot_fork_state') IS NULL
    OR to_regclass('jo.pilot_cancel_episodes') IS NULL
    OR to_regclass('jo.pilot_reference_create_requests') IS NULL
    OR to_regprocedure('jo.sync_reference_global_status_to_state_machine()') IS NULL
    OR to_regprocedure('jo.sync_and_validate_reference_line_subline()') IS NULL
    OR to_regprocedure('jo.guard_reference_catalog_status_030()') IS NULL
    OR to_regprocedure('jo.current_user_has_role(text)') IS NULL THEN
    RAISE EXCEPTION 'verify: faltan precondiciones 028/030 o destinos atomicos';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM jo.collections WHERE code='SS27' AND year=2027)
    OR NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid='jo.references'::regclass
      AND attname='tipo_prenda_id' AND atttypid='integer'::regtype AND NOT attisdropped)
    OR NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid='jo.references'::regclass
      AND attname='reference_type' AND NOT attisdropped) THEN
    RAISE EXCEPTION 'verify: SS27/2027, tipo_prenda_id int4 o enum legacy ausente';
  END IF;
  FOR fn IN SELECT p.oid,p.proname,p.prosecdef,p.proconfig,pg_get_userbyid(p.proowner) AS owner_name
    FROM pg_proc p WHERE p.oid IN (
      to_regprocedure('jo.pilot_create_reference_031(jsonb,uuid)'),
      to_regprocedure('jo.pilot_create_reference_032(jsonb,uuid)'),
      to_regprocedure('jo.pilot_workflow_event_031(integer,text,uuid,bigint,jsonb)'),
      to_regprocedure('jo.snapshot_pilot_global_cancel_031()'),
      to_regprocedure('jo.guard_reference_catalog_status_030()')) LOOP
    IF NOT fn.prosecdef OR fn.owner_name IS DISTINCT FROM
       (SELECT pg_get_userbyid(c.relowner) FROM pg_class c WHERE c.oid='jo.references'::regclass)
       OR fn.proconfig IS NULL OR NOT ('search_path='=ANY(fn.proconfig)) THEN
      RAISE EXCEPTION 'verify: owner/SECURITY DEFINER/search_path inseguro para %',fn.proname;
    END IF;
  END LOOP;
  IF (SELECT count(*) FROM pg_proc p WHERE p.oid IN (
      to_regprocedure('jo.pilot_create_reference_031(jsonb,uuid)'),
      to_regprocedure('jo.pilot_create_reference_032(jsonb,uuid)'),
      to_regprocedure('jo.pilot_workflow_event_031(integer,text,uuid,bigint,jsonb)'),
      to_regprocedure('jo.snapshot_pilot_global_cancel_031()'),
      to_regprocedure('jo.guard_reference_catalog_status_030()'))<>5 THEN
    RAISE EXCEPTION 'verify: faltan RPC/guards del piloto';
  END IF;
  FOR expected IN SELECT * FROM (VALUES
    ('references','trg_references_line_subline_matrix','sync_and_validate_reference_line_subline()'),
    ('references','trg_030_guard_reference_catalog_status','guard_reference_catalog_status_030()'),
    ('references','trg_zz_reference_tipo_ref_blank','blank_reference_tipo_ref_030()'),
    ('references','trg_027_pilot_cancel_episode','snapshot_pilot_global_cancel_031()'),
    ('references','trg_031_pilot_reference_insert_rpc','guard_direct_pilot_reference_insert_031()'),
    ('references','trg_031_require_pilot_workflow','require_pilot_reference_workflow_031()'),
    ('references','trg_028_global_status_state_machine','sync_reference_global_status_to_state_machine()'),
    ('reference_states','trg_031_no_direct_reference_states','guard_pilot_direct_workflow_031()'),
    ('state_history','trg_031_no_direct_state_history','guard_pilot_direct_workflow_031()'),
    ('reference_handoffs','trg_031_pilot_handoff_guard','guard_pilot_handoff_031()')
  ) t(table_name,trigger_name,function_name) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger tr
      WHERE tr.tgrelid=to_regclass('jo.'||expected.table_name)
      AND tr.tgname=expected.trigger_name AND tr.tgenabled='O' AND NOT tr.tgisinternal
      AND tr.tgfoid=to_regprocedure('jo.'||expected.function_name)) THEN
      RAISE EXCEPTION 'verify: trigger ausente/inactivo %.%',expected.table_name,expected.trigger_name;
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM (VALUES ('tipo_prendas'),('references'),('reference_states'),('state_history')) t(name)
    LEFT JOIN pg_class c ON c.oid=to_regclass('jo.'||t.name)
    WHERE c.oid IS NULL OR NOT c.relrowsecurity) THEN
    RAISE EXCEPTION 'verify: RLS ausente';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='jo' AND tablename='tipo_prendas'
       AND policyname='rbac_admin_all' AND cmd='ALL' AND 'authenticated'=ANY(roles)
       AND concat_ws(' ',qual,with_check) ILIKE '%is_admin_user%')
    OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='jo' AND tablename='tipo_prendas'
       AND policyname='rbac_active_select' AND cmd='SELECT' AND 'authenticated'=ANY(roles))
    OR EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='jo' AND tablename='tipo_prendas'
       AND permissive='PERMISSIVE' AND cmd IN ('ALL','INSERT','UPDATE','DELETE')
       AND policyname<>'rbac_admin_all') THEN
    RAISE EXCEPTION 'verify: políticas efectivas catálogo no verificadas';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid='jo.pilot_reference_create_requests'::regclass
       AND attname='result' AND atttypid='jsonb'::regtype AND NOT attisdropped)
    OR EXISTS (SELECT 1 FROM jo.pilot_reference_create_requests WHERE result IS NULL) THEN
    RAISE EXCEPTION 'verify: 032 sin recibo original para cada alta';
  END IF;
  IF NOT has_function_privilege('authenticated','jo.pilot_create_reference_032(jsonb,uuid)','EXECUTE')
    OR has_function_privilege('authenticated','jo.pilot_create_reference_031(jsonb,uuid)','EXECUTE')
    OR NOT has_function_privilege('authenticated','jo.pilot_workflow_event_031(integer,text,uuid,bigint,jsonb)','EXECUTE')
    OR has_function_privilege('anon','jo.pilot_workflow_event_031(integer,text,uuid,bigint,jsonb)','EXECUTE')
    OR has_function_privilege('anon','jo.pilot_create_reference_031(jsonb,uuid)','EXECUTE')
    OR has_function_privilege('anon','jo.pilot_create_reference_032(jsonb,uuid)','EXECUTE')
    OR has_table_privilege('authenticated','jo.pilot_reference_create_requests','SELECT')
    OR NOT has_table_privilege('authenticated','jo.tipo_prendas','SELECT') THEN
    RAISE EXCEPTION 'verify: grants incompatibles con aislamiento';
  END IF;
END
$verify$;

-- Exploración suplementaria; la sección anterior aborta si falta un gate.
SELECT to_regprocedure('jo.guard_reference_catalog_status_030()') IS NOT NULL AS precondition_030,
  to_regprocedure('jo.sync_reference_global_status_to_state_machine()') IS NOT NULL AS precondition_028,
  to_regprocedure('jo.sync_and_validate_reference_line_subline()') IS NOT NULL AS precondition_lines,
  to_regprocedure('jo.current_user_has_role(text)') IS NOT NULL AS precondition_rbac,
  to_regclass('jo.reference_embroidery') IS NOT NULL AS embroidery_destination,
  to_regclass('jo.montage_mannequin') IS NOT NULL AS montage_destination,
  to_regclass('jo.references_referents') IS NOT NULL AS referent_destination,
  to_regclass('jo.pilot_reference_create_requests') IS NOT NULL AS provenance_receipts;

SELECT expected.table_name, expected.trigger_name,
  EXISTS(SELECT 1 FROM pg_trigger t WHERE t.tgrelid=to_regclass('jo.'||expected.table_name)
    AND t.tgname=expected.trigger_name AND NOT t.tgisinternal AND t.tgenabled='O') AS installed_enabled
FROM (VALUES
  ('references','trg_030_guard_reference_catalog_status'),
  ('references','trg_zz_reference_tipo_ref_blank'),
  ('references','trg_027_pilot_cancel_episode'),
  ('references','trg_031_pilot_reference_insert_rpc'),
  ('references','trg_031_require_pilot_workflow'),
  ('references','trg_028_global_status_state_machine'),
  ('reference_states','trg_031_no_direct_reference_states'),
  ('state_history','trg_031_no_direct_state_history'),
  ('reference_handoffs','trg_031_pilot_handoff_guard')
) expected(table_name,trigger_name);

SELECT c.relname, c.relrowsecurity AS rls_enabled
FROM pg_class c WHERE c.oid IN (to_regclass('jo.tipo_prendas'),to_regclass('jo.references'),
  to_regclass('jo.reference_states'),to_regclass('jo.state_history'));
SELECT has_function_privilege('authenticated','jo.pilot_create_reference_032(jsonb,uuid)','EXECUTE') AS create_rpc_granted,
  NOT has_function_privilege('authenticated','jo.pilot_create_reference_031(jsonb,uuid)','EXECUTE') AS create_core_private,
  has_function_privilege('authenticated','jo.pilot_workflow_event_031(integer,text,uuid,bigint,jsonb)','EXECUTE') AS event_rpc_granted,
  NOT has_function_privilege('anon','jo.pilot_workflow_event_031(integer,text,uuid,bigint,jsonb)','EXECUTE') AS anon_event_denied,
  NOT has_table_privilege('authenticated','jo.pilot_reference_create_requests','SELECT') AS receipts_private,
  has_table_privilege('authenticated','jo.tipo_prendas','SELECT') AS catalog_read_granted;
SELECT policyname,cmd,roles,qual,with_check FROM pg_policies
 WHERE schemaname='jo' AND tablename='tipo_prendas';

SELECT current_database() AS checked_database,
  to_regclass('jo.tipo_prendas') IS NOT NULL AS catalog_exists,
  to_regclass('jo.pilot_fork_state') IS NOT NULL AS fork_table_exists,
  to_regclass('jo.pilot_cancel_episodes') IS NOT NULL AS episode_table_exists,
  to_regprocedure('jo.pilot_workflow_event_031(integer,text,uuid,bigint,jsonb)') IS NOT NULL AS workflow_rpc_exists,
  to_regprocedure('jo.pilot_create_reference_031(jsonb,uuid)') IS NOT NULL AS create_rpc_exists;
-- RPC expuesta por la UI: pilot_create_reference_032. 031 es core privado.

SELECT a.attname, format_type(a.atttypid,a.atttypmod) AS type, a.attnotnull
  FROM pg_attribute a WHERE a.attrelid=to_regclass('jo.references')
  AND a.attname IN ('tipo_prenda_id','reference_type') AND a.attnum>0;

SELECT (SELECT count(*) FROM jo.references WHERE tipo_prenda_id IS NULL) AS historical_unclassified,
  (SELECT count(*) FROM jo.tipo_prendas WHERE active) AS active_types,
  (SELECT count(*) FROM jo.pilot_cancel_episodes WHERE active) AS open_episodes;

SELECT schemaname,tablename,policyname,cmd,roles,qual,with_check
  FROM pg_policies WHERE schemaname='jo' AND tablename IN (
    'tipo_prendas','references','reference_states','state_history','montage_mannequin'
  ) ORDER BY tablename,policyname;

SELECT p.proname,p.prosecdef,p.proconfig
  FROM pg_proc p WHERE p.oid IN (
    to_regprocedure('jo.pilot_workflow_event_031(integer,text,uuid,bigint,jsonb)'),
    to_regprocedure('jo.pilot_create_reference_031(jsonb,uuid)'));

SELECT c.relname,i.indisunique,i.indisvalid,pg_get_expr(i.indpred,i.indrelid) AS scope
 FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid
 WHERE c.relnamespace='jo'::regnamespace AND c.relname='pilot_ss27_reference_identity_031';

SELECT r.id,r.reference_number,s.current_state,
  EXISTS(SELECT 1 FROM jo.state_history h WHERE h.reference_id=r.id AND h.event='INIT') AS initialized,
  EXISTS(SELECT 1 FROM jo.pilot_cancel_episodes e WHERE e.reference_id=r.id AND e.active) AS open_episode
 FROM jo.references r JOIN jo.collections c ON c.id=r.collection_id AND c.code='SS27' AND c.year=2027
 LEFT JOIN jo.reference_states s ON s.reference_id=r.id
 WHERE r.year=2027 ORDER BY r.id;

-- Revisor: comparar conteos/IDs historicos ANTES y DESPUES solo en clon.
-- El conteo '11' fue informado por usuario, no es guard de migracion.
-- Probar por API JWT: Admin vs Creador, otra coleccion, cancel/reactivar,
-- fork resuelto, mismo request_id/version, fallo intermedio sin historial,
-- escritura directa prohibida, hand-off durante cancelacion y snapshots.
-- Probar reintento estable tras timeout; simular FK inválida para montaje/
-- referente y verificar ausencia total de referencia/INIT/episodio/receipt.
