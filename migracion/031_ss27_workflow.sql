-- L3-v7 / 031: solo en clon SS27 AISLADO. Ejecutar despues de 030 y SOLO
-- tras revision independiente. NO necesita 029; NO importa/borra datos.
-- Mismo freno de operador que 030: en sesion confirmada como clon aislado,
-- SET jo.pilot_ss27_isolated = 'approved'; antes de ejecutar este archivo.
-- No garantiza aislamiento: verificar proyecto/URL por fuera de la aplicacion.
BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='2min';
DO $$ BEGIN
  IF current_setting('jo.pilot_ss27_isolated',true) IS DISTINCT FROM 'approved'
    OR to_regprocedure('jo.guard_reference_catalog_status_030()') IS NULL
    OR to_regprocedure('jo.sync_reference_global_status_to_state_machine()') IS NULL THEN
    RAISE EXCEPTION '031 requiere clon confirmado y 028 + 030';
  END IF;
END $$;

-- No se infiere progreso/responsable de historicos sin metadatos fiables.
-- NULL means historical/unverified; only pilot_create_reference_031 sets a version.
ALTER TABLE jo.reference_states ADD COLUMN IF NOT EXISTS pilot_version bigint DEFAULT NULL;
ALTER TABLE jo.reference_states ADD COLUMN IF NOT EXISTS cancelled_sub_states text[] NOT NULL DEFAULT '{}';
CREATE TABLE IF NOT EXISTS jo.pilot_fork_state (
  reference_id integer NOT NULL REFERENCES jo.references(id) ON DELETE RESTRICT,
  fork_type text NOT NULL CHECK (fork_type IN ('bordado','sublimado','proceso_externo')),
  status text NOT NULL CHECK (status IN ('active','suspended','completed','CANCELADO')),
  responsible_id integer REFERENCES jo.persons(id) ON DELETE RESTRICT,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(progress)='object'),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY(reference_id,fork_type)
);
CREATE TABLE IF NOT EXISTS jo.pilot_cancel_episodes (
  id bigserial PRIMARY KEY,
  reference_id integer NOT NULL REFERENCES jo.references(id) ON DELETE RESTRICT,
  active boolean NOT NULL DEFAULT true,
  restore_state text NOT NULL CHECK (restore_state IN ('concepto','diseno','costeo','industrializacion','produccion','comercial')),
  active_forks text[] NOT NULL,
  fork_snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  reactivated_at timestamptz,
  CHECK ((active AND reactivated_at IS NULL) OR (NOT active AND reactivated_at IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS pilot_cancel_one_open_episode_idx
  ON jo.pilot_cancel_episodes(reference_id) WHERE active;
CREATE TABLE IF NOT EXISTS jo.pilot_workflow_requests (
  request_id uuid PRIMARY KEY,
  reference_id integer NOT NULL REFERENCES jo.references(id) ON DELETE RESTRICT,
  actor_id uuid NOT NULL,
  event text NOT NULL,
  expected_version bigint NOT NULL,
  payload jsonb NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE IF NOT EXISTS jo.pilot_reference_create_requests (
  request_id uuid PRIMARY KEY,
  actor_id uuid NOT NULL,
  payload jsonb NOT NULL,
  reference_id integer NOT NULL UNIQUE REFERENCES jo.references(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS pilot_requests_reference_idx ON jo.pilot_workflow_requests(reference_id,created_at DESC);
REVOKE ALL ON jo.pilot_fork_state,jo.pilot_cancel_episodes,jo.pilot_workflow_requests FROM PUBLIC,anon,authenticated;
REVOKE ALL ON jo.pilot_reference_create_requests FROM PUBLIC,anon,authenticated;

-- Un INSERT de navegador no puede omitir INIT/historial. La RPC SECURITY
-- DEFINER ejecuta el INSERT con identidad del propietario, no authenticated.
CREATE OR REPLACE FUNCTION jo.guard_direct_pilot_reference_insert_031()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF current_user='authenticated' AND NEW.year=2027 AND EXISTS (
    SELECT 1 FROM jo.collections c WHERE c.id=NEW.collection_id AND c.code='SS27' AND c.year=2027
  ) THEN
    RAISE EXCEPTION 'Use pilot_create_reference_032 para fichas SS27' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION jo.guard_direct_pilot_reference_insert_031() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER trg_031_pilot_reference_insert_rpc
  BEFORE INSERT ON jo.references FOR EACH ROW EXECUTE FUNCTION jo.guard_direct_pilot_reference_insert_031();

CREATE OR REPLACE FUNCTION jo.require_pilot_reference_workflow_031()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF NEW.year=2027 AND EXISTS (SELECT 1 FROM jo.collections c
    WHERE c.id=NEW.collection_id AND c.code='SS27' AND c.year=2027) THEN
    IF NOT EXISTS (SELECT 1 FROM jo.reference_states s WHERE s.reference_id=NEW.id)
      OR NOT EXISTS (SELECT 1 FROM jo.state_history h WHERE h.reference_id=NEW.id AND h.event='INIT') THEN
      RAISE EXCEPTION 'Ficha SS27 sin INIT/historial transaccional' USING ERRCODE='23514';
    END IF;
    IF EXISTS (SELECT 1 FROM jo.reference_statuses s WHERE s.id=NEW.status_id AND s.is_cancelled)
      AND (NOT EXISTS (SELECT 1 FROM jo.reference_states s WHERE s.reference_id=NEW.id AND s.current_state='cancelado')
        OR NOT EXISTS (SELECT 1 FROM jo.pilot_cancel_episodes e WHERE e.reference_id=NEW.id AND e.active)
        OR NOT EXISTS (SELECT 1 FROM jo.state_history h WHERE h.reference_id=NEW.id AND h.event='STATUS_GLOBAL_CANCELADO')) THEN
      RAISE EXCEPTION 'Alta cancelada SS27 sin episodio/historial' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION jo.require_pilot_reference_workflow_031() FROM PUBLIC,anon,authenticated;
CREATE CONSTRAINT TRIGGER trg_031_require_pilot_workflow
  AFTER INSERT ON jo.references DEFERRABLE INITIALLY DEFERRED FOR EACH ROW
  EXECUTE FUNCTION jo.require_pilot_reference_workflow_031();

-- Rechazar mutaciones cliente del piloto incluso si una politica 023 permite
-- escribir a Creador. Las RPC SECURITY DEFINER se ejecutan como propietario;
-- los accesos PostgREST authenticated siguen sujetos a este trigger INVOKER.
CREATE OR REPLACE FUNCTION jo.guard_pilot_direct_workflow_031()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE ref_id integer; pilot_old boolean:=false;
BEGIN
  ref_id := CASE WHEN TG_OP='DELETE' THEN OLD.reference_id ELSE NEW.reference_id END;
  IF TG_OP='UPDATE' THEN
    SELECT EXISTS (SELECT 1 FROM jo.references r JOIN jo.collections c ON c.id=r.collection_id
      WHERE r.id=OLD.reference_id AND c.code='SS27' AND c.year=2027 AND r.year=2027) INTO pilot_old;
  END IF;
  IF current_user='authenticated' THEN
    IF pilot_old OR EXISTS (SELECT 1 FROM jo.references r JOIN jo.collections c ON c.id=r.collection_id
      WHERE r.id=ref_id AND c.code='SS27' AND c.year=2027 AND r.year=2027) THEN
      RAISE EXCEPTION 'Workflow piloto: escritura directa prohibida; use RPC' USING ERRCODE='42501';
    END IF;
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION jo.guard_pilot_direct_workflow_031() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER trg_031_no_direct_reference_states
 BEFORE INSERT OR UPDATE OR DELETE ON jo.reference_states FOR EACH ROW
 EXECUTE FUNCTION jo.guard_pilot_direct_workflow_031();
CREATE TRIGGER trg_031_no_direct_state_history
 BEFORE INSERT OR UPDATE OR DELETE ON jo.state_history FOR EACH ROW
 EXECUTE FUNCTION jo.guard_pilot_direct_workflow_031();

-- El hand-off legacy (024) tambien mueve areas. En SS27 queda bajo la misma
-- autoridad temporal Admin y no puede avanzar durante cancelacion global.
CREATE OR REPLACE FUNCTION jo.guard_pilot_handoff_031()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE ref_id integer; pilot_old boolean:=false; current_status_id integer;
BEGIN
  ref_id:=CASE WHEN TG_OP='DELETE' THEN OLD.reference_id ELSE NEW.reference_id END;
  -- FOR SHARE serializa hand-off con el UPDATE de estado global (lock de ref).
  SELECT status_id INTO current_status_id FROM jo.references WHERE id=ref_id FOR SHARE;
  IF TG_OP='UPDATE' THEN
    SELECT EXISTS (SELECT 1 FROM jo.references r JOIN jo.collections c ON c.id=r.collection_id
      WHERE r.id=OLD.reference_id AND r.year=2027 AND c.code='SS27' AND c.year=2027) INTO pilot_old;
  END IF;
  IF pilot_old OR EXISTS (SELECT 1 FROM jo.references r JOIN jo.collections c ON c.id=r.collection_id
    WHERE r.id=ref_id AND r.year=2027 AND c.code='SS27' AND c.year=2027) THEN
    IF TG_OP='UPDATE' AND NEW.reference_id IS DISTINCT FROM OLD.reference_id THEN
      RAISE EXCEPTION 'Titular de hand-off SS27 inmutable' USING ERRCODE='42501';
    END IF;
    IF TG_OP='DELETE' THEN
      RAISE EXCEPTION 'El historial de hand-offs SS27 es inmutable' USING ERRCODE='42501';
    END IF;
    IF NOT jo.current_user_has_role('Administrador') THEN
      RAISE EXCEPTION 'Hand-off SS27 reservado a Administrador' USING ERRCODE='42501';
    END IF;
    IF EXISTS (SELECT 1 FROM jo.reference_statuses s WHERE s.id=current_status_id AND s.is_cancelled) THEN
      RAISE EXCEPTION 'Hand-off bloqueado por cancelacion global' USING ERRCODE='23514';
    END IF;
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION jo.guard_pilot_handoff_031() FROM PUBLIC,anon,authenticated;
DO $$ BEGIN
  IF to_regclass('jo.reference_handoffs') IS NULL THEN
    RAISE EXCEPTION '031 necesita jo.reference_handoffs (024)';
  END IF;
END $$;
CREATE TRIGGER trg_031_pilot_handoff_guard
 BEFORE INSERT OR UPDATE OR DELETE ON jo.reference_handoffs FOR EACH ROW
 EXECUTE FUNCTION jo.guard_pilot_handoff_031();

-- Este trigger BEFORE corre antes de la sincronizacion AFTER de 028.
-- Ambos participan en la misma transaccion que el UPDATE del status global.
-- La autorizacion Admin de 030 se valida antes en su BEFORE trigger.
CREATE OR REPLACE FUNCTION jo.snapshot_pilot_global_cancel_031()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE old_cancel boolean; new_cancel boolean; st jo.reference_states%ROWTYPE;
  ep jo.pilot_cancel_episodes%ROWTYPE; saved jsonb; existing_count integer;
BEGIN
  IF NEW.status_id IS NOT DISTINCT FROM OLD.status_id THEN RETURN NEW; END IF;
  IF NOT EXISTS (SELECT 1 FROM jo.collections c WHERE c.id=NEW.collection_id
       AND c.code='SS27' AND c.year=2027) OR NEW.year<>2027 THEN RETURN NEW; END IF;
  IF NOT jo.current_user_has_role('Administrador') THEN
    RAISE EXCEPTION 'Solo Administrador puede cancelar o reactivar SS27' USING ERRCODE='42501';
  END IF;
  SELECT COALESCE((SELECT is_cancelled FROM jo.reference_statuses WHERE id=OLD.status_id),false) INTO old_cancel;
  SELECT COALESCE((SELECT is_cancelled FROM jo.reference_statuses WHERE id=NEW.status_id),false) INTO new_cancel;
  IF old_cancel=new_cancel THEN RETURN NEW; END IF;
  IF NOT EXISTS (SELECT 1 FROM jo.pilot_reference_create_requests req WHERE req.reference_id=NEW.id) THEN
    RAISE EXCEPTION 'Referencia historica SS27 sin procedencia de snapshot; revision manual' USING ERRCODE='23514';
  END IF;
  SELECT * INTO st FROM jo.reference_states WHERE reference_id=NEW.id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referencia SS27 sin workflow; revision manual antes de cambiar estado' USING ERRCODE='23514';
  END IF;
   IF st.pilot_version IS NULL THEN
     RAISE EXCEPTION 'Workflow historico sin version piloto; revision manual' USING ERRCODE='23514';
   END IF;
   IF new_cancel THEN
    IF st.current_state NOT IN ('concepto','diseno','costeo','industrializacion','produccion','comercial')
      OR st.main_trunk_state IS DISTINCT FROM st.current_state THEN
      RAISE EXCEPTION 'Tronco no restaurable; revision manual referencia %',NEW.id USING ERRCODE='23514';
    END IF;
    SELECT count(*) INTO existing_count FROM jo.pilot_fork_state
      WHERE reference_id=NEW.id AND status='active';
    IF st.sub_states IS NULL OR existing_count<>cardinality(st.sub_states)
      OR EXISTS (SELECT 1 FROM jo.pilot_fork_state f WHERE f.reference_id=NEW.id
        AND f.status='active' AND NOT f.fork_type=ANY(st.sub_states)) THEN
      RAISE EXCEPTION 'Forks historicos sin snapshot fiable: revision manual referencia %',NEW.id USING ERRCODE='23514';
    END IF;
    SELECT COALESCE(jsonb_agg(to_jsonb(f) ORDER BY f.fork_type),'[]'::jsonb)
      INTO saved FROM jo.pilot_fork_state f WHERE f.reference_id=NEW.id AND f.status='active';
    INSERT INTO jo.pilot_cancel_episodes(reference_id,restore_state,active_forks,fork_snapshot)
      VALUES(NEW.id,st.current_state,st.sub_states,saved);
    UPDATE jo.pilot_fork_state SET status='suspended',updated_at=clock_timestamp()
      WHERE reference_id=NEW.id AND status='active';
    UPDATE jo.reference_states SET sub_states='{}',last_process_state=st.current_state,
      pilot_version=pilot_version+1
      WHERE id=st.id;
  ELSE
    SELECT * INTO ep FROM jo.pilot_cancel_episodes WHERE reference_id=NEW.id AND active FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Cancelacion historica sin snapshot: revision manual referencia %',NEW.id USING ERRCODE='23514'; END IF;
    IF st.current_state IS DISTINCT FROM 'cancelado'
      OR st.sub_states IS DISTINCT FROM '{}'::text[]
      OR st.main_trunk_state IS DISTINCT FROM ep.restore_state
      OR st.last_process_state IS DISTINCT FROM ep.restore_state THEN
      RAISE EXCEPTION 'Procedencia de tronco no restaurable referencia %',NEW.id USING ERRCODE='23514';
    END IF;
     IF jsonb_typeof(ep.fork_snapshot)<>'array'
       OR jsonb_array_length(ep.fork_snapshot)<>cardinality(ep.active_forks)
       OR EXISTS (SELECT 1 FROM jo.pilot_fork_state f WHERE f.reference_id=NEW.id
         AND f.status IN ('active','suspended') AND NOT f.fork_type=ANY(ep.active_forks)) THEN
      RAISE EXCEPTION 'Snapshot inconsistente referencia %',NEW.id USING ERRCODE='23514';
    END IF;
    SELECT count(*) INTO existing_count FROM jo.pilot_fork_state f
      WHERE f.reference_id=NEW.id AND f.status='suspended' AND f.fork_type=ANY(ep.active_forks)
         AND EXISTS (SELECT 1 FROM jsonb_array_elements(ep.fork_snapshot) item
           WHERE item->>'fork_type'=f.fork_type
             AND (to_jsonb(f) - 'updated_at' - 'status')
               = (item - 'updated_at' - 'status')
             AND item->>'status'='active');
    IF existing_count<>cardinality(ep.active_forks) THEN
      RAISE EXCEPTION 'Snapshot de fork alterado: revision manual referencia %',NEW.id USING ERRCODE='23514';
    END IF;
    UPDATE jo.pilot_fork_state SET status='active',updated_at=clock_timestamp()
      WHERE reference_id=NEW.id AND status='suspended' AND fork_type=ANY(ep.active_forks);
    UPDATE jo.reference_states SET sub_states=ep.active_forks,pilot_version=pilot_version+1
      WHERE id=st.id;
    UPDATE jo.pilot_cancel_episodes SET active=false,reactivated_at=clock_timestamp() WHERE id=ep.id;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION jo.snapshot_pilot_global_cancel_031() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER trg_027_pilot_cancel_episode
  BEFORE UPDATE OF status_id ON jo.references FOR EACH ROW
  EXECUTE FUNCTION jo.snapshot_pilot_global_cancel_031();

-- Una llamada = una transaccion Postgres. El row lock serializa eventos de la
-- misma referencia. Idempotencia por UUID, expected_version frena stale UI.
CREATE OR REPLACE FUNCTION jo.pilot_workflow_event_031(
  p_reference_id integer,p_event text,p_request_id uuid,p_expected_version bigint,
  p_payload jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE st jo.reference_states%ROWTYPE; r jo.references%ROWTYPE; existing jo.pilot_workflow_requests%ROWTYPE;
  dest text; fork text; from_state text; result jsonb; active_count integer; was_merge boolean:=false;
  new_initial numeric; new_cm numeric; diff numeric; threshold numeric;
  needs_justification boolean:=false; consumption_change jsonb; elapsed_ms bigint;
BEGIN
  IF NOT jo.current_user_has_role('Administrador') THEN
    RAISE EXCEPTION 'Solo Administrador activo del piloto' USING ERRCODE='42501';
  END IF;
  IF p_request_id IS NULL OR p_expected_version IS NULL OR p_payload IS NULL
    OR jsonb_typeof(p_payload)<>'object' THEN
    RAISE EXCEPTION 'request_id/version/payload invalidos' USING ERRCODE='23514';
  END IF;
  SELECT rr.* INTO r FROM jo.references rr JOIN jo.collections c ON c.id=rr.collection_id
    WHERE rr.id=p_reference_id AND rr.year=2027 AND c.code='SS27' AND c.year=2027 FOR UPDATE OF rr;
  IF NOT FOUND THEN RAISE EXCEPTION 'RPC solo permite clon SS27' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM jo.pilot_reference_create_requests req WHERE req.reference_id=p_reference_id) THEN
    RAISE EXCEPTION 'Referencia historica sin procedencia piloto; revision manual' USING ERRCODE='23514';
  END IF;
  SELECT * INTO existing FROM jo.pilot_workflow_requests WHERE request_id=p_request_id;
  IF FOUND THEN
    IF existing.reference_id<>p_reference_id OR existing.actor_id IS DISTINCT FROM auth.uid()
      OR existing.event<>p_event OR existing.expected_version<>p_expected_version
      OR existing.payload IS DISTINCT FROM p_payload THEN
      RAISE EXCEPTION 'request_id reutilizado con otro evento/titular' USING ERRCODE='23514';
    END IF;
    RETURN existing.result;
  END IF;
  IF EXISTS (SELECT 1 FROM jo.reference_statuses s WHERE s.id=r.status_id AND s.is_cancelled) THEN
    RAISE EXCEPTION 'Referencia globalmente cancelada; reactivar antes de transicionar' USING ERRCODE='23514';
  END IF;
  SELECT * INTO st FROM jo.reference_states WHERE reference_id=p_reference_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Referencia historica sin workflow; revision manual' USING ERRCODE='23514'; END IF;
    IF st.pilot_version<>p_expected_version THEN RAISE EXCEPTION 'Version obsoleta' USING ERRCODE='40001'; END IF;
    SELECT count(*) INTO active_count FROM jo.pilot_fork_state f
      WHERE f.reference_id=p_reference_id AND f.status='active';
    IF st.sub_states IS NULL OR active_count<>cardinality(st.sub_states)
      OR EXISTS (SELECT 1 FROM jo.pilot_fork_state f WHERE f.reference_id=p_reference_id
        AND f.status='active' AND NOT f.fork_type=ANY(st.sub_states)) THEN
      RAISE EXCEPTION 'Forks historicos sin estado fiable: revision manual' USING ERRCODE='23514';
    END IF;
    from_state:=st.current_state;
    new_initial:=st.consumption_initial;
    new_cm:=st.consumption_contramuestra;
    IF p_payload ? 'consumptionInitial' THEN
      new_initial:=NULLIF(p_payload->>'consumptionInitial','')::numeric;
    END IF;
    IF p_payload ? 'consumptionContramuestra' THEN
      new_cm:=NULLIF(p_payload->>'consumptionContramuestra','')::numeric;
    END IF;
    needs_justification:=new_initial IS DISTINCT FROM st.consumption_initial
      OR new_cm IS DISTINCT FROM st.consumption_contramuestra;
    IF needs_justification AND btrim(COALESCE(p_payload->>'justification',''))='' THEN
      RAISE EXCEPTION 'Justificacion obligatoria cuando cambian consumos' USING ERRCODE='23514';
    END IF;
    IF needs_justification THEN
      consumption_change:=jsonb_build_object('before',st.consumption_initial,'after',new_initial,
        'contramuestraBefore',st.consumption_contramuestra,'contramuestraAfter',new_cm);
    END IF;
    threshold:=COALESCE(st.threshold_cm,45);
    diff:=CASE WHEN new_initial IS NOT NULL AND new_cm IS NOT NULL
      THEN abs(new_cm-new_initial) ELSE 0 END;
    elapsed_ms:=CASE WHEN st.timestamp_entry IS NULL THEN 0 ELSE
      greatest(0,(extract(epoch FROM clock_timestamp()-st.timestamp_entry)*1000)::bigint) END;
    dest:=CASE
      WHEN from_state='concepto' AND p_event='AVANZAR_CONCEPTO' THEN 'diseno'
      WHEN from_state='diseno' AND p_event='AVANZAR_DISENO' THEN 'costeo'
      WHEN from_state='costeo' AND p_event='APROBAR_COSTO' THEN 'industrializacion'
      WHEN from_state='costeo' AND p_event='RECHAZAR' THEN 'diseno'
      WHEN from_state='industrializacion' AND p_event='APROBAR_INDUSTR' THEN 'produccion'
      WHEN from_state='produccion' AND p_event='APROBAR_PRODUCCION' THEN 'comercial'
      WHEN from_state='comercial' AND p_event='CERRAR_COMERCIAL' THEN 'completado'
      WHEN from_state='pausado' AND p_event='REANUDAR' THEN st.previous_state
    END;
    fork:=CASE
      WHEN p_event IN ('FORK_BORDADO','COMPLETAR_BORDADO','RECHAZAR_BORDADO') THEN 'bordado'
      WHEN p_event IN ('FORK_SUBLIMADO','COMPLETAR_SUBLIMADO','RECHAZAR_SUBLIMADO') THEN 'sublimado'
      WHEN p_event IN ('FORK_PROCESO_EXT','COMPLETAR_EXT','RECHAZAR_EXT') THEN 'proceso_externo'
    END;
    IF p_event='CERRAR_COMERCIAL' AND (cardinality(st.sub_states)>0 OR st.waiting_for_merge IS TRUE) THEN
      RAISE EXCEPTION 'No se puede cerrar Comercial con forks activos' USING ERRCODE='23514';
    END IF;
    IF fork IS NOT NULL THEN
      IF p_event LIKE 'FORK_%' THEN
        IF from_state NOT IN ('diseno','industrializacion') THEN
          RAISE EXCEPTION 'FORK solo se inicia en diseno/industrializacion' USING ERRCODE='23514';
        END IF;
        IF fork=ANY(st.sub_states) OR fork=ANY(st.completed_sub_states)
          OR fork=ANY(st.cancelled_sub_states) THEN RAISE EXCEPTION 'Fork ya iniciado/resuelto' USING ERRCODE='23514'; END IF;
        INSERT INTO jo.pilot_fork_state(reference_id,fork_type,status,responsible_id,progress)
          VALUES(p_reference_id,fork,'active',
            COALESCE(NULLIF(p_payload->>'responsible_id','')::integer,st.assigned_person_id),
            COALESCE(p_payload->'progress','{}'::jsonb));
        st.sub_states:=array_append(st.sub_states,fork);
        st.main_trunk_state:=from_state;
      ELSE
        IF from_state NOT IN ('diseno','costeo','industrializacion','produccion','comercial') THEN
          RAISE EXCEPTION 'Fork no resoluble desde etapa actual' USING ERRCODE='23514';
        END IF;
        IF NOT fork=ANY(st.sub_states) THEN RAISE EXCEPTION 'Fork no activo' USING ERRCODE='23514'; END IF;
        st.sub_states:=array_remove(st.sub_states,fork);
        IF p_event LIKE 'RECHAZAR_%' THEN
          st.cancelled_sub_states:=array_append(st.cancelled_sub_states,fork);
          UPDATE jo.pilot_fork_state SET status='CANCELADO',updated_at=clock_timestamp()
            WHERE reference_id=p_reference_id AND fork_type=fork AND status='active';
        ELSE
          st.completed_sub_states:=array_append(st.completed_sub_states,fork);
          UPDATE jo.pilot_fork_state SET status='completed',updated_at=clock_timestamp()
            WHERE reference_id=p_reference_id AND fork_type=fork AND status='active';
        END IF;
        was_merge:=cardinality(st.sub_states)=0;
      END IF;
      dest:=from_state;
    END IF;
    IF dest IS NULL OR p_event='MERGE_UNION' THEN
      RAISE EXCEPTION 'Evento invalido para estado %: %',from_state,p_event USING ERRCODE='23514';
    END IF;
    IF fork IS NULL AND dest IN ('concepto','diseno','costeo','industrializacion','produccion','comercial') THEN
      st.main_trunk_state:=dest;
    END IF;
    st.current_state:=dest;
     IF was_merge THEN
       -- M1 confirms the join, without rewinding a trunk that advanced meanwhile.
       st.waiting_for_merge:=false;
     END IF;
    st.previous_state:=from_state;
    st.pilot_version:=st.pilot_version+1;
    st.lifecycle_status:=CASE WHEN st.current_state='completado' THEN 'completed' ELSE 'active' END;
    st.consumption_initial:=new_initial;
    st.consumption_contramuestra:=new_cm;
    st.consumption_diff:=diff;
    st.alert_level:=CASE WHEN new_initial IS NULL OR new_cm IS NULL THEN 'none'
      WHEN diff>=threshold THEN 'critical' WHEN diff>=threshold*0.75 THEN 'warning' ELSE 'none' END;
    st.alert_reason:=CASE WHEN st.alert_level='none' THEN NULL
      ELSE format('Diferencia de %scm (limite %scm).',round(diff,1),threshold) END;
    IF p_payload ? 'assignedPersonId' THEN
      st.assigned_person_id:=NULLIF(p_payload->>'assignedPersonId','')::integer;
    END IF;
    UPDATE jo.reference_states SET current_state=st.current_state,previous_state=st.previous_state,
      main_trunk_state=st.main_trunk_state,sub_states=st.sub_states,
      completed_sub_states=st.completed_sub_states,cancelled_sub_states=st.cancelled_sub_states,
      waiting_for_merge=st.waiting_for_merge,pilot_version=st.pilot_version,
      lifecycle_status=st.lifecycle_status,consumption_initial=st.consumption_initial,
      consumption_contramuestra=st.consumption_contramuestra,consumption_diff=st.consumption_diff,
      alert_level=st.alert_level,alert_reason=st.alert_reason,assigned_person_id=st.assigned_person_id,
      timestamp_entry=CASE WHEN st.current_state IN ('union','pausado') THEN timestamp_entry
        ELSE clock_timestamp() END WHERE id=st.id RETURNING * INTO st;
    INSERT INTO jo.state_history(reference_id,from_state,to_state,event,"timestamp",user_id,user_role,fork_type,
      is_parallel_fork,is_parallel_merge,duration_in_previous_ms,requires_justification,justification,
      consumption_change,molderia_changes)
      VALUES(p_reference_id,from_state,CASE WHEN was_merge THEN 'union' ELSE dest END,p_event,
        clock_timestamp(),auth.uid()::text,'Administrador',fork,p_event LIKE 'FORK_%',was_merge,
        elapsed_ms,needs_justification,CASE WHEN needs_justification THEN p_payload->>'justification' END,
        consumption_change,p_payload->'molderiaChanges');
    IF was_merge THEN
      INSERT INTO jo.state_history(reference_id,from_state,to_state,event,"timestamp",user_id,user_role,is_parallel_merge)
        VALUES(p_reference_id,'union',st.current_state,'MERGE_UNION',clock_timestamp(),auth.uid()::text,'Administrador',true);
    END IF;
  result:=to_jsonb(st);
  INSERT INTO jo.pilot_workflow_requests(request_id,reference_id,actor_id,event,expected_version,payload,result)
    VALUES(p_request_id,p_reference_id,auth.uid(),p_event,p_expected_version,p_payload,result);
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION jo.pilot_workflow_event_031(integer,text,uuid,bigint,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION jo.pilot_workflow_event_031(integer,text,uuid,bigint,jsonb) TO authenticated;

-- Identidad única SOLO en la colección piloto; no altera otras colecciones.
DO $$ DECLARE pilot_collection_id integer; duplicates text; BEGIN
  SELECT id INTO STRICT pilot_collection_id FROM jo.collections WHERE code='SS27' AND year=2027;
  -- Preflight antes de DDL: ninguna fila se modifica o clasifica para resolver
  -- colisiones históricas. Mostrar claves e IDs para revisión manual.
  SELECT string_agg(format('collection=%s/year=%s/ref=%s ids=%s',collection_id,year,reference_number,ids),'; ' ORDER BY collection_id,year,reference_number)
    INTO duplicates FROM (
      SELECT collection_id,year,reference_number,string_agg(id::text,',' ORDER BY id) AS ids
      FROM jo.references WHERE collection_id=pilot_collection_id AND year=2027
      GROUP BY collection_id,year,reference_number HAVING count(*)>1
    ) conflicts;
  IF duplicates IS NOT NULL THEN
    RAISE EXCEPTION '031: duplicados SS27/2027 (keys/ids) %; revision manual sin cambios',duplicates USING ERRCODE='23505';
  END IF;
  EXECUTE format('CREATE UNIQUE INDEX pilot_ss27_reference_identity_031 ON jo.references(collection_id,year,reference_number) WHERE collection_id=%s AND year=2027',pilot_collection_id);
END $$;

-- F03/F01: RPC core. No codigos ni storage en esta transaccion. PostgreSQL
-- revierte INSERT de referencia, montaje, referente, INIT, episodio e historia
-- como una sola llamada si falla cualquiera de las escrituras.
CREATE OR REPLACE FUNCTION jo.pilot_create_reference_031(p_payload jsonb,p_request_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE existing jo.pilot_reference_create_requests%ROWTYPE;
  new_ref jo.references%ROWTYPE; state_row jo.reference_states%ROWTYPE;
  cancelled boolean; requested_status integer; result jsonb;
BEGIN
  IF NOT jo.current_user_has_any_role(ARRAY['Administrador','Creador de Ficha','Diseñador Creativo']::text[]) THEN
    RAISE EXCEPTION 'Cuenta no autorizada para crear fichas' USING ERRCODE='42501';
  END IF;
  IF p_request_id IS NULL OR p_payload IS NULL OR jsonb_typeof(p_payload)<>'object'
    OR p_payload - ARRAY[
      'collection_id','year','reference_number','name','tipo_prenda_id','color','color_code',
      'line_id','subline_id','tallaje_group_id','length_description','length_cm',
      'closure_type_id','package_type_id','has_art_modification','has_trace_location',
      'has_all_over','has_embroidery','has_semielaborated','complejidad_corte_id',
      'complejidad_confeccion_id','priority_first_buy','drop_entrega',
      'envio_corte_maquila','envio_confeccion_maquila','status_id','linned',
      'requiere_muestra','tiras_continuas','especificacion_confeccion',
      'montage_type','referent_reference_id','embroidery_description'
    ]::text[] <> '{}'::jsonb THEN
    RAISE EXCEPTION 'Payload no admitido para la ficha piloto' USING ERRCODE='22023';
  END IF;
  -- UUID global: dos clientes con el mismo request_id (incluso actores distintos)
  -- se serializan antes de comprobar el recibo. Colisiones del hash solo
  -- serializan solicitudes independientes; PK(request_id) es respaldo único.
  -- Con READ COMMITTED la SELECT posterior observa el commit del primer actor.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
  SELECT * INTO existing FROM jo.pilot_reference_create_requests WHERE request_id=p_request_id;
  IF FOUND THEN
    IF existing.actor_id IS DISTINCT FROM auth.uid() OR existing.payload IS DISTINCT FROM p_payload THEN
      RAISE EXCEPTION 'Identidad de intento reutilizada con otra ficha' USING ERRCODE='23505';
    END IF;
    SELECT to_jsonb(r) INTO result FROM jo.references r WHERE r.id=existing.reference_id;
    RETURN result;
  END IF;
  IF (p_payload->>'year')::integer<>2027
    OR NOT EXISTS(SELECT 1 FROM jo.collections c WHERE c.id=(p_payload->>'collection_id')::integer
      AND c.code='SS27' AND c.year=2027 AND c.active IS TRUE)
    OR COALESCE(p_payload->>'reference_number','') !~ '^[1-9][0-9]*$'
    OR NULLIF(p_payload->>'tipo_prenda_id','') IS NULL THEN
    RAISE EXCEPTION 'Solo referencias nuevas SS27/2027 con tipo concreto' USING ERRCODE='42501';
  END IF;
  IF NULLIF(p_payload->>'montage_type','') IS NOT NULL
    AND p_payload->>'montage_type' NOT IN ('No aplica','Drapeado','Descole','Prensados') THEN
    RAISE EXCEPTION 'Montaje no válido' USING ERRCODE='22023';
  END IF;
  IF NULLIF(btrim(p_payload->>'embroidery_description'),'') IS NOT NULL
    AND COALESCE((p_payload->>'has_embroidery')::boolean,false) IS FALSE THEN
    RAISE EXCEPTION 'Descripcion bordado requiere bordado en prenda' USING ERRCODE='23514';
  END IF;
  requested_status:=NULLIF(p_payload->>'status_id','')::integer;
  INSERT INTO jo.references(
    collection_id,year,reference_number,name,tipo_prenda_id,color,color_code,
    line_id,subline_id,tallaje_group_id,length_description,length_cm,closure_type_id,
    package_type_id,has_art_modification,has_trace_location,has_all_over,
    has_embroidery,has_semielaborated,complejidad_corte_id,complejidad_confeccion_id,
    priority_first_buy,drop_entrega,envio_corte_maquila,envio_confeccion_maquila,
    status_id,linned,requiere_muestra,tiras_continuas,especificacion_confeccion,is_hidden
  ) VALUES (
    (p_payload->>'collection_id')::integer,2027,p_payload->>'reference_number',
    p_payload->>'name',(p_payload->>'tipo_prenda_id')::integer,p_payload->>'color',p_payload->>'color_code',
    NULLIF(p_payload->>'line_id','')::integer,NULLIF(p_payload->>'subline_id','')::integer,
    NULLIF(p_payload->>'tallaje_group_id','')::integer,p_payload->>'length_description',
    NULLIF(p_payload->>'length_cm','')::integer,NULLIF(p_payload->>'closure_type_id','')::integer,
    NULLIF(p_payload->>'package_type_id','')::integer,COALESCE((p_payload->>'has_art_modification')::boolean,false),
    COALESCE((p_payload->>'has_trace_location')::boolean,false),COALESCE((p_payload->>'has_all_over')::boolean,false),
    COALESCE((p_payload->>'has_embroidery')::boolean,false),COALESCE((p_payload->>'has_semielaborated')::boolean,false),
    NULLIF(p_payload->>'complejidad_corte_id','')::integer,NULLIF(p_payload->>'complejidad_confeccion_id','')::integer,
    NULLIF(p_payload->>'priority_first_buy','')::integer,NULLIF(p_payload->>'drop_entrega','')::jo.entrega_drop,
    COALESCE((p_payload->>'envio_corte_maquila')::boolean,false),
    COALESCE((p_payload->>'envio_confeccion_maquila')::boolean,false),
    requested_status,COALESCE((p_payload->>'linned')::boolean,false),
    COALESCE((p_payload->>'requiere_muestra')::boolean,false),p_payload->>'tiras_continuas',
    p_payload->>'especificacion_confeccion',false
  ) RETURNING * INTO new_ref;

  IF NULLIF(p_payload->>'montage_type','') IS NOT NULL THEN
    INSERT INTO jo.montage_mannequin(reference_id,montage_type)
      VALUES(new_ref.id,p_payload->>'montage_type');
  END IF;
  IF NULLIF(p_payload->>'referent_reference_id','') IS NOT NULL THEN
    IF (p_payload->>'referent_reference_id')::integer = new_ref.id THEN
      RAISE EXCEPTION 'La referencia no puede ser su propio referente' USING ERRCODE='23514';
    END IF;
    PERFORM 1 FROM jo.references WHERE id=(p_payload->>'referent_reference_id')::integer FOR KEY SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Referente inexistente' USING ERRCODE='23503';
    END IF;
    INSERT INTO jo.references_referents(reference_id,referent_reference_id,relationship)
      VALUES(new_ref.id,(p_payload->>'referent_reference_id')::integer,'MOLDERIA_BASE');
  END IF;
  -- La etiqueta "Bordado en Prenda" identifica el tipo existente EN_PRENDA.
  -- Registrar descripcion no crea un fork/subfase automaticamente.
  IF NULLIF(btrim(p_payload->>'embroidery_description'),'') IS NOT NULL THEN
    INSERT INTO jo.reference_embroidery(reference_id,bordado_type,description)
      VALUES(new_ref.id,'EN_PRENDA'::jo.bordado_type,btrim(p_payload->>'embroidery_description'));
  END IF;
  SELECT COALESCE(s.is_cancelled,false) INTO cancelled FROM jo.reference_statuses s WHERE s.id=new_ref.status_id;
  IF cancelled THEN
    INSERT INTO jo.reference_states(reference_id,collection_id,current_state,previous_state,
      main_trunk_state,last_process_state,lifecycle_status,pilot_version)
    VALUES(new_ref.id,new_ref.collection_id,'cancelado','concepto','concepto','concepto','cancelled',1)
    RETURNING * INTO state_row;
  ELSE
    INSERT INTO jo.reference_states(reference_id,collection_id,current_state,main_trunk_state,
      last_process_state,pilot_version)
    VALUES(new_ref.id,new_ref.collection_id,'concepto','concepto','concepto',1)
    RETURNING * INTO state_row;
  END IF;
  INSERT INTO jo.state_history(reference_id,from_state,to_state,event,"timestamp",user_id,user_role)
    VALUES(new_ref.id,'__init__','concepto','INIT',clock_timestamp(),auth.uid()::text,
      CASE WHEN jo.current_user_has_role('Administrador') THEN 'Administrador' ELSE 'Creador de Ficha' END);
  IF cancelled THEN
    INSERT INTO jo.pilot_cancel_episodes(reference_id,restore_state,active_forks,fork_snapshot)
      VALUES(new_ref.id,'concepto','{}','[]'::jsonb);
    INSERT INTO jo.state_history(reference_id,from_state,to_state,event,"timestamp",user_id,user_role)
      VALUES(new_ref.id,'concepto','cancelado','STATUS_GLOBAL_CANCELADO',clock_timestamp(),auth.uid()::text,'Administrador');
  END IF;
  INSERT INTO jo.pilot_reference_create_requests(request_id,actor_id,payload,reference_id)
    VALUES(p_request_id,auth.uid(),p_payload,new_ref.id);
  RETURN to_jsonb(new_ref);
END $$;
-- 031 se instala como core privado; no hay ventana de acceso directo para
-- authenticated entre 031 y 032. Solo el propietario llama desde la fachada.
REVOKE ALL ON FUNCTION jo.pilot_create_reference_031(jsonb,uuid) FROM PUBLIC,anon,authenticated;
COMMIT;
