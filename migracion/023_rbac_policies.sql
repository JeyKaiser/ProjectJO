-- ===========================================================================
-- AtelierData v2.0 - RBAC y RLS por rol
-- Ejecutar DESPUES de 022_auth_rbac.sql y de las migraciones de cada modulo.
--
-- Objetivo:
--   1. Ningun acceso anonimo a las tablas de negocio.
--   2. Solo cuentas Auth enlazadas y activas pueden consultar datos.
--   3. Las escrituras se restringen al rol funcional correspondiente.
--   4. Administrador conserva acceso completo excepto al log de auditoria.
--
-- La migracion es idempotente: elimina las politicas anteriores de las tablas
-- administradas y las vuelve a crear con nombres estables.
-- ===========================================================================

SET search_path = jo, public;

-- ---------------------------------------------------------------------------
-- 1. Funciones de contexto de seguridad
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION jo.current_user_is_active()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT (SELECT auth.uid()) IS NOT NULL
       AND EXISTS (
           SELECT 1
           FROM jo.user_accounts AS account
           WHERE account.auth_user_id = (SELECT auth.uid())
             AND account.active IS TRUE
             AND account.role = ANY(ARRAY[
                 'Administrador', 'Creador de Ficha', 'Diseñador Creativo',
                 'Diseñador Técnico', 'Líder de Modistas', 'Trazador',
                 'Especificadora', 'Cortador', 'Líder de Cortadores',
                 'Bodega', 'Visitante'
             ]::TEXT[])
       );
$$;

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

CREATE OR REPLACE FUNCTION jo.current_user_has_any_role(required_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT required_roles IS NOT NULL
       AND EXISTS (
           SELECT 1
           FROM jo.user_accounts AS account
           WHERE account.auth_user_id = (SELECT auth.uid())
             AND account.active IS TRUE
             AND account.role = ANY(required_roles)
       );
$$;

CREATE OR REPLACE FUNCTION jo.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT jo.current_user_has_role('Administrador');
$$;

REVOKE EXECUTE ON FUNCTION jo.current_user_is_active() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION jo.current_user_has_role(TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION jo.current_user_has_any_role(TEXT[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION jo.is_admin_user() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION jo.current_user_is_active() TO authenticated;
GRANT EXECUTE ON FUNCTION jo.current_user_has_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION jo.current_user_has_any_role(TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION jo.is_admin_user() TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Tablas administradas por esta politica
-- ---------------------------------------------------------------------------

DO $$
DECLARE
    app_tables TEXT[] := ARRAY[
        'collections', 'collection_groups', 'collection_years',
        'lines', 'sublines', 'tallaje_groups', 'person_roles',
        'reference_statuses', 'workshop_statuses', 'closure_types',
        'include_types', 'fabric_base_types', 'empaques', 'care_types',
        'difficulty_levels', 'process_types', 'variant_types', 'tejido_types',
        'corte_types', 'nota_fabricacion_statuses', 'tipo_prendas', 'largos',
        'usos_tela', 'sentidos_tela', 'unidades_medida', 'temporadas',
        'persons', 'user_accounts', 'person_role_assignments', 'fabrics',
        'supplies', 'references', 'reference_codes', 'code_pool', 'code_log',
        'references_variants', 'references_referents', 'reference_fabrics',
        'reference_supplies', 'reference_includes', 'consumos',
        'notas_fabricacion', 'contramuestras', 'molderia', 'laboratorios',
        'entregables', 'workflow_phases', 'reference_assignments',
        'reference_phase_history', 'reference_embroidery',
        'reference_semielaborated', 'external_processes', 'production_units',
        'quality_issues', 'tech_sheets', 'measures', 'compositions',
        'composition_materials', 'care_instructions', 'montage_mannequin',
        'cuts', 'sewings', 'reference_images', 'embroidery_reviews',
        'production_feedback', 'cut_requests', 'trazos',
        'comparativo_trazos', 'colors', 'collection_colors', 'referents',
        'referent_photos', 'supply_requests', 'mediciones',
        'reference_states', 'state_history', 'alert_thresholds'
    ];
    policy_row RECORD;
    table_name TEXT;
BEGIN
    -- Se eliminan solo las politicas de las tablas de AtelierData. Esto evita
    -- dejar combinadas las politicas anon antiguas con las nuevas.
    FOR policy_row IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'jo'
          AND tablename = ANY(app_tables)
    LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS %I ON jo.%I',
            policy_row.policyname,
            policy_row.tablename
        );
    END LOOP;

    FOREACH table_name IN ARRAY app_tables
    LOOP
        IF to_regclass(format('jo.%I', table_name)) IS NOT NULL THEN
            EXECUTE format('ALTER TABLE jo.%I ENABLE ROW LEVEL SECURITY', table_name);
        END IF;
    END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. Lectura: cualquier cuenta Auth activa puede consultar el dominio.
--    user_accounts es la excepcion: cada usuario ve solo su cuenta, salvo admin.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
    read_tables TEXT[] := ARRAY[
        'collections', 'collection_groups', 'collection_years',
        'lines', 'sublines', 'tallaje_groups', 'person_roles',
        'reference_statuses', 'workshop_statuses', 'closure_types',
        'include_types', 'fabric_base_types', 'empaques', 'care_types',
        'difficulty_levels', 'process_types', 'variant_types', 'tejido_types',
        'corte_types', 'nota_fabricacion_statuses', 'tipo_prendas', 'largos',
        'usos_tela', 'sentidos_tela', 'unidades_medida', 'temporadas',
        'persons', 'person_role_assignments', 'fabrics', 'supplies',
        'references', 'reference_codes',
        'references_variants', 'references_referents', 'reference_fabrics',
        'reference_supplies', 'reference_includes', 'consumos',
        'notas_fabricacion', 'contramuestras', 'molderia', 'laboratorios',
        'entregables', 'workflow_phases', 'reference_assignments',
        'reference_phase_history', 'reference_embroidery',
        'reference_semielaborated', 'external_processes', 'production_units',
        'quality_issues', 'tech_sheets', 'measures', 'compositions',
        'composition_materials', 'care_instructions', 'montage_mannequin',
        'cuts', 'sewings', 'reference_images', 'embroidery_reviews',
        'production_feedback', 'cut_requests', 'trazos',
        'comparativo_trazos', 'colors', 'collection_colors', 'referents',
        'referent_photos', 'supply_requests', 'mediciones',
        'reference_states', 'state_history', 'alert_thresholds'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY read_tables
    LOOP
        IF to_regclass(format('jo.%I', table_name)) IS NOT NULL THEN
            EXECUTE format(
                'CREATE POLICY rbac_active_select ON jo.%I FOR SELECT TO authenticated USING ((SELECT jo.current_user_is_active()))',
                table_name
            );
        END IF;
    END LOOP;
END;
$$;

CREATE POLICY rbac_user_accounts_self_select
    ON jo.user_accounts FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = auth_user_id);

DO $$
BEGIN
    IF to_regclass('jo.code_log') IS NOT NULL THEN
        CREATE POLICY rbac_code_log_admin_select
            ON jo.code_log FOR SELECT TO authenticated
            USING ((SELECT jo.current_user_has_role('Administrador')));
    END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Administrador: CRUD completo en tablas operativas y de catalogo.
--    code_log queda fuera de esta lista: se consulta, pero solo lo escriben
--    los triggers de asignacion de codigos.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
    admin_tables TEXT[] := ARRAY[
        'collections', 'collection_groups', 'collection_years',
        'lines', 'sublines', 'tallaje_groups', 'person_roles',
        'reference_statuses', 'workshop_statuses', 'closure_types',
        'include_types', 'fabric_base_types', 'empaques', 'care_types',
        'difficulty_levels', 'process_types', 'variant_types', 'tejido_types',
        'corte_types', 'nota_fabricacion_statuses', 'tipo_prendas', 'largos',
        'usos_tela', 'sentidos_tela', 'unidades_medida', 'temporadas',
        'persons', 'user_accounts', 'person_role_assignments', 'fabrics',
        'supplies', 'references', 'reference_codes', 'code_pool',
        'references_variants', 'references_referents', 'reference_fabrics',
        'reference_supplies', 'reference_includes', 'consumos',
        'notas_fabricacion', 'contramuestras', 'molderia', 'laboratorios',
        'entregables', 'workflow_phases', 'reference_assignments',
        'reference_phase_history', 'reference_embroidery',
        'reference_semielaborated', 'external_processes', 'production_units',
        'quality_issues', 'tech_sheets', 'measures', 'compositions',
        'composition_materials', 'care_instructions', 'montage_mannequin',
        'cuts', 'sewings', 'reference_images', 'embroidery_reviews',
        'production_feedback', 'cut_requests', 'trazos',
        'comparativo_trazos', 'colors', 'collection_colors', 'referents',
        'referent_photos', 'supply_requests', 'mediciones',
        'reference_states', 'alert_thresholds'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY admin_tables
    LOOP
        IF to_regclass(format('jo.%I', table_name)) IS NOT NULL THEN
            EXECUTE format(
                'CREATE POLICY rbac_admin_all ON jo.%I FOR ALL TO authenticated USING ((SELECT jo.current_user_has_role(''Administrador''))) WITH CHECK ((SELECT jo.current_user_has_role(''Administrador'')))',
                table_name
            );
        END IF;
    END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. Escrituras por area funcional
-- ---------------------------------------------------------------------------

DO $$
DECLARE
    rule TEXT[];
    role_rules TEXT[][] := ARRAY[
        ARRAY['references', 'Creador de Ficha,Diseñador Creativo'],
        ARRAY['references_variants', 'Creador de Ficha,Diseñador Creativo,Diseñador Técnico'],
        ARRAY['references_referents', 'Creador de Ficha,Diseñador Creativo,Diseñador Técnico'],
        ARRAY['reference_fabrics', 'Diseñador Creativo'],
        ARRAY['reference_supplies', 'Diseñador Creativo'],
        ARRAY['reference_includes', 'Diseñador Creativo,Diseñador Técnico,Especificadora'],
        ARRAY['reference_embroidery', 'Diseñador Creativo,Especificadora'],
        ARRAY['reference_semielaborated', 'Diseñador Creativo,Diseñador Técnico,Especificadora'],
        ARRAY['external_processes', 'Diseñador Creativo,Diseñador Técnico,Especificadora'],
        ARRAY['notas_fabricacion', 'Especificadora'],
        ARRAY['contramuestras', 'Especificadora,Líder de Modistas'],
        ARRAY['molderia', 'Diseñador Creativo'],
        ARRAY['laboratorios', 'Diseñador Creativo'],
        ARRAY['entregables', 'Creador de Ficha,Diseñador Creativo,Diseñador Técnico,Trazador,Especificadora,Líder de Modistas,Cortador,Líder de Cortadores'],
        ARRAY['reference_assignments', 'Creador de Ficha,Diseñador Creativo,Diseñador Técnico,Trazador,Especificadora,Líder de Modistas,Cortador,Líder de Cortadores'],
        ARRAY['production_units', 'Especificadora'],
        ARRAY['quality_issues', 'Diseñador Creativo,Especificadora'],
        ARRAY['tech_sheets', 'Especificadora'],
        ARRAY['measures', 'Diseñador Creativo'],
        ARRAY['compositions', 'Especificadora'],
        ARRAY['composition_materials', 'Especificadora'],
        ARRAY['care_instructions', 'Especificadora'],
        ARRAY['montage_mannequin', 'Diseñador Creativo'],
        ARRAY['cuts', 'Diseñador Creativo,Cortador,Líder de Cortadores'],
        ARRAY['sewings', 'Diseñador Creativo,Líder de Modistas'],
        ARRAY['reference_images', 'Diseñador Creativo,Especificadora'],
        ARRAY['embroidery_reviews', 'Diseñador Creativo,Especificadora'],
        ARRAY['production_feedback', 'Diseñador Creativo,Especificadora'],
        ARRAY['cut_requests', 'Diseñador Creativo,Diseñador Técnico,Cortador,Líder de Cortadores,Líder de Modistas'],
        ARRAY['trazos', 'Trazador'],
        ARRAY['comparativo_trazos', 'Trazador'],
        ARRAY['mediciones', 'Diseñador Creativo'],
        ARRAY['reference_states', 'Creador de Ficha']
    ];
    table_name TEXT;
    roles_literal TEXT;
BEGIN
    FOREACH rule SLICE 1 IN ARRAY role_rules
    LOOP
        table_name := rule[1];
        IF to_regclass(format('jo.%I', table_name)) IS NOT NULL THEN
            roles_literal := '{"' || replace(rule[2], ',', '","') || '"}';
            EXECUTE format(
                'CREATE POLICY %I ON jo.%I FOR INSERT TO authenticated WITH CHECK ((SELECT jo.current_user_has_any_role(%L::text[])))',
                'rbac_' || table_name || '_insert', table_name, roles_literal
            );
            EXECUTE format(
                'CREATE POLICY %I ON jo.%I FOR UPDATE TO authenticated USING ((SELECT jo.current_user_has_any_role(%L::text[]))) WITH CHECK ((SELECT jo.current_user_has_any_role(%L::text[])))',
                'rbac_' || table_name || '_update', table_name, roles_literal, roles_literal
            );
        END IF;
    END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 6. DELETE solo donde el flujo de trabajo lo necesita.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
    rule TEXT[];
    delete_rules TEXT[][] := ARRAY[
        ARRAY['reference_supplies', 'Diseñador Creativo'],
        ARRAY['molderia', 'Diseñador Creativo'],
        ARRAY['laboratorios', 'Diseñador Creativo'],
        ARRAY['mediciones', 'Diseñador Creativo'],
        ARRAY['composition_materials', 'Especificadora'],
        ARRAY['cuts', 'Diseñador Creativo,Cortador,Líder de Cortadores'],
        ARRAY['sewings', 'Diseñador Creativo,Líder de Modistas'],
        ARRAY['trazos', 'Trazador']
    ];
    table_name TEXT;
    roles_literal TEXT;
BEGIN
    FOREACH rule SLICE 1 IN ARRAY delete_rules
    LOOP
        table_name := rule[1];
        IF to_regclass(format('jo.%I', table_name)) IS NOT NULL THEN
            roles_literal := '{"' || replace(rule[2], ',', '","') || '"}';
            EXECUTE format(
                'CREATE POLICY %I ON jo.%I FOR DELETE TO authenticated USING ((SELECT jo.current_user_has_any_role(%L::text[])))',
                'rbac_' || table_name || '_delete', table_name, roles_literal
            );
        END IF;
    END LOOP;
END;
$$;

DO $$
BEGIN
    IF to_regclass('jo.state_history') IS NOT NULL THEN
        CREATE POLICY rbac_state_history_admin_insert
            ON jo.state_history FOR INSERT TO authenticated
            WITH CHECK ((SELECT jo.current_user_has_role('Administrador')));
        CREATE POLICY rbac_state_history_creator_insert
            ON jo.state_history FOR INSERT TO authenticated
            WITH CHECK ((SELECT jo.current_user_has_role('Creador de Ficha')));
    END IF;

    IF to_regclass('jo.reference_phase_history') IS NOT NULL THEN
        CREATE POLICY rbac_reference_phase_history_insert
            ON jo.reference_phase_history FOR INSERT TO authenticated
            WITH CHECK ((SELECT jo.current_user_has_any_role(
                ARRAY['Administrador', 'Creador de Ficha']::TEXT[]
            )));
    END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. Consumos: el rol Auth debe coincidir con la columna role del registro.
-- ---------------------------------------------------------------------------

CREATE POLICY rbac_consumos_insert
    ON jo.consumos FOR INSERT TO authenticated
    WITH CHECK (
        (role = 'CREATIVO'::jo.consumo_role_type
            AND (SELECT jo.current_user_has_any_role(ARRAY['Diseñador Creativo', 'Creador de Ficha']::TEXT[])))
        OR (role = 'TECNICO'::jo.consumo_role_type
            AND (SELECT jo.current_user_has_role('Diseñador Técnico')))
        OR (role = 'TRAZADOR'::jo.consumo_role_type
            AND (SELECT jo.current_user_has_role('Trazador')))
        OR (role = 'CONTRAMUESTRA'::jo.consumo_role_type
            AND (SELECT jo.current_user_has_any_role(ARRAY['Diseñador Técnico', 'Líder de Modistas']::TEXT[])))
    );

CREATE POLICY rbac_consumos_update
    ON jo.consumos FOR UPDATE TO authenticated
    USING (
        (role = 'CREATIVO'::jo.consumo_role_type
            AND (SELECT jo.current_user_has_any_role(ARRAY['Diseñador Creativo', 'Creador de Ficha']::TEXT[])))
        OR (role = 'TECNICO'::jo.consumo_role_type
            AND (SELECT jo.current_user_has_role('Diseñador Técnico')))
        OR (role = 'TRAZADOR'::jo.consumo_role_type
            AND (SELECT jo.current_user_has_role('Trazador')))
        OR (role = 'CONTRAMUESTRA'::jo.consumo_role_type
            AND (SELECT jo.current_user_has_any_role(ARRAY['Diseñador Técnico', 'Líder de Modistas']::TEXT[])))
    )
    WITH CHECK (
        (role = 'CREATIVO'::jo.consumo_role_type
            AND (SELECT jo.current_user_has_any_role(ARRAY['Diseñador Creativo', 'Creador de Ficha']::TEXT[])))
        OR (role = 'TECNICO'::jo.consumo_role_type
            AND (SELECT jo.current_user_has_role('Diseñador Técnico')))
        OR (role = 'TRAZADOR'::jo.consumo_role_type
            AND (SELECT jo.current_user_has_role('Trazador')))
        OR (role = 'CONTRAMUESTRA'::jo.consumo_role_type
            AND (SELECT jo.current_user_has_any_role(ARRAY['Diseñador Técnico', 'Líder de Modistas']::TEXT[])))
    );

-- ---------------------------------------------------------------------------
-- 8. Solicitudes de insumos: separar solicitud, entrega y confirmacion.
-- ---------------------------------------------------------------------------

CREATE POLICY rbac_supply_requests_insert
    ON jo.supply_requests FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT jo.current_user_has_any_role(
            ARRAY['Administrador', 'Diseñador Creativo', 'Diseñador Técnico', 'Líder de Modistas']::TEXT[]
        ))
    );

CREATE POLICY rbac_supply_requests_update
    ON jo.supply_requests FOR UPDATE TO authenticated
    USING (
        (SELECT jo.current_user_has_any_role(
            ARRAY['Administrador', 'Diseñador Creativo', 'Diseñador Técnico', 'Líder de Modistas', 'Bodega']::TEXT[]
        ))
    )
    WITH CHECK (
        (SELECT jo.current_user_has_any_role(
            ARRAY['Administrador', 'Diseñador Creativo', 'Diseñador Técnico', 'Líder de Modistas', 'Bodega']::TEXT[]
        ))
    );

-- ---------------------------------------------------------------------------
-- 9. Restricciones de auditoria y funciones RPC.
-- ---------------------------------------------------------------------------

REVOKE INSERT, UPDATE, DELETE ON jo.code_log FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION jo.save_final_sheet(JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION jo.save_final_sheet(JSONB) TO authenticated;

-- Los triggers necesitan registrar cambios aunque el cliente no pueda escribir
-- directamente el log. Se ejecutan como el propietario y con search_path fijo.
ALTER FUNCTION jo.sync_code_pool_on_insert() SECURITY DEFINER SET search_path = '';
ALTER FUNCTION jo.sync_code_pool_on_update() SECURITY DEFINER SET search_path = '';
ALTER FUNCTION jo.sync_code_pool_on_delete() SECURITY DEFINER SET search_path = '';
REVOKE EXECUTE ON FUNCTION jo.sync_code_pool_on_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION jo.sync_code_pool_on_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION jo.sync_code_pool_on_delete() FROM PUBLIC, anon, authenticated;

-- La Ficha Final usa SECURITY INVOKER; la Especificadora debe tener permisos
-- RLS sobre compositions, composition_materials, care_instructions,
-- notas_fabricacion y contramuestras para que el RPC pueda completar el flujo.

COMMENT ON FUNCTION jo.current_user_has_any_role(TEXT[]) IS
    'Comprueba roles funcionales de la cuenta Auth activa para politicas RLS.';
