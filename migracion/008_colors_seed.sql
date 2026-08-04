-- ===========================================================================
-- AtelierData v2.0 — Seed: Catalogo Maestro de Colores
-- ~50 colores de ejemplo para Moda/Textil
-- ===========================================================================
SET search_path = jo, public;

INSERT INTO jo.colors (code, name, hex) VALUES
-- Negros / Grises
('NEGRO-001', 'Black', '#000000'),
('NEGRO-002', 'Jet Black', '#0A0A0A'),
('GRIS-001', 'Light Grey', '#D3D3D3'),
('GRIS-002', 'Charcoal Grey', '#36454F'),
('GRIS-003', 'Silver Grey', '#C0C0C0'),
('GRIS-004', 'Dove Grey', '#8C92AC'),
('GRIS-005', 'Pearl Grey', '#E2DFD2'),
-- Blancos / Cremas
('BLANCO-001', 'White', '#FFFFFF'),
('BLANCO-002', 'Off White', '#FAF9F6'),
('BLANCO-003', 'Ivory', '#FFFFF0'),
('BLANCO-004', 'Cream', '#FFFDD0'),
('BLANCO-005', 'Ecru', '#C2B280'),
('BLANCO-006', 'Sand', '#C2B280'),
-- Rojos
('ROJO-001', 'Red', '#FF0000'),
('ROJO-002', 'Crimson', '#DC143C'),
('ROJO-003', 'Burgundy', '#800020'),
('ROJO-004', 'Wine Red', '#722F37'),
('ROJO-005', 'Coral Red', '#FF4040'),
('ROJO-006', 'Cherry Red', '#DE3163'),
-- Azules
('AZUL-001', 'Navy Blue', '#000080'),
('AZUL-002', 'Royal Blue', '#4169E1'),
('AZUL-003', 'Sky Blue', '#87CEEB'),
('AZUL-004', 'Cobalt Blue', '#0047AB'),
('AZUL-005', 'Baby Blue', '#89CFF0'),
('AZUL-006', 'Midnight Blue', '#191970'),
-- Verdes
('VERDE-001', 'Emerald Green', '#50C878'),
('VERDE-002', 'Forest Green', '#228B22'),
('VERDE-003', 'Olive Green', '#808000'),
('VERDE-004', 'Sage Green', '#BCB88A'),
('VERDE-005', 'Mint Green', '#98FB98'),
('VERDE-006', 'Jade Green', '#00A86B'),
-- Rosas / Violeas
('ROSA-001', 'Pink', '#FFC0CB'),
('ROSA-002', 'Fuchsia', '#FF00FF'),
('ROSA-003', 'Dusty Rose', '#C0737A'),
('ROSA-004', 'Blush Pink', '#DE5D83'),
('ROSA-005', 'Magenta', '#FF00FF'),
('MORADO-001', 'Purple', '#800080'),
('MORADO-002', 'Lavender', '#E6E6FA'),
('MORADO-003', 'Plum', '#DDA0DD'),
-- Naranjas / Amarillos
('NARANJA-001', 'Orange', '#FFA500'),
('NARANJA-002', 'Terracotta', '#E2725B'),
('NARANJA-003', 'Peach', '#FFE5B4'),
('AMARILLO-001', 'Yellow', '#FFFF00'),
('AMARILLO-002', 'Gold', '#FFD700'),
('AMARILLO-003', 'Mustard Yellow', '#FFDB58'),
('AMARILLO-004', 'Butter Yellow', '#FFFACD'),
-- Marrones / Neutros
('CAFE-001', 'Brown', '#964B00'),
('CAFE-002', 'Chocolate Brown', '#7B3F00'),
('CAFE-003', 'Beige', '#F5F5DC'),
('CAFE-004', 'Camel', '#C19A6B'),
('CAFE-005', 'Taupe', '#483C32'),
('CAFE-006', 'Nude', '#F2D5C4')
ON CONFLICT (code) DO NOTHING;

-- Verificar insercion
SELECT count(*) AS total_colors FROM jo.colors;
