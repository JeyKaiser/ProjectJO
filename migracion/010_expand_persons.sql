-- ===========================================================================
-- FASE 6: Expandir jo.persons con area e hire_date, y poblar todos los datos
-- ===========================================================================
SET search_path = jo, public;

-- 1. Agregar columnas faltantes
ALTER TABLE jo.persons ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE jo.persons ADD COLUMN IF NOT EXISTS hire_date DATE;

-- 2. Crear tabla temporal con todos los datos de personas.js
CREATE TEMP TABLE tmp_personas (
  id_temp TEXT,
  area TEXT,
  rol TEXT,
  first_name TEXT,
  last_name TEXT,
  hire_date DATE
);

INSERT INTO tmp_personas (id_temp, area, rol, first_name, last_name, hire_date) VALUES
-- Creativos (7)
('CRE-001', 'creativos', 'CREATIVO', 'MARIA', 'BURGOS', '2024-01-15'),
('CRE-002', 'creativos', 'CREATIVO', 'FERNANDO', 'CASTAÑO', '2024-01-15'),
('CRE-003', 'creativos', 'CREATIVO', 'OSMAN', 'LOPEZ', '2024-01-15'),
('CRE-004', 'creativos', 'CREATIVO', 'MAR', 'ORDOÑEZ', '2024-03-01'),
('CRE-005', 'creativos', 'CREATIVO', 'YAMILETH', 'ROSERO', '2024-03-01'),
('CRE-006', 'creativos', 'CREATIVO', 'CLAUDIA', 'REYES', '2024-05-10'),
('CRE-007', 'creativos', 'CREATIVO', 'MARGARITA', 'OLIVO', '2024-06-01'),
-- Tecnicos (11)
('TEC-001', 'tecnicos', 'TECNICO', 'MARISOL', 'RIASCOS', '2024-01-15'),
('TEC-002', 'tecnicos', 'TECNICO', 'ANDREA', 'JACOME', '2024-01-15'),
('TEC-003', 'tecnicos', 'TECNICO', 'KELLY', 'MITROVITH', '2024-02-01'),
('TEC-004', 'tecnicos', 'TECNICO', 'CRISTIAN', 'GOMEZ', '2024-02-01'),
('TEC-005', 'tecnicos', 'TECNICO', 'DANIELA', 'GARCIA', '2024-03-15'),
('TEC-006', 'tecnicos', 'TECNICO', 'LINA', 'DELGADO', '2024-03-15'),
('TEC-007', 'tecnicos', 'TECNICO', 'NATHALY', 'CONTRERAS', '2024-04-01'),
('TEC-008', 'tecnicos', 'TECNICO', 'KAROLIN', 'CUMBAL', '2024-04-01'),
('TEC-009', 'tecnicos', 'TECNICO', 'CAMILA', 'VILLEGAS', '2024-05-01'),
('TEC-010', 'tecnicos', 'TECNICO', 'JENNIFER', 'CHANTRE', '2024-05-01'),
('TEC-011', 'tecnicos', 'TECNICO', 'LINA', 'PEÑA', '2024-06-01'),
-- Cortadores (4)
('COR-001', 'cortadores', 'CORTADOR', 'JUAN DAVID', 'CORTES', '2024-01-15'),
('COR-002', 'cortadores', 'CORTADOR', 'JUAN DIEGO', 'VALENCIA', '2024-01-15'),
('COR-003', 'cortadores', 'CORTADOR', 'PAULINA', 'CHAPUESGAL', '2024-03-01'),
('COR-004', 'cortadores', 'CORTADOR', 'JEFERSON', 'CHACON', '2024-04-01'),
-- Modistas (18)
('MOD-001', 'modistas', 'MODISTA', 'FANNY', 'GOMEZ', '2024-01-15'),
('MOD-002', 'modistas', 'MODISTA', 'SINDY', 'VAZQUEZ', '2024-01-15'),
('MOD-003', 'modistas', 'MODISTA', 'YULEIMI', 'LUCUMI', '2024-01-15'),
('MOD-004', 'modistas', 'MODISTA', 'ADRIANA', 'ESCOBAR', '2024-02-01'),
('MOD-005', 'modistas', 'MODISTA', 'ALEJANDRA', 'ROJAS', '2024-02-01'),
('MOD-006', 'modistas', 'MODISTA', 'LUISA', 'BUITRAGO', '2024-03-01'),
('MOD-007', 'modistas', 'MODISTA', 'CIELO', 'AGUIRRE', '2024-03-01'),
('MOD-008', 'modistas', 'MODISTA', 'LUISA', 'HERNANDEZ', '2024-03-15'),
('MOD-009', 'modistas', 'MODISTA', 'ENEIDA', 'MACA', '2024-03-15'),
('MOD-010', 'modistas', 'MODISTA', 'MARIA EUGENIA', 'SARRIA', '2024-04-01'),
('MOD-011', 'modistas', 'MODISTA', 'AISURY', 'QUINTERO', '2024-04-01'),
('MOD-012', 'modistas', 'MODISTA', 'STELLA', 'CASTAÑO', '2024-05-01'),
('MOD-013', 'modistas', 'MODISTA', 'JIMENA', 'BORJA', '2024-05-01'),
('MOD-014', 'modistas', 'MODISTA', 'LUCY', 'RAMOS', '2024-05-15'),
('MOD-015', 'modistas', 'MODISTA', 'KAREN', 'RENGIFO', '2024-05-15'),
('MOD-016', 'modistas', 'MODISTA', 'MARTA', 'RAMIREZ', '2024-06-01'),
('MOD-017', 'modistas', 'MODISTA', 'MARIA NELCY', 'ORDOÑEZ', '2024-06-01'),
('MOD-018', 'modistas', 'MODISTA', 'MARYURI', 'OSPINA', '2024-06-15'),
-- Especificadoras (5)
('ESP-001', 'especificadoras', 'ESPECIFICADORA', 'NIDIA', 'ERAZO', '2024-01-15'),
('ESP-002', 'especificadoras', 'ESPECIFICADORA', 'MAYRA', 'PRECIADO', '2024-01-15'),
('ESP-003', 'especificadoras', 'ESPECIFICADORA', 'ANDRI', 'RENGIFO', '2024-03-01'),
('ESP-004', 'especificadoras', 'ESPECIFICADORA', 'JULIANA', 'PARRA', '2024-04-01'),
('ESP-005', 'especificadoras', 'ESPECIFICADORA', 'DIANA', 'ADARME', '2024-05-01'),
-- Trazadores (1)
('TRA-001', 'trazadores', 'TRAZADOR', 'CARLOS ANDRES', 'MEJIA', '2024-01-15'),
-- Bordadoras (7)
('BOR-001', 'bordadoras', 'BORDADORA', 'LUCIA', 'VEGA', '2024-02-01'),
('BOR-002', 'bordadoras', 'BORDADORA', 'CATALINA', 'RUIZ', '2024-02-01'),
('BOR-003', 'bordadoras', 'BORDADORA', 'VALENTINA', 'OSORIO', '2024-03-01'),
('BOR-004', 'bordadoras', 'BORDADORA', 'NATALIA', 'MUÑOZ', '2024-03-15'),
('BOR-005', 'bordadoras', 'BORDADORA', 'CAROLINA', 'LOPEZ', '2024-04-01'),
('BOR-006', 'bordadoras', 'BORDADORA', 'PAULA', 'GARCIA', '2024-05-01'),
('BOR-007', 'bordadoras', 'BORDADORA', 'ALEJANDRA', 'MORALES', '2024-06-01'),
-- Bodega (2)
('BOD-001', 'bodega', 'BODEGA', 'GLORIA', 'BANGUERA', '2024-01-15'),
('BOD-002', 'bodega', 'BODEGA', 'DANIELA', 'GARCIA', '2024-03-01');

