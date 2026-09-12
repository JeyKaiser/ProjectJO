-- AtelierData v2.0 - Ficha Final: persistencia
-- Ejecutar manualmente en Supabase SQL Editor despues de confirmar 020_ficha_final.sql.
-- Este archivo no se ejecuta desde la aplicacion.

SET search_path = jo, public;

INSERT INTO jo.care_types (type, description)
VALUES ('BLANQUEADO'::jo.care_type, 'Instrucciones de blanqueado')
ON CONFLICT (type) DO NOTHING;

CREATE TABLE IF NOT EXISTS jo.composition_materials (
    id              SERIAL PRIMARY KEY,
    composition_id  INTEGER NOT NULL REFERENCES jo.compositions(id) ON DELETE CASCADE,
    material        TEXT NOT NULL,
    percentage      NUMERIC(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_composition_materials_composition
    ON jo.composition_materials(composition_id);

CREATE UNIQUE INDEX IF NOT EXISTS compositions_reference_scope_uidx
    ON jo.compositions(reference_id, scope);

CREATE UNIQUE INDEX IF NOT EXISTS care_instructions_reference_type_uidx
    ON jo.care_instructions(reference_id, care_type_id)
    WHERE care_type_id IS NOT NULL;

-- Conserva todo el historial y deja solo una contramuestra activa por referencia.
WITH ranked_active AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY reference_id
            ORDER BY created_at NULLS FIRST, id
        ) AS position
    FROM jo.contramuestras
    WHERE LOWER(status) = 'activa'
)
UPDATE jo.contramuestras AS c
SET status = 'utilizada', updated_at = NOW()
FROM ranked_active AS r
WHERE c.id = r.id
  AND r.position > 1;

CREATE UNIQUE INDEX IF NOT EXISTS contramuestras_one_active_uidx
    ON jo.contramuestras(reference_id)
    WHERE LOWER(status) = 'activa';

