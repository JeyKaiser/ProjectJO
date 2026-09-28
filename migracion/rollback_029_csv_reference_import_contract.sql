-- RETIRADA OPERATIVA (no es un rollback técnico).
--
-- Alcance deliberado:
--   * deshabilita y revoca las RPC de preview/confirmación;
--   * conserva lotes, auditoría, referencias e índices/constraints de identidad;
--   * NO restaura constraints globales previos ni intenta deshacer escrituras.
--
-- Es reversible operativamente reaplicando la definición aprobada de 029. Las
-- guardas permiten ejecutar este retiro cuando 029 esté ausente o incompleta.
BEGIN;
SET LOCAL search_path = jo, public;

DO $$
BEGIN
  IF to_regprocedure('jo.preview_csv_reference_import(jsonb)') IS NOT NULL THEN
    CREATE OR REPLACE FUNCTION jo.preview_csv_reference_import(p_document JSONB)
    RETURNS JSONB LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path='' AS $disabled$
    BEGIN
      RAISE EXCEPTION 'Importación CSV de referencias retirada operativamente' USING ERRCODE='55000';
    END;
    $disabled$;
    REVOKE ALL ON FUNCTION jo.preview_csv_reference_import(JSONB) FROM PUBLIC,anon,authenticated;
    COMMENT ON FUNCTION jo.preview_csv_reference_import(JSONB) IS 'DESHABILITADA por retirada operativa de 029; no implica rollback de datos ni constraints.';
  END IF;

  IF to_regprocedure('jo.confirm_csv_reference_import(jsonb,text,jsonb)') IS NOT NULL THEN
    CREATE OR REPLACE FUNCTION jo.confirm_csv_reference_import(p_document JSONB,p_source_file TEXT,p_expected_preview JSONB)
    RETURNS JSONB LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path='' AS $disabled$
    BEGIN
      RAISE EXCEPTION 'Importación CSV de referencias retirada operativamente' USING ERRCODE='55000';
    END;
    $disabled$;
    REVOKE ALL ON FUNCTION jo.confirm_csv_reference_import(JSONB,TEXT,JSONB) FROM PUBLIC,anon,authenticated;
    COMMENT ON FUNCTION jo.confirm_csv_reference_import(JSONB,TEXT,JSONB) IS 'DESHABILITADA por retirada operativa de 029; no implica rollback de datos ni constraints.';
  END IF;

  IF to_regprocedure('jo.confirm_csv_reference_import(jsonb,text,jsonb,uuid)') IS NOT NULL THEN
    CREATE OR REPLACE FUNCTION jo.confirm_csv_reference_import(p_document JSONB,p_source_file TEXT,p_expected_preview JSONB,p_confirmation_id UUID)
    RETURNS JSONB LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path='' AS $disabled$
    BEGIN
      RAISE EXCEPTION 'Importación CSV de referencias retirada operativamente' USING ERRCODE='55000';
    END;
    $disabled$;
    REVOKE ALL ON FUNCTION jo.confirm_csv_reference_import(JSONB,TEXT,JSONB,UUID) FROM PUBLIC,anon,authenticated;
    COMMENT ON FUNCTION jo.confirm_csv_reference_import(JSONB,TEXT,JSONB,UUID) IS 'DESHABILITADA por retirada operativa de 029; no implica rollback de datos ni constraints.';
  END IF;

  IF to_regclass('jo.csv_reference_import_rows') IS NOT NULL THEN
    REVOKE INSERT,UPDATE,DELETE ON jo.csv_reference_import_rows FROM PUBLIC,anon,authenticated;
  END IF;
  IF to_regclass('jo.csv_reference_import_issues') IS NOT NULL THEN
    REVOKE INSERT,UPDATE,DELETE ON jo.csv_reference_import_issues FROM PUBLIC,anon,authenticated;
  END IF;

  RAISE NOTICE '029 retirada operativamente: RPC deshabilitadas/revocadas; auditoría, datos e identidad compuesta conservados.';
END;
$$;
COMMIT;
