import { useState, useEffect, useCallback, startTransition } from 'react';
import supabase, { uploadImage } from './supabase';
import {
  getReferenceStatusBucket,
  getReferenceStatusLabel,
  getReferenceStatusSubfase,
  isCancelledStatus,
} from './referenceStatuses';

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

// ═══════════════════════════════════════════════════════════════
// Hook: useDashboardData — fetch collections + references
// ═══════════════════════════════════════════════════════════════
export function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    startTransition(() => { setLoading(true); setError(null); });
    async function load() {
      try {
        const [collectionsResult, groupsResult, yearsResult, referencesResult] = await Promise.all([
          supabase
            .from('collections')
            .select('id,code,name,image_url,year,season')
            .eq('active', true),
          supabase
            .from('collection_groups')
            .select('id,code,name,image_url')
            .eq('active', true)
            .order('id'),
          supabase
            .from('collection_years')
            .select('id,collection_id,year,is_hidden'),
          supabase
            .from('references')
            .select('id, reference_number, name, collection_id, year, status_id, is_hidden, main_image_url, has_art_modification, has_trace_location, has_all_over, has_embroidery, drop_entrega, priority_first_buy, color, color_code, length_description, length_cm, has_semielaborated, envio_confeccion_maquila, tallaje_group_id, tallaje_groups(id, name), reference_type, tipo_ref, lines(name, code), sublines(name), complejidad_corte_id, complejidad_confeccion_id, reference_statuses(status), created_at'),
        ]);

        const { data: cols, error: colErr } = collectionsResult;
        const { data: groups, error: grpErr } = groupsResult;
        const { data: colYears, error: cyErr } = yearsResult;
        const { data: refs, error: refErr } = referencesResult;
        if (colErr) throw colErr;
        if (grpErr) throw grpErr;
        if (cyErr) throw cyErr;
        if (refErr) throw refErr;

        if (cancelled) return;

        const refIds = (refs || []).map(r => r.id);
        const codeMap = await resolveReferenceCodes(refIds);

        // Mapa rápido: collection_id -> years
        const yearsByCollection = {};
        (colYears || []).forEach(cy => {
          if (!yearsByCollection[cy.collection_id]) yearsByCollection[cy.collection_id] = [];
          yearsByCollection[cy.collection_id].push(cy);
        });

        const refsByCollection = {};
        const refsByCollectionYear = {};
        (refs || []).forEach(ref => {
          if (!refsByCollection[ref.collection_id]) refsByCollection[ref.collection_id] = [];
          refsByCollection[ref.collection_id].push(ref);
          const key = `${ref.collection_id}:${ref.year}`;
          if (!refsByCollectionYear[key]) refsByCollectionYear[key] = [];
          refsByCollectionYear[key].push(ref);
        });

        // Build colecciones structure
        const colecciones = cols.map(col => {
          const colYearsList = yearsByCollection[col.id] || [];
          const fallbackYear = col.year || 2026;

          const anios = colYearsList.length > 0
            ? colYearsList.map(cy => {
                const yearRefs = [...(refsByCollectionYear[`${col.id}:${cy.year}`] || [])];
                const total = yearRefs.length;
                const completadas = yearRefs.filter(r => getReferenceStatusBucket(r.reference_statuses?.status) === 'completed').length;
                const pausadas = yearRefs.filter(r => getReferenceStatusBucket(r.reference_statuses?.status) === 'paused').length;
                const enProceso = total - completadas - pausadas;

                yearRefs.sort((a, b) => (Number(a.reference_number) || 0) - (Number(b.reference_number) || 0));
                const referencias = yearRefs.map(r => {
                  const status = r.reference_statuses?.status || '';
                  const sf = getReferenceStatusSubfase(status);
                  const clasificacion = r.has_art_modification ? 'Mod. Arte'
                    : r.has_trace_location ? 'Ubicacion Trazo'
                    : r.has_all_over ? 'All Over'
                    : 'Solida';

                  const rcCodes = codeMap[r.id] || {};
                  return {
                    id: `REF-${r.reference_number}`,
                    referenceNumber: String(r.reference_number),
                    dbId: r.id,
                    codigoMD: rcCodes.MD || `MD-${String(r.reference_number).padStart(3, '0')}`,
                    codigoPT: rcCodes.PT || `PT03${String(r.reference_number).padStart(3, '0')}`,
                    mdAssigned: !!rcCodes.MD,
                    ptAssigned: !!rcCodes.PT,
                    statusId: r.status_id,
                    nombre: r.name,
                    tipoPrenda: r.reference_type || col.name || '',
                    color: r.color || '',
                    codigoColor: r.color_code || '',
                    imagen: r.main_image_url || null,
                    linea: r.lines?.name || '',
                    sublinea: r.sublines?.name || '',
                    tipoRef: r.tipo_ref || r.lines?.code || '',
                    tallaje: r.tallaje_groups?.name || '',
                    largo: r.length_description || '',
                    largoCms: r.length_cm || '',
                    closure: '',
                    faseActual: sf,
                    subfaseNombre: getProcesoNombre(sf),
                    responsable: '',
                    tiempoFase: '',
                    clasificacion,
                    status,
                    statusLabel: getReferenceStatusLabel(status),
                    isCancelled: isCancelledStatus(status),
                    statusBucket: getReferenceStatusBucket(status),
                    prioridadFirstBuy: r.priority_first_buy || '',
                    dropEntrega: r.drop_entrega || '',
                    enviarMaquila: r.envio_confeccion_maquila || false,
                    complejidadCorte: '',
                    complejidadConfeccion: '',
                    tieneBordado: r.has_embroidery || false,
                    tieneSemielaborado: r.has_semielaborated || false,
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
                  const yearRefs = [...(refsByCollection[col.id] || [])];
                  yearRefs.sort((a, b) => (Number(a.reference_number) || 0) - (Number(b.reference_number) || 0));
                  return yearRefs.map(r => {
                    const status = r.reference_statuses?.status || '';
                    const sf = getReferenceStatusSubfase(status);
                    const clasificacion = r.has_art_modification ? 'Mod. Arte'
                      : r.has_trace_location ? 'Ubicacion Trazo'
                      : r.has_all_over ? 'All Over'
                      : 'Solida';
                    const fcCodes = codeMap[r.id] || {};
                    return {
                      id: `REF-${r.reference_number}`,
                      referenceNumber: String(r.reference_number),
                      dbId: r.id,
                      codigoMD: fcCodes.MD || `MD-${String(r.reference_number).padStart(3, '0')}`,
                      codigoPT: fcCodes.PT || `PT03${String(r.reference_number).padStart(3, '0')}`,
                      mdAssigned: !!fcCodes.MD,
                      ptAssigned: !!fcCodes.PT,
                      statusId: r.status_id,
                      nombre: r.name,
                      tipoPrenda: r.reference_type || col.name || '',
                      color: r.color || '', codigoColor: r.color_code || '',
                      imagen: r.main_image_url || null,
                        linea: r.lines?.name || '', sublinea: r.sublines?.name || '', tipoRef: r.tipo_ref || r.lines?.code || '', tallaje: r.tallaje_groups?.name || '', largo: r.length_description || '', largoCms: r.length_cm || '', closure: '',
                      faseActual: sf,
                      subfaseNombre: getProcesoNombre(sf),
                      responsable: '', tiempoFase: '',
                      clasificacion,
                      status,
                      statusLabel: getReferenceStatusLabel(status),
                      isCancelled: isCancelledStatus(status),
                      statusBucket: getReferenceStatusBucket(status),
                      prioridadFirstBuy: r.priority_first_buy || '',
                      dropEntrega: r.drop_entrega || '',
                      enviarMaquila: r.envio_confeccion_maquila || false,
                      complejidadCorte: '', complejidadConfeccion: '',
                      tieneBordado: r.has_embroidery || false,
                      tieneSemielaborado: r.has_semielaborated || false,
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
            const c = refsForYear.filter(r => r.statusBucket === 'completed').length;
            const p = refsForYear.filter(r => r.statusBucket === 'paused').length;
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
  }, [reloadKey]);

  return { data, loading, error, refetch: () => setReloadKey(key => key + 1) };
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

        const [fabricsResult, consumosResult, codeMap] = await Promise.all([
          supabase
            .from('reference_fabrics')
            .select('*, fabrics(code, description, width_cm, fabric_base_types(name))')
            .eq('reference_id', refData.id),
          supabase
            .from('consumos')
            .select('*')
            .eq('reference_id', refData.id)
            .order('created_at'),
          resolveReferenceCodes(refData.id),
        ]);
        const { data: fabrics, error: fabricsError } = fabricsResult;
        const { data: consumos, error: consumosError } = consumosResult;
        if (fabricsError) throw fabricsError;
        if (consumosError) throw consumosError;

        if (cancelled) return;

        const rcCodes = codeMap[refData.id] || {};

        const statusNombre = refData.reference_statuses?.status || 'EN_PROCESO';
        const sf = getReferenceStatusSubfase(statusNombre);
        setRef({
          ...refData,
          id: refId,
          codigoMD: rcCodes.MD || `MD-${String(refData.reference_number).padStart(3, '0')}`,
          codigoPT: rcCodes.PT || `PT03${String(refData.reference_number).padStart(3, '0')}`,
          mdAssigned: !!rcCodes.MD,
          ptAssigned: !!rcCodes.PT,
          faseActual: sf,
          subfaseNombre: getProcesoNombre(sf),
          coleccionNombre: refData.collections?.name || '',
          coleccionCode: refData.collections?.code || '',
          coleccionId: refData.collection_id,
          year: refData.year,
          isHidden: refData.is_hidden || false,
          statusNombre,
          statusLabel: getReferenceStatusLabel(statusNombre),
          isCancelled: isCancelledStatus(statusNombre),
          statusBucket: getReferenceStatusBucket(statusNombre),
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
// Ficha final: lectura y persistencia de la ficha de produccion
// ═══════════════════════════════════════════════════════════════

export const FINAL_SHEET_SCOPES = ['MUESTRA', 'PRODUCCION'];

function normalizeFinalSheetStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'activa' || normalized === 'active') return 'activa';
  if (normalized === 'utilizada' || normalized === 'used') return 'utilizada';
  if (normalized === 'anulada' || normalized === 'cancelled' || normalized === 'cancelada') return 'anulada';
  return 'pendiente';
}

function emptyFinalComposition(scope) {
  return {
    id: null,
    reference_id: null,
    scope,
    sap_registered: false,
    description_usauk: '',
    fiber_composition: '',
    woven_knitted: '',
    inside_composition: '',
    include_description: '',
    notes: '',
    materials: [],
  };
}

/**
 * Lee todos los datos de Ficha Final usando el id numerico de references.
 * composition_materials es opcional durante la transicion: cuando la tabla
 * aun no existe se conserva el resto de la ficha y se devuelve el error para
 * que la UI pueda avisarlo sin volver a datos mock.
 */
export async function readFinalSheet(referenceId) {
  const numericReferenceId = Number(referenceId);
  if (!Number.isInteger(numericReferenceId) || numericReferenceId <= 0) {
    throw new Error('La Ficha Final requiere un reference_id numerico valido.');
  }

  const [referenceResult, compositionResult, careTypesResult, careResult, contraResult, notesResult, qualityResult] = await Promise.all([
    supabase.from('references').select('*').eq('id', numericReferenceId).single(),
    supabase.from('compositions').select('*').eq('reference_id', numericReferenceId).order('id'),
    supabase.from('care_types').select('id,type,description').order('id'),
    supabase.from('care_instructions').select('*').eq('reference_id', numericReferenceId).order('care_type_id').order('id'),
    supabase.from('contramuestras').select('*').eq('reference_id', numericReferenceId).order('created_at').order('id'),
    supabase.from('notas_fabricacion').select('*').eq('reference_id', numericReferenceId).order('created_at').order('id'),
    supabase.from('quality_issues').select('*').eq('reference_id', numericReferenceId).order('detected_at').order('id'),
  ]);

  const firstError = [referenceResult, compositionResult, careTypesResult, careResult, contraResult, notesResult, qualityResult]
    .find(result => result.error)?.error;
  if (firstError) throw firstError;

  const compositions = compositionResult.data || [];
  const compositionIds = compositions.map(composition => composition.id).filter(Boolean);
  let materialRows = [];
  let materialsError = null;

  if (compositionIds.length > 0) {
    const materialResult = await supabase
      .from('composition_materials')
       .select('id,composition_id,material,percentage')
      .in('composition_id', compositionIds)
      .order('composition_id').order('material');
    if (materialResult.error) materialsError = materialResult.error;
    else materialRows = materialResult.data || [];
  }

  const materialByComposition = {};
  materialRows.forEach(material => {
    if (!materialByComposition[material.composition_id]) materialByComposition[material.composition_id] = [];
    materialByComposition[material.composition_id].push({
      id: material.id,
      composition_id: material.composition_id,
      material: material.material || '',
      percentage: material.percentage ?? '',
    });
  });

  const compositionByScope = FINAL_SHEET_SCOPES.reduce((result, scope) => {
    const row = compositions.find(composition => composition.scope === scope);
    result[scope] = row
      ? {
          ...emptyFinalComposition(scope),
          ...row,
          materials: materialByComposition[row.id] || [],
        }
      : emptyFinalComposition(scope);
    return result;
  }, {});

  const careTypes = (careTypesResult.data || []).map(type => ({
    id: type.id,
    type: type.type,
    description: type.description || '',
  }));
  const careTypeById = new Map(careTypes.map(type => [type.id, type]));
  const careInstructions = (careResult.data || []).map(instruction => ({
    ...instruction,
    care_type: careTypeById.get(instruction.care_type_id) || null,
  }));

  const notesById = new Map((notesResult.data || []).map(note => [note.id, note]));
  const contramuestras = (contraResult.data || []).map(contramuestra => {
    const note = notesById.get(contramuestra.nota_fabricacion_id) || null;
    return {
      ...contramuestra,
      status: normalizeFinalSheetStatus(contramuestra.status),
      nota_fabricacion: note,
      codigo_nota: note?.codigo_nota || '',
      fecha_traslado_sap: note?.fecha_traslado_sap || '',
      fecha_despacho_zf: note?.fecha_despacho_zf || '',
      observaciones_nota: note?.observaciones || '',
    };
  });

  const qualityIssues = (qualityResult.data || []).map(issue => ({
    ...issue,
    classification: issue.classification || '',
    description: issue.description || '',
    resolved: issue.resolved === true,
  }));

  const codeMap = await resolveReferenceCodes(numericReferenceId);
  const reference = referenceResult.data;
  const codes = codeMap[numericReferenceId] || {};

  return {
    reference: {
      ...reference,
      codigoMD: codes.MD || `MD-${String(reference.reference_number).padStart(3, '0')}`,
      codigoPT: codes.PT || `PT03${String(reference.reference_number).padStart(3, '0')}`,
    },
    compositions: compositionByScope,
    careTypes,
    careInstructions,
    contramuestras,
    qualityIssues,
    materialsError,
  };
}

// Alias semantico para consumidores que llaman a esta operacion "load".
export const loadFinalSheet = readFinalSheet;

export function useFinalSheet(referenceId) {
  const [state, setState] = useState({ key: referenceId || null, data: null, loading: Boolean(referenceId), error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!referenceId) return undefined;

    let cancelled = false;
    readFinalSheet(referenceId)
      .then(result => {
        if (!cancelled) setState({ key: referenceId, data: result, loading: false, error: null });
      })
      .catch(loadError => {
        if (!cancelled) setState({ key: referenceId, data: null, loading: false, error: loadError });
      });

    return () => { cancelled = true; };
  }, [referenceId, reloadKey]);

  const isCurrent = Boolean(referenceId) && state.key === referenceId;
  return {
    data: isCurrent ? state.data : null,
    loading: Boolean(referenceId) && (!isCurrent || state.loading),
    error: isCurrent ? state.error : null,
    refresh: () => setReloadKey(key => key + 1),
  };
}

function nullableNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function nullableText(value) {
  if (value === '' || value === null || value === undefined) return null;
  return String(value).trim();
}

/**
 * Contrato JSON de jo.save_final_sheet. Los registros con id existente se
 * actualizan; los registros sin id se insertan. No se envia ninguna lista de
 * borrado, por lo que las novedades omitidas no se eliminan.
 */
export function buildFinalSheetPayload({ referenceId, compositions, careInstructions, contramuestras, qualityIssues }) {
  const numericReferenceId = Number(referenceId);
  const scopes = FINAL_SHEET_SCOPES.reduce((result, scope) => {
    const composition = compositions?.[scope] || emptyFinalComposition(scope);
    result[scope] = {
      composition: {
        id: composition.id || null,
        reference_id: numericReferenceId,
        scope,
        sap_registered: composition.sap_registered === true,
        description_usauk: nullableText(composition.description_usauk),
        fiber_composition: nullableText(composition.fiber_composition),
        woven_knitted: nullableText(composition.woven_knitted),
        inside_composition: nullableText(composition.inside_composition),
        include_description: nullableText(composition.include_description),
        notes: nullableText(composition.notes),
      },
      materials: (composition.materials || [])
        .filter(material => String(material.material || '').trim() !== '')
        .map(material => ({
          composition_id: composition.id || null,
          material: String(material.material).trim(),
          percentage: nullableNumber(material.percentage),
        })),
    };
    return result;
  }, {});

  let activeContramuestraFound = false;
  const contraPayload = (contramuestras || []).map(contramuestra => {
    const requestedStatus = normalizeFinalSheetStatus(contramuestra.status);
    const status = requestedStatus === 'activa' && activeContramuestraFound ? 'utilizada' : requestedStatus;
    if (status === 'activa') activeContramuestraFound = true;
    return {
      id: contramuestra.id || null,
      reference_id: numericReferenceId,
      nombre: nullableText(contramuestra.nombre),
      codigo_ot: nullableText(contramuestra.codigo_ot),
      talla: nullableText(contramuestra.talla),
      descripcion_color: nullableText(contramuestra.descripcion_color),
      unidades_cortadas: nullableNumber(contramuestra.unidades_cortadas),
      nota_fabricacion_id: nullableNumber(contramuestra.nota_fabricacion_id),
      prioridad: nullableNumber(contramuestra.prioridad),
      fecha_meta_entrega: nullableText(contramuestra.fecha_meta_entrega),
      drop_entrega: nullableText(contramuestra.drop_entrega),
      status,
      observaciones_confeccion: nullableText(contramuestra.observaciones_confeccion),
      nota_fabricacion: {
        id: contramuestra.nota_fabricacion_id || null,
        reference_id: numericReferenceId,
        codigo_nota: nullableText(contramuestra.codigo_nota),
        fecha_traslado_sap: nullableText(contramuestra.fecha_traslado_sap),
        fecha_despacho_zf: nullableText(contramuestra.fecha_despacho_zf),
        observaciones: nullableText(contramuestra.observaciones_nota),
      },
    };
  }).filter(contramuestra => contramuestra.codigo_ot);

  return {
    version: 1,
    reference_id: numericReferenceId,
    scopes,
    care_instructions: (careInstructions || []).map(instruction => ({
      id: instruction.id || null,
      reference_id: numericReferenceId,
      care_type_id: nullableNumber(instruction.care_type_id),
      instruction: nullableText(instruction.instruction),
      icon_url: nullableText(instruction.icon_url),
      notes: nullableText(instruction.notes),
    })).filter(instruction => instruction.care_type_id !== null && (instruction.id || instruction.instruction)),
    contramuestras: contraPayload,
    quality_issues: (qualityIssues || []).map(issue => ({
      id: issue.id || null,
      reference_id: numericReferenceId,
      detected_at: issue.detected_at || new Date().toISOString(),
      area: nullableText(issue.area),
      classification: nullableText(issue.classification),
      material: nullableText(issue.material),
      material_classification: nullableText(issue.material_classification),
      execution_type: nullableText(issue.execution_type),
      description: nullableText(issue.description),
      corrective_action: nullableText(issue.corrective_action),
      resolved: issue.resolved === true,
    })),
  };
}

export async function saveFinalSheet(payload) {
  if (!payload || !Number.isInteger(Number(payload.reference_id)) || Number(payload.reference_id) <= 0) {
    throw new Error('El payload de Ficha Final requiere reference_id numerico.');
  }

  const { data, error } = await supabase.rpc('save_final_sheet', { p_payload: payload });
  if (error) throw error;
  return data;
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
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!refId) {
      startTransition(() => { setRefFabrics([]); setLoading(false); setError(null); });
      return undefined;
    }
    let cancelled = false;
    startTransition(() => { setLoading(true); setError(null); });
    async function load() {
      const { data, error } = await supabase
        .from('reference_fabrics')
        .select('id, reference_id, fabric_id, usage, width_cm, consumo_base, notes, active, usada, confirmada_por, fabrics(id, code, description, width_cm, image_url)')
        .eq('reference_id', refId)
        .eq('active', true)
        .order('id');

      if (error) throw error;
      if (!cancelled) setRefFabrics(data || []);
      if (!cancelled) setLoading(false);
    }
    load().catch(loadError => {
      if (!cancelled) {
        setError(loadError);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [refId, reloadKey]);

  return { refFabrics, loading, error, refresh: () => setReloadKey(key => key + 1) };
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

export async function toggleReferenceFabricUsada(id, usada, confirmada_por) {
  return supabase
    .from('reference_fabrics')
    .update({ usada, confirmada_por })
    .eq('id', id)
    .select('*')
    .single();
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
          es_final: c.es_final || false,
          registrado_por: c.registrado_por || null,
        })
        .select('*')
        .single();
      if (!error) {
        results.push(data);
      } else {
        console.error('saveConsumos error:', error);
        throw error;
      }
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
    if (!collectionId) {
      startTransition(() => { setYears([]); setLoading(false); });
      return;
    }
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
export function validateReferenceLineSubline({ line_id, subline_id, availableSublines } = {}) {
  if (!line_id) return 'La línea es obligatoria.';
  if (!subline_id) return 'La sublínea es obligatoria.';
  if (availableSublines && !availableSublines.some(subline => subline.id === subline_id)) {
    return 'La sublínea no pertenece a la línea seleccionada.';
  }
  return null;
}

export async function createReference(data) {
  const {
    collection_id, year, reference_number, name, color, color_code,
    reference_type, line_id, subline_id, tallaje_group_id,
    length_description, length_cm, closure_type_id, package_type_id,
    has_art_modification, has_trace_location, has_all_over,
    has_embroidery, has_semielaborated,
    complejidad_corte_id, complejidad_confeccion_id,
    priority_first_buy, drop_entrega,
    envio_corte_maquila, envio_confeccion_maquila,
    main_image_url, status_id,
    linned, requiere_muestra, tiras_continuas,
    especificacion_confeccion,
  } = data;

  const lineSublineError = validateReferenceLineSubline({ line_id, subline_id });
  if (lineSublineError) return { data: null, error: new Error(lineSublineError) };

  let resolvedStatusId = status_id;
  if (!resolvedStatusId) {
    const { data: defaultStatus, error: statusError } = await supabase
      .from('reference_statuses')
      .select('id')
      .eq('status', 'EN_PROCESO')
      .single();
    if (statusError) return { data: null, error: statusError };
    resolvedStatusId = defaultStatus.id;
  }

  return supabase
    .from('references')
    .insert({
      collection_id, year, reference_number, name, color, color_code,
      reference_type: reference_type || 'SILUETA',
      line_id, subline_id, tallaje_group_id,
      length_description, length_cm, closure_type_id, package_type_id,
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
      status_id: resolvedStatusId,
      is_hidden: false,
      linned: linned || false,
      requiere_muestra: requiere_muestra || false,
      tiras_continuas: tiras_continuas || null,
      especificacion_confeccion: especificacion_confeccion || null,
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
    startTransition(() => { setLoading(true); setError(null); });
    try {
      let query = supabase
        .from('cut_requests')
        .select('*, references(reference_number, name, color, main_image_url, has_art_modification, has_trace_location, has_all_over, has_embroidery), collections(code, name)')
        .order('created_at', { ascending: false });

      if (source === 'app') query = query.neq('source', 'csv');
      else if (source === 'csv') query = query.eq('source', 'csv');

      const { data, error: err } = await query;

      if (err) throw err;
      startTransition(() => setItems(data || []));
    } catch (e) {
      startTransition(() => setError(e.message));
    } finally {
      startTransition(() => setLoading(false));
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
// CRUD: Ordenes de Trabajo del Taller
// ═══════════════════════════════════════════════════════════════
const WORKSHOP_ORDER_SELECT = `
  *,
  references(reference_number, name, color, main_image_url, has_embroidery, has_semielaborated),
  collections(code, name, year)
`;

export function useWorkshopOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    startTransition(() => { setLoading(true); setError(null); });
    try {
      const { data, error: err } = await supabase
        .from('workshop_orders')
        .select(WORKSHOP_ORDER_SELECT)
        .order('created_at', { ascending: false });

      if (err) throw err;
      startTransition(() => setItems(data || []));
    } catch (e) {
      startTransition(() => setError(e));
    } finally {
      startTransition(() => setLoading(false));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { items, loading, error, refresh: load };
}

export async function createWorkshopOrder(data) {
  return supabase
    .from('workshop_orders')
    .insert(data)
    .select(WORKSHOP_ORDER_SELECT)
    .single();
}

export async function updateWorkshopOrder(id, updates) {
  return supabase
    .from('workshop_orders')
    .update(updates)
    .eq('id', id)
    .select(WORKSHOP_ORDER_SELECT)
    .single();
}

// ═══════════════════════════════════════════════════════════════
// CRUD: Hand-off de Referencias
// ═══════════════════════════════════════════════════════════════
export function useReferenceHandoffs(referenceId) {
  const [data, setData] = useState({ current: null, history: [] });
  const [loading, setLoading] = useState(Boolean(referenceId));
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!referenceId) {
      setData({ current: null, history: [] });
      setLoading(false);
      return;
    }

    startTransition(() => { setLoading(true); setError(null); });
    try {
      const { data: rows, error: err } = await supabase
        .from('reference_handoffs')
        .select('*')
        .eq('reference_id', referenceId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      const history = rows || [];
      const current = history.find(row => row.status !== 'COMPLETED') || null;
      startTransition(() => setData({ current, history }));
    } catch (e) {
      startTransition(() => setError(e));
    } finally {
      startTransition(() => setLoading(false));
    }
  }, [referenceId]);

  useEffect(() => { load(); }, [load]);

  return { ...data, loading, error, refresh: load };
}

export async function createReferenceHandoff(data) {
  return supabase
    .from('reference_handoffs')
    .insert(data)
    .select('*')
    .single();
}

export async function updateReferenceHandoff(id, updates) {
  return supabase
    .from('reference_handoffs')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
}

export async function deliverReferenceHandoff(handoffId, nextArea, actorRole) {
  return supabase.rpc('deliver_reference_handoff', {
    p_handoff_id: handoffId,
    p_next_area: nextArea,
    p_actor_role: actorRole,
  });
}

export async function returnReferenceHandoff(handoffId, nextArea, actorRole, notes) {
  return supabase.rpc('return_reference_handoff', {
    p_handoff_id: handoffId,
    p_next_area: nextArea,
    p_actor_role: actorRole,
    p_notes: notes,
  });
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
    startTransition(() => setLoading(true));
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
      startTransition(() => setTrazos(data || []));
    } catch (e) {
      startTransition(() => setError(e.message));
    } finally {
      startTransition(() => setLoading(false));
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
      estado: data.estado || 'activo',
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
      estado: data.estado || 'activo',
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
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!refId) {
      startTransition(() => { setComparativo(null); setLoading(false); setError(null); });
      return undefined;
    }
    let cancelled = false;
    startTransition(() => { setLoading(true); setError(null); });
    async function load() {
      const { data, error } = await supabase
        .from('comparativo_trazos')
        .select('*, trazo_costeo:trazo_costeo_id(*), trazo_contramuestra:trazo_contramuestra_id(*)')
        .eq('reference_id', refId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!cancelled) setComparativo(data?.[0] || null);
      if (!cancelled) setLoading(false);
    }
    load().catch(loadError => {
      if (!cancelled) {
        setError(loadError);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [refId, reloadKey]);

  return { comparativo, loading, error, refresh: () => setReloadKey(key => key + 1) };
}

// ═══════════════════════════════════════════════════════════════
// Hooks: Colores (Catalogo maestro + Carta por coleccion)
// ═══════════════════════════════════════════════════════════════

export function useAllColors() {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .eq('active', true)
        .order('code');
      if (!error && !cancelled) setColors(data || []);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { colors, loading };
}

export function useCollectionColors(collectionId) {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collectionId) {
      startTransition(() => { setColors([]); setLoading(false); });
      return;
    }
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from('collection_colors')
        .select('id, colors(id, code, name, hex)')
        .eq('collection_id', collectionId)
        .eq('is_hidden', false)
        .order('id');
      if (!error && !cancelled) {
        setColors((data || []).map(cc => cc.colors).filter(Boolean));
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [collectionId]);

  return { colors, loading };
}

export function useColorLookup(code) {
  const [color, setColor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!code || code.trim().length === 0) {
      startTransition(() => { setColor(null); setLoading(false); });
      return;
    }
    let cancelled = false;
    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('colors')
        .select('code, name')
        .eq('code', code.trim())
        .maybeSingle();
      if (!cancelled) {
        setColor(error || !data ? null : data);
        setLoading(false);
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [code]);

  return { color, loading };
}

export async function addColorToCollection(collectionId, colorId) {
  return supabase
    .from('collection_colors')
    .insert({ collection_id: collectionId, color_id: colorId })
    .select('*')
    .single();
}

export async function removeColorFromCollection(id) {
  return supabase
    .from('collection_colors')
    .update({ is_hidden: true })
    .eq('id', id);
}

// ═══════════════════════════════════════════════════════════════
// Hook: useSearchReferences — busqueda de referencias para selector de referente
// ═══════════════════════════════════════════════════════════════

export function useSearchReferences(searchTerm, collectionId) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      startTransition(() => setResults([]));
      return;
    }
    let cancelled = false;
    const timeout = setTimeout(async () => {
      setLoading(true);
      let query = supabase
        .from('references')
        .select('id, reference_number, name, color, collection_id, collections(name, code)')
        .ilike('name', `%${searchTerm}%`)
        .eq('is_hidden', false)
        .order('reference_number')
        .limit(20);

      if (collectionId) query = query.eq('collection_id', collectionId);

      const { data, error } = await query;
      if (!cancelled) {
        if (!error) setResults(data || []);
        setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [searchTerm, collectionId]);

  return { results, loading };
}

// ═══════════════════════════════════════════════════════════════
// Catálogo de Referentes — tabla plana jo.referents (11 campos)
// Consulta libre para todos los roles, creación solo admin
// ═══════════════════════════════════════════════════════════════

export function useTiposPrenda() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('referents')
      .select('tipo_prenda')
      .order('tipo_prenda')
      .then(({ data, error }) => {
        if (!cancelled && !error && data) {
          setTipos([...new Set(data.map(d => d.tipo_prenda))]);
        }
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { tipos, loading };
}

export function useGruposVariante(tipoPrenda) {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tipoPrenda) {
      startTransition(() => setGrupos([]));
      return;
    }
    startTransition(() => setLoading(true));
    let cancelled = false;
    supabase
      .from('referents')
      .select('cantidad_telas, variante, descripcion, terminacion')
      .eq('tipo_prenda', tipoPrenda)
      .order('cantidad_telas')
      .order('variante')
      .then(({ data, error }) => {
        if (!cancelled && !error && data) {
          const seen = new Set();
          const unique = [];
          for (const r of data) {
            const key = `${r.cantidad_telas}||${r.variante}`;
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(r);
              console.log('R:', r);
            }
          }
          // console.log('useGruposVariante:', unique);
          // console.log('data:', data);
          setGrupos(unique);
        }
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tipoPrenda]);

  return { grupos, loading };
}

export function useFilasReferente(tipoPrenda, cantidadTelas, variante) {
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tipoPrenda || !cantidadTelas || !variante) {
      startTransition(() => setFilas([]));
      return;
    }
    startTransition(() => setLoading(true));
    let cancelled = false;
    supabase
      .from('referents')
      .select('*')
      .eq('tipo_prenda', tipoPrenda)
      .eq('cantidad_telas', cantidadTelas)
      .eq('variante', variante)
      .order('tela')
      .order('uso_prenda')
      .then(({ data, error }) => {
        if (!cancelled && !error) setFilas(data || []);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tipoPrenda, cantidadTelas, variante]);

  return { filas, loading };
}

export function useCantidadesTelas(tipoPrenda) {
  const [cantidades, setCantidades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tipoPrenda) {
      startTransition(() => setCantidades([]));
      return;
    }
    startTransition(() => setLoading(true));
    let cancelled = false;
    supabase
      .from('referents')
      .select('cantidad_telas')
      .eq('tipo_prenda', tipoPrenda)
      .order('cantidad_telas')
      .then(({ data, error }) => {
        if (!cancelled && !error && data) {
          setCantidades([...new Set(data.map(d => d.cantidad_telas))]);
        }
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tipoPrenda]);

  return { cantidades, loading };
}

export function useVariantes(tipoPrenda, cantidadTelas) {
  const [variantes, setVariantes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tipoPrenda || !cantidadTelas) {
      startTransition(() => setVariantes([]));
      return;
    }
    startTransition(() => setLoading(true));
    let cancelled = false;
    supabase
      .from('referents')
      .select('variante')
      .eq('tipo_prenda', tipoPrenda)
      .eq('cantidad_telas', cantidadTelas)
      .order('variante')
      .then(({ data, error }) => {
        if (!cancelled && !error && data) {
          setVariantes([...new Set(data.map(d => d.variante))]);
        }
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tipoPrenda, cantidadTelas]);

  return { variantes, loading };
}

export function useTelasDeReferente(tipoPrenda, cantidadTelas, variante) {
  const [telas, setTelas] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tipoPrenda || !cantidadTelas || !variante) {
      startTransition(() => { setTelas([]); setItems([]); });
      return;
    }
    startTransition(() => setLoading(true));
    let cancelled = false;
    supabase
      .from('referents')
      .select('*')
      .eq('tipo_prenda', tipoPrenda)
      .eq('cantidad_telas', cantidadTelas)
      .eq('variante', variante)
      .order('tela')
      .order('uso_prenda')
      .then(({ data, error }) => {
        if (!cancelled && !error) {
          setItems(data || []);
          const uniqueTelas = [...new Set((data || []).map(d => d.numero_tela || d.tela))];
          setTelas(uniqueTelas);
        }
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tipoPrenda, cantidadTelas, variante]);

  return { telas, items, loading };
}

export async function createReferentRow(row) {
  return supabase
    .from('referents')
    .insert({
      tipo_prenda: row.tipoPrenda.trim(),
      cantidad_telas: parseInt(row.cantidadTelas) || 1,
      variante: parseInt(row.variante) || 1,
      tela: parseInt(row.tela) || 1,
      uso_prenda: row.usoPrenda.trim(),
      base_textil: row.baseTextil.trim(),
      color: row.color?.trim() || 'SOLIDO',
      ancho_tela: row.anchoTela.trim(),
      consumo: row.consumo.trim(),
      descripcion: row.descripcion?.trim() || null,
      terminacion: row.terminacion?.trim() || null,
    })
    .select('*')
    .single();
}

export async function bulkImportReferentes(rows, options = {}) {
  const { onProgress } = options;
  let created = 0;
  let skipped = 0;
  let errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const { error } = await supabase
        .from('referents')
        .upsert({
          tipo_prenda: row.tipoPrenda.trim(),
          cantidad_telas: parseInt(row.cantidadTelas) || 1,
          variante: parseInt(row.variante) || 1,
          tela: parseInt(row.tela) || 1,
          uso_prenda: row.usoPrenda.trim(),
          base_textil: row.baseTextil.trim(),
          color: row.color?.trim() || 'SOLIDO',
          ancho_tela: row.anchoTela.trim(),
          consumo: row.consumo.trim(),
          descripcion: row.descripcion?.trim() || null,
          terminacion: row.terminacion?.trim() || null,
        }, {
          onConflict: 'tipo_prenda,cantidad_telas,variante,tela,uso_prenda,base_textil,color,ancho_tela',
        });

      if (error) {
        errors.push({ row: i + 1, tipoPrenda: row.tipoPrenda, error: error.message });
      } else {
        created++;
      }
    } catch (e) {
      errors.push({ row: i + 1, tipoPrenda: row.tipoPrenda, error: e.message });
    }
    if (onProgress) onProgress({ current: i + 1, total: rows.length, created, skipped, errors: errors.length });
  }

  return { created, skipped, errors };
}

// ═══════════════════════════════════════════════════════════════
// Fotos de referentes (cards Nivel 1 y Nivel 2)
// ═══════════════════════════════════════════════════════════════

export function useReferentPhoto(tipoPrenda, cantidadTelas, variante) {
  const [fotoUrl, setFotoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(() => {
    if (!tipoPrenda) {
      startTransition(() => { setFotoUrl(null); setLoading(false); });
      return;
    }
    startTransition(() => setLoading(true));
    let cancelled = false;
    let query = supabase
      .from('referent_photos')
      .select('foto_url')
      .eq('tipo_prenda', tipoPrenda);

    query = query.eq('cantidad_telas', cantidadTelas ?? 0);
    query = query.eq('variante', variante ?? 0);

    query.maybeSingle().then(({ data, error }) => {
      if (!cancelled) {
        if (!error && data) setFotoUrl(data.foto_url);
        else setFotoUrl(null);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [tipoPrenda, cantidadTelas, variante]);

  useEffect(() => {
    const cleanup = reload();
    return cleanup;
  }, [reload]);

  return { fotoUrl, loading, reload };
}

export async function uploadReferentPhoto(file, tipoPrenda, cantidadTelas, variante) {
  const url = await uploadImage(file, 'referentes');
  return supabase
    .from('referent_photos')
    .upsert({
      tipo_prenda: tipoPrenda,
      cantidad_telas: cantidadTelas ?? 0,
      variante: variante ?? 0,
      foto_url: url,
    }, { onConflict: 'tipo_prenda,cantidad_telas,variante' })
    .select('*')
    .single();
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

// ═══════════════════════════════════════════════════════════════
// Hook: useReferenciaDB — fetch full reference from DB
// ═══════════════════════════════════════════════════════════════

export function useReferenciaDB(dbRefId) {
  const [refDb, setRefDb] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dbRefId) {
      startTransition(() => { setRefDb(null); setLoading(false); });
      return;
    }
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from('references')
        .select('*')
        .eq('id', dbRefId)
        .single();

      if (!error && !cancelled) setRefDb(data);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [dbRefId]);

  return { refDb, loading };
}

// ═══════════════════════════════════════════════════════════════
// Code Management: resolve codes from DB or derive as fallback
// ═══════════════════════════════════════════════════════════════

function deriveMD(refNumber) {
  return `MD-${String(refNumber).padStart(3, '0')}`;
}
function derivePT(refNumber) {
  return `PT03${String(refNumber).padStart(3, '0')}`;
}

export async function resolveReferenceCodes(referenceIds) {
  const ids = Array.isArray(referenceIds) ? referenceIds : [referenceIds];
  if (ids.length === 0) return {};

  const { data, error } = await supabase
    .from('reference_codes')
    .select('reference_id, code_type, code, active')
    .in('reference_id', ids)
    .eq('active', true);

  if (error) throw error;
  if (!data) return {};

  const map = {};
  data.forEach(rc => {
    if (!map[rc.reference_id]) map[rc.reference_id] = {};
    map[rc.reference_id][rc.code_type] = rc.code;
  });
  return map;
}

export async function searchReferences(searchTerm) {
  const term = String(searchTerm || '').trim().toLocaleLowerCase();
  if (!term) return [];

  const { data, error } = await supabase
    .from('references')
    .select('id, reference_number, name, collection_id, year, is_hidden, collections(code, name, season, year), reference_codes(code_type, code, active)')
    .eq('is_hidden', false)
    .order('reference_number')
    .limit(250);

  if (error) throw error;

  return (data || [])
    .filter(reference => {
      const codes = (reference.reference_codes || [])
        .filter(code => code.active !== false)
        .map(code => code.code);
      return [reference.name, reference.reference_number, ...codes]
        .some(value => String(value || '').toLocaleLowerCase().includes(term));
    })
    .slice(0, 12)
    .map(reference => {
      const codes = (reference.reference_codes || []).filter(code => code.active !== false);
      const md = codes.find(code => code.code_type === 'MD')?.code || deriveMD(reference.reference_number);
      const pt = codes.find(code => code.code_type === 'PT')?.code || derivePT(reference.reference_number);
      return {
        id: reference.id,
        referenceNumber: reference.reference_number,
        name: reference.name,
        collectionId: reference.collection_id,
        collectionName: reference.collections?.name || '',
        collectionCode: reference.collections?.season || reference.collections?.code || '',
        year: reference.year || reference.collections?.year,
        codigoMD: md,
        codigoPT: pt,
      };
    });
}

// ═══════════════════════════════════════════════════════════════
// Hook: useReferenceCodes — fetch official codes for a single reference
// ═══════════════════════════════════════════════════════════════

export function useReferenceCodes(dbRefId, referenceNumber) {
  const [codes, setCodes] = useState({ md: null, pt: null, mdStatus: 'DERIVADO', ptStatus: 'DERIVADO' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dbRefId) {
      startTransition(() => setLoading(false));
      return;
    }
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from('reference_codes')
        .select('code_type, code, active')
        .eq('reference_id', dbRefId)
        .eq('active', true);

      if (cancelled) return;
      if (error) { setLoading(false); return; }

      const mdRow = (data || []).find(r => r.code_type === 'MD');
      const ptRow = (data || []).find(r => r.code_type === 'PT');

      const num = referenceNumber || '';
      setCodes({
        md: mdRow ? mdRow.code : deriveMD(num),
        pt: ptRow ? ptRow.code : derivePT(num),
        mdDbId: mdRow ? mdRow : null,
        ptDbId: ptRow ? ptRow : null,
        mdStatus: mdRow ? 'ASIGNADO' : 'DERIVADO',
        ptStatus: ptRow ? 'ASIGNADO' : 'DERIVADO',
      });
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [dbRefId, referenceNumber]);

  return { codes, loading };
}

// ═══════════════════════════════════════════════════════════════
// Hook: useCodePool — admin panel code catalog
// ═══════════════════════════════════════════════════════════════

export function useCodePool(filters = {}) {
  const [codes, setCodes] = useState([]);
  const [stats, setStats] = useState({ total: 0, disponible: 0, asignado: 0, reservado: 0, retirado: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let query = supabase.from('code_pool').select('*', { count: 'exact' });

      if (filters.codeType) query = query.eq('code_type', filters.codeType);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.prefix) query = query.ilike('code', `${filters.prefix}%`);
      if (filters.search) query = query.ilike('code', `%${filters.search}%`);

      query = query.order('code_type').order('code');

      if (filters.limit) query = query.limit(filters.limit);
      else query = query.limit(500);

      const { data, error } = await query;
      if (cancelled) return;
      if (!error) setCodes(data || []);

      // Stats
      const { data: statsData } = await supabase
        .from('code_pool')
        .select('status');

      if (!cancelled && statsData) {
        setStats({
          total: statsData.length,
          disponible: statsData.filter(s => s.status === 'DISPONIBLE').length,
          asignado: statsData.filter(s => s.status === 'ASIGNADO').length,
          reservado: statsData.filter(s => s.status === 'RESERVADO').length,
          retirado: statsData.filter(s => s.status === 'RETIRADO').length,
        });
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [filters.codeType, filters.status, filters.prefix, filters.search, filters.limit]);

  return { codes, stats, loading };
}

// ═══════════════════════════════════════════════════════════════
// Hook: useCodeLog — audit trail
// ═══════════════════════════════════════════════════════════════

export function useCodeLog(filters = {}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let query = supabase
        .from('code_log')
        .select('*')
        .order('changed_at', { ascending: false });

      if (filters.referenceId) query = query.eq('reference_id', filters.referenceId);
      if (filters.codeType) query = query.eq('code_type', filters.codeType);
      if (filters.action) query = query.eq('action', filters.action);
      if (filters.limit) query = query.limit(filters.limit);
      else query = query.limit(200);

      const { data, error } = await query;
      if (cancelled) return;
      if (!error) setLogs(data || []);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [filters.referenceId, filters.codeType, filters.action, filters.limit]);

  return { logs, loading };
}

// ═══════════════════════════════════════════════════════════════
// Hook: useReferencesWithCodeStatus — admin panel: all refs with code info
// ═══════════════════════════════════════════════════════════════

export function useReferencesWithCodeStatus(collectionId = null) {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let refQuery = supabase
        .from('references')
        .select('id, reference_number, name, collection_id, is_hidden, collections(code, name)')
        .eq('is_hidden', false)
        .order('reference_number');

      if (collectionId) refQuery = refQuery.eq('collection_id', collectionId);

      const { data: refs, error: refErr } = await refQuery;
      if (refErr || cancelled) { if (!cancelled) setLoading(false); return; }

      const refIds = (refs || []).map(r => r.id);

      const codeMap = await resolveReferenceCodes(refIds);

      const result = (refs || []).map(r => {
        const codes = codeMap[r.id] || {};
        return {
          id: r.id,
          referenceNumber: r.reference_number,
          name: r.name,
          collectionId: r.collection_id,
          collectionCode: r.collections?.code || '',
          collectionName: r.collections?.name || '',
          codigoMD: codes.MD || deriveMD(r.reference_number),
          codigoPT: codes.PT || derivePT(r.reference_number),
          mdStatus: codes.MD ? 'ASIGNADO' : 'DERIVADO',
          ptStatus: codes.PT ? 'ASIGNADO' : 'DERIVADO',
        };
      });

      if (!cancelled) {
        setReferences(result);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [collectionId]);

  return { references, loading };
}

// ═══════════════════════════════════════════════════════════════
// Functions: assign / unassign / bulk derive codes
// ═══════════════════════════════════════════════════════════════

export async function assignCode(refDbId, codeType, code, assignedBy = 'admin', notes = '') {
  return supabase
    .from('reference_codes')
    .upsert({
      reference_id: refDbId,
      code_type: codeType,
      code,
      assigned_by: assignedBy,
      notes,
      active: true,
    }, { onConflict: 'reference_id,code_type' })
    .select('*')
    .single();
}

export async function unassignCode(refDbId, codeType, assignedBy = 'admin') {
  return supabase
    .from('reference_codes')
    .update({ active: false, assigned_by: assignedBy })
    .eq('reference_id', refDbId)
    .eq('code_type', codeType)
    .eq('active', true);
}

export async function bulkDeriveCodes(collectionId, assignedBy = 'admin') {
  const { data: refs, error } = await supabase
    .from('references')
    .select('id, reference_number')
    .eq('collection_id', collectionId)
    .eq('is_hidden', false);

  if (error || !refs) return { error, count: 0 };

  const codeMap = await resolveReferenceCodes(refs.map(r => r.id));
  const inserts = [];

  refs.forEach(r => {
    const existing = codeMap[r.id] || {};
    if (!existing.MD) {
      inserts.push({ reference_id: r.id, code_type: 'MD', code: deriveMD(r.reference_number), assigned_by: assignedBy, active: true });
    }
    if (!existing.PT) {
      inserts.push({ reference_id: r.id, code_type: 'PT', code: derivePT(r.reference_number), assigned_by: assignedBy, active: true });
    }
  });

  if (inserts.length === 0) return { count: 0 };

  const { error: insErr } = await supabase.from('reference_codes').insert(inserts);
  return { error: insErr, count: inserts.length };
}

export async function generateCodePoolRanges(ranges) {
  const results = [];
  for (const range of ranges) {
    const { data, error } = await supabase.rpc('generate_code_pool', {
      p_prefix: range.prefix,
      p_code_type: range.codeType,
      p_start: range.start,
      p_end: range.end,
    });
    results.push({ range, data, error });
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// Insumos y Bodega (Fase A)
//   Catálogo maestro: jo.supplies
//   Solicitudes del creativo: jo.supply_requests (SOLICITADO -> ENTREGADO -> usado)
// ═══════════════════════════════════════════════════════════════

export function useSupplies() {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    startTransition(() => { setLoading(true); setError(null); });
    const { data, error: err } = await supabase
      .from('supplies')
      .select('*')
      .eq('active', true)
      .order('code');
    if (err) startTransition(() => setError(err.message));
    else startTransition(() => setSupplies(data || []));
    startTransition(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return { supplies, loading, error, refresh: load };
}

export async function createSupply({ code, description, category, unit_of_measure, supplier }) {
  return supabase
    .from('supplies')
    .insert({ code, description, category, unit_of_measure, supplier, active: true })
    .select('*')
    .single();
}

export async function updateSupply(id, data) {
  return supabase
    .from('supplies')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();
}

export async function toggleSupplyActive(id, active) {
  return supabase
    .from('supplies')
    .update({ active })
    .eq('id', id);
}

export function useSupplyRequests(referenceId) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    startTransition(() => setLoading(true));
    let query = supabase
      .from('supply_requests')
      .select('*, supplies(code, description, unit_of_measure)')
      .order('created_at', { ascending: false });
    if (referenceId) query = query.eq('reference_id', referenceId);
    const { data, error: err } = await query;
    if (err) startTransition(() => setError(err.message));
    else startTransition(() => setRequests(data || []));
    startTransition(() => setLoading(false));
  }, [referenceId]);

  useEffect(() => { load(); }, [load]);

  return { requests, loading, error, refresh: load };
}

export async function createSupplyRequest({ reference_id, supply_id, description, quantity_requested, unit_of_measure, requested_by, notes }) {
  return supabase
    .from('supply_requests')
    .insert({
      reference_id,
      supply_id: supply_id || null,
      description,
      quantity_requested,
      unit_of_measure,
      status: 'SOLICITADO',
      requested_by,
      requested_at: new Date().toISOString(),
      notes,
    })
    .select('*, supplies(code, description, unit_of_measure)')
    .single();
}

export async function deliverSupplyRequest(id, { delivered_code, quantity_delivered, delivered_by, notes }) {
  return supabase
    .from('supply_requests')
    .update({
      status: 'ENTREGADO',
      delivered_code,
      quantity_delivered,
      delivered_by,
      delivered_at: new Date().toISOString(),
      notes,
    })
    .eq('id', id)
    .select('*, supplies(code, description, unit_of_measure)')
    .single();
}

export async function cancelSupplyRequest(id) {
  return supabase
    .from('supply_requests')
    .update({ status: 'CANCELADO' })
    .eq('id', id)
    .select('*')
    .single();
}

export async function confirmSupplyAsUsed(reference_id, request) {
  const { error: insertErr } = await supabase
    .from('reference_supplies')
    .insert({
      reference_id,
      supply_id: request.supply_id || null,
      quantity: request.quantity_delivered != null
        ? request.quantity_delivered
        : request.quantity_requested,
      unit_of_measure: request.unit_of_measure,
      notes: request.notes,
    })
    .select('*')
    .single();

  if (insertErr) return { error: insertErr };

  const { error: updateErr } = await supabase
    .from('supply_requests')
    .update({ used_confirmed: true })
    .eq('id', request.id);

  return { error: updateErr };
}

export function useReferenceSupplies(referenceId) {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!referenceId) {
      startTransition(() => { setSupplies([]); setLoading(false); setError(null); });
      return undefined;
    }
    let cancelled = false;
    startTransition(() => { setLoading(true); setError(null); });
    async function load() {
      const { data, error } = await supabase
        .from('reference_supplies')
        .select('*, supplies(code, description, unit_of_measure)')
        .eq('reference_id', referenceId)
        .order('id');
      if (error) throw error;
      if (!cancelled) setSupplies(data || []);
      if (!cancelled) setLoading(false);
    }
    load().catch(loadError => {
      if (!cancelled) {
        setError(loadError);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [referenceId, reloadKey]);

  return { supplies, loading, error, refresh: () => setReloadKey(key => key + 1) };
}

export async function saveReferenceSupply({ id, reference_id, supply_id, talla = null, quantity, unit_of_measure, notes }) {
  if (id) {
    return supabase
      .from('reference_supplies')
      .update({ supply_id, talla, quantity, unit_of_measure, notes })
      .eq('id', id)
      .select('*, supplies(code, description, unit_of_measure)')
      .single();
  }
  return supabase
    .from('reference_supplies')
    .insert({ reference_id, supply_id, talla, quantity, unit_of_measure, notes })
    .select('*, supplies(code, description, unit_of_measure)')
    .single();
}

export async function deleteReferenceSupply(id) {
  return supabase
    .from('reference_supplies')
    .delete()
    .eq('id', id);
}

// Reemplaza el consumo por talla de un insumo: elimina las filas por-talla de ese
// insumo en la referencia y reinserta las tallas con valor.
export async function saveReferenceSuppliesByTalla(reference_id, supply_id, unit_of_measure, rows) {
  const { error: delErr } = await supabase
    .from('reference_supplies')
    .delete()
    .eq('reference_id', reference_id)
    .eq('supply_id', supply_id)
    .not('talla', 'is', null);

  if (delErr) return { error: delErr };

  const inserts = rows
    .filter(r => r.talla && r.quantity != null && r.quantity !== '')
    .map(r => ({
      reference_id,
      supply_id,
      talla: r.talla,
      quantity: parseFloat(r.quantity),
      unit_of_measure,
      notes: r.notes || null,
    }));

  if (inserts.length === 0) return { error: null, count: 0 };

  const { error } = await supabase.from('reference_supplies').insert(inserts);
  return { error, count: inserts.length };
}

// ═══════════════════════════════════════════════════════════════
// Medición y Aprobación de Muestra (Fase C)
//   jo.mediciones: una fila por sesión de medición.
//   resultado APROBADA -> la referencia pasa al rack de aprobadas.
// ═══════════════════════════════════════════════════════════════

export function useMediciones(referenceId) {
  const [mediciones, setMediciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    startTransition(() => setLoading(true));
    if (!referenceId) {
      startTransition(() => { setMediciones([]); setLoading(false); });
      return;
    }
    const { data, error: err } = await supabase
      .from('mediciones')
      .select('*')
      .eq('reference_id', referenceId)
      .order('created_at', { ascending: false });
    if (err) startTransition(() => setError(err.message));
    else startTransition(() => setMediciones(data || []));
    startTransition(() => setLoading(false));
  }, [referenceId]);

  useEffect(() => { load(); }, [load]);

  return { mediciones, loading, error, refresh: load };
}

export async function createMedicion(data) {
  return supabase
    .from('mediciones')
    .insert({
      reference_id: data.reference_id,
      fecha: data.fecha || new Date().toISOString().slice(0, 10),
      talla_medida: data.talla_medida || null,
      resultado: data.resultado,
      tipo_cambio: data.tipo_cambio || 'NINGUNO',
      requiere_nueva_muestra: data.requiere_nueva_muestra || false,
      analisis_largos: data.analisis_largos || null,
      analisis_horma: data.analisis_horma || null,
      posicion_estampado: data.posicion_estampado || null,
      cambios_molderia: data.cambios_molderia || null,
      observaciones: data.observaciones || null,
      medido_por: data.medido_por || null,
      ubicacion_rack: data.ubicacion_rack || null,
    })
    .select('*')
    .single();
}

export async function deleteMedicion(id) {
  return supabase
    .from('mediciones')
    .delete()
    .eq('id', id);
}

// Actualiza el status de la referencia por su nombre (ej. 'APROBADO' -> rack).
export async function updateReferenceStatusByNombre(referenceId, statusNombre) {
  const { data: st } = await supabase
    .from('reference_statuses')
    .select('id, active')
    .eq('status', statusNombre)
    .maybeSingle();

  if (!st || st.active === false) return { error: { message: `Status ${statusNombre} no encontrado en reference_statuses` } };

  return supabase
    .from('references')
    .update({ status_id: st.id })
    .eq('id', referenceId)
    .select('*, reference_statuses(status, description)')
    .single();
}

// ═══════════════════════════════════════════════════════════════
// Laboratorios de Molde y Molderia (Fase D)
//   Pruebas de molde del creativo con workflow de estados.
// ═══════════════════════════════════════════════════════════════

export function useLaboratorios(referenceId) {
  const [laboratorios, setLaboratorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    startTransition(() => setLoading(true));
    if (!referenceId) {
      startTransition(() => { setLaboratorios([]); setLoading(false); });
      return;
    }
    const { data, error: err } = await supabase
      .from('laboratorios')
      .select('*')
      .eq('reference_id', referenceId)
      .order('created_at', { ascending: false });
    if (err) startTransition(() => setError(err.message));
    else startTransition(() => setLaboratorios(data || []));
    startTransition(() => setLoading(false));
  }, [referenceId]);

  useEffect(() => { load(); }, [load]);

  return { laboratorios, loading, error, refresh: load };
}

export async function createLaboratorio(data) {
  return supabase
    .from('laboratorios')
    .insert({
      reference_id: data.reference_id,
      fecha: data.fecha || new Date().toISOString().slice(0, 10),
      fecha_inicio: data.fecha_inicio || data.fecha || new Date().toISOString().slice(0, 10),
      descripcion: data.descripcion || null,
      tipo_molde: data.tipo_molde || 'DIGITAL',
      estado: data.estado || 'EN_PREPARACION',
      realizado_por_nombre: data.realizado_por_nombre || null,
      observaciones: data.observaciones || null,
    })
    .select('*')
    .single();
}

export async function updateLaboratorio(id, data) {
  return supabase
    .from('laboratorios')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();
}

export async function deleteLaboratorio(id) {
  return supabase
    .from('laboratorios')
    .delete()
    .eq('id', id);
}

export function useMolderia(referenceId) {
  const [molderia, setMolderia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!referenceId) {
      startTransition(() => { setMolderia([]); setLoading(false); });
      return;
    }
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from('molderia')
        .select('*')
        .eq('reference_id', referenceId)
        .order('fecha_inicio', { ascending: false, nullsFirst: false })
        .order('id', { ascending: false });
      if (!error && !cancelled) setMolderia(data || []);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [referenceId]);

  return { molderia, loading };
}

export async function createMolderia({ reference_id, disenador, fecha_inicio, fecha_fin, comentarios }) {
  return supabase
    .from('molderia')
    .insert({ reference_id, disenador, fecha_inicio, fecha_fin, comentarios })
    .select('*')
    .single();
}

export async function deleteMolderia(id) {
  return supabase
    .from('molderia')
    .delete()
    .eq('id', id);
}

// ═══════════════════════════════════════════════════════════════
// Corte y Confección de Muestra (Fase E)
//   jo.cuts (corte de muestra) + jo.sewings (confección).
// ═══════════════════════════════════════════════════════════════

export function useCorteTypes() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    startTransition(() => { setLoading(true); setError(null); });
    async function load() {
      const { data, error } = await supabase
        .from('corte_types')
        .select('id, type, description')
        .order('id');
      if (error) throw error;
      if (!cancelled) setTipos(data || []);
      if (!cancelled) setLoading(false);
    }
    load().catch(loadError => {
      if (!cancelled) {
        setError(loadError);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [reloadKey]);

  return { tipos, loading, error, refresh: () => setReloadKey(key => key + 1) };
}

export function useCutsMuestra(referenceId) {
  const [cuts, setCuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!referenceId) {
      startTransition(() => { setCuts([]); setLoading(false); setError(null); });
      return undefined;
    }
    let cancelled = false;
    startTransition(() => { setLoading(true); setError(null); });
    async function load() {
      const { data, error } = await supabase
        .from('cuts')
        .select('*')
        .eq('reference_id', referenceId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!cancelled) setCuts(data || []);
      if (!cancelled) setLoading(false);
    }
    load().catch(loadError => {
      if (!cancelled) {
        setError(loadError);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [referenceId, reloadKey]);

  return { cuts, loading, error, refresh: () => setReloadKey(key => key + 1) };
}

export async function createCutMuestra(data) {
  return supabase
    .from('cuts')
    .insert({
      reference_id: data.reference_id,
      cut_date: data.cut_date || new Date().toISOString().slice(0, 10),
      cut_type_id: data.cut_type_id || null,
      units_piece: data.units_piece || null,
      units_sample: data.units_sample || null,
      quien_corto: data.quien_corto || null,
      origen_corte: data.origen_corte || 'CREATIVO',
      observations: data.observations || null,
    })
    .select('*')
    .single();
}

export async function deleteCut(id) {
  return supabase
    .from('cuts')
    .delete()
    .eq('id', id);
}

export function useSewingsMuestra(referenceId) {
  const [sewings, setSewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!referenceId) {
      startTransition(() => { setSewings([]); setLoading(false); setError(null); });
      return undefined;
    }
    let cancelled = false;
    startTransition(() => { setLoading(true); setError(null); });
    async function load() {
      const { data, error } = await supabase
        .from('sewings')
        .select('*')
        .eq('reference_id', referenceId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!cancelled) setSewings(data || []);
      if (!cancelled) setLoading(false);
    }
    load().catch(loadError => {
      if (!cancelled) {
        setError(loadError);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [referenceId, reloadKey]);

  return { sewings, loading, error, refresh: () => setReloadKey(key => key + 1) };
}

export async function createSewing(data) {
  return supabase
    .from('sewings')
    .insert({
      reference_id: data.reference_id,
      modista_nombre: data.modista_nombre || null,
      tipo_muestra: data.tipo_muestra || 'MUESTRA',
      start_date: data.start_date || new Date().toISOString().slice(0, 10),
      end_date: data.end_date || null,
      status: data.status || 'PENDIENTE',
      notes: data.notes || null,
    })
    .select('*')
    .single();
}

export async function updateSewing(id, data) {
  return supabase
    .from('sewings')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();
}

export async function deleteSewing(id) {
  return supabase
    .from('sewings')
    .delete()
    .eq('id', id);
}

export function usePanelCreativo(refIds) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const key = (refIds || []).join(',');

  const refresh = useCallback(async () => {
    if (!refIds || refIds.length === 0) {
      startTransition(() => { setData({}); setLoading(false); setError(null); });
      return;
    }
    startTransition(() => setLoading(true));
    setError(null);
    try {
      const q = {
        laboratorios: supabase.from('laboratorios').select('id, reference_id, estado, integrado_molderia').in('reference_id', refIds).order('id', { ascending: false }),
        cuts: supabase.from('cuts').select('reference_id, cut_date').in('reference_id', refIds).order('created_at', { ascending: false }),
        sewings: supabase.from('sewings').select('reference_id, status').in('reference_id', refIds).order('created_at', { ascending: false }),
        mediciones: supabase.from('mediciones').select('reference_id, resultado, fecha').in('reference_id', refIds).order('fecha', { ascending: false }),
        supplyRequests: supabase.from('supply_requests').select('reference_id, status').in('reference_id', refIds),
        supplies: supabase.from('reference_supplies').select('reference_id, talla').in('reference_id', refIds),
        fabrics: supabase.from('reference_fabrics').select('reference_id, usada').in('reference_id', refIds),
        consumos: supabase.from('consumos').select('reference_id, role').eq('role', 'CREATIVO').in('reference_id', refIds),
      };
      const [lab, cuts, sew, med, req, sup, fab, cons] = await Promise.all([
        q.laboratorios, q.cuts, q.sewings, q.mediciones, q.supplyRequests, q.supplies, q.fabrics, q.consumos,
      ]);
      const errs = [lab, cuts, sew, med, req, sup, fab, cons].filter(r => r.error);
      if (errs.length) throw errs[0].error;

      const byRef = {};
      refIds.forEach(id => {
        byRef[id] = { laboratorios: [], cuts: [], sewings: [], mediciones: [], supplyRequests: [], suppliesTalla: 0, fabricsUsadas: 0, fabricsTotal: 0, consumosCreativo: 0 };
      });
      (lab.data || []).forEach(r => { if (byRef[r.reference_id]) byRef[r.reference_id].laboratorios.push(r); });
      (cuts.data || []).forEach(r => { if (byRef[r.reference_id]) byRef[r.reference_id].cuts.push(r); });
      (sew.data || []).forEach(r => { if (byRef[r.reference_id]) byRef[r.reference_id].sewings.push(r); });
      (med.data || []).forEach(r => { if (byRef[r.reference_id]) byRef[r.reference_id].mediciones.push(r); });
      (req.data || []).forEach(r => { if (byRef[r.reference_id]) byRef[r.reference_id].supplyRequests.push(r); });
      (sup.data || []).forEach(r => { if (byRef[r.reference_id] && r.talla) byRef[r.reference_id].suppliesTalla += 1; });
      (fab.data || []).forEach(r => {
        if (byRef[r.reference_id]) { byRef[r.reference_id].fabricsTotal += 1; if (r.usada) byRef[r.reference_id].fabricsUsadas += 1; }
      });
      (cons.data || []).forEach(r => { if (byRef[r.reference_id]) byRef[r.reference_id].consumosCreativo += 1; });

      startTransition(() => setData(byRef));
    } catch (e) {
      startTransition(() => setError(e));
    } finally {
      startTransition(() => setLoading(false));
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}
