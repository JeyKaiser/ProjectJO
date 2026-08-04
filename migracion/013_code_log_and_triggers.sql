-- ===========================================================================
-- AtelierData v2.0 — Code Log + Triggers de sincronización
-- Ejecutar DESPUES de 011_code_pool.sql y 012_alter_reference_codes.sql
-- ===========================================================================
SET search_path = jo, public;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. TABLA: code_log — Auditoría de asignaciones
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE jo.code_log (
    id              SERIAL PRIMARY KEY,
    reference_id    INTEGER REFERENCES jo.references(id) ON DELETE SET NULL,
    code_type       jo.reference_code_type NOT NULL,
    old_code        TEXT,
    new_code        TEXT,
    action          TEXT NOT NULL
                    CHECK (action IN ('ASIGNAR','REASIGNAR','LIBERAR')),
    changed_by      TEXT,
    changed_at      TIMESTAMPTZ DEFAULT NOW(),
    notes           TEXT
);

COMMENT ON TABLE jo.code_log IS 'Auditoría de cada cambio en asignaciones de códigos MD/PT.';
COMMENT ON COLUMN jo.code_log.action IS 'ASIGNAR: primera asignación | REASIGNAR: cambio de código | LIBERAR: código desasignado';

CREATE INDEX idx_code_log_reference ON jo.code_log(reference_id);
CREATE INDEX idx_code_log_type      ON jo.code_log(code_type);
CREATE INDEX idx_code_log_action    ON jo.code_log(action);
CREATE INDEX idx_code_log_date      ON jo.code_log(changed_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. TRIGGER FUNCTION: sincronizar code_pool al INSERTAR reference_codes
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION jo.sync_code_pool_on_insert()
RETURNS TRIGGER AS $$
DECLARE
    pool_id INTEGER;
BEGIN
    -- Buscar o crear el código en el pool
    SELECT id INTO pool_id FROM jo.code_pool WHERE code = NEW.code AND code_type = NEW.code_type;
    IF pool_id IS NULL THEN
        INSERT INTO jo.code_pool (code, code_type, status, prefix)
        VALUES (NEW.code, NEW.code_type, 'ASIGNADO', split_part(NEW.code, '-', 1))
        RETURNING id INTO pool_id;
    ELSE
        UPDATE jo.code_pool SET status = 'ASIGNADO', updated_at = NOW() WHERE id = pool_id;
    END IF;

    -- Vincular
    NEW.pool_code_id := pool_id;

    -- Registrar en log
    INSERT INTO jo.code_log (reference_id, code_type, old_code, new_code, action, changed_by)
    VALUES (NEW.reference_id, NEW.code_type, NULL, NEW.code, 'ASIGNAR', NEW.assigned_by);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ref_codes_insert ON jo.reference_codes;
CREATE TRIGGER trg_ref_codes_insert
    BEFORE INSERT ON jo.reference_codes
    FOR EACH ROW EXECUTE FUNCTION jo.sync_code_pool_on_insert();

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. TRIGGER FUNCTION: sincronizar code_pool al ACTUALIZAR reference_codes
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION jo.sync_code_pool_on_update()
RETURNS TRIGGER AS $$
DECLARE
    new_pool_id INTEGER;
BEGIN
    -- Solo si cambió el código
    IF NEW.code IS DISTINCT FROM OLD.code THEN
        -- Liberar código anterior en el pool
        IF OLD.pool_code_id IS NOT NULL THEN
            UPDATE jo.code_pool SET status = 'DISPONIBLE', updated_at = NOW()
            WHERE id = OLD.pool_code_id;
        END IF;

        -- Buscar o crear el nuevo código en el pool
        SELECT id INTO new_pool_id FROM jo.code_pool WHERE code = NEW.code AND code_type = NEW.code_type;
        IF new_pool_id IS NULL THEN
            INSERT INTO jo.code_pool (code, code_type, status, prefix)
            VALUES (NEW.code, NEW.code_type, 'ASIGNADO', split_part(NEW.code, '-', 1))
            RETURNING id INTO new_pool_id;
        ELSE
            UPDATE jo.code_pool SET status = 'ASIGNADO', updated_at = NOW() WHERE id = new_pool_id;
        END IF;

        NEW.pool_code_id := new_pool_id;

        -- Registrar en log
        INSERT INTO jo.code_log (reference_id, code_type, old_code, new_code, action, changed_by)
        VALUES (NEW.reference_id, NEW.code_type, OLD.code, NEW.code, 'REASIGNAR', NEW.assigned_by);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ref_codes_update ON jo.reference_codes;
CREATE TRIGGER trg_ref_codes_update
    BEFORE UPDATE ON jo.reference_codes
    FOR EACH ROW EXECUTE FUNCTION jo.sync_code_pool_on_update();

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. TRIGGER FUNCTION: liberar código al ELIMINAR/DESACTIVAR reference_codes
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION jo.sync_code_pool_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Liberar código en el pool
    IF OLD.pool_code_id IS NOT NULL THEN
        UPDATE jo.code_pool SET status = 'DISPONIBLE', updated_at = NOW()
        WHERE id = OLD.pool_code_id;
    END IF;

    -- Registrar en log
    INSERT INTO jo.code_log (reference_id, code_type, old_code, new_code, action, changed_by)
    VALUES (OLD.reference_id, OLD.code_type, OLD.code, NULL, 'LIBERAR', OLD.assigned_by);

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ref_codes_delete ON jo.reference_codes;
CREATE TRIGGER trg_ref_codes_delete
    BEFORE DELETE ON jo.reference_codes
    FOR EACH ROW EXECUTE FUNCTION jo.sync_code_pool_on_delete();

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. TRIGGER: actualizar updated_at en code_pool
-- ═══════════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS trg_code_pool_updated ON jo.code_pool;
CREATE TRIGGER trg_code_pool_updated
    BEFORE UPDATE ON jo.code_pool
    FOR EACH ROW EXECUTE FUNCTION jo.update_timestamp();

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. HABILITAR RLS EN NUEVAS TABLAS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE jo.code_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.code_log ENABLE ROW LEVEL SECURITY;

-- Lectura para autenticados
CREATE POLICY "CodePool: lectura autenticados"
    ON jo.code_pool FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "CodeLog: lectura autenticados"
    ON jo.code_log FOR SELECT USING (auth.role() = 'authenticated');

-- Verificación
SELECT 'Tablas creadas y triggers instalados' AS resultado;
