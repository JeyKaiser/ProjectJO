-- ===========================================================================
-- AtelierData v2.0 — Seed de Datos Maestros (Catálogos)
-- Ejecutar DESPUES de database_schema.sql
-- ===========================================================================
SET search_path = jo, public;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. COLECCIONES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.collections (code, name, season, year, description) VALUES
('WS', 'WINTER SUN',       'WS', 2026, 'Coleccion Winter Sun — temporada invierno/verano'),
('RS', 'RESORT RTW',       'RS', 2026, 'Coleccion Resort Ready-to-Wear'),
('SS', 'SPRING SUMMER',    'SS', 2026, 'Coleccion Primavera/Verano'),
('SV', 'SUMMER VACATION',  'SV', 2026, 'Coleccion Summer Vacation'),
('PF', 'PREFALL RTW',      'PF', 2026, 'Coleccion Pre-Fall Ready-to-Wear'),
('FW', 'FALL WINTER',      'FW', 2026, 'Coleccion Fall/Winter');

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. LINEAS Y SUBLINEAS
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.lines (name, description) VALUES
('READY TO WEAR',     'Linea principal de prêt-à-porter'),
('SWIMWEAR',          'Linea de trajes de baño'),
('ACCESSORIES',       'Accesorios (cinturones, bolsos)'),
('RESORT',            'Linea Resort'),
('COCKTAIL',          'Vestidos de coctel y noche'),
('BRIDAL',            'Coleccion novias');

