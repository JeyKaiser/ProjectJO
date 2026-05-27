/**
 * VALIDACION_DE_TELAS v3.0 - Sincronizacion multi-hoja
 * 
 * Arquitectura:
 * - _MAESTRA (oculta): 73 columnas, fuente unica de verdad
 * - COORDINACION: copia completa visible para admins
 * - CREATIVO: solo contexto + consumos de diseno creativo
 * - TECNICO: solo contexto + consumos de diseno tecnico
 * - TRAZO_Y_CORTE: solo contexto + consumos de trazo
 * 
 * Las hojas de rol tienen columnas protegidas (🔒).
 * El script revierte cualquier edicion sobre columnas protegidas.
 * Toda edicion valida se sincroniza a _MAESTRA y COORDINACION.
 */

// ── CONFIGURACION ──────────────────────────────────────────────────────────

var S = {
  MAESTRA: '_MAESTRA',
  COORDINACION: 'COORDINACION',
  CREATIVO: 'CREATIVO',
  TECNICO: 'TECNICO',
  TRAZO_Y_CORTE: 'TRAZO_Y_CORTE'
};

/**
 * Mapeo: columna en hoja de rol -> columna en _MAESTRA
 */
var MAPEO = {
  CREATIVO: {
    // cols 1-12: contexto (solo lectura en script)
    1: 1,   2: 2,   3: 3,   4: 4,   5: 5,   6: 6,
    7: 10,  8: 11,  9: 12,  10: 13, 11: 14, 12: 15,
    // cols 13-18: consumos creativo (editable)
    13: 16, 14: 17, 15: 18, 16: 19, 17: 20, 18: 21,
  },
  TECNICO: {
    1: 1,   2: 2,   3: 3,   4: 4,   5: 5,   6: 6,
    7: 10,  8: 11,  9: 12,  10: 13, 11: 14, 12: 15,
    13: 22, // DISEÑADOR TECNICO
    // SOLIDO
    14: 23, 15: 24, 16: 25, 17: 26, 18: 27,
    // MOD ARTE
    19: 28, 20: 29, 21: 30, 22: 31, 23: 32,
    // UBI TRAZO
    24: 33, 25: 34, 26: 35, 27: 36, 28: 37,
    // OBS
    29: 38,
  },
  TRAZO_Y_CORTE: {
    1: 1,   2: 2,   3: 3,   4: 4,   5: 5,   6: 6,
    7: 10,  8: 11,  9: 12,  10: 13, 11: 14, 12: 15,
    // SOLIDO
    13: 39, 14: 40, 15: 41, 16: 42, 17: 43, 18: 44,
    // MOD ARTE
    19: 45, 20: 46, 21: 47, 22: 48, 23: 49, 24: 50,
    // UBI TRAZO
    25: 51, 26: 52, 27: 53, 28: 54,
    // OBS
    29: 55,
  },
};

// Columnas protegidas por rol (1-indexed en la hoja de rol)
var PROTEGIDAS = {
  CREATIVO: [1,2,3,4,5,6,7,8,9,10,11,12],
  TECNICO: [1,2,3,4,5,6,7,8,9,10,11,12],
  TRAZO_Y_CORTE: [1,2,3,4,5,6,7,8,9,10,11,12],
};

// ── MENU ───────────────────────────────────────────────────────────────────

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Validacion Telas v3')
    .addItem('Sincronizar todo ahora', 'sincronizarTodo')
    .addSeparator()
    .addItem('Ir a INFO BASICA', 'irAInfoBasica')
    .addItem('Ir a CREATIVO', 'irACreativo')
    .addItem('Ir a TECNICO', 'irATecnico')
    .addItem('Ir a TRAZO Y CORTE', 'irATrazo')
    .addItem('Ir a CONTRAMUESTRA', 'irAContramuestra')
    .addToUi();
}

// ── NAVEGACION ─────────────────────────────────────────────────────────────

function irAInfoBasica() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(S.COORDINACION);
  if (sheet) sheet.getRange('A3').activate();
}

function irACreativo() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var crSheet = ss.getSheetByName(S.CREATIVO);
  var coSheet = ss.getSheetByName(S.COORDINACION);

  var resp = ui.alert('Ir a CREATIVO',
    '¿Quieres ir a tu hoja CREATIVO (solo tus columnas)?\n\n' +
    '"SI" = Hoja CREATIVO\n"NO" = COORDINACION (col P)',
    ui.ButtonSet.YES_NO);

  if (resp === ui.Button.YES) {
    if (crSheet) { ss.setActiveSheet(crSheet); crSheet.getRange('A3').activate(); }
  } else {
    if (coSheet) { ss.setActiveSheet(coSheet); coSheet.getRange('P3').activate(); }
  }
}

