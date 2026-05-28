-- ===========================================================================
-- Agregar columna image_url a jo.collections y poblar con imagenes locales
-- ===========================================================================
SET search_path = jo, public;

-- 1. Agregar la columna
ALTER TABLE jo.collections ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Poblar con los paths de imagenes en public/images/colecciones/
UPDATE jo.collections SET image_url = '/images/colecciones/winter_sun.png'     WHERE code = 'WS';
UPDATE jo.collections SET image_url = '/images/colecciones/resort_rtw.png'     WHERE code = 'RS';
UPDATE jo.collections SET image_url = '/images/colecciones/spring_summer.png'  WHERE code = 'SS';
UPDATE jo.collections SET image_url = '/images/colecciones/summer_vacation.png' WHERE code = 'SV';
UPDATE jo.collections SET image_url = '/images/colecciones/prefall.png'        WHERE code = 'PF';
UPDATE jo.collections SET image_url = '/images/colecciones/fallwinter.png'     WHERE code = 'FW';
