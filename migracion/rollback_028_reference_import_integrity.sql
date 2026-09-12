-- Rollback operativo y no destructivo de 028.
-- NO elimina catalogos/asignaciones/import_batches/import_issues ni sus datos.
-- Antes de ejecutarlo, exportar las tablas nuevas y revisar escrituras ocurridas.
BEGIN;
SET LOCAL search_path = jo, public;

DROP TRIGGER IF EXISTS trg_028_global_status_state_machine ON jo.references;
DROP TRIGGER IF EXISTS trg_028_guard_reference_import_metadata_insert ON jo.references;
DROP TRIGGER IF EXISTS trg_028_guard_reference_import_metadata_update ON jo.references;
DROP TRIGGER IF EXISTS trg_028_freeze_code_pool ON jo.code_pool;
DROP TRIGGER IF EXISTS trg_028_freeze_reference_codes ON jo.reference_codes;

-- Evita dos autoridades escribibles durante el rollback.
REVOKE INSERT,UPDATE,DELETE ON jo.md_codes,jo.pt_codes,jo.md_code_assignments,jo.pt_code_assignments FROM authenticated;

-- Restaura la autoridad legacy solo para Administrador. Los triggers 013 se
-- conservan y vuelven a operar. No se intenta sincronizar cambios hechos en 028
-- hacia legacy: esa reconciliacion requiere revision manual para evitar perdida.
GRANT SELECT,INSERT,UPDATE,DELETE ON jo.code_pool,jo.reference_codes TO authenticated;
DROP POLICY IF EXISTS rbac_028_legacy_admin_write ON jo.code_pool;
CREATE POLICY rbac_028_legacy_admin_write ON jo.code_pool FOR ALL TO authenticated
  USING ((SELECT jo.current_user_has_role('Administrador')))
  WITH CHECK ((SELECT jo.current_user_has_role('Administrador')));
DROP POLICY IF EXISTS rbac_028_legacy_admin_write ON jo.reference_codes;
CREATE POLICY rbac_028_legacy_admin_write ON jo.reference_codes FOR ALL TO authenticated
  USING ((SELECT jo.current_user_has_role('Administrador')))
  WITH CHECK ((SELECT jo.current_user_has_role('Administrador')));

-- Retira ejecucion de RPCs 028 pero conserva definiciones y datos auditables.
DO $$
DECLARE signature TEXT;
BEGIN
  FOREACH signature IN ARRAY ARRAY[
    'jo.admin_create_reference_code(text,text,text,text)','jo.assign_existing_reference_code(integer,text,text,text)',
    'jo.unassign_reference_code(integer,text,text)','jo.resolve_import_collection(text,text,integer)',
    'jo.begin_reference_import(text,integer,jsonb)','jo.record_import_issue(bigint,integer,text,text,integer,jsonb)',
    'jo.register_reference_import(bigint,integer,integer,text)','jo.finish_reference_import(bigint,boolean)'
  ] LOOP EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated',signature); END LOOP;
END;
$$;

COMMIT;

-- PENDIENTE MANUAL tras rollback:
-- 1) comparar asignaciones nuevas con reference_codes;
-- 2) decidir cual autoridad conservar antes de reactivar importaciones;
-- 3) no borrar import_batches/import_issues/code_log.
