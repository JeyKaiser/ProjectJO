import * as XLSX from 'xlsx';

/**
 * Parsea un archivo Excel (.xlsx) o CSV con formato VALIDACION DE TELAS.
 * Retorna { referencias, telas, consumos, errores }
 */
export function parseValidationTelas(fileData, fileName) {
  const isCSV = fileName.toLowerCase().endsWith('.csv');
  const workbook = isCSV
    ? XLSX.read(fileData, { type: 'array', raw: true })
    : XLSX.read(fileData, { type: 'array' });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false });
  if (!rows.length) return { error: 'El archivo esta vacio' };

  // ── Encontrar fila de encabezados ──
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i] || [];
    const first = String(row[0] || '').toUpperCase().trim();
    if (first === 'REF' || first === '#REF!' || first === '#REF') {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    return { error: 'No se encontro la fila de encabezados. La columna A debe decir "REF"' };
  }

  const headers = (rows[headerIdx] || []).map(h => String(h || '').toUpperCase().trim().replace('#REF!', 'REF').replace('#REF', 'REF'));

  // ── Mapear columnas por nombre ──
  function findCol(...names) {
    for (const n of names) {
      const idx = headers.findIndex(h => h.includes(n.toUpperCase()));
      if (idx >= 0) return idx;
    }
    return -1;
  }

  const col = {
    REF: findCol('REF'),
    FOTO: findCol('FOTO'),
    NOMBRE: findCol('NOMBRE', 'REFERENCIA'),
    STATUS: findCol('STATUS', 'ESTADO'),
    MOD_ARTE: findCol('MOD', 'ARTE'),
    UBI_TRAZO: findCol('UBI', 'TRAZO'),
    VARIACION_COLOR: findCol('VARIACION', 'COLOR'),
    LARGO: findCol('LARGO'),
    USO: findCol('USO'),
    CODIGO_TELA: findCol('CODIGO', 'TELA'),
    DESC_TELA: findCol('DESCRIPCION', 'TELA'),
    ANCHO: findCol('ANCHO'),
    CONSUMO_BASE: findCol('CONSUMO BASE', 'CONSUMO_BASE'),
    CREATIVO: findCol('DISEÑADOR', 'CREATIVO'),
    CAMBIO_MOLD: findCol('CAMBIO', 'MOLDERIA'),
    CONS_C1: findCol('CONSUMO 1', 'CONSUMO1'),
    CONS_C2: findCol('CONSUMO 2', 'CONSUMO2'),
    CONS_C3: findCol('CONSUMO 3', 'CONSUMO3'),
    OBS_CREATIVO: findCol('OBSERVACIONES', 'CREATIVO'),
    TECNICO: findCol('DISEÑADOR', 'TECNICO'),
    TALLA_SOL: findCol('TALLA', 'SOLIDO'),
    CONS_S1: findCol('CONSUMO', 'SOLIDO', '1'),
    CONS_S2: findCol('CONSUMO', 'SOLIDO', '2'),
    CONS_S3: findCol('CONSUMO', 'SOLIDO', '3'),
    TALLA_MOD: findCol('TALLA', 'MOD'),
    CONS_M1: findCol('CONSUMO', 'MOD', 'ARTE'),
    CONS_M2: findCol('CONSUMO', 'MOD', 'ARTE', '2'),
    CONS_M3: findCol('CONSUMO', 'MOD', 'ARTE', '3'),
    TALLA_UBI: findCol('TALLA', 'UBI'),
    CONS_U1: findCol('CONSUMO', 'UBI', 'TRAZO'),
    CONS_U2: findCol('CONSUMO', 'UBI', 'TRAZO', '2'),
    CONS_U3: findCol('CONSUMO', 'UBI', 'TRAZO', '3'),
    OBS_TECNICO: findCol('OBSERVACIONES', 'TECNICO'),
    TEC: findCol('TEC'),
    TRAZADOR: findCol('TRAZADOR'),
    TALLER: findCol('TERMINADO', 'TALLER'),
  };

  // ── Helpers ──
  const safe = (val) => {
    if (val === undefined || val === null) return '';
    const s = String(val).trim();
    if (!s || s === '#N/A' || s === 'N/A' || s === '#REF!' || s === '#REF') return '';
    return s;
  };
  const cleanNum = (val) => {
    const s = safe(val).toUpperCase().replace(/MTS|MT|CMS/g, '').replace(',', '.').trim();
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  };
  const siNo = (val) => {
    const v = safe(val).toUpperCase();
    if (v === 'SI') return true;
    if (v === 'NO') return false;
    return null;
  };

  // ── Parsear filas ──
  const referencias = {};
  const telasData = [];
  const consumosData = [];
  let currentRef = null;
  let skipped = 0;

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const g = (c) => (c >= 0 && c < row.length) ? safe(row[c]) : '';

    let refVal = g(col.REF);
    const uso = g(col.USO);
    const codTela = g(col.CODIGO_TELA);

    if (!refVal.match(/^\d+$/) && currentRef && (uso || codTela)) {
      refVal = currentRef;
    }
    if (!refVal || !refVal.match(/^\d+$/)) { skipped++; continue; }

    const refNum = refVal;
    if (safe(row[col.REF] || '').match(/^\d+$/)) currentRef = refNum;

    // Reference
    if (!referencias[refNum]) {
      referencias[refNum] = {
        reference_number: refNum,
        name: g(col.NOMBRE) || `REF-${refNum}`,
        main_image_url: g(col.FOTO),
        status: g(col.STATUS),
        has_art_modification: siNo(g(col.MOD_ARTE)) || false,
        has_trace_location: siNo(g(col.UBI_TRAZO)) || false,
        length_description: g(col.LARGO),
      };
    }

    // Fabric
    if (codTela) {
      const anchoStr = g(col.ANCHO).replace(',', '.');
      telasData.push({
        ref_num: refNum,
        codigo_tela: codTela,
        descripcion_tela: g(col.DESC_TELA),
        uso: uso,
        ancho: anchoStr && !isNaN(parseFloat(anchoStr)) ? parseFloat(anchoStr) : null,
        consumo_base: cleanNum(g(col.CONSUMO_BASE)),
      });
    }

    // Consumos Creativo
    for (const ver of [1, 2, 3]) {
      const val = cleanNum(g(col[`CONS_C${ver}`]));
      if (val && val > 0) {
        consumosData.push({ ref_num: refNum, role: 'CREATIVO', version: ver, consumo_valor: val,
          observaciones: g(col.OBS_CREATIVO), cambio_molderia: siNo(g(col.CAMBIO_MOLD)) });
      }
    }

    // Consumos Tecnico - Solido
    for (const ver of [1, 2, 3]) {
      const val = cleanNum(g(col[`CONS_S${ver}`]));
      if (val && val > 0) {
        consumosData.push({ ref_num: refNum, role: 'TECNICO', tipo_tela: 'SOLIDO', version: ver,
          talla: g(col.TALLA_SOL), consumo_valor: val, observaciones: g(col.OBS_TECNICO) });
      }
    }

    // Consumos Tecnico - Mod Arte
    for (const ver of [1, 2, 3]) {
      const ckey = ver === 1 ? 'CONS_M1' : ver === 2 ? 'CONS_M2' : 'CONS_M3';
      const val = cleanNum(g(col[ckey]));
      if (val && val > 0) {
        consumosData.push({ ref_num: refNum, role: 'TECNICO', tipo_tela: 'MOD_ARTE', version: ver,
          talla: g(col.TALLA_MOD), consumo_valor: val, observaciones: g(col.OBS_TECNICO) });
      }
    }

    // Consumos Tecnico - Ubi Trazo
    for (const ver of [1, 2, 3]) {
      const ckey = ver === 1 ? 'CONS_U1' : ver === 2 ? 'CONS_U2' : 'CONS_U3';
      const val = cleanNum(g(col[ckey]));
      if (val && val > 0) {
        consumosData.push({ ref_num: refNum, role: 'TECNICO', tipo_tela: 'UBI_TRAZO', version: ver,
          talla: g(col.TALLA_UBI), consumo_valor: val, observaciones: g(col.OBS_TECNICO) });
      }
    }
  }

  return {
    referencias: Object.values(referencias),
    telas: telasData,
    consumos: consumosData,
    errores: skipped > 0 ? [`${skipped} filas saltadas (sin REF valido)`] : [],
  };
}
