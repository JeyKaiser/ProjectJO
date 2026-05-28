-- ===========================================================================
-- AtelierData v2.0 — Seed de Fases del Workflow (13 sub-fases)
-- Ejecutar DESPUES de database_schema.sql
-- ===========================================================================
SET search_path = jo, public;

INSERT INTO jo.workflow_phases (code, name, description, sequence, macro_fase) VALUES
-- FASE 1: CREACION Y DISENO (Area Creativa) — azul/frio
('1.1', 'Perfilamiento',
 'Creacion de ficha tecnica y asignacion simultanea de codigos MD/PT. Definicion de complejidad y caracteristicas iniciales.',
 1, 1),
('1.2', 'Consumo Base',
 'Estimacion visual del consumo de tela realizada por el disenador creativo basandose en la molderia referente.',
 2, 1),
('1.3', 'Molderia Base',
 'Creacion del primer patron digital (Audaces) o en papel en la talla base (2 o XS).',
 3, 1),

-- FASE 2: LABORATORIO Y PROTOTIPADO (Modulo Taller) —ambar/tibio
('2.1', 'Alistamiento',
 'Separacion de telas e insumos para corte. Revision de calidad de materiales. Posibles novedades pausan el flujo.',
 4, 2),
('2.2', 'Corte de Muestra',
 'Procesamiento de la tela base asignada. Corte de los moldes en la talla de muestra.',
 5, 2),
('2.3', 'Confeccion de Muestra',
 'Ensamblaje fisico de la muestra diseno por la modista asignada. Incluye registro de tiempo y responsable.',
 6, 2),
('2.4', 'Procesos Especiales',
 'Lavanderia, bordado, drapeado u otros procesos externos aplicados a la muestra confeccionada.',
 7, 2),

-- FASE 3: VALIDACION TECNICA (Area de Ingenieria) — naranja/caliente
('3.1', 'Medicion y Tallaje',
 'Prueba de la muestra con modelo. Veredicto de la Directora Creativa: aprobada directa, con comentarios o rechazada.',
 8, 3),
('3.2', 'Ajustes de Molderia',
 'Correccion por encogimientos, ajustes de medidas u observaciones de la medicion. Regreso al disenador creativo si es necesario.',
 9, 3),
('3.3', 'Escalado y Consumo Tecnico',
 'Escalado de la molderia a todas las tallas. Calculo de consumos por el disenador tecnico en la talla mayor (Solido/Mod Arte/Ubi Trazo).',
 10, 3),
('3.4', 'Trazos de Produccion',
 'Consumo definitivo calculado por el trazador con Audaces Tizada. Version final de costeo para Solido, Mod Arte y Ubi Trazo.',
 11, 3),

-- FASE 4: INDUSTRIALIZACION (Area de Produccion) — rojo/muy caliente
('4.1', 'Cierre Ficha Final',
 'Definicion de marquillas, cuidados de la prenda y composiciones definitivas. Revision de insumos en SAP.',
 12, 4),
('4.2', 'Explosion Contramuestra',
 'Verificacion del consumo real contra el consumo del trazador. Si varia el consumo, se informa a costeo.',
 13, 4),
('4.3', 'Nota de Fabricacion SAP',
 'Creacion de la Nota de Fabricacion en SAP que reserva/asigna telas e insumos. Disparador para produccion masiva en planta o maquila.',
 14, 4);
