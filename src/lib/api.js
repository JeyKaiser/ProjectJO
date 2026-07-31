import { useState, useEffect, useCallback } from 'react';
import supabase from './supabase';

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

export const COLLECTION_BORDERS = {
  'WINTER SUN': '#EAB308',
  'RESORT RTW': '#3B82F6',
  'SPRING SUMMER': '#22C55E',
  'SUMMER VACATION': '#F97316',
  'PREFALL RTW': '#A855F7',
  'FALL WINTER': '#DC2626',
};

export const COLLECTION_SLUGS = {
  'WINTER SUN': 'winter-sun',
  'RESORT RTW': 'resort-rtw',
  'SPRING SUMMER': 'spring-summer',
  'SUMMER VACATION': 'summer-vacation',
  'PREFALL RTW': 'prefall',
  'FALL WINTER': 'fall-winter',
};

export function slugFromName(name) {
  return COLLECTION_SLUGS[name] || name.toLowerCase().replace(/\s+/g, '-');
}

export function borderFromName(name) {
  return COLLECTION_BORDERS[name] || '#6B7280';
}

// ═══════════════════════════════════════════════════════════════
// Fase tracking — 6 Fases con Procesos y Actividades
//   faseActual = F.Pro  (ej: 2.3 = Diseño / Corte)
//   actividad  = F.Pro.Act (ej: 2.3.1 = Diseño / Corte / Corte MD)
// ═══════════════════════════════════════════════════════════════

// Progreso de cada proceso (F.Pro → porcentaje acumulado)
export const subfaseToProgress = {
  // Fase 1: Concepto
  1.1: 4,  1.2: 8,  1.3: 12,
  // Fase 2: Diseño
  2.1: 16, 2.2: 19, 2.3: 22, 2.4: 26,
  2.5: 30, 2.6: 33, 2.7: 36, 2.8: 38,
  // Fase 3: Costeo
  3.1: 42, 3.2: 48, 3.3: 52,
  3.4: 56, 3.5: 59, 3.6: 62,
  // Fase 4: Industrialización
  4.1: 65, 4.2: 68, 4.3: 72, 4.4: 75,
  4.5: 78, 4.6: 81, 4.7: 84, 4.8: 85,
  // Fase 5: Producción
  5.1: 89, 5.2: 93, 5.3: 96,
  // Fase 6: Comercial
  6.1: 98, 6.2: 100,
};

// Nombres de procesos
export const PROCESO_NOMBRES = {
  // Fase 1: Concepto
  1.1: 'Aprobacion de Diseños',
  1.2: 'Solicitud Sampling / Labs',
  1.3: 'Llegada de Sampling',
  // Fase 2: Diseño
  2.1: 'Inicio de Coleccion',
  2.2: 'Prototipos (Moldería MD)',
  2.3: 'Corte',
  2.4: 'Confeccion',
  2.5: 'Bordado',
  2.6: 'Medicion',
  2.7: 'Fotos Internas',
  2.8: 'Despacho Muestras Diseño',
  // Fase 3: Costeo
  3.1: 'Foto Producto',
  3.2: 'Costeo',
  3.3: 'Cierre Costeo',
  3.4: 'Modificaciones de Arte',
  3.5: 'Ubicaciones de Trazo',
  3.6: 'Cierre de Coleccion',
  // Fase 4: Industrialización
  4.1: 'Final Buy',
  4.2: 'Alistamiento',
  4.3: 'Industrializacion (Explosion)',
  4.4: 'Corte',
  4.5: 'Confeccion',
  4.6: 'Bordado',
  4.7: 'Medicion',
  4.8: 'Inventario',
  // Fase 5: Producción
  5.1: 'Entrega a Produccion',
  5.2: 'Produccion',
  5.3: 'Feedback Produccion',
  // Fase 6: Comercial
  6.1: 'Entrega a Comercial',
  6.2: 'Feed Comercial',
};

