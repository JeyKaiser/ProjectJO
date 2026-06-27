-- ===========================================================================
-- AtelierData v2.0 — Politicas RLS (Row Level Security)
-- Ejecutar en SQL Editor despues de database_schema.sql
-- ===========================================================================
SET search_path = jo, public;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. HABILITAR RLS EN TABLAS PRINCIPALES
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE jo.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.references ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.reference_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.reference_fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.reference_supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.consumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.notas_fabricacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.contramuestras ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.molderia ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.laboratorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.entregables ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.references_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.references_referents ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.reference_includes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.reference_embroidery ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.reference_semielaborated ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.external_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.production_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.quality_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.tech_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.care_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.montage_mannequin ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.cuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.sewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.embroidery_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE jo.production_feedback ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. POLITICAS: TABLAS CATALOGO (lectura publica, solo admin edita)
-- ═══════════════════════════════════════════════════════════════════════════

-- Lectura publica para catalogos que alimentan dropdowns
CREATE POLICY "Catalogos: lectura para todos"
    ON jo.lines FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.sublines FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.tallaje_groups FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.person_roles FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.reference_statuses FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.workshop_statuses FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.closure_types FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.include_types FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.fabric_base_types FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.empaques FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.care_types FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.difficulty_levels FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.process_types FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.variant_types FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.tejido_types FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.corte_types FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.nota_fabricacion_statuses FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.workflow_phases FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.collections FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.fabrics FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.supplies FOR SELECT USING (true);

CREATE POLICY "Catalogos: lectura para todos"
    ON jo.persons FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. POLITICAS: REFERENCIAS Y RELACIONADOS
--    Autenticados: lectura total. Insercion/edicion: todos los autenticados.
--    (El control fino por rol se maneja en la capa de aplicacion)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY "Referencias: lectura autenticados"
    ON jo.references FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Referencias: insercion autenticados"
    ON jo.references FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Referencias: actualizacion autenticados"
    ON jo.references FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Reference codes
CREATE POLICY "Codes: lectura autenticados"
    ON jo.reference_codes FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Codes: insercion autenticados"
    ON jo.reference_codes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Reference fabrics
CREATE POLICY "RefFabrics: lectura autenticados"
    ON jo.reference_fabrics FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "RefFabrics: insercion autenticados"
    ON jo.reference_fabrics FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "RefFabrics: actualizacion autenticados"
    ON jo.reference_fabrics FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Reference supplies
CREATE POLICY "RefSupplies: lectura autenticados"
    ON jo.reference_supplies FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "RefSupplies: insercion autenticados"
    ON jo.reference_supplies FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Consumos (lectura todos, insercion solo autenticados)
CREATE POLICY "Consumos: lectura autenticados"
    ON jo.consumos FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Consumos: insercion autenticados"
    ON jo.consumos FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Consumos: actualizacion autenticados"
    ON jo.consumos FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. POLITICAS: TABLAS RESTANTES (lectura + escritura autenticados)
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'notas_fabricacion','contramuestras','molderia','laboratorios','entregables',
        'references_variants','references_referents','reference_includes',
        'reference_embroidery','reference_semielaborated','external_processes',
        'production_units','quality_issues','tech_sheets','measures',
        'compositions','care_instructions','montage_mannequin',
        'cuts','sewings','reference_images',
        'embroidery_reviews','production_feedback'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format(
            'CREATE POLICY %I ON jo.%I FOR SELECT USING (auth.role() = ''authenticated'')',
            t || '_select', t
        );
        EXECUTE format(
            'CREATE POLICY %I ON jo.%I FOR INSERT WITH CHECK (auth.role() = ''authenticated'')',
            t || '_insert', t
        );
        EXECUTE format(
            'CREATE POLICY %I ON jo.%I FOR UPDATE USING (auth.role() = ''authenticated'')',
            t || '_update', t
        );
    END LOOP;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. POLITICA ESPECIAL: Consumos — solo el disenador de su area edita
--    (Politica fina por rol para el futuro)
-- ═══════════════════════════════════════════════════════════════════════════
-- Descomentar cuando se implemente auth por rol en Supabase:
--
-- CREATE POLICY "Consumos: solo creativo edita sus consumos"
--     ON jo.consumos FOR UPDATE
--     USING (
--         auth.role() = 'authenticated'
--         AND role = 'CREATIVO'
--         AND auth.uid() IN (SELECT id FROM jo.user_accounts WHERE role = 'CREATIVO')
--     );
