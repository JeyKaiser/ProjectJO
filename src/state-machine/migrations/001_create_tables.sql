-- ===========================================================================
-- State Machine v2 — Tablas para máquina de estados de referencias
-- Schema: jo (existente)
-- ===========================================================================

-- 1. REFERENCE_STATES — Estado actual de cada referencia en la SM
CREATE TABLE IF NOT EXISTS jo.reference_states (
    id                          SERIAL PRIMARY KEY,
    reference_id                INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    collection_id               INTEGER REFERENCES jo.collections(id) ON DELETE SET NULL,
    current_state               TEXT NOT NULL CHECK (current_state IN (
        'concepto','diseno','costeo','industrializacion','produccion','comercial',
        'bordado','sublimado','proceso_externo','union',
        'pausado','completado','cancelado'
    )),
    previous_state              TEXT,
    main_trunk_state            TEXT NOT NULL DEFAULT 'concepto',
    sub_states                  TEXT[] DEFAULT '{}',
    completed_sub_states        TEXT[] DEFAULT '{}',
    waiting_for_merge           BOOLEAN DEFAULT FALSE,
    alert_level                 TEXT DEFAULT 'none' CHECK (alert_level IN ('none','warning','critical')),
    alert_reason                TEXT,
    consumption_initial         NUMERIC(10,4),
    consumption_contramuestra   NUMERIC(10,4),
    consumption_diff            NUMERIC(10,4),
    threshold_cm                NUMERIC(6,2) DEFAULT 45,
    assigned_role               TEXT,
    assigned_person_id          INTEGER REFERENCES jo.persons(id) ON DELETE SET NULL,
    timestamp_entry             TIMESTAMPTZ DEFAULT NOW(),
    last_updated                TIMESTAMPTZ DEFAULT NOW(),
    lifecycle_status            TEXT DEFAULT 'active' CHECK (lifecycle_status IN ('active','paused','cancelled','completed')),
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (reference_id)
);

-- 2. STATE_HISTORY — Trazabilidad completa de cada transición
CREATE TABLE IF NOT EXISTS jo.state_history (
    id                          SERIAL PRIMARY KEY,
    reference_id                INTEGER NOT NULL REFERENCES jo.references(id) ON DELETE CASCADE,
    from_state                  TEXT NOT NULL,
    to_state                    TEXT NOT NULL,
    event                       TEXT NOT NULL,
    timestamp                   TIMESTAMPTZ DEFAULT NOW(),
    duration_in_previous_ms     BIGINT,
    user_id                     TEXT,
    user_display_name           TEXT,
    user_role                   TEXT,
    requires_justification      BOOLEAN DEFAULT FALSE,
    justification               TEXT,
    consumption_change           JSONB,
    molderia_changes             JSONB,
    is_parallel_fork            BOOLEAN DEFAULT FALSE,
    is_parallel_merge           BOOLEAN DEFAULT FALSE,
    fork_type                   TEXT
);

CREATE INDEX IF NOT EXISTS idx_state_history_ref_ts
    ON jo.state_history(reference_id, timestamp DESC);

-- 3. ALERT_THRESHOLDS — Umbrales configurables por colección y referencia
CREATE TABLE IF NOT EXISTS jo.alert_thresholds (
    id              SERIAL PRIMARY KEY,
    collection_id   INTEGER REFERENCES jo.collections(id) ON DELETE CASCADE,
    reference_id    INTEGER REFERENCES jo.references(id) ON DELETE CASCADE,
    threshold_cm    NUMERIC(6,2) NOT NULL DEFAULT 45,
    created_by      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_alert_thresholds_scope
    ON jo.alert_thresholds (COALESCE(collection_id, -1), COALESCE(reference_id, -1));

-- Insertar threshold global por defecto
INSERT INTO jo.alert_thresholds (collection_id, reference_id, threshold_cm)
VALUES (NULL, NULL, 45);

-- Trigger: actualizar updated_at en reference_states
CREATE OR REPLACE FUNCTION jo.update_sm_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_reference_states_updated'
    ) THEN
        CREATE TRIGGER trg_reference_states_updated
            BEFORE UPDATE ON jo.reference_states
            FOR EACH ROW EXECUTE FUNCTION jo.update_sm_timestamp();
    END IF;
END $$;