WITH line_ids AS (SELECT id, name FROM jo.lines)
INSERT INTO jo.sublines (line_id, name, description) VALUES
((SELECT id FROM line_ids WHERE name = 'READY TO WEAR'), 'DRESSES',  'Vestidos'),
((SELECT id FROM line_ids WHERE name = 'READY TO WEAR'), 'TOPS',     'Blusas y tops'),
((SELECT id FROM line_ids WHERE name = 'READY TO WEAR'), 'BOTTOMS',  'Pantalones y faldas'),
((SELECT id FROM line_ids WHERE name = 'READY TO WEAR'), 'JACKETS',  'Chaquetas y blazers'),
((SELECT id FROM line_ids WHERE name = 'READY TO WEAR'), 'JUMPSUITS','Enterizos'),
((SELECT id FROM line_ids WHERE name = 'READY TO WEAR'), 'OUTERWEAR','Abrigos'),
((SELECT id FROM line_ids WHERE name = 'SWIMWEAR'),      'BIKINIS',  'Bikinis'),
((SELECT id FROM line_ids WHERE name = 'SWIMWEAR'),      'ONE PIECE','Enterizos de baño'),
((SELECT id FROM line_ids WHERE name = 'ACCESSORIES'),   'BELTS',    'Cinturones'),
((SELECT id FROM line_ids WHERE name = 'ACCESSORIES'),   'BAGS',     'Bolsos'),
((SELECT id FROM line_ids WHERE name = 'COCKTAIL'),      'LONG',     'Vestidos largos'),
((SELECT id FROM line_ids WHERE name = 'COCKTAIL'),      'SHORT',    'Vestidos cortos');

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. TALLAJES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.tallaje_groups (name, type, description) VALUES
('0-2-4-6-8-10-12',      'NUMERIC',    'Tallas numericas estandar'),
('2-4-6-8-10-12',         'NUMERIC',    'Tallas numericas sin 0'),
('XS-S-M-L-XL',           'ALPHABETIC', 'Tallas por letra estandar'),
('1-2-3-4-5-6',           'NUMERIC',    'Tallas numericas especiales'),
('0-12 + XS-XL',          'MIXTO',      'Tallas mixtas numericas y letras');

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. ROLES DE PERSONAS
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.person_roles (name, description) VALUES
('CREATIVO',          'Disenador creativo — crea molderia base y muestra diseno'),
('TECNICO',           'Disenador tecnico — escala moldes y calcula consumos'),
('TRAZADOR',          'Trazador — experto en reduccion de consumos y trazos'),
('MODISTA',           'Modista — confecciona muestras y contramuestras'),
('SUPERVISOR',        'Supervisor de taller o produccion'),
('CONTROL_CALIDAD',   'Control de calidad — verifica prendas terminadas'),
('INGENIERIA',        'Ingenieria de produccion'),
('ESPECIFICADORA',    'Especificadora de fichas tecnicas'),
('CORTADOR',          'Cortador de telas'),
('BORDADORA',         'Bordadora'),
('COORDINADORA',      'Coordinadora de diseno/coleccion'),
('ADMIN',             'Administrador del sistema');

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. STATUS DE REFERENCIA
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.reference_statuses (status, description) VALUES
('EN_PROCESO',        'Referencia activa en desarrollo'),
('APROBADO',          'Referencia aprobada por directora creativa'),
('CANCELADO',         'Referencia cancelada (generico)'),
('PAQUETE_COMPLETO',  'Referencia lista como paquete completo'),
('RECHAZADO',         'Referencia rechazada en medicion'),
('PENDIENTE',         'Referencia pendiente de inicio');

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. STATUS DE TALLER
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.workshop_statuses (status, description) VALUES
('PENDIENTE',       'Pendiente de entrar a taller'),
('EN_CORTE',        'En proceso de corte'),
('EN_CONFECCION',   'En proceso de confeccion'),
('TERMINADO',       'Terminado en taller'),
('EN_REVISION',     'En revision por disenador');

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. TIPOS DE CIERRE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.closure_types (type, description) VALUES
('CREMALLERA',  'Cierre con cremallera (invisible, lateral, posterior)'),
('BOTON',       'Cierre con botones'),
('SNAP',        'Cierre con broches snap'),
('OTRO',        'Otro tipo de cierre (elastico, slip-on, lazos)');

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. TIPOS DE INCLUDE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.include_types (type, description) VALUES
('PRINCIPAL',        'Prenda principal'),
('ACCESORIO',        'Accesorio incluido (cinturon, borla)'),
('PAQUETE_COMPLETO', 'Incluye conjunto completo (top + bottom)'),
('OTRO',             'Otro tipo de include');

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. BASES TEXTILES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.fabric_base_types (name, description) VALUES
('LINEN',            'Lino'),
('COTTON',           'Algodon'),
('SILK',             'Seda natural'),
('WOOL',             'Lana'),
('LYCRA',            'Lycra estandar'),
('LYCRA VITA',       'Lycra Vita'),
('LYCRA BAHIA',      'Lycra Bahia'),
('LYCRA CRINKLE',    'Lycra Crinkle'),
('CRINKLE LYCRA',    'Crinkle Lycra'),
('SILK CDC',         'Seda CDC'),
('COTTON JACQUARD',  'Algodon Jacquard'),
('PRINTED JACQUARD', 'Jacquard Estampado'),
('LEATHER',          'Cuero'),
('CUERO',            'Cuero (espanol)'),
('LIGHT LINEN',      'Lino Ligero'),
('VISCOSE',          'Viscosa'),
('POLYAMIDE',        'Poliamida'),
('POLYESTER',        'Poliester'),
('TAFETA SEDA',      'Tafeta de Seda'),
('DUCHESS SATIN',    'Raso Duchess'),
('CREPE DE CHINE',   'Crepe de Chine'),
('CREPE DE SEDA',    'Crepe de Seda'),
('CUPRO',            'Cupro (forro)'),
('SPANDEX',          'Spandex/Elastano');

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. EMPAQUES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.empaques (name, description) VALUES
('INDIVIDUAL',  'Empaque individual por prenda'),
('CONJUNTO',    'Empaque en conjunto (top + bottom)'),
('SET',         'Set de accesorios'),
('ESPECIAL',    'Empaque especial (alta costura)');

-- ═══════════════════════════════════════════════════════════════════════════
-- 11. TIPOS DE CUIDADO
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.care_types (type, description) VALUES
('LAVADO',     'Instrucciones de lavado'),
('SECADO',     'Instrucciones de secado'),
('PLANCHADO',  'Instrucciones de planchado'),
('DESMANCHE',  'Instrucciones de desmanche/blanqueado'),
('OTRO',       'Otros cuidados especiales');

-- ═══════════════════════════════════════════════════════════════════════════
-- 12. NIVELES DE DIFICULTAD
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.difficulty_levels (level, description) VALUES
('BAJA',   'Dificultad baja — procesos simples'),
('MEDIA',  'Dificultad media — procesos moderados'),
('ALTA',   'Dificultad alta — procesos complejos');

-- ═══════════════════════════════════════════════════════════════════════════
-- 13. TIPOS DE PROCESO EXTERNO
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.process_types (type, description) VALUES
('BORDADO',        'Proceso de bordado externo'),
('LAVANDERIA',     'Lavanderia industrial (stone wash, enzimatico, etc.)'),
('TERMINACION',    'Procesos de terminacion/acabados especiales'),
('CORTE_EXTERNO',  'Corte realizado por maquila externa'),
('OTRO',           'Otro proceso externo');