-- 3. Insertar personas que no existen todavia
-- Primero, borramos las personas existentes y volvemos a insertar para asegurar consistencia

-- DELETE FROM jo.person_role_assignments;
-- DELETE FROM jo.persons;

INSERT INTO jo.persons (first_name, last_name, area, hire_date, active)
SELECT first_name, last_name, area, hire_date, true
FROM tmp_personas;

-- 4. Asignar roles a cada persona
INSERT INTO jo.person_role_assignments (person_id, role_id)
SELECT p.id, pr.id
FROM jo.persons p
JOIN tmp_personas t ON p.first_name = t.first_name AND p.last_name = t.last_name AND p.area = t.area
JOIN jo.person_roles pr ON pr.name = t.rol;

-- 5. Crear vista para compatibilidad con el frontend (formato personas.js)
CREATE OR REPLACE VIEW jo.v_personas AS
SELECT
  p.id,
  p.area,
  p.first_name,
  p.last_name,
  p.hire_date,
  p.cedula,
  p.email AS correo,
  p.phone AS telefono,
  p.active AS activo,
  pr.name AS rol
FROM jo.persons p
LEFT JOIN jo.person_role_assignments pra ON pra.person_id = p.id
LEFT JOIN jo.person_roles pr ON pr.id = pra.role_id;

-- Limpieza
DROP TABLE tmp_personas;

SELECT 'OK: ' || count(*) || ' personas insertadas' FROM jo.persons;