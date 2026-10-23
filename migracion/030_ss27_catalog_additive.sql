-- L3-v5 / 030. SOLO en clon SS27 aislado, tras revision independiente.
-- Precondiciones: 022/023/024/025/026/027/028 aplicadas; NO 029 (pausada).
-- No ejecuta importacion, no clasifica los 11 historicos y NO retira legacy.
-- No habilitar escrituras de la UI piloto tras 030 hasta aplicar tambien 031.
-- Preflight de operacion: verificar URL/proyecto aislado fuera de este script;
-- establecer SET jo.pilot_ss27_isolated = 'approved' en la SESION aislada
-- ANTES de ejecutar este archivo, solamente tras confirmar el proyecto. NO
-- insertar el SET en este archivo. El flag NO es
-- barrera de seguridad frente a un operador malicioso: es un freno accidental.
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '2min';
DO $$ BEGIN
  IF current_setting('jo.pilot_ss27_isolated', true) IS DISTINCT FROM 'approved' THEN
    RAISE EXCEPTION '030: falta confirmacion explicita del clon aislado SS27';
  END IF;
  IF to_regclass('jo.tipo_prendas') IS NULL
    OR to_regprocedure('jo.sync_and_validate_reference_line_subline()') IS NULL
    OR to_regprocedure('jo.sync_reference_global_status_to_state_machine()') IS NULL
    OR to_regprocedure('jo.is_admin_user()') IS NULL THEN
    RAISE EXCEPTION '030 requiere tabla tipo_prendas y 022/023/025/026/028; NO 029';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM jo.collections WHERE code='SS27' AND year=2027) THEN
    RAISE EXCEPTION '030: falta SS27 en el clon aislado';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='jo'
    AND table_name='tipo_prendas' AND column_name='id' AND data_type='integer') THEN
    RAISE EXCEPTION '030: tipo_prendas.id no es int4';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='jo'
    AND table_name='tipo_prendas' AND column_name='id'
    AND (column_default IS NOT NULL OR is_identity='YES')) THEN
    RAISE EXCEPTION '030: tipo_prendas.id requiere default/identity antes de seed; revision manual';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='jo'
    AND tablename='tipo_prendas' AND cmd IN ('INSERT','UPDATE','DELETE','ALL')
    AND policyname<>'rbac_admin_all') THEN
    RAISE EXCEPTION '030: revisar politicas de escritura de tipo_prendas, solo Admin';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='jo'
    AND tablename='tipo_prendas' AND policyname='rbac_admin_all'
    AND (qual IS NULL OR (qual NOT ILIKE '%current_user_has_role%Administrador%'
        AND qual NOT ILIKE '%is_admin_user%'))) THEN
    RAISE EXCEPTION '030: rbac_admin_all no demuestra restriccion Admin';
  END IF;
END $$;

-- La tabla del usuario ya existe. El indice evita duplicados y permite seed
-- idempotente sin reactivar tipos ocultos ni alterar su descripcion.
CREATE UNIQUE INDEX IF NOT EXISTS tipo_prendas_name_casefold_uidx ON jo.tipo_prendas (lower(name));
ALTER TABLE jo.tipo_prendas ADD CONSTRAINT tipo_prendas_name_nonblank_030
  CHECK (name IS NOT NULL AND btrim(name)<>'');
INSERT INTO jo.tipo_prendas (name, active)
VALUES ('Vestido',true),('Pantalón',true),('Falda',true),('Blazer',true),
 ('Jacket',true),('Abrigo',true),('Jumpsuit',true),('Top',true),
 ('Blusa',true),('Camisa',true),('Shorts',true),('Cardigan',true),
 ('Vest',true),('Otro',true)
ON CONFLICT DO NOTHING;

ALTER TABLE jo.references ADD COLUMN IF NOT EXISTS tipo_prenda_id integer;
ALTER TABLE jo.references ADD COLUMN IF NOT EXISTS linned boolean DEFAULT false;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
    WHERE conrelid='jo.references'::regclass AND conname='references_tipo_prenda_id_fkey') THEN
    ALTER TABLE jo.references ADD CONSTRAINT references_tipo_prenda_id_fkey
      FOREIGN KEY (tipo_prenda_id) REFERENCES jo.tipo_prendas(id) ON DELETE RESTRICT;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS references_tipo_prenda_id_idx ON jo.references(tipo_prenda_id);

-- 028 sincroniza NULL cuando falta linea; CSV-010 exige cadena vacia. Corre
-- despues del trigger de 028, sin cambiar 028 y sin depender de 029.
CREATE OR REPLACE FUNCTION jo.blank_reference_tipo_ref_030()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NEW.line_id IS NULL THEN NEW.tipo_ref := ''; END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION jo.blank_reference_tipo_ref_030() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER trg_zz_reference_tipo_ref_blank
  BEFORE INSERT OR UPDATE ON jo.references FOR EACH ROW
  EXECUTE FUNCTION jo.blank_reference_tipo_ref_030();

