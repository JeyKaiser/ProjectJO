// src/data/referentes.js
// Capa de compatibilidad: los datos ahora viven en jo.referents (tabla plana, 11 campos)
// Se recomienda usar los hooks de ../lib/api.js directamente desde componentes React.

import supabase from '../lib/supabase';

let cachedData = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000;

async function loadCache() {
  if (cachedData && (Date.now() - cacheTimestamp) < CACHE_TTL) return cachedData;
  const { data, error } = await supabase
    .from('referents')
    .select('*')
    .order('tipo_prenda')
    .order('cantidad_telas')
    .order('variante')
    .order('tela');
  if (error) throw error;
  cachedData = (data || []).map(r => ({
    id: r.id,
    tipoPrenda: r.tipo_prenda,
    cantidadTelas: r.cantidad_telas,
    variante: r.variante,
    tela: r.tela,
    usoEnPrenda: r.uso_prenda,
    baseTextil: r.base_textil,
    color: r.color,
    anchoTela: r.ancho_tela,
    consumo: r.consumo,
    descripcion: r.descripcion,
    terminacion: r.terminacion,
  }));
  cacheTimestamp = Date.now();
  return cachedData;
}

export const getReferentes = () => cachedData || [];

export const getReferenteById = (id) => (cachedData || []).find(r => r.id === id);

export const getTiposPrenda = () => {
  if (!cachedData) return [];
  return [...new Set(cachedData.map(r => r.tipoPrenda))];
};

export const getCantidadesTelas = (tipoPrenda) => {
  if (!cachedData) return [];
  const filtrados = cachedData.filter(r => r.tipoPrenda === tipoPrenda);
  return [...new Set(filtrados.map(r => r.cantidadTelas))].sort();
};

export const getVariantes = (tipoPrenda, cantidadTelas) => {
  if (!cachedData) return [];
  const filtrados = cachedData.filter(r => r.tipoPrenda === tipoPrenda && r.cantidadTelas === cantidadTelas);
  return [...new Set(filtrados.map(r => r.variante))].sort();
};

export const getFilasDeReferente = (tipoPrenda, cantidadTelas, variante) => {
  if (!cachedData) return [];
  return cachedData.filter(r =>
    r.tipoPrenda === tipoPrenda &&
    r.cantidadTelas === cantidadTelas &&
    r.variante === variante
  );
};

export const buscarConsumo = ({ tipoPrenda, cantidadTelas, variante, tela, usoEnPrenda, baseTextil, anchoTela, color }) => {
  if (!cachedData) return null;
  const fila = cachedData.find(r =>
    r.tipoPrenda === tipoPrenda &&
    r.cantidadTelas === cantidadTelas &&
    r.variante === variante &&
    String(r.tela) === String(tela) &&
    r.usoEnPrenda === usoEnPrenda &&
    r.baseTextil === baseTextil &&
    r.anchoTela === anchoTela &&
    r.color === color
  );
  return fila ? fila.consumo : null;
};

export function initReferentes() {
  return loadCache().catch(() => []);
}