// Configuración de las 6 macro fases
const FASES_CONFIG = [
  { fase: 1, nombre: 'Concepto',             tempVar: 'frost' },
  { fase: 2, nombre: 'Diseño',               tempVar: 'cold' },
  { fase: 3, nombre: 'Costeo',               tempVar: 'warm' },
  { fase: 4, nombre: 'Industrializacion',    tempVar: 'hot' },
  { fase: 5, nombre: 'Produccion',           tempVar: 'fire' },
  { fase: 6, nombre: 'Comercial',            tempVar: 'blaze' },
];

export function getFaseMacro(subfase) {
  const f = Math.floor(subfase);
  return FASES_CONFIG[f - 1] || FASES_CONFIG[0];
}

export function getProcesoNombre(subfase) {
  return PROCESO_NOMBRES[subfase] || '';
}

// Mapea status_id a subfase aproximada
const STATUS_TO_SUBFASE = { 1: 1.1, 2: 6.2, 3: 0, 4: 6.2, 5: 0, 6: 1.1 };

// ═══════════════════════════════════════════════════════════════
// Hook: useDashboardData — fetch collections + references
// ═══════════════════════════════════════════════════════════════
export function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Fetch collections + collection_years
        const { data: cols, error: colErr } = await supabase
          .from('collections')
          .select('id,code,name,image_url,year,season')
          .eq('active', true);

        if (colErr) throw colErr;

        // Fetch collection groups (canonical seasons)
        const { data: groups, error: grpErr } = await supabase
          .from('collection_groups')
          .select('id,code,name,image_url')
          .eq('active', true)
          .order('id');

        if (grpErr) throw grpErr;

        // Fetch collection years
        const { data: colYears, error: cyErr } = await supabase
          .from('collection_years')
          .select('id,collection_id,year,is_hidden');

        if (cyErr) throw cyErr;

        // Fetch references
        const { data: refs, error: refErr } = await supabase
          .from('references')
          .select('id, reference_number, name, collection_id, year, status_id, is_hidden, main_image_url, has_art_modification, has_trace_location, has_all_over, has_embroidery, drop_entrega, priority_first_buy, created_at');

        if (refErr) throw refErr;

        if (cancelled) return;

        // Mapa rápido: collection_id -> years
        const yearsByCollection = {};
        (colYears || []).forEach(cy => {
          if (!yearsByCollection[cy.collection_id]) yearsByCollection[cy.collection_id] = [];
          yearsByCollection[cy.collection_id].push(cy);
        });

        // Build colecciones structure
        const colecciones = cols.map(col => {
          const colYearsList = yearsByCollection[col.id] || [];
          const fallbackYear = col.year || 2026;

          const anios = colYearsList.length > 0
            ? colYearsList.map(cy => {
                const yearRefs = (refs || []).filter(r =>
                  r.collection_id === col.id && r.year === cy.year
                );
                const total = yearRefs.length;
                const completadas = yearRefs.filter(r => r.status_id === 2 || r.status_id === 4).length;
                const pausadas = yearRefs.filter(r => r.status_id === 3 || r.status_id === 5).length;
                const enProceso = total - completadas - pausadas;

                const referencias = yearRefs.map(r => {
                  const sf = STATUS_TO_SUBFASE[r.status_id] || 1.1;
                  const fm = getFaseMacro(sf);
                  const clasificacion = r.has_art_modification ? 'Mod. Arte'
                    : r.has_trace_location ? 'Ubicacion Trazo'
                    : r.has_all_over ? 'All Over'
                    : 'Solida';

                  return {
                    id: `REF-${r.reference_number}`,
                    dbId: r.id,
                    codigoMD: `MD-${String(r.reference_number).padStart(3, '0')}`,
                    codigoPT: `PT03${String(r.reference_number).padStart(3, '0')}`,
                    nombre: r.name,
                    tipoPrenda: col.name || '',
                    color: '',
                    codigoColor: '',
                    imagen: r.main_image_url || null,
                    linea: '',
                    sublinea: '',
                    tallaje: '',
                    largo: '',
                    closure: '',
                    faseActual: sf,
                    subfaseNombre: getProcesoNombre(sf),
                    responsable: '',
                    tiempoFase: '',
                    clasificacion,
                    prioridadFirstBuy: r.drop_entrega || '',
                    dropEntrega: r.drop_entrega || '',
                    enviarMaquila: false,
                    complejidadCorte: '',
                    complejidadConfeccion: '',
                    tieneBordado: r.has_embroidery || false,
                    tieneSemielaborado: false,
                    montajeManiqui: '',
                    tirasContinuas: false,
                    includes: '',
                    tipoEmpaque: '',
                    isHidden: r.is_hidden || false,
                    telas: [],
                    insumos: [],
                    historialFases: [],
                    mediciones: [],
                    procesosEspeciales: [],
                    marquilla: null,
                    cuidados: [],
                    contramuestra: null,
                  };
                });

                return {
                  id: cy.id,
                  anio: cy.year,
                  isHidden: cy.is_hidden || false,
                  resumen: { total, enProceso, pausadas, completadas },
                  referencias,
                };
              })
            : [{
                id: null,
                anio: fallbackYear,
                isHidden: false,
                resumen: { total: 0, enProceso: 0, pausadas: 0, completadas: 0 },
                referencias: (() => {
                  const yearRefs = (refs || []).filter(r => r.collection_id === col.id);
                  const total = yearRefs.length;
                  const completadas = yearRefs.filter(r => r.status_id === 2 || r.status_id === 4).length;
                  const pausadas = yearRefs.filter(r => r.status_id === 3 || r.status_id === 5).length;
                  const enProceso = total - completadas - pausadas;
                  return yearRefs.map(r => {
                    const sf = STATUS_TO_SUBFASE[r.status_id] || 1.1;
                    const clasificacion = r.has_art_modification ? 'Mod. Arte'
                      : r.has_trace_location ? 'Ubicacion Trazo'
                      : r.has_all_over ? 'All Over'
                      : 'Solida';
                    return {
                      id: `REF-${r.reference_number}`,
                      dbId: r.id,
                      codigoMD: `MD-${String(r.reference_number).padStart(3, '0')}`,
                      codigoPT: `PT03${String(r.reference_number).padStart(3, '0')}`,
                      nombre: r.name,
                      tipoPrenda: col.name || '',
                      color: '', codigoColor: '',
                      imagen: r.main_image_url || null,
                      linea: '', sublinea: '', tallaje: '', largo: '', closure: '',
                      faseActual: sf,
                      subfaseNombre: getProcesoNombre(sf),
                      responsable: '', tiempoFase: '',
                      clasificacion,
                      prioridadFirstBuy: r.drop_entrega || '',
                      dropEntrega: r.drop_entrega || '',
                      enviarMaquila: false,
                      complejidadCorte: '', complejidadConfeccion: '',
                      tieneBordado: r.has_embroidery || false,
                      tieneSemielaborado: false,
                      montajeManiqui: '', tirasContinuas: false,
                      includes: '', tipoEmpaque: '',
                      isHidden: r.is_hidden || false,
                      telas: [], insumos: [], historialFases: [], mediciones: [],
                      procesosEspeciales: [], marquilla: null, cuidados: [], contramuestra: null,
                    };
                  });
                })(),
              }];

          // fix anios resumen for fallback case
          if (colYearsList.length === 0 && anios.length) {
            const refsForYear = anios[0].referencias;
            const t = refsForYear.length;
            const c = refsForYear.filter(r => r.faseActual >= 6).length;
            const p = refsForYear.filter(r => r.faseActual === 0).length;
            anios[0].resumen = { total: t, enProceso: t - c - p, pausadas: p, completadas: c };
          }

          return {
            id: slugFromName(col.name),
            dbId: col.id,
            code: col.code,
            season: col.season,
            nombre: col.name,
            imagen: col.image_url || null,
            borderColor: borderFromName(col.name),
            anios,
          };
        });

        setData({ colecciones, groups: groups || [] });
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

