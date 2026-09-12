-- ===========================================================================
-- AtelierData v2.0 - Migracion: OT de taller y hand-off de referencias
-- Ejecutar despues de 023_rbac_policies.sql en el SQL Editor de Supabase.
-- ===========================================================================
SET search_path = jo, public;

-- ---------------------------------------------------------------------------
-- 1. OT DEL TALLER
--    Una OT representa el trabajo que se mueve por corte, confeccion,
--    procesos externos y medicion. cut_requests permanece como la bandeja
--    especifica de solicitudes de corte.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jo.workshop_orders (
    id                       BIGSERIAL PRIMARY KEY,
    reference_id             INTEGER REFERENCES jo.references(id) ON DELETE SET NULL,
    collection_id            INTEGER REFERENCES jo.collections(id) ON DELETE SET NULL,
    reference_number         TEXT,
    garment_type             TEXT NOT NULL,
    collection_raw           TEXT,
    referent                 TEXT,
    stage                    TEXT NOT NULL DEFAULT 'corte'
                             CHECK (stage IN ('corte', 'confeccion', 'procesoExterno', 'medicion')),
    status                   TEXT NOT NULL DEFAULT 'waiting'
                             CHECK (status IN ('active', 'paused', 'waiting', 'completed')),
    priority                 TEXT NOT NULL DEFAULT 'media'
                             CHECK (priority IN ('alta', 'media', 'baja')),
    requester_name           TEXT,
    requester_role           TEXT,
    assigned_operator_names  TEXT[] NOT NULL DEFAULT '{}',
    observations             TEXT,
    created_by               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at             TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_workshop_orders_stage_status
    ON jo.workshop_orders(stage, status);
CREATE INDEX IF NOT EXISTS idx_workshop_orders_reference
    ON jo.workshop_orders(reference_id);
CREATE INDEX IF NOT EXISTS idx_workshop_orders_collection
    ON jo.workshop_orders(collection_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_workshop_orders_updated'
    ) THEN
        CREATE TRIGGER trg_workshop_orders_updated
            BEFORE UPDATE ON jo.workshop_orders
            FOR EACH ROW EXECUTE FUNCTION jo.update_timestamp();
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. HAND-OFF DE REFERENCIAS
--    Cada fila es una entrega a un area. La fila activa es PENDING_RECEIPT o
--    IN_PROGRESS; las filas completadas conservan la trazabilidad.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jo.reference_handoffs (
    id              BIGSERIAL PRIMARY KEY,
    reference_id    INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    from_area       TEXT CHECK (from_area IN ('CREATIVO', 'TECNICO', 'TRAZADOR')),
    to_area         TEXT NOT NULL CHECK (to_area IN ('CREATIVO', 'TECNICO', 'TRAZADOR')),
    status          TEXT NOT NULL DEFAULT 'PENDING_RECEIPT'
                    CHECK (status IN ('PENDING_RECEIPT', 'IN_PROGRESS', 'COMPLETED')),
    last_action     TEXT NOT NULL CHECK (last_action IN ('ENTREGADO', 'RECIBIDO')),
    last_action_by  TEXT,
    last_action_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_by    TEXT,
    delivered_at    TIMESTAMPTZ,
    received_by     TEXT,
    received_at     TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE jo.reference_handoffs
    ADD COLUMN IF NOT EXISTS delivered_by TEXT,
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS received_by TEXT,
    ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_reference_handoffs_reference_created
    ON jo.reference_handoffs(reference_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reference_handoffs_active
    ON jo.reference_handoffs(reference_id, status)
    WHERE status <> 'COMPLETED';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_reference_handoffs_updated'
    ) THEN
        CREATE TRIGGER trg_reference_handoffs_updated
            BEFORE UPDATE ON jo.reference_handoffs
            FOR EACH ROW EXECUTE FUNCTION jo.update_timestamp();
    END IF;
END $$;

-- Transicion atomica: cierra el hand-off actual y crea el siguiente.
CREATE OR REPLACE FUNCTION jo.deliver_reference_handoff(
    p_handoff_id BIGINT,
    p_next_area TEXT,
    p_actor_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = jo, public
AS $$
DECLARE
    current_handoff jo.reference_handoffs%ROWTYPE;
BEGIN
    IF p_next_area NOT IN ('CREATIVO', 'TECNICO', 'TRAZADOR') THEN
        RAISE EXCEPTION 'Area de destino no valida: %', p_next_area;
    END IF;

    SELECT * INTO current_handoff
    FROM jo.reference_handoffs
    WHERE id = p_handoff_id
      AND status = 'IN_PROGRESS'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El hand-off no existe o no esta en progreso';
    END IF;

    UPDATE jo.reference_handoffs
    SET status = 'COMPLETED',
        last_action = 'ENTREGADO',
        last_action_by = p_actor_role,
        last_action_at = NOW(),
        delivered_by = p_actor_role,
        delivered_at = NOW()
    WHERE id = p_handoff_id;

    INSERT INTO jo.reference_handoffs (
        reference_id, from_area, to_area, status,
        last_action, last_action_by, last_action_at,
        delivered_by, delivered_at
    ) VALUES (
        current_handoff.reference_id, current_handoff.to_area, p_next_area,
        'PENDING_RECEIPT', 'ENTREGADO', p_actor_role, NOW(),
        p_actor_role, NOW()
    );
END;
$$;

CREATE OR REPLACE FUNCTION jo.return_reference_handoff(
    p_handoff_id BIGINT,
    p_next_area TEXT,
    p_actor_role TEXT,
    p_notes TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = jo, public
AS $$
DECLARE
    current_handoff jo.reference_handoffs%ROWTYPE;
BEGIN
    IF p_next_area NOT IN ('CREATIVO', 'TECNICO', 'TRAZADOR') THEN
        RAISE EXCEPTION 'Area de retorno no valida: %', p_next_area;
    END IF;

    SELECT * INTO current_handoff
    FROM jo.reference_handoffs
    WHERE id = p_handoff_id
      AND status = 'IN_PROGRESS'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El hand-off no existe o no esta en progreso';
    END IF;

    UPDATE jo.reference_handoffs
    SET status = 'COMPLETED',
        last_action = 'ENTREGADO',
        last_action_by = p_actor_role,
        last_action_at = NOW(),
        delivered_by = p_actor_role,
        delivered_at = NOW(),
        notes = p_notes
    WHERE id = p_handoff_id;

    INSERT INTO jo.reference_handoffs (
        reference_id, from_area, to_area, status,
        last_action, last_action_by, last_action_at,
        delivered_by, delivered_at, notes
    ) VALUES (
        current_handoff.reference_id, current_handoff.to_area, p_next_area,
        'PENDING_RECEIPT', 'ENTREGADO', p_actor_role, NOW(),
        p_actor_role, NOW(), p_notes
    );
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. Campos usados por la creacion/importacion de solicitudes de corte.
-- ---------------------------------------------------------------------------
ALTER TABLE jo.cut_requests
    ADD COLUMN IF NOT EXISTS reference_number_csv TEXT,
    ADD COLUMN IF NOT EXISTS collection_raw TEXT,
    ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'app';

CREATE INDEX IF NOT EXISTS idx_cut_requests_source
    ON jo.cut_requests(source);

-- ---------------------------------------------------------------------------
-- 4. RLS especifico de las tablas nuevas.
--    Se ejecuta despues de 023 porque usa las funciones RBAC consolidadas.
-- ---------------------------------------------------------------------------
ALTER TABLE jo.workshop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.reference_handoffs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workshop_orders_active_select ON jo.workshop_orders;
CREATE POLICY workshop_orders_active_select
    ON jo.workshop_orders FOR SELECT TO authenticated
    USING ((SELECT jo.current_user_is_active()));

DROP POLICY IF EXISTS workshop_orders_write ON jo.workshop_orders;
CREATE POLICY workshop_orders_write
    ON jo.workshop_orders FOR INSERT TO authenticated
    WITH CHECK ((SELECT jo.current_user_has_any_role(
        ARRAY['Administrador', 'Diseñador Creativo', 'Diseñador Técnico', 'Líder de Modistas']::TEXT[]
    )));

DROP POLICY IF EXISTS workshop_orders_update ON jo.workshop_orders;
CREATE POLICY workshop_orders_update
    ON jo.workshop_orders FOR UPDATE TO authenticated
    USING ((SELECT jo.current_user_has_any_role(
        ARRAY['Administrador', 'Diseñador Creativo', 'Diseñador Técnico', 'Líder de Modistas']::TEXT[]
    )))
    WITH CHECK ((SELECT jo.current_user_has_any_role(
        ARRAY['Administrador', 'Diseñador Creativo', 'Diseñador Técnico', 'Líder de Modistas']::TEXT[]
    )));

DROP POLICY IF EXISTS reference_handoffs_active_select ON jo.reference_handoffs;
CREATE POLICY reference_handoffs_active_select
    ON jo.reference_handoffs FOR SELECT TO authenticated
    USING ((SELECT jo.current_user_is_active()));

DROP POLICY IF EXISTS reference_handoffs_write ON jo.reference_handoffs;
CREATE POLICY reference_handoffs_write
    ON jo.reference_handoffs FOR INSERT TO authenticated
    WITH CHECK ((SELECT jo.current_user_has_any_role(
        ARRAY['Administrador', 'Creador de Ficha', 'Diseñador Creativo',
              'Diseñador Técnico', 'Trazador']::TEXT[]
    )));

DROP POLICY IF EXISTS reference_handoffs_update ON jo.reference_handoffs;
CREATE POLICY reference_handoffs_update
    ON jo.reference_handoffs FOR UPDATE TO authenticated
    USING ((SELECT jo.current_user_has_any_role(
        ARRAY['Administrador', 'Creador de Ficha', 'Diseñador Creativo',
              'Diseñador Técnico', 'Trazador']::TEXT[]
    )))
    WITH CHECK ((SELECT jo.current_user_has_any_role(
        ARRAY['Administrador', 'Creador de Ficha', 'Diseñador Creativo',
              'Diseñador Técnico', 'Trazador']::TEXT[]
    )));

REVOKE ALL ON FUNCTION jo.deliver_reference_handoff(BIGINT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION jo.deliver_reference_handoff(BIGINT, TEXT, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION jo.return_reference_handoff(BIGINT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION jo.return_reference_handoff(BIGINT, TEXT, TEXT, TEXT) TO authenticated;

GRANT USAGE ON SCHEMA jo TO authenticated;
GRANT SELECT, INSERT, UPDATE ON jo.workshop_orders, jo.reference_handoffs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE jo.workshop_orders_id_seq, jo.reference_handoffs_id_seq TO authenticated;
GRANT SELECT, INSERT, UPDATE ON jo.cut_requests TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE jo.cut_requests_id_seq TO authenticated;

COMMENT ON TABLE jo.workshop_orders IS 'Ordenes de trabajo del taller y su avance por corte, confeccion, procesos externos y medicion.';
COMMENT ON TABLE jo.reference_handoffs IS 'Historial persistente de entregas y recepciones entre areas de una referencia.';