function irATecnico() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tSheet = ss.getSheetByName(S.TECNICO);
  var coSheet = ss.getSheetByName(S.COORDINACION);

  var resp = ui.alert('Ir a TECNICO',
    '¿Quieres ir a tu hoja TECNICO (solo tus columnas)?\n\n' +
    '"SI" = Hoja TECNICO\n"NO" = COORDINACION (col V)',
    ui.ButtonSet.YES_NO);

  if (resp === ui.Button.YES) {
    if (tSheet) { ss.setActiveSheet(tSheet); tSheet.getRange('A3').activate(); }
  } else {
    if (coSheet) { ss.setActiveSheet(coSheet); coSheet.getRange('V3').activate(); }
  }
}

function irATrazo() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var trSheet = ss.getSheetByName(S.TRAZO_Y_CORTE);
  var coSheet = ss.getSheetByName(S.COORDINACION);

  var resp = ui.alert('Ir a TRAZO Y CORTE',
    '¿Quieres ir a tu hoja TRAZO_Y_CORTE (solo tus columnas)?\n\n' +
    '"SI" = Hoja TRAZO_Y_CORTE\n"NO" = COORDINACION (col AM)',
    ui.ButtonSet.YES_NO);

  if (resp === ui.Button.YES) {
    if (trSheet) { ss.setActiveSheet(trSheet); trSheet.getRange('A3').activate(); }
  } else {
    if (coSheet) { ss.setActiveSheet(coSheet); coSheet.getRange('AM3').activate(); }
  }
}

function irAContramuestra() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(S.COORDINACION);
  if (sheet) sheet.getRange('BD3').activate();
}

// ── CONTROL DE EDICION ─────────────────────────────────────────────────────

function onEdit(e) {
  try {
    var range = e.range;
    var sheet = range.getSheet();
    var sheetName = sheet.getName();
    var row = range.getRow();
    var col = range.getColumn();
    var newValue = e.value || '';

    // Solo procesar hojas de rol
    if (sheetName !== S.CREATIVO && sheetName !== S.TECNICO &&
        sheetName !== S.TRAZO_Y_CORTE && sheetName !== S.COORDINACION) {
      return;
    }

    // Ignorar fila 1-2 (headers)
    if (row < 3) return;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var maestraSheet = ss.getSheetByName(S.MAESTRA);

    // ── Si edito en COORDINACION ──
    if (sheetName === S.COORDINACION) {
      // Escribir en MAESTRA
      if (maestraSheet) {
        maestraSheet.getRange(row, col).setValue(newValue);
      }
      // Propagar a hojas de rol
      propagarDeMaestraARoles(ss, row, col);
      return;
    }

    // ── Si edito en hoja de rol ──
    var rol = sheetName;
    var proteccion = PROTEGIDAS[rol];

    // Verificar si la columna es protegida
    if (proteccion && proteccion.indexOf(col) >= 0) {
      range.setValue(e.oldValue || '');
      SpreadsheetApp.getUi().alert(
        'Columna protegida',
        'Esta columna es de solo lectura. No puedes modificarla desde tu hoja de rol.\n\n' +
        'Si necesitas cambiar este dato, pidele a un ADMIN que lo haga desde COORDINACION.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    // Columna editable: escribir en MAESTRA
    var colMaestra = MAPEO[rol] ? MAPEO[rol][col] : null;
    if (colMaestra && maestraSheet) {
      maestraSheet.getRange(row, colMaestra).setValue(newValue);
    }

    // Propagar a COORDINACION
    var coordSheet = ss.getSheetByName(S.COORDINACION);
    if (coordSheet && colMaestra) {
      coordSheet.getRange(row, colMaestra).setValue(newValue);
    }

  } catch (err) {
    Logger.log('Error en onEdit: ' + err.toString());
  }
}

// ── PROPAGAR DE MAESTRA A ROLES (cuando admin edita en COORDINACION) ──────

function propagarDeMaestraARoles(ss, row, colMaestra) {
  var coordSheet = ss.getSheetByName(S.COORDINACION);
  if (!coordSheet) return;
  var valor = coordSheet.getRange(row, colMaestra).getValue();

  // Buscar en cual mapeo aparece esta columna
  var roles = [S.CREATIVO, S.TECNICO, S.TRAZO_Y_CORTE];
  for (var r = 0; r < roles.length; r++) {
    var rol = roles[r];
    var mapping = MAPEO[rol];
    if (!mapping) continue;

    var colLocal = buscarColumnaEnMapeo(mapping, colMaestra);
    if (colLocal) {
      var rolSheet = ss.getSheetByName(rol);
      if (rolSheet) {
        rolSheet.getRange(row, colLocal).setValue(valor);
      }
    }
  }
}

function buscarColumnaEnMapeo(mapping, colMaestra) {
  var keys = Object.keys(mapping);
  for (var k = 0; k < keys.length; k++) {
    if (mapping[keys[k]] === colMaestra) return parseInt(keys[k]);
  }
  return null;
}

// ── SINCRONIZACION COMPLETA ────────────────────────────────────────────────

function sincronizarTodo() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var resp = ui.alert('Sincronizar todo',
    'Esto va a REEMPLAZAR todos los datos en las hojas de rol\n' +
    'con los datos de _MAESTRA.\n\n' +
    '¿Estas seguro?',
    ui.ButtonSet.YES_NO);

  if (resp !== ui.Button.YES) return;

  var maestraSheet = ss.getSheetByName(S.MAESTRA);
  if (!maestraSheet) {
    ui.alert('Error', 'Hoja _MAESTRA no encontrada.', ui.ButtonSet.OK);
    return;
  }

  // Primero sincronizar COORDINACION desde MAESTRA
  sincronizarHojaCompleta(maestraSheet, S.COORDINACION);

  // Luego sincronizar hojas de rol
  sincronizarRolDesdeMaestra(maestraSheet, S.CREATIVO, MAPEO[S.CREATIVO]);
  sincronizarRolDesdeMaestra(maestraSheet, S.TECNICO, MAPEO[S.TECNICO]);
  sincronizarRolDesdeMaestra(maestraSheet, S.TRAZO_Y_CORTE, MAPEO[S.TRAZO_Y_CORTE]);

  ui.alert('Sincronizacion completada',
    'Todas las hojas han sido actualizadas desde _MAESTRA.',
    ui.ButtonSet.OK);
}

function sincronizarHojaCompleta(origen, destinoNombre) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var origenSheet = origen;
  var destinoSheet = ss.getSheetByName(destinoNombre);
  if (!destinoSheet) return;

  // Limpiar datos (preservar headers en filas 1-2)
  var lastRow = origenSheet.getLastRow();
  var lastCol = origenSheet.getLastColumn();
  if (lastRow > 2) {
    destinoSheet.getRange(3, 1, lastRow - 2, lastCol).clearContent();
  }

  // Copiar datos desde fila 3
  if (lastRow >= 3) {
    var data = origenSheet.getRange(3, 1, lastRow - 2, lastCol).getValues();
    if (data.length > 0) {
      destinoSheet.getRange(3, 1, data.length, data[0].length).setValues(data);
    }
  }
}