CREATE OR REPLACE FUNCTION jo.save_final_sheet(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = jo, public
AS $$
DECLARE
    v_reference_id   INTEGER;
    v_scope          TEXT;
    v_scope_payload  JSONB;
    v_composition    JSONB;
    v_material       JSONB;
    v_row            JSONB;
    v_note           JSONB;
    v_id             INTEGER;
    v_note_id        INTEGER;
    v_composition_id INTEGER;
    v_found          BOOLEAN;
BEGIN
    v_reference_id := NULLIF(p_payload->>'reference_id', '')::INTEGER;

    IF v_reference_id IS NULL OR v_reference_id <= 0 THEN
        RAISE EXCEPTION 'reference_id es obligatorio';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM jo.references WHERE id = v_reference_id) THEN
        RAISE EXCEPTION 'La referencia % no existe', v_reference_id;
    END IF;

    -- La ficha envía ambos scopes en cada guardado para mantenerlos completos.
    FOREACH v_scope IN ARRAY ARRAY['MUESTRA', 'PRODUCCION']
    LOOP
        v_scope_payload := p_payload->'scopes'->v_scope;
        IF v_scope_payload IS NULL THEN
            CONTINUE;
        END IF;

        v_composition := v_scope_payload->'composition';
        INSERT INTO jo.compositions (
            reference_id,
            scope,
            sap_registered,
            description_usauk,
            fiber_composition,
            woven_knitted,
            inside_composition,
            include_description,
            notes
        )
        VALUES (
            v_reference_id,
            v_scope,
            COALESCE((v_composition->>'sap_registered')::BOOLEAN, FALSE),
            NULLIF(v_composition->>'description_usauk', ''),
            NULLIF(v_composition->>'fiber_composition', ''),
            NULLIF(v_composition->>'woven_knitted', ''),
            NULLIF(v_composition->>'inside_composition', ''),
            NULLIF(v_composition->>'include_description', ''),
            NULLIF(v_composition->>'notes', '')
        )
        ON CONFLICT (reference_id, scope) DO UPDATE SET
            sap_registered = EXCLUDED.sap_registered,
            description_usauk = EXCLUDED.description_usauk,
            fiber_composition = EXCLUDED.fiber_composition,
            woven_knitted = EXCLUDED.woven_knitted,
            inside_composition = EXCLUDED.inside_composition,
            include_description = EXCLUDED.include_description,
            notes = EXCLUDED.notes
        RETURNING id INTO v_composition_id;

        -- La lista de materiales representa el estado actual de esa composición.
        DELETE FROM jo.composition_materials
        WHERE composition_id = v_composition_id;

        FOR v_material IN
            SELECT value
            FROM jsonb_array_elements(COALESCE(v_scope_payload->'materials', '[]'::JSONB))
        LOOP
            IF NULLIF(BTRIM(v_material->>'material'), '') IS NOT NULL THEN
                INSERT INTO jo.composition_materials (composition_id, material, percentage)
                VALUES (
                    v_composition_id,
                    BTRIM(v_material->>'material'),
                    COALESCE(NULLIF(v_material->>'percentage', '')::NUMERIC, 0)
                );
            END IF;
        END LOOP;
    END LOOP;

    -- Los cuidados con id se actualizan. Los nuevos se insertan. No se borran
    -- cuidados omitidos para conservar el historial ya registrado.
    FOR v_row IN
        SELECT value
        FROM jsonb_array_elements(COALESCE(p_payload->'care_instructions', '[]'::JSONB))
    LOOP
        v_id := NULLIF(v_row->>'id', '')::INTEGER;
        v_found := FALSE;

        IF v_id IS NOT NULL THEN
            UPDATE jo.care_instructions
            SET care_type_id = NULLIF(v_row->>'care_type_id', '')::INTEGER,
                instruction = NULLIF(v_row->>'instruction', ''),
                icon_url = NULLIF(v_row->>'icon_url', ''),
                notes = NULLIF(v_row->>'notes', '')
            WHERE id = v_id AND reference_id = v_reference_id;
            v_found := FOUND;
        END IF;

        IF NOT v_found AND NULLIF(v_row->>'care_type_id', '') IS NOT NULL THEN
            INSERT INTO jo.care_instructions (
                reference_id, care_type_id, instruction, icon_url, notes
            )
            VALUES (
                v_reference_id,
                NULLIF(v_row->>'care_type_id', '')::INTEGER,
                NULLIF(v_row->>'instruction', ''),
                NULLIF(v_row->>'icon_url', ''),
                NULLIF(v_row->>'notes', '')
            );
        END IF;
    END LOOP;

    -- Contramuestras y sus notas SAP se conservan. Los ids existentes se
    -- actualizan y los registros sin id se insertan.
    FOR v_row IN
        SELECT value
        FROM jsonb_array_elements(COALESCE(p_payload->'contramuestras', '[]'::JSONB))
    LOOP
        v_note := v_row->'nota_fabricacion';
        v_note_id := NULLIF(v_note->>'id', '')::INTEGER;

        IF v_note IS NOT NULL AND (
            v_note_id IS NOT NULL
            OR NULLIF(v_note->>'codigo_nota', '') IS NOT NULL
            OR NULLIF(v_note->>'fecha_traslado_sap', '') IS NOT NULL
            OR NULLIF(v_note->>'fecha_despacho_zf', '') IS NOT NULL
            OR NULLIF(v_note->>'observaciones', '') IS NOT NULL
        ) THEN
            v_found := FALSE;
            IF v_note_id IS NOT NULL THEN
                UPDATE jo.notas_fabricacion
                SET codigo_nota = NULLIF(v_note->>'codigo_nota', ''),
                    fecha_traslado_sap = NULLIF(v_note->>'fecha_traslado_sap', '')::DATE,
                    fecha_despacho_zf = NULLIF(v_note->>'fecha_despacho_zf', '')::DATE,
                    observaciones = NULLIF(v_note->>'observaciones', '')
                WHERE id = v_note_id AND reference_id = v_reference_id;
                v_found := FOUND;
            END IF;

            IF NOT v_found THEN
                INSERT INTO jo.notas_fabricacion (
                    reference_id, codigo_nota, fecha_traslado_sap,
                    fecha_despacho_zf, observaciones
                )
                VALUES (
                    v_reference_id,
                    NULLIF(v_note->>'codigo_nota', ''),
                    NULLIF(v_note->>'fecha_traslado_sap', '')::DATE,
                    NULLIF(v_note->>'fecha_despacho_zf', '')::DATE,
                    NULLIF(v_note->>'observaciones', '')
                )
                RETURNING id INTO v_note_id;
            END IF;
        ELSE
            v_note_id := NULL;
        END IF;

        v_id := NULLIF(v_row->>'id', '')::INTEGER;
        v_found := FALSE;
        IF v_id IS NOT NULL THEN
            UPDATE jo.contramuestras
            SET nombre = NULLIF(v_row->>'nombre', ''),
                codigo_ot = NULLIF(v_row->>'codigo_ot', ''),
                talla = NULLIF(v_row->>'talla', ''),
                descripcion_color = NULLIF(v_row->>'descripcion_color', ''),
                unidades_cortadas = NULLIF(v_row->>'unidades_cortadas', '')::INTEGER,
                nota_fabricacion_id = v_note_id,
                prioridad = NULLIF(v_row->>'prioridad', '')::INTEGER,
                fecha_meta_entrega = NULLIF(v_row->>'fecha_meta_entrega', '')::DATE,
                drop_entrega = NULLIF(v_row->>'drop_entrega', '')::jo.entrega_drop,
                status = COALESCE(NULLIF(v_row->>'status', ''), 'pendiente'),
                observaciones_confeccion = NULLIF(v_row->>'observaciones_confeccion', ''),
                updated_at = NOW()
            WHERE id = v_id AND reference_id = v_reference_id;
            v_found := FOUND;
        END IF;

        IF NOT v_found AND NULLIF(v_row->>'codigo_ot', '') IS NOT NULL THEN
            INSERT INTO jo.contramuestras (
                reference_id, nombre, codigo_ot, talla, descripcion_color,
                unidades_cortadas, nota_fabricacion_id, prioridad,
                fecha_meta_entrega, drop_entrega, status,
                observaciones_confeccion
            )
            VALUES (
                v_reference_id,
                NULLIF(v_row->>'nombre', ''),
                NULLIF(v_row->>'codigo_ot', ''),
                NULLIF(v_row->>'talla', ''),
                NULLIF(v_row->>'descripcion_color', ''),
                NULLIF(v_row->>'unidades_cortadas', '')::INTEGER,
                v_note_id,
                NULLIF(v_row->>'prioridad', '')::INTEGER,
                NULLIF(v_row->>'fecha_meta_entrega', '')::DATE,
                NULLIF(v_row->>'drop_entrega', '')::jo.entrega_drop,
                COALESCE(NULLIF(v_row->>'status', ''), 'pendiente'),
                NULLIF(v_row->>'observaciones_confeccion', '')
            );
        END IF;
    END LOOP;

    -- Novedades: id existente = update; sin id = insert. Nunca se eliminan
    -- las filas que no vengan en el payload.
    FOR v_row IN
        SELECT value
        FROM jsonb_array_elements(COALESCE(p_payload->'quality_issues', '[]'::JSONB))
    LOOP
        v_id := NULLIF(v_row->>'id', '')::INTEGER;
        v_found := FALSE;

        IF v_id IS NOT NULL THEN
            UPDATE jo.quality_issues
            SET detected_at = COALESCE(NULLIF(v_row->>'detected_at', '')::TIMESTAMPTZ, detected_at),
                area = NULLIF(v_row->>'area', ''),
                classification = NULLIF(v_row->>'classification', ''),
                material = NULLIF(v_row->>'material', ''),
                material_classification = NULLIF(v_row->>'material_classification', ''),
                execution_type = NULLIF(v_row->>'execution_type', ''),
                description = NULLIF(v_row->>'description', ''),
                corrective_action = NULLIF(v_row->>'corrective_action', ''),
                resolved = COALESCE((v_row->>'resolved')::BOOLEAN, FALSE)
            WHERE id = v_id AND reference_id = v_reference_id;
            v_found := FOUND;
        END IF;

        IF NOT v_found THEN
            INSERT INTO jo.quality_issues (
                reference_id, detected_at, area, classification, material,
                material_classification, execution_type, description,
                corrective_action, resolved
            )
            VALUES (
                v_reference_id,
                COALESCE(NULLIF(v_row->>'detected_at', '')::TIMESTAMPTZ, NOW()),
                NULLIF(v_row->>'area', ''),
                NULLIF(v_row->>'classification', ''),
                NULLIF(v_row->>'material', ''),
                NULLIF(v_row->>'material_classification', ''),
                NULLIF(v_row->>'execution_type', ''),
                NULLIF(v_row->>'description', ''),
                NULLIF(v_row->>'corrective_action', ''),
                COALESCE((v_row->>'resolved')::BOOLEAN, FALSE)
            );
        END IF;
    END LOOP;

    RETURN jsonb_build_object('reference_id', v_reference_id, 'saved', TRUE);
END;
$$;

GRANT EXECUTE ON FUNCTION jo.save_final_sheet(JSONB) TO anon, authenticated;
