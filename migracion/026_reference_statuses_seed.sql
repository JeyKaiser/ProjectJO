-- Estados ampliados de referencias: catalogo, normalizacion y seguridad.
-- Ejecutar despues de confirmar 025_reference_statuses.sql.

SET search_path = jo, public;

-- Normalizar referencias legacy antes de retirar sus filas del catalogo.
UPDATE jo.references AS r
SET status_id = target.id
FROM jo.reference_statuses AS legacy
JOIN jo.reference_statuses AS target
  ON target.status = 'CANCELADO'
WHERE r.status_id = legacy.id
  AND legacy.status = 'RECHAZADO';

UPDATE jo.references AS r
SET status_id = target.id
FROM jo.reference_statuses AS legacy
JOIN jo.reference_statuses AS target
  ON target.status = 'EN_PROCESO'
WHERE r.status_id = legacy.id
  AND legacy.status = 'PENDIENTE';

INSERT INTO jo.reference_statuses (
  status, label, description, active, is_cancelled, sort_order
)
VALUES
  ('EN_PROCESO', 'En proceso', 'Referencia activa en desarrollo', TRUE, FALSE, 10),
  ('APROBADO', 'Aprobado', 'Referencia aprobada', TRUE, FALSE, 20),
  ('CANCELADO', 'Cancelado', 'Referencia cancelada', TRUE, TRUE, 30),
  ('CANCELADO_COMERCIAL', 'Cancelado por comercial', 'Cancelada por decision comercial', TRUE, TRUE, 40),
  ('CANCELADO_CORTADO', 'Cancelado cortado', 'Cancelada despues del corte', TRUE, TRUE, 50),
  ('PAQUETE_COMPLETO', 'Paquete completo', 'Referencia lista como paquete completo', TRUE, FALSE, 60),
  ('CANCELADO_SIN_CORTAR', 'Cancelado sin cortar', 'Cancelada antes del corte', TRUE, TRUE, 70),
  ('SE_RETOMA_PROXIMA_COLECCION', 'Se retoma en la proxima coleccion', 'Referencia aplazada para una proxima coleccion', TRUE, FALSE, 80),
  ('CANCELADO_PAQUETE_COMPLETO', 'Cancelado paquete completo', 'Paquete completo cancelado', TRUE, TRUE, 90),
  ('APROBADO_REPROGRAMACION', 'Aprobado reprogramacion', 'Referencia aprobada con reprogramacion', TRUE, FALSE, 100),
  ('JUST_FOR_SHOW', 'Just for show', 'Referencia destinada a exhibicion', TRUE, FALSE, 110)
ON CONFLICT (status) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  is_cancelled = EXCLUDED.is_cancelled,
  sort_order = EXCLUDED.sort_order;

UPDATE jo.reference_statuses
SET label = 'Aprobado', is_cancelled = FALSE, sort_order = 20
WHERE status = 'APROBADO';

UPDATE jo.reference_statuses
SET label = 'Cancelado', is_cancelled = TRUE, sort_order = 30
WHERE status = 'CANCELADO';

UPDATE jo.reference_statuses
SET label = 'En proceso', is_cancelled = FALSE, sort_order = 10
WHERE status = 'EN_PROCESO';

UPDATE jo.reference_statuses
SET label = 'Paquete completo', is_cancelled = FALSE, sort_order = 60
WHERE status = 'PAQUETE_COMPLETO';

DELETE FROM jo.reference_statuses
WHERE status IN ('RECHAZADO', 'PENDIENTE');

-- Impide que un usuario autorizado para otras ediciones cambie status_id.
CREATE OR REPLACE FUNCTION jo.guard_reference_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = jo, public
AS $$
BEGIN
  IF NEW.status_id IS DISTINCT FROM OLD.status_id
     AND NOT COALESCE(
       jo.current_user_has_any_role(
         ARRAY['Administrador', 'Creador de Ficha']::TEXT[]
       ),
       FALSE
     ) THEN
    RAISE EXCEPTION 'Solo Administrador o Creador de Ficha puede cambiar el estado de una referencia';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_reference_status_change ON jo.references;

CREATE TRIGGER trg_guard_reference_status_change
BEFORE UPDATE OF status_id ON jo.references
FOR EACH ROW
EXECUTE FUNCTION jo.guard_reference_status_change();

REVOKE ALL ON FUNCTION jo.guard_reference_status_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION jo.guard_reference_status_change() TO authenticated;
