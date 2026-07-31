-- ===========================================================================
-- 006_extend_consumo_tipo_tela.sql
-- Extiende el enum jo.consumo_tipo_tela para incluir CUERO y ALL_OVER.
-- Requerido por el workflow del trazador (rolesJO/trazador.md).
-- ===========================================================================

DO $$
BEGIN
    -- Verificar si el valor ya existe antes de agregarlo
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'jo.consumo_tipo_tela'::regtype
        AND enumlabel = 'CUERO'
    ) THEN
        ALTER TYPE jo.consumo_tipo_tela ADD VALUE 'CUERO';
        RAISE NOTICE 'Valor CUERO agregado al enum jo.consumo_tipo_tela';
    ELSE
        RAISE NOTICE 'Valor CUERO ya existe en el enum, omitiendo.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'jo.consumo_tipo_tela'::regtype
        AND enumlabel = 'ALL_OVER'
    ) THEN
        ALTER TYPE jo.consumo_tipo_tela ADD VALUE 'ALL_OVER';
        RAISE NOTICE 'Valor ALL_OVER agregado al enum jo.consumo_tipo_tela';
    ELSE
        RAISE NOTICE 'Valor ALL_OVER ya existe en el enum, omitiendo.';
    END IF;
END $$;

-- Verificacion
SELECT enumlabel FROM pg_enum
WHERE enumtypid = 'jo.consumo_tipo_tela'::regtype
ORDER BY enumsortorder;