-- El status general es independiente de las ediciones de referencia de Creador.
-- No reescribe datos antiguos ni sustituye otras politicas de edicion.
CREATE OR REPLACE FUNCTION jo.guard_reference_catalog_status_030()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE default_id integer;
BEGIN
  IF TG_OP='INSERT' THEN
    IF NEW.year IS DISTINCT FROM 2027 OR NOT EXISTS (
      SELECT 1 FROM jo.collections c WHERE c.id=NEW.collection_id AND c.code='SS27' AND c.year=2027
    ) THEN
      RAISE EXCEPTION 'Piloto: referencias nuevas solo SS27 (clon aislado)' USING ERRCODE='42501';
    END IF;
    SELECT id INTO default_id FROM jo.reference_statuses WHERE status='EN_PROCESO';
    IF default_id IS NULL THEN RAISE EXCEPTION 'Falta EN_PROCESO' USING ERRCODE='23514'; END IF;
    IF NOT jo.is_admin_user() AND NEW.status_id IS NOT NULL AND NEW.status_id IS DISTINCT FROM default_id THEN
      RAISE EXCEPTION 'Solo Administrador puede elegir estado general' USING ERRCODE='42501';
    END IF;
    NEW.status_id := COALESCE(NEW.status_id,default_id);
  ELSIF NEW.status_id IS DISTINCT FROM OLD.status_id AND NOT jo.is_admin_user() THEN
    RAISE EXCEPTION 'Solo Administrador puede cambiar estado general' USING ERRCODE='42501';
  END IF;

  IF TG_OP='UPDATE' THEN
    IF (NEW.collection_id IS DISTINCT FROM OLD.collection_id OR NEW.year IS DISTINCT FROM OLD.year) AND (
        (OLD.year=2027 AND EXISTS (SELECT 1 FROM jo.collections c WHERE c.id=OLD.collection_id AND c.code='SS27' AND c.year=2027))
        OR (NEW.year=2027 AND EXISTS (SELECT 1 FROM jo.collections c WHERE c.id=NEW.collection_id AND c.code='SS27' AND c.year=2027))
      ) THEN
      RAISE EXCEPTION 'La identidad de coleccion/año del piloto SS27 es inmutable' USING ERRCODE='23514';
    END IF;
  END IF;

  IF TG_OP='INSERT' THEN
    IF NEW.tipo_prenda_id IS NULL THEN
      RAISE EXCEPTION 'El tipo de prenda es obligatorio en referencias nuevas' USING ERRCODE='23514';
    END IF;
    IF NEW.tipo_prenda_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM jo.tipo_prendas WHERE id=NEW.tipo_prenda_id AND active IS TRUE FOR SHARE
    ) THEN
      RAISE EXCEPTION 'Tipo de prenda inexistente o inactivo' USING ERRCODE='23514';
    END IF;
  ELSIF NEW.tipo_prenda_id IS DISTINCT FROM OLD.tipo_prenda_id THEN
    IF NEW.tipo_prenda_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM jo.tipo_prendas WHERE id=NEW.tipo_prenda_id AND active IS TRUE FOR SHARE
    ) THEN
      RAISE EXCEPTION 'Tipo de prenda inexistente o inactivo' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION jo.guard_reference_catalog_status_030() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER trg_030_guard_reference_catalog_status
  BEFORE INSERT OR UPDATE ON jo.references FOR EACH ROW
  EXECUTE FUNCTION jo.guard_reference_catalog_status_030();

-- No se permite renombrar/eliminar SS27: de ello depende el guard del RPC.
CREATE OR REPLACE FUNCTION jo.guard_pilot_collection_identity_030()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF TG_OP='DELETE' THEN
    IF OLD.code='SS27' THEN RAISE EXCEPTION 'SS27 no se puede eliminar en el piloto' USING ERRCODE='42501'; END IF;
    RETURN OLD;
  END IF;
  IF (OLD.code='SS27' OR NEW.code='SS27') AND (
    NEW.code IS DISTINCT FROM OLD.code OR NEW.year IS DISTINCT FROM OLD.year
    OR NEW.id IS DISTINCT FROM OLD.id
  ) THEN
    RAISE EXCEPTION 'Identidad de coleccion SS27 inmutable durante el piloto' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION jo.guard_pilot_collection_identity_030() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER trg_030_guard_pilot_collection_identity
  BEFORE UPDATE OR DELETE ON jo.collections FOR EACH ROW
  EXECUTE FUNCTION jo.guard_pilot_collection_identity_030();

-- Lectura para cuentas activas (incluye historicos ocultos); escritura solo
-- Admin. Retirar politicas permisivas ajenas requiere revision previa manual.
ALTER TABLE jo.tipo_prendas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON jo.tipo_prendas FROM PUBLIC,anon;
REVOKE DELETE ON jo.tipo_prendas FROM authenticated;
GRANT SELECT,INSERT,UPDATE ON jo.tipo_prendas TO authenticated;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='jo'
    AND tablename='tipo_prendas' AND policyname='rbac_admin_all') THEN
    CREATE POLICY rbac_admin_all ON jo.tipo_prendas FOR ALL TO authenticated
      USING ((SELECT jo.is_admin_user())) WITH CHECK ((SELECT jo.is_admin_user()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='jo'
    AND tablename='tipo_prendas' AND policyname='rbac_active_select') THEN
    CREATE POLICY rbac_active_select ON jo.tipo_prendas FOR SELECT TO authenticated
      USING ((SELECT jo.current_user_is_active()));
  END IF;
END $$;
DO $$ DECLARE seq_name text; BEGIN
  seq_name := pg_get_serial_sequence('jo.tipo_prendas','id');
  IF seq_name IS NOT NULL THEN
    EXECUTE format('GRANT USAGE ON SEQUENCE %s TO authenticated', seq_name::regclass);
  END IF;
END $$;
-- Las politicas rbac_admin_all/rbac_active_select de 023 ya cubren tipo_prendas.

-- Montaje se inserta únicamente dentro de la RPC de creación SECURITY DEFINER
-- como propietario. 030 no amplía INSERT/RLS al navegador (Creador) ni altera
-- permisos o políticas preexistentes, incluida la autoridad Admin heredada.
COMMIT;