// ═══════════════════════════════════════════════════════════════
// Hook: useReferenciaDetalle(id) — fetch full reference detail
// ═══════════════════════════════════════════════════════════════
export function useReferenciaDetalle(refId) {
  const [ref, setRef] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!refId) return;
    let cancelled = false;
    async function load() {
      try {
        const refNum = refId.replace('REF-', '');

        const { data: refData, error: refErr } = await supabase
          .from('references')
          .select('*, collections(name, code), reference_statuses(status, description)')
          .eq('reference_number', refNum)
          .single();

        if (refErr) throw refErr;

        // Fetch fabrics for this reference
        const { data: fabrics } = await supabase
          .from('reference_fabrics')
          .select('*, fabrics(code, description, width_cm, fabric_base_types(name))')
          .eq('reference_id', refData.id);

        // Fetch consumos
        const { data: consumos } = await supabase
          .from('consumos')
          .select('*')
          .eq('reference_id', refData.id)
          .order('created_at');

        if (cancelled) return;

        const sf = STATUS_TO_SUBFASE[refData.status_id] || 1.1;
        const fm = getFaseMacro(sf);

        setRef({
          ...refData,
          id: refId,
          codigoMD: `MD-${String(refData.reference_number).padStart(3, '0')}`,
          codigoPT: `PT03${String(refData.reference_number).padStart(3, '0')}`,
          faseActual: sf,
          subfaseNombre: getProcesoNombre(sf),
          coleccionNombre: refData.collections?.name || '',
          coleccionCode: refData.collections?.code || '',
          coleccionId: refData.collection_id,
          year: refData.year,
          isHidden: refData.is_hidden || false,
          statusNombre: refData.reference_statuses?.status || 'EN_PROCESO',
          telasSupabase: fabrics || [],
          consumosSupabase: consumos || [],
          clasificacion: refData.has_art_modification ? 'Mod. Arte'
            : refData.has_trace_location ? 'Ubicacion Trazo'
            : refData.has_all_over ? 'All Over'
            : 'Solida',
        });
      } catch (e) {
        console.error('Error loading reference:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refId]);

  return { ref, loading };
}

// ═══════════════════════════════════════════════════════════════
// Hook: useConsumos — fetch consumos for a reference
// ═══════════════════════════════════════════════════════════════
export function useConsumos(refId) {
  const [consumos, setConsumos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!refId) return;
    let cancelled = false;
    async function load() {
      const refNum = refId.replace('REF-', '');
      const { data: ref } = await supabase
        .from('references')
        .select('id')
        .eq('reference_number', refNum)
        .single();

      if (!ref) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('consumos')
        .select('*, reference_fabrics(fabric_id, fabrics(code, description))')
        .eq('reference_id', ref.id)
        .order('role')
        .order('version');

      if (!error && !cancelled) setConsumos(data || []);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [refId]);

  return { consumos, loading };
}

// ═══════════════════════════════════════════════════════════════
// Hook: useFabrics — fetch fabric catalog for autocomplete
// ═══════════════════════════════════════════════════════════════
export function useFabrics() {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from('fabrics')
        .select('id, code, description, width_cm, image_url')
        .eq('active', true)
        .order('code');

      if (!error && !cancelled) setFabrics(data || []);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { fabrics, loading };
}

// ═══════════════════════════════════════════════════════════════
// Hook: useReferenceFabrics — fetch fabrics assigned to a reference
// ═══════════════════════════════════════════════════════════════
export function useReferenceFabrics(refId) {
  const [refFabrics, setRefFabrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!refId) return;
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from('reference_fabrics')
        .select('id, reference_id, fabric_id, usage, width_cm, consumo_base, notes, active, fabrics(id, code, description, width_cm, image_url)')
        .eq('reference_id', refId)
        .eq('active', true)
        .order('id');

      if (!error && !cancelled) setRefFabrics(data || []);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [refId]);

  return { refFabrics, loading };
}

// ═══════════════════════════════════════════════════════════════
// CRUD: reference_fabrics
// ═══════════════════════════════════════════════════════════════
export async function saveReferenceFabric({ id, reference_id, fabric_id, usage, width_cm, notes }) {
  if (id) {
    return supabase
      .from('reference_fabrics')
      .update({ fabric_id, usage, width_cm, notes })
      .eq('id', id)
      .select('*')
      .single();
  }
  return supabase
    .from('reference_fabrics')
    .insert({ reference_id, fabric_id, usage, width_cm, notes })
    .select('*, fabrics(id, code, description, width_cm, image_url)')
    .single();
}

export async function deleteReferenceFabric(id) {
  return supabase
    .from('reference_fabrics')
    .update({ active: false })
    .eq('id', id);
}

// ═══════════════════════════════════════════════════════════════
// CRUD: consumos (batch save)
// ═══════════════════════════════════════════════════════════════
export async function saveConsumos(consumosArray) {
  const results = [];
  for (const c of consumosArray) {
    if (c.id) {
      const { data, error } = await supabase
        .from('consumos')
        .update({
          consumo_valor: c.consumo_valor,
          unidades: c.unidades,
          talla: c.talla,
          observaciones: c.observaciones,
        })
        .eq('id', c.id)
        .select('*')
        .single();
      if (!error) results.push(data);
    } else {
      const { data, error } = await supabase
        .from('consumos')
        .insert({
          reference_id: c.reference_id,
          reference_fabric_id: c.reference_fabric_id,
          role: c.role,
          tipo_tela: c.tipo_tela || 'SOLIDO',
          version: c.version || 1,
          talla: c.talla,
          unidades: c.unidades,
          consumo_valor: c.consumo_valor,
          observaciones: c.observaciones,
        })
        .select('*')
        .single();
      if (!error) results.push(data);
    }
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// CRUD: Collections
// ═══════════════════════════════════════════════════════════════
export async function createCollection({ code, name, season, description, image_url }) {
  return supabase
    .from('collections')
    .insert({ code, name, season, description, image_url, active: true })
    .select('*')
    .single();
}

export async function updateCollection(id, { name, season, description, image_url }) {
  return supabase
    .from('collections')
    .update({ name, season, description, image_url })
    .eq('id', id)
    .select('*')
    .single();
}

export async function toggleCollectionActive(id, active) {
  return supabase
    .from('collections')
    .update({ active })
    .eq('id', id);
}

// ═══════════════════════════════════════════════════════════════
// CRUD: Collection Years
// ═══════════════════════════════════════════════════════════════
export async function createCollectionYear(collectionId, year) {
  return supabase
    .from('collection_years')
    .insert({ collection_id: collectionId, year, is_hidden: false })
    .select('*')
    .single();
}

export async function toggleCollectionYearHidden(id, isHidden) {
  return supabase
    .from('collection_years')
    .update({ is_hidden: isHidden })
    .eq('id', id);
}

export function useCollectionYears(collectionId) {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collectionId) { setYears([]); setLoading(false); return; }
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from('collection_years')
        .select('*')
        .eq('collection_id', collectionId)
        .order('year', { ascending: false });
      if (!error && !cancelled) setYears(data || []);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [collectionId]);

  return { years, loading };
}

// ═══════════════════════════════════════════════════════════════
// CRUD: References (create, update, hide)
// ═══════════════════════════════════════════════════════════════
export async function createReference(data) {
  const {
    collection_id, year, reference_number, name, color, color_code,
    reference_type, line_id, subline_id, tallaje_group_id,
    length_description, closure_type_id, package_type_id,
    has_art_modification, has_trace_location, has_all_over,
    has_embroidery, has_semielaborated,
    complejidad_corte_id, complejidad_confeccion_id,
    priority_first_buy, drop_entrega,
    envio_corte_maquila, envio_confeccion_maquila,
    main_image_url, status_id,
  } = data;

  return supabase
    .from('references')
    .insert({
      collection_id, year, reference_number, name, color, color_code,
      reference_type: reference_type || 'SILUETA',
      line_id, subline_id, tallaje_group_id,
      length_description, closure_type_id, package_type_id,
      has_art_modification: has_art_modification || false,
      has_trace_location: has_trace_location || false,
      has_all_over: has_all_over || false,
      has_embroidery: has_embroidery || false,
      has_semielaborated: has_semielaborated || false,
      complejidad_corte_id, complejidad_confeccion_id,
      priority_first_buy, drop_entrega,
      envio_corte_maquila: envio_corte_maquila || false,
      envio_confeccion_maquila: envio_confeccion_maquila || false,
      main_image_url,
      status_id: status_id || 1,
      is_hidden: false,
    })
    .select('*')
    .single();
}

export async function updateReference(id, data) {
  return supabase
    .from('references')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();
}

export async function toggleReferenceHidden(id, isHidden) {
  return supabase
    .from('references')
    .update({ is_hidden: isHidden })
    .eq('id', id);
}

// ═══════════════════════════════════════════════════════════════
// CRUD: Cut Requests (Tabla de Corte)
// ═══════════════════════════════════════════════════════════════
export function useCutRequests({ source } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('cut_requests')
        .select('*, references(reference_number, name, color, main_image_url, has_art_modification, has_trace_location, has_all_over, has_embroidery), collections(code, name)')
        .order('created_at', { ascending: false });

      if (source === 'app') query = query.neq('source', 'csv');
      else if (source === 'csv') query = query.eq('source', 'csv');

      const { data, error: err } = await query;

      if (err) throw err;
      setItems(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => { load(); }, [load]);

  return { items, loading, error, refresh: load };
}

export async function createCutRequest(data) {
  const { reference_id, collection_id, type, fabric_handling, requester_name, requester_role, observations } = data;
  return supabase
    .from('cut_requests')
    .insert({
      reference_id, collection_id, type, fabric_handling,
      requester_name, requester_role, observations,
      status: 'en_cola',
      fecha_recepcion: new Date().toISOString(),
    })
    .select('*')
    .single();
}

export async function updateCutRequest(id, updates) {
  return supabase
    .from('cut_requests')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
}

// ═══════════════════════════════════════════════════════════════
// CRUD: Trazos (Workflow del Trazador)
// ═══════════════════════════════════════════════════════════════

export function useTrazos(refId, fase) {
  const [trazos, setTrazos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!refId) return;
    setLoading(true);
    try {
      let query = supabase
        .from('trazos')
        .select('*, reference_fabrics(id, usage, fabrics(code, description))')
        .eq('reference_id', refId)
        .order('opcion_num')
        .order('fase');

      if (fase) query = query.eq('fase', fase);

      const { data, error: err } = await query;
      if (err) throw err;
      setTrazos(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [refId, fase]);

  useEffect(() => { load(); }, [load]);

  return { trazos, loading, error, refresh: load };
}

export async function createTrazo(data) {
  return supabase
    .from('trazos')
    .insert({
      reference_id: data.reference_id,
      reference_fabric_id: data.reference_fabric_id || null,
      tipo_tela: data.tipo_tela || 'SOLIDO',
      fase: data.fase || 'costeo',
      opcion_num: data.opcion_num || 1,
      veces_trazadas: data.veces_trazadas || 1,
      cantidad_piezas: data.cantidad_piezas,
      consumo_valor: data.consumo_valor,
      talla: data.talla,
      ancho_tela: data.ancho_tela,
      ancho_sesgo: data.ancho_sesgo,
      consumo_lineal: data.consumo_lineal,
      archivo_audaces: data.archivo_audaces,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      trazador_id: data.trazador_id,
      observaciones: data.observaciones,
    })
    .select('*')
    .single();
}

export async function updateTrazo(id, data) {
  return supabase
    .from('trazos')
    .update({
      tipo_tela: data.tipo_tela,
      fase: data.fase,
      opcion_num: data.opcion_num,
      veces_trazadas: data.veces_trazadas,
      cantidad_piezas: data.cantidad_piezas,
      consumo_valor: data.consumo_valor,
      talla: data.talla,
      ancho_tela: data.ancho_tela,
      ancho_sesgo: data.ancho_sesgo,
      consumo_lineal: data.consumo_lineal,
      archivo_audaces: data.archivo_audaces,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      trazador_id: data.trazador_id,
      observaciones: data.observaciones,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
}

export async function deleteTrazo(id) {
  return supabase
    .from('trazos')
    .delete()
    .eq('id', id);
}

// ═══════════════════════════════════════════════════════════════
// CRUD: Comparativo de Trazos
// ═══════════════════════════════════════════════════════════════

export function useComparativo(refId) {
  const [comparativo, setComparativo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!refId) return;
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from('comparativo_trazos')
        .select('*, trazo_costeo:trazo_costeo_id(*), trazo_contramuestra:trazo_contramuestra_id(*)')
        .eq('reference_id', refId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && !cancelled) setComparativo(data?.[0] || null);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [refId]);

  return { comparativo, loading };
}

export async function saveComparativo(data) {
  if (data.id) {
    return supabase
      .from('comparativo_trazos')
      .update({
        trazo_costeo_id: data.trazo_costeo_id,
        trazo_contramuestra_id: data.trazo_contramuestra_id,
        difiere_veces: data.difiere_veces,
        justificacion_veces: data.justificacion_veces,
        difiere_piezas: data.difiere_piezas,
        justificacion_piezas: data.justificacion_piezas,
        difiere_ancho: data.difiere_ancho,
        justificacion_ancho: data.justificacion_ancho,
        difiere_molderia: data.difiere_molderia,
        justificacion_molderia: data.justificacion_molderia,
        difiere_sesgo: data.difiere_sesgo,
        justificacion_sesgo: data.justificacion_sesgo,
        difiere_ancho_sesgo: data.difiere_ancho_sesgo,
        justificacion_ancho_sesgo: data.justificacion_ancho_sesgo,
        difiere_telas: data.difiere_telas,
        justificacion_telas: data.justificacion_telas,
        trazador_id: data.trazador_id,
        fecha_comparativo: data.fecha_comparativo,
        observaciones: data.observaciones,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)
      .select('*')
      .single();
  }

  return supabase
    .from('comparativo_trazos')
    .insert({
      reference_id: data.reference_id,
      trazo_costeo_id: data.trazo_costeo_id,
      trazo_contramuestra_id: data.trazo_contramuestra_id,
      difiere_veces: data.difiere_veces || false,
      justificacion_veces: data.justificacion_veces,
      difiere_piezas: data.difiere_piezas || false,
      justificacion_piezas: data.justificacion_piezas,
      difiere_ancho: data.difiere_ancho || false,
      justificacion_ancho: data.justificacion_ancho,
      difiere_molderia: data.difiere_molderia || false,
      justificacion_molderia: data.justificacion_molderia,
      difiere_sesgo: data.difiere_sesgo || false,
      justificacion_sesgo: data.justificacion_sesgo,
      difiere_ancho_sesgo: data.difiere_ancho_sesgo || false,
      justificacion_ancho_sesgo: data.justificacion_ancho_sesgo,
      difiere_telas: data.difiere_telas || false,
      justificacion_telas: data.justificacion_telas,
      trazador_id: data.trazador_id,
      fecha_comparativo: data.fecha_comparativo || new Date().toISOString().split('T')[0],
      observaciones: data.observaciones,
    })
    .select('*')
    .single();
}
