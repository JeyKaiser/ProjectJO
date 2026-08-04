-- ===========================================================================
-- AtelierData v2.0 — RLS restrictivo para reference_codes (admin solo escribe)
-- Ejecutar DESPUES de 013_code_log_and_triggers.sql
-- ===========================================================================
SET search_path = jo, public;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Helper function: verifica si el usuario autenticado es admin
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION jo.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM jo.user_accounts
        WHERE email = auth.email()
          AND role = 'Administrador'
          AND active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Reemplazar políticas existentes en reference_codes
-- ═══════════════════════════════════════════════════════════════════════════

-- Eliminar políticas viejas (broad authenticated)
DROP POLICY IF EXISTS "Codes: lectura autenticados"      ON jo.reference_codes;
DROP POLICY IF EXISTS "Codes: insercion autenticados"     ON jo.reference_codes;

-- Nueva: lectura para todos los autenticados
CREATE POLICY "Codes: lectura autenticados"
    ON jo.reference_codes FOR SELECT
    USING (auth.role() = 'authenticated');

-- Nueva: inserción solo admin
CREATE POLICY "Codes: insercion admin"
    ON jo.reference_codes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND jo.is_admin_user());

-- Nueva: actualización solo admin
CREATE POLICY "Codes: actualizacion admin"
    ON jo.reference_codes FOR UPDATE
    USING (auth.role() = 'authenticated' AND jo.is_admin_user());

-- Nueva: eliminación solo admin
CREATE POLICY "Codes: eliminacion admin"
    ON jo.reference_codes FOR DELETE
    USING (auth.role() = 'authenticated' AND jo.is_admin_user());

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. Políticas para code_pool (admin escribe, autenticados leen)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "CodePool: insercion admin"
    ON jo.code_pool FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND jo.is_admin_user());

CREATE POLICY "CodePool: actualizacion admin"
    ON jo.code_pool FOR UPDATE
    USING (auth.role() = 'authenticated' AND jo.is_admin_user());

CREATE POLICY "CodePool: eliminacion admin"
    ON jo.code_pool FOR DELETE
    USING (auth.role() = 'authenticated' AND jo.is_admin_user());

-- Políticas para code_log (solo lectura, los triggers escriben con SECURITY DEFINER)
-- (los triggers corren como owner, no necesitan política)

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. Seed inicial: generar code_pool desde reference_codes existentes
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO jo.code_pool (code, code_type, status, prefix)
SELECT code, code_type, 'ASIGNADO', split_part(code, '-', 1)
FROM jo.reference_codes
WHERE active = TRUE
  AND code NOT IN (SELECT code FROM jo.code_pool)
ON CONFLICT (code) DO NOTHING;

-- Vincular reference_codes existentes con el pool
UPDATE jo.reference_codes rc
SET pool_code_id = cp.id
FROM jo.code_pool cp
WHERE rc.code = cp.code
  AND rc.code_type = cp.code_type
  AND rc.pool_code_id IS NULL;

SELECT 'RLS admin configurado. ' || COUNT(*) || ' códigos sincronizados al pool.' AS resultado
FROM jo.code_pool;