-- ═══════════════════════════════════════════════════════════════════════════
-- 14. TIPOS DE VARIANTE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.variant_types (type, description) VALUES
('COLOR',    'Variacion por color — misma molderia, distinto color'),
('TELA',     'Variacion por tela — misma molderia, distinta tela'),
('MOLDERIA', 'Variacion por molderia — cambios en el patron');

-- ═══════════════════════════════════════════════════════════════════════════
-- 15. TIPOS DE TEJIDO
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.tejido_types (type, description) VALUES
('PLANO',  'Tejido plano (woven)'),
('PUNTO',  'Tejido de punto (knitted)'),
('CUERO',  'Cuero'),
('DENIM',  'Denim/Mezclilla'),
('OTRO',   'Otro tipo de tejido');

-- ═══════════════════════════════════════════════════════════════════════════
-- 16. TIPOS DE CORTE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.corte_types (type, description) VALUES
('PRENDA_COMPLETA',  'Corte de prenda completa'),
('LABORATORIO',      'Corte de laboratorio (prueba parcial)'),
('PIEZA',            'Corte de pieza individual'),
('REPOSICION',       'Corte de reposicion');

-- ═══════════════════════════════════════════════════════════════════════════
-- 17. STATUS DE NOTA DE FABRICACION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.nota_fabricacion_statuses (status, description) VALUES
('ACTIVA',     'Nota activa — en uso'),
('UTILIZADA',  'Nota utilizada — ya aplicada a produccion'),
('ANULADA',    'Nota anulada — cancelada');

-- ═══════════════════════════════════════════════════════════════════════════
-- 18. PERSONAS (datos reales del equipo JO)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO jo.persons (first_name, last_name) VALUES
-- Creativos (7)
('MARIA',       'BURGOS'),
('FERNANDO',    'CASTAÑO'),
('OSMAN',       'LOPEZ'),
('MAR',         'ORDOÑEZ'),
('YAMILETH',    'ROSERO'),
('CLAUDIA',     'REYES'),
('MARGARITA',   'OLIVO'),
-- Tecnicos (11)
('MARISOL',     'RIASCOS'),
('ANDREA',      'JACOME'),
('KELLY',       'MITROVITH'),
('CRISTIAN',    'GOMEZ'),
('DANIELA',     'GARCIA'),
('LINA',        'DELGADO'),
('NATHALY',     'CONTRERAS'),
('KAROLIN',     'CUMBAL'),
('CAMILA',      'VILLEGAS'),
('JENNIFER',    'CHANTRE'),
('LINA',        'PEÑA'),
-- Cortadores (4)
('JUAN DAVID',  'CORTES'),
('JUAN DIEGO',  'VALENCIA'),
('PAULINA',     'CHAPUESGAL'),
('JEFERSON',    'CHACON'),
-- Modistas (18)
('FANNY',       'GOMEZ'),
('SINDY',       'VAZQUEZ'),
('YULEIMI',     'LUCUMI'),
('ADRIANA',     'ESCOBAR'),
('ALEJANDRA',   'ROJAS'),
('LUISA',       'BUITRAGO'),
('CIELO',       'AGUIRRE'),
('LUISA',       'HERNANDEZ'),
('ENEIDA',      'MACA'),
('MARIA EUGENIA','SARRIA'),
('AISURY',      'QUINTERO'),
('STELLA',      'CASTAÑO'),
('JIMENA',      'BORJA'),
('LUCY',        'RAMOS'),
('KAREN',       'RENGIFO'),
('MARTA',       'RAMIREZ'),
('MARIA NELCY', 'ORDOÑEZ'),
('MARYURI',     'OSPINA'),
-- Especificadoras (5)
('NIDIA',       'ERAZO'),
('MAYRA',       'PRECIADO'),
('ANDRI',       'RENGIFO'),
('JULIANA',     'PARRA'),
('DIANA',       'ADARME'),
-- Trazadores (1)
('CARLOS ANDRES','MEJIA'),
-- Bordadoras (7)
('LUCIA',       'VEGA'),
('CATALINA',    'RUIZ'),
('VALENTINA',   'OSORIO'),
('NATALIA',     'MUÑOZ'),
('CAROLINA',    'LOPEZ'),
('PAULA',       'GARCIA'),
('ALEJANDRA',   'MORALES');
