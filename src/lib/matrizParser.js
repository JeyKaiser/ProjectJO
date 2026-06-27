import * as XLSX from 'xlsx';

/* ==========================================================================
   MATRIZ Parser — Lee archivos Excel con formato CONTRAMUESTRAS/MATRIZ
   Columnas por posicion fija (A=0, B=1, ..., HD=213) segun row 9 del Excel.
   Retorna { coleccion, referencias, telas, consumos, medidas, cortes, ... }
   ========================================================================== */

// ── Helpers ──
const safe = (val) => {
  if (val === undefined || val === null) return '';
  const s = String(val).trim();
  if (!s || s === '#N/A' || s === 'N/A' || s === '#REF!' || s === '#REF' || s === '0') return '';
  return s;
};
const safeNum = (val) => { const s = safe(val); return s ? Number(s) : null; };
const cleanNum = (val) => {
  const s = safe(val).toUpperCase().replace(/MTS|MT|CMS|\,/g, (c) => c === ',' ? '.' : '').trim();
  const n = parseFloat(s); return isNaN(n) ? null : n;
};
const siNo = (val) => { const v = safe(val).toUpperCase(); if (v === 'SI') return true; if (v === 'NO') return false; return null; };
const isOK = (val) => { const v = safe(val).toUpperCase(); return v === 'OK' || v === 'X' || v === '✓'; };
const parseDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  const s = String(val).trim();
  const m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) return `${m[3].padStart(4,'20')}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  if (/^\d{5}$/.test(s)) { const d = new Date((Number(s) - 25569) * 86400000); return d.toISOString().split('T')[0]; }
  return null;
};

// ── Column mapping (0-based, based on row 9 of MATRIZ sheet) ──
const C = {
  REF: 0, IMAGEN: 1, COD_MD: 2, COD_PT: 3, NOMBRE: 4, COLOR: 5, COD_COLOR: 6,
  FOTO_REF: 7, PT_REF: 8, BASADO_EN: 9, STATUS: 10, DISENADOR: 11,
  STATUS_TALLER: 12, MODISTA: 13, FOTOS_INT: 14,
  LINEA: 15, SUBLINEA: 16, TIPO_REF: 17, TALLAJE: 18, LARGO: 19, CLOSURE: 20, LINNED: 21,
  INCLUDES: 22, INCLUDES_PAQ: 23,
  COD_TELA_LUCIR: 24, FOTO_TELA: 25, DESC_TELA: 26, ANCHO_TELA: 27, BASE_TEXTIL: 28,
  COD_TELA_FORRO: 29, DESC_FORRO: 30, ANCHO_FORRO: 31,
  MOD_ARTE: 32, UBI_TRAZO: 33, ALL_OVER: 34, SUGERENCIA_MOD: 35,
  VAR_COLOR: 36, REF_VAR: 37, TIPO_EMPAQUE: 38,
  BORDADO_APLICA: 39, BORDADO_DESC: 40, BORDADO_STATUS: 41,
  SEMIELAB_APLICA: 42, SEMIELAB_DESC: 43,
  PROV_EXT: 44, PROC_EXT: 45, COSTO_EXT: 46,
  ENT_CREATIVO: 47, ENT_TECNICO_PROC: 48, ENT_TECNICO_COMP: 49, ENT_TRAZADOR: 50, ENVIO_MOD: 51,
  ESPECIF_CONF: 52, ESCALADO_MOLD: 53, TIRAS_CONT: 54, DIFIC_PRENDA: 55, DIFIC_BORDADO: 56,
  TIRA_CONT_COM: 57, PROP_CANCELAR: 58, BORDADO_TIPO: 59, GRUPO: 60,
  COM_ING: 61, COM_TRAZO: 62, COM_COSTEO: 63, SUG_MOD_UBC: 64, REQUIERE_MUESTRA: 65,
  FECHA_HALLAZGO: 69, AREA_AFECT: 70, CLASIF_HALLAZGO: 71, MP: 72, CLASIF_MP: 73, TIPO_EJEC: 74,
  SAP_MUESTRA: 75, DESC_USA_M: 76, FIBER_M: 77, WOVEN_M: 78, INSIDE_M: 79, INCLUDE_M: 80, OBS_M: 81,
  SAP_PROD: 82, DESC_USA_P: 83, FIBER_P: 84, WOVEN_P: 85, INSIDE_P: 86, INCLUDE_P: 87, OBS_P: 88,
  PROCESO_CUID: 90, LAVADO: 91, DESMANCHE: 93, SECADO: 95, PLANCHADO: 97, CUID_INCLUDES: 99,
  TALLA_0: 100, TALLA_2: 101, TALLA_4: 102, TALLA_6: 103, TALLA_8: 104,
  TALLA_10: 105, TALLA_12: 106, TALLA_XS: 107, TALLA_S: 108, TALLA_M: 109, TALLA_L: 110, TALLA_XL: 111,
  TIPO_TEJIDO: 113, COMPL_CORTE: 114, ENVIO_CORTE_MAQ: 115, COMPL_CONF: 116, ENVIO_CONF_MAQ: 117,
  MONTAJE_TIPO: 118, MONTAJE_PROY: 120,
  DIS_TEC_CONTRAM: 121, DIS_CRE_CONTRAM: 122,
  MOLD_INI: 123, MOLD_FIN: 124, MOLD_COM: 125,
  PROC_EXT2_TIPO: 126, PROC_EXT2_REC: 127, PROC_EXT2_ENT: 128, PROC_EXT2_STATUS: 129,
  CORTE_F1: 130, CORTE_T1: 131, CORTE_F2: 132, CORTE_T2: 133, CORTE_F3: 134, CORTE_T3: 135,
  CORTE_F4: 136, CORTE_T4: 137, CORTE_OBS: 138, CORTE_PIEZAS: 139, CORTE_MUESTRAS: 140,
  CONF_MODISTA: 141, CONF_INI: 142, CONF_ENT: 143, CONF_ESTADO: 144, CONF_OBS: 145, CONF_SIT: 146,
  CONF_TIEMPO: 148, CONF_EST_PLANTA: 149, CONF_RECHAZO: 150, CONF_FEEDBACK: 151,
  MED_F1: 152, MED_C1: 153, MED_F2: 154, MED_C2: 155, MED_F3: 156, MED_C3: 157,
  MED_F4: 158, MED_C4: 159, MED_F5: 160, MED_C5: 161, FOTO_CONTRAM: 162,
  ESPECIF: 166, INICIO_ESPEC: 167, REV_SAP: 168, FINAL_ESPEC: 171,
  PRIORIDAD: 172, FECHA_META: 173, DROPS: 174, STATUS_CM: 175,
  CONT_FOTO: 180, CONT_UND: 181, CONT_NOMBRE: 182, CONT_TALLA: 183, CONT_COLOR: 184,
  CONT_OT: 185, CONT_NOTA: 186, CONT_GESTION: 187, CONT_TRASLADO: 188, CONT_DESPACHO: 189,
  LIB_FICHA_FIS: 190,
};

// ── Tallajes ──
const TALLA_NAMES = ['0','2','4','6','8','10','12','XS','S','M','L','XL'];
const TALLA_COLS = [C.TALLA_0, C.TALLA_2, C.TALLA_4, C.TALLA_6, C.TALLA_8,
  C.TALLA_10, C.TALLA_12, C.TALLA_XS, C.TALLA_S, C.TALLA_M, C.TALLA_L, C.TALLA_XL];

// ── Status mapping ──
const STATUS_MAP = {
  'APROBADO': 2, 'EN PROCESO': 1, 'EN_PROCESO': 1, 'CANCELADO': 3, 'CANCELADO CORTADO': 3,
  'CANCELADO SIN CORTAR': 3, 'JUST FOR SHOW': 3, 'PAQUETE COMPLETO': 4, 'PENDIENTE': 6,
};

/* ==========================================================================
   Main export: parseMatriz(fileData) → { coleccion, secciones }
   ========================================================================== */
export function parseMatriz(fileData, fileName) {
  const wb = XLSX.read(fileData, { type: 'array', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames.find(s => s.toUpperCase().includes('MATRIZ')) || wb.SheetNames[1] || wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });

  if (rows.length < 10) return { error: 'Archivo muy corto. Se espera al menos 10 filas (headers en fila 9).' };

  // Find header row — busca "REF" en columna A en cualquier fila (0-50)
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 50); i++) {
    const r = rows[i] || [];
    const a0 = String(r[0] || '').toUpperCase().trim();
    // Busca exactamente "REF" en col A
    if (a0 === 'REF') {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return { error: 'No se encontro la fila de encabezados. La columna A debe decir "REF" (sin espacios, en mayuscula). Verifica que la primera columna de la fila de titulos contenga exactamente la palabra REF.' };

  const dataStart = headerIdx + 1;
  const refs = {};
  const allData = {
    referencias: [], telas: [], telasForro: [], consumos: [],
    medidas: [], cortes: [], confecciones: [], composiciones: [],
    bordados: [], semielaborados: [], procesosExternos: [],
    contramuestras: [], produccionUnits: [], molderia: [], entregables: [],
    calidad: [], cuidados: [], montaje: [], referentes: [],
  };

  let skipped = 0;
  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i] || [];
    const ref = safe(row[C.REF]);
    if (!ref || !ref.match(/^\d+$/)) { skipped++; continue; }
    const rn = parseInt(ref);

    const g = (key) => (C[key] !== undefined && C[key] < row.length) ? safe(row[C[key]]) : '';
    const gd = (key) => (C[key] !== undefined && C[key] < row.length) ? parseDate(row[C[key]]) : null;
    const gn = (key) => (C[key] !== undefined && C[key] < row.length) ? safeNum(row[C[key]]) : null;

    // ── 1. Reference core ──
    if (!refs[rn]) {
      refs[rn] = {
        reference_number: String(rn),
        name: g('NOMBRE') || `REF-${rn}`,
        main_image_url: g('IMAGEN'),
        color: g('COLOR'),
        color_code: g('COD_COLOR'),
        status_id: STATUS_MAP[g('STATUS').toUpperCase()] || 1,
        line_name: g('LINEA'),
        subline_name: g('SUBLINEA'),
        tallaje_group: g('TALLAJE'),
        length_description: g('LARGO'),
        closure: g('CLOSURE'),
        linned: g('LINNED'),
        has_art_modification: siNo(g('MOD_ARTE')) || false,
        has_trace_location: siNo(g('UBI_TRAZO')) || false,
        has_all_over: siNo(g('ALL_OVER')) || false,
        has_embroidery: siNo(g('BORDADO_APLICA')) || false,
        has_semielaborated: siNo(g('SEMIELAB_APLICA')) || false,
        package_type: g('TIPO_EMPAQUE'),
        disenador: g('DISENADOR'),
        // Time Collection
        especificacion_confeccion: g('ESPECIF_CONF'),
        escalado_molderia_notes: g('ESCALADO_MOLD'),
        tiras_continuas: g('TIRAS_CONT'),
        dificultad_prenda: g('DIFIC_PRENDA'),
        dificultad_bordado: g('DIFIC_BORDADO'),
        sugerencia_mod_ubc: g('SUGERENCIA_MOD'),
        requiere_muestra: siNo(g('REQUIERE_MUESTRA')),
        grupo_estilo: g('GRUPO'),
        header_notes: g('COM_ING'),
        trace_notes: g('COM_TRAZO'),
        costing_notes: g('COM_COSTEO'),
        // Maquila
        tejido: g('TIPO_TEJIDO'),
        complejidad_corte: g('COMPL_CORTE'),
        envio_corte_maquila: siNo(g('ENVIO_CORTE_MAQ')),
        complejidad_confeccion: g('COMPL_CONF'),
        envio_confeccion_maquila: siNo(g('ENVIO_CONF_MAQ')),
      };

      // MD / PT codes
      const md = g('COD_MD');
      const pt = g('COD_PT');
      if (md && md !== '-' && md !== '0') refs[rn].codigo_md = md;
      if (pt && pt !== '-' && pt !== '0') refs[rn].codigo_pt = pt;
    }

    // ── 2. Referentes ──
    const ptRef = g('PT_REF');
    const nombreRef = g('BASADO_EN');
    if (ptRef && ptRef !== 'N/A') {
      allData.referentes.push({ ref_num: rn, pt: ptRef, nombre: nombreRef });
    }

    // ── 3. Tela Lucir ──
    const codLucir = g('COD_TELA_LUCIR');
    if (codLucir && codLucir !== '-') {
      allData.telas.push({
        ref_num: rn, uso: 'TELA LUCIR', codigo: codLucir,
        descripcion: g('DESC_TELA'),
        ancho: cleanNum(g('ANCHO_TELA')),
        base_textil: g('BASE_TEXTIL'),
        foto: g('FOTO_TELA'),
      });
    }

    // ── 4. Tela Forro ──
    const codForro = g('COD_TELA_FORRO');
    if (codForro && codForro !== '-') {
      allData.telasForro.push({
        ref_num: rn, uso: 'TELA FORRO', codigo: codForro,
        descripcion: g('DESC_FORRO'),
        ancho: cleanNum(g('ANCHO_FORRO')),
      });
    }

    // ── 5. Bordado ──
    const bordAplica = siNo(g('BORDADO_APLICA'));
    const bordDesc = g('BORDADO_DESC');
    if (bordAplica || bordDesc) {
      allData.bordados.push({
        ref_num: rn, aplica: bordAplica, descripcion: bordDesc,
        status: g('BORDADO_STATUS'), tipo: g('BORDADO_TIPO'),
      });
    }

    // ── 6. Semielaborado ──
    const semiAplica = siNo(g('SEMIELAB_APLICA'));
    if (semiAplica || g('SEMIELAB_DESC')) {
      allData.semielaborados.push({ ref_num: rn, aplica: semiAplica, descripcion: g('SEMIELAB_DESC') });
    }

    // ── 7. Proceso Externo ──
    const provExt = g('PROV_EXT');
    if (provExt) {
      allData.procesosExternos.push({
        ref_num: rn, proveedor: provExt, descripcion: g('PROC_EXT'), costo: cleanNum(g('COSTO_EXT')),
      });
    }

    // ── 8. Entregables ──
    const entradas = [
      { tipo: 'CREATIVO', key: 'ENT_CREATIVO' },
      { tipo: 'TECNICO_PROC', key: 'ENT_TECNICO_PROC' },
      { tipo: 'TECNICO_COMP', key: 'ENT_TECNICO_COMP' },
      { tipo: 'TRAZADOR', key: 'ENT_TRAZADOR' },
      { tipo: 'ENVIO_MOD_ARTE', key: 'ENVIO_MOD' },
    ];
    entradas.forEach(e => {
      const val = g(e.key);
      if (val) allData.entregables.push({ ref_num: rn, tipo: e.tipo, completado: isOK(val), valor: val });
    });

    // ── 9. Composiciones (MUESTRA) ──
    const fibMuestra = g('FIBER_M');
    if (fibMuestra) {
      allData.composiciones.push({
        ref_num: rn, scope: 'MUESTRA', sap: isOK(g('SAP_MUESTRA')),
        desc_usa: g('DESC_USA_M'), fiber: fibMuestra, woven: g('WOVEN_M'),
        inside: g('INSIDE_M'), include: g('INCLUDE_M'), obs: g('OBS_M'),
      });
    }
    // Composiciones (PRODUCCION)
    const fibProd = g('FIBER_P');
    if (fibProd) {
      allData.composiciones.push({
        ref_num: rn, scope: 'PRODUCCION', sap: isOK(g('SAP_PROD')),
        desc_usa: g('DESC_USA_P'), fiber: fibProd, woven: g('WOVEN_P'),
        inside: g('INSIDE_P'), include: g('INCLUDE_P'), obs: g('OBS_P'),
      });
    }

    // ── 10. Cuidados ──
    const lavado = g('LAVADO');
    if (lavado) allData.cuidados.push({ ref_num: rn, tipo: 'LAVADO', instruccion: lavado });
    if (g('DESMANCHE')) allData.cuidados.push({ ref_num: rn, tipo: 'DESMANCHE', instruccion: g('DESMANCHE') });
    if (g('SECADO')) allData.cuidados.push({ ref_num: rn, tipo: 'SECADO', instruccion: g('SECADO') });
    if (g('PLANCHADO')) allData.cuidados.push({ ref_num: rn, tipo: 'PLANCHADO', instruccion: g('PLANCHADO') });
    if (g('PROCESO_CUID')) allData.cuidados.push({ ref_num: rn, tipo: 'PROCESO', instruccion: g('PROCESO_CUID') });

    // ── 11. Unidades de produccion ──
    TALLA_NAMES.forEach((name, idx) => {
      const val = gn(`TALLA_${name === '10' || name === '12' ? name : name}`);
      if (val !== null && val > 0) {
        allData.produccionUnits.push({ ref_num: rn, talla: name, cantidad: val });
      }
    });

    // ── 12. Montaje ──
    const montajeTipo = g('MONTAJE_TIPO');
    if (montajeTipo) {
      allData.montaje.push({ ref_num: rn, tipo: montajeTipo, proyecto: g('MONTAJE_PROY') });
    }

    // ── 13. Molderia ──
    const moldIni = gd('MOLD_INI');
    const moldFin = gd('MOLD_FIN');
    if (moldIni || moldFin || g('MOLD_COM')) {
      allData.molderia.push({
        ref_num: rn, inicio: moldIni, fin: moldFin,
        disenador_tecnico: g('DIS_TEC_CONTRAM'), disenador_creativo: g('DIS_CRE_CONTRAM'),
        comentarios: g('MOLD_COM'),
      });
    }

    // ── 14. Procesos Externos 2 ──
    const proc2Tipo = g('PROC_EXT2_TIPO');
    if (proc2Tipo) {
      allData.procesosExternos.push({
        ref_num: rn, tipo: proc2Tipo, rec: gd('PROC_EXT2_REC'), ent: gd('PROC_EXT2_ENT'), status: g('PROC_EXT2_STATUS'),
      });
    }

    // ── 15. Cortes ──
    for (const n of [1, 2, 3, 4]) {
      const fkey = `CORTE_F${n}`; const tkey = `CORTE_T${n}`;
      const fecha = gd(fkey); const tipo = g(tkey);
      if (fecha || tipo) {
        allData.cortes.push({ ref_num: rn, numero: n, fecha, tipo, obs: g('CORTE_OBS'), piezas: gn('CORTE_PIEZAS'), muestras: gn('CORTE_MUESTRAS') });
      }
    }

    // ── 16. Confeccion ──
    const confModista = g('CONF_MODISTA');
    const confIni = gd('CONF_INI');
    if (confModista || confIni) {
      allData.confecciones.push({
        ref_num: rn, modista: confModista, inicio: confIni, entrega: gd('CONF_ENT'),
        estado: g('CONF_ESTADO'), obs: g('CONF_OBS'), situacion: g('CONF_SIT'),
        tiempo: gn('CONF_TIEMPO'), estado_planta: g('CONF_EST_PLANTA'),
        rechazo: g('CONF_RECHAZO'), feedback: g('CONF_FEEDBACK'),
      });
    }

    // ── 17. Mediciones ──
    for (const n of [1, 2, 3, 4, 5]) {
      const fkey = `MED_F${n}`; const ckey = `MED_C${n}`;
      const fecha = gd(fkey); const comentario = g(ckey);
      if (fecha || comentario) {
        allData.medidas.push({ ref_num: rn, fase: n, fecha, comentario });
      }
    }

    // ── 18. Contramuestras ──
    const ot = g('CONT_OT');
    const nombreCont = g('CONT_NOMBRE');
    if (ot || nombreCont) {
      allData.contramuestras.push({
        ref_num: rn, codigo_ot: ot, nombre: nombreCont, talla: g('CONT_TALLA'),
        color: g('CONT_COLOR'), unidades: gn('CONT_UND'),
        nota: g('CONT_NOTA'), gestion_nota: gd('CONT_GESTION'),
        traslado_sap: gd('CONT_TRASLADO'), despacho_zf: gd('CONT_DESPACHO'),
        prioridad: gn('PRIORIDAD'), fecha_meta: gd('FECHA_META'),
        drops: g('DROPS'), status: g('STATUS_CM'),
        foto: g('FOTO_CONTRAM'), especificadora: g('ESPECIF'),
        inicio_espec: gd('INICIO_ESPEC'), final_espec: gd('FINAL_ESPEC'),
      });
    }

    // ── 19. Validacion MP (calidad) ──
    const fechaHallazgo = gd('FECHA_HALLAZGO');
    if (fechaHallazgo || g('AREA_AFECT')) {
      allData.calidad.push({
        ref_num: rn, fecha: fechaHallazgo, area: g('AREA_AFECT'),
        clasificacion: g('CLASIF_HALLAZGO'), material: g('MP'),
        clasif_mp: g('CLASIF_MP'), ejecucion: g('TIPO_EJEC'),
      });
    }

    // ── 20. Status taller / modista (workflow phase history) ──
    const statusTaller = g('STATUS_TALLER');
    const modista = g('MODISTA');
    if (statusTaller || modista) {
      refs[rn].workshop_status = statusTaller;
      refs[rn].modista = modista;
      refs[rn].fotos_internas = isOK(g('FOTOS_INT'));
    }
  }

  const errors = [];
  if (Object.keys(refs).length === 0) errors.push('No se encontraron referencias validas (col A con numeros)');
  if (skipped > 0) errors.push(`${skipped} filas saltadas (sin REF valido)`);

  return {
    coleccion: 'WINTER SUN',
    year: 2026,
    referencias: Object.values(refs),
    secciones: allData,
    totalRefs: Object.keys(refs).length,
    errors,
  };
}

/**
 * Auto-detecta si un archivo es formato MATRIZ observando la row 9.
 * Retorna 'MATRIZ' | 'VALIDACION_TELAS' | 'UNKNOWN'
 */
export function detectFormat(fileData, fileName) {
  try {
    const wb = XLSX.read(fileData, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });

    if (rows.length < 2) return 'UNKNOWN';

    // Buscar "REF" en col 0 de cualquier fila (0-30)
    let headerRow = null;
    for (let i = 0; i < Math.min(rows.length, 30); i++) {
      if (String((rows[i] || [])[0] || '').toUpperCase().trim() === 'REF') {
        headerRow = (rows[i] || []).map(c => String(c || '').toUpperCase().trim());
        break;
      }
    }
    if (!headerRow) return 'UNKNOWN';

    // MATRIZ: col 13 "STATUS TALLER" o col 12 "MODISTA" o col 10 "STATUS"
    if (headerRow[12]?.includes('STATUS TALLER') || headerRow[13]?.includes('MODISTA') || headerRow[10]?.includes('STATUS')) return 'MATRIZ';

    // VALIDACION DE TELAS: col 9-10 "USO EN PRENDA" o "CODIGO TELA"
    if (headerRow[9]?.includes('USO') || headerRow[10]?.includes('CODIGO')) return 'VALIDACION_TELAS';

    return 'UNKNOWN';
  } catch { return 'UNKNOWN'; }
}