function sincronizarRolDesdeMaestra(maestraSheet, rolNombre, mapping) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rolSheet = ss.getSheetByName(rolNombre);
  if (!rolSheet || !mapping) return;

  var lastRow = maestraSheet.getLastRow();
  if (lastRow < 3) return;

  var numFilas = lastRow - 2;
  var numColsRol = Object.keys(mapping).length;

  // Limpiar
  rolSheet.getRange(3, 1, numFilas, numColsRol).clearContent();

  // Leer solo columnas necesarias de MAESTRA
  var colsNecesarias = [];
  var mapeo_inverso = {};
  for (var local = 1; local <= numColsRol; local++) {
    var mc = mapping[local];
    if (mc) {
      colsNecesarias.push(mc);
      mapeo_inverso[mc] = local;
    }
  }

  // Para cada fila, leer de MAESTRA y escribir en rol
  for (var r = 3; r <= lastRow; r++) {
    for (var ci = 0; ci < colsNecesarias.length; ci++) {
      var colMaestra = colsNecesarias[ci];
      var val = maestraSheet.getRange(r, colMaestra).getValue();
      var colLocal = mapeo_inverso[colMaestra];
      if (colLocal) {
        rolSheet.getRange(r, colLocal).setValue(val);
      }
    }
  }
}

// ── INICIALIZAR DESDE CERO ─────────────────────────────────────────────────

function inicializarTodo() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var resp = ui.alert('Inicializar desde cero',
    'ATENCION: Esto poblara TODAS las hojas de rol desde _MAESTRA.\n' +
    'Los datos existentes en hojas de rol seran REEMPLAZADOS.\n\n' +
    'Ejecutar SOLO al crear el archivo por primera vez.',
    ui.ButtonSet.YES_NO);

  if (resp !== ui.Button.YES) return;

  // Mostrar MAESTRA temporalmente
  var maestraSheet = ss.getSheetByName(S.MAESTRA);
  if (maestraSheet) maestraSheet.showSheet();

  // Poblar COORDINACION desde MAESTRA
  sincronizarHojaCompleta(maestraSheet, S.COORDINACION);

  // Poblar hojas de rol
  sincronizarRolDesdeMaestra(maestraSheet, S.CREATIVO, MAPEO[S.CREATIVO]);
  sincronizarRolDesdeMaestra(maestraSheet, S.TECNICO, MAPEO[S.TECNICO]);
  sincronizarRolDesdeMaestra(maestraSheet, S.TRAZO_Y_CORTE, MAPEO[S.TRAZO_Y_CORTE]);

  // Volver a ocultar MAESTRA
  if (maestraSheet) maestraSheet.hideSheet();

  ui.alert('Inicializacion completada',
    'Las hojas de rol han sido pobladas desde _MAESTRA.\n\n' +
    'PROXIMO PASO: comparte el archivo y dile a cada rol que use SU hoja.',
    ui.ButtonSet.OK);
}
