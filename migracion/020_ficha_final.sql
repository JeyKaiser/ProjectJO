-- AtelierData v2.0 - Ficha Final: catalogo
-- Ejecutar este archivo por separado en Supabase SQL Editor y confirmar
-- la transaccion antes de ejecutar 021_ficha_final.sql.

SET search_path = jo, public;

-- El catalogo existente usa DESMANCHE para desmanche/blanqueado. Se agrega
-- BLANQUEADO como tipo independiente para que pueda seleccionarse en la ficha.
ALTER TYPE jo.care_type ADD VALUE IF NOT EXISTS 'BLANQUEADO';
