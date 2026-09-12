-- AtelierData v2.0 - Vinculo de Supabase Auth con cuentas y personas
-- Ejecutar despues de crear jo.user_accounts y antes de habilitar el acceso real.
-- Las cuentas de auth deben existir previamente para que el enlace automatico funcione.

SET search_path = jo, public;

ALTER TABLE jo.user_accounts
    ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE jo.persons
    ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS user_accounts_auth_user_id_uidx
    ON jo.user_accounts(auth_user_id)
    WHERE auth_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS persons_auth_user_id_uidx
    ON jo.persons(auth_user_id)
    WHERE auth_user_id IS NOT NULL;

-- Vincula las cuentas existentes cuando el correo coincide con auth.users.
UPDATE jo.user_accounts AS account
SET auth_user_id = auth_user.id
FROM auth.users AS auth_user
WHERE account.auth_user_id IS NULL
  AND LOWER(account.email) = LOWER(auth_user.email)
  AND NOT EXISTS (
      SELECT 1
      FROM jo.user_accounts AS occupied
      WHERE occupied.auth_user_id = auth_user.id
  );

UPDATE jo.persons AS person
SET auth_user_id = account.auth_user_id
FROM jo.user_accounts AS account
WHERE person.auth_user_id IS NULL
  AND account.person_id = person.id
  AND account.auth_user_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM jo.persons AS occupied
      WHERE occupied.auth_user_id = account.auth_user_id
  );

ALTER TABLE jo.user_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "UserAccounts: lectura propia" ON jo.user_accounts;
CREATE POLICY "UserAccounts: lectura propia"
    ON jo.user_accounts FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = auth_user_id);

CREATE OR REPLACE FUNCTION jo.current_user_has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM jo.user_accounts AS account
        WHERE account.auth_user_id = (SELECT auth.uid())
          AND account.active IS TRUE
          AND account.role = required_role
    );
$$;

REVOKE EXECUTE ON FUNCTION jo.current_user_has_role(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION jo.current_user_has_role(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION jo.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT jo.current_user_has_role('Administrador');
$$;

REVOKE EXECUTE ON FUNCTION jo.is_admin_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION jo.is_admin_user() TO authenticated;

-- La Ficha Final nunca debe aceptar llamadas anonimas.
REVOKE EXECUTE ON FUNCTION jo.save_final_sheet(JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION jo.save_final_sheet(JSONB) TO authenticated;

CREATE INDEX IF NOT EXISTS user_accounts_role_active_idx
    ON jo.user_accounts(role, active)
    WHERE active IS TRUE;
