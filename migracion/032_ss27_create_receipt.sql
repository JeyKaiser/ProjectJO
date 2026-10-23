-- L3-v7 / 032. NO-RUN. Exclusivamente clon SS27 aislado, despues de 030 -> 031,
-- antes de habilitar la UI. No toca datos reales ni requiere 029.
-- Confirmar externally proyecto/clon; SET jo.pilot_ss27_isolated='approved'
-- en la sesion del clon ANTES de ejecutar; el flag no demuestra aislamiento.
BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='2min';
DO $$ BEGIN
  IF current_setting('jo.pilot_ss27_isolated',true) IS DISTINCT FROM 'approved'
    OR to_regclass('jo.pilot_reference_create_requests') IS NULL
    OR to_regprocedure('jo.pilot_create_reference_031(jsonb,uuid)') IS NULL THEN
    RAISE EXCEPTION '032 requiere clon confirmado y 031 aplicada';
  END IF;
  -- No se puede inferir el resultado ORIGINAL de una ficha ya editada.
  IF EXISTS (SELECT 1 FROM jo.pilot_reference_create_requests) THEN
    RAISE EXCEPTION '032 exige receipts vacios; revision manual sin backfill historico';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='jo'
    AND table_name='pilot_reference_create_requests' AND column_name='result') THEN
    RAISE EXCEPTION '032 ya aplicada o esquema divergente: revision manual';
  END IF;
END $$;

ALTER TABLE jo.pilot_reference_create_requests ADD COLUMN result jsonb
  CHECK (result IS NULL OR jsonb_typeof(result)='object');

-- Solo la fachada expuesta es invocable por clientes. La RPC 031 sigue
-- disponible al propietario dentro de esta misma transaccion, sin exponer
-- lecturas mutables del registro al reintento de un cliente autenticado.
REVOKE EXECUTE ON FUNCTION jo.pilot_create_reference_031(jsonb,uuid) FROM authenticated;
CREATE OR REPLACE FUNCTION jo.pilot_create_reference_032(p_payload jsonb,p_request_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE existing jo.pilot_reference_create_requests%ROWTYPE; created jsonb;
BEGIN
  IF NOT jo.current_user_has_any_role(ARRAY['Administrador','Creador de Ficha','Diseñador Creativo']::text[]) THEN
    RAISE EXCEPTION 'Cuenta no autorizada para crear fichas' USING ERRCODE='42501';
  END IF;
  IF p_request_id IS NULL OR p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' THEN
    RAISE EXCEPTION 'request_id/payload invalidos' USING ERRCODE='22023';
  END IF;
  -- Mismo UUID (incluso de otro actor) espera el commit y lee su receipt.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
  SELECT * INTO existing FROM jo.pilot_reference_create_requests WHERE request_id=p_request_id;
  IF FOUND THEN
    IF existing.payload IS DISTINCT FROM p_payload OR existing.actor_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Identidad de intento reutilizada con otra ficha' USING ERRCODE='23505';
    END IF;
    IF existing.result IS NULL THEN
      RAISE EXCEPTION 'Receipt sin resultado original: revision manual' USING ERRCODE='23514';
    END IF;
    RETURN existing.result;
  END IF;
  created:=jo.pilot_create_reference_031(p_payload,p_request_id);
  UPDATE jo.pilot_reference_create_requests SET result=created
    WHERE request_id=p_request_id AND actor_id=auth.uid() AND payload=p_payload AND result IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Receipt no creado: rollback' USING ERRCODE='23514'; END IF;
  RETURN created;
END $$;
REVOKE ALL ON FUNCTION jo.pilot_create_reference_032(jsonb,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION jo.pilot_create_reference_032(jsonb,uuid) TO authenticated;
COMMIT;
