-- Verificacion de Auth/RBAC para ejecutar en Supabase SQL Editor.
-- Este archivo solo consulta metadatos y no modifica datos.

SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'jo'
  AND table_name IN ('user_accounts', 'persons')
  AND column_name = 'auth_user_id'
ORDER BY table_name;

SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'jo'
  AND indexname IN ('user_accounts_auth_user_id_uidx', 'persons_auth_user_id_uidx');

SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'jo'
  AND tablename = 'user_accounts';

SELECT
    has_function_privilege('anon', 'jo.save_final_sheet(jsonb)', 'EXECUTE') AS anon_can_save_final_sheet,
    has_function_privilege('authenticated', 'jo.save_final_sheet(jsonb)', 'EXECUTE') AS authenticated_can_save_final_sheet,
    has_function_privilege('authenticated', 'jo.current_user_has_role(text)', 'EXECUTE') AS authenticated_can_check_role;

SELECT
    email,
    display_name,
    role,
    active,
    auth_user_id,
    auth_user_id IS NOT NULL AS auth_linked
FROM jo.user_accounts
ORDER BY email;

-- Verificacion de las funciones de contexto y sus permisos.
SELECT
    has_function_privilege('anon', 'jo.current_user_is_active()', 'EXECUTE') AS anon_can_check_active,
    has_function_privilege('authenticated', 'jo.current_user_is_active()', 'EXECUTE') AS authenticated_can_check_active,
    has_function_privilege('anon', 'jo.current_user_has_any_role(text[])', 'EXECUTE') AS anon_can_check_any_role,
    has_function_privilege('authenticated', 'jo.current_user_has_any_role(text[])', 'EXECUTE') AS authenticated_can_check_any_role,
    has_function_privilege('anon', 'jo.save_final_sheet(jsonb)', 'EXECUTE') AS anon_can_save_final_sheet,
    has_function_privilege('authenticated', 'jo.save_final_sheet(jsonb)', 'EXECUTE') AS authenticated_can_save_final_sheet;

SELECT
    has_table_privilege('anon', 'jo.code_log', 'INSERT') AS anon_can_write_code_log,
    has_table_privilege('authenticated', 'jo.code_log', 'INSERT') AS authenticated_can_write_code_log,
    has_table_privilege('authenticated', 'jo.code_log', 'SELECT') AS authenticated_can_read_code_log;

-- Debe devolver una fila por tabla de negocio y relrowsecurity debe ser TRUE.
-- policy_count debe ser mayor que cero en todas las tablas administradas.
SELECT
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    COUNT(p.policyname) AS policy_count
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
LEFT JOIN pg_policies AS p
    ON p.schemaname = n.nspname
   AND p.tablename = c.relname
WHERE n.nspname = 'jo'
  AND c.relkind = 'r'
GROUP BY c.relname, c.relrowsecurity
ORDER BY c.relname;

-- Debe devolver cero filas despues de ejecutar 023_rbac_policies.sql.
SELECT c.relname AS tables_without_rls
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'jo'
  AND c.relkind = 'r'
  AND c.relrowsecurity IS FALSE
ORDER BY c.relname;

-- Matriz efectiva: permite revisar que cada tabla tenga las operaciones
-- esperadas y que ninguna politica siga dirigida a anon/public.
SELECT
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'jo'
ORDER BY tablename, policyname;
