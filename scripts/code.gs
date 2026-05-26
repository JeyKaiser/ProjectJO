/**
 * AtelierData - Sistema de Validacion de Telas
 * Google Apps Script para Google Sheets
 * 
 * Funcionalidades:
 * - Control de acceso por rol (onEdit)
 * - Auto-completado desde PARAMETROS
 * - Historial de cambios automatico
 * - Comparacion Costeo vs Contramuestra (>5% alerta)
 * - Envio de correos de alerta
 * - Dashboard ejecutivo
 * - Gestion de imagenes via Google Drive
 * - Menu personalizado
 */

// ── CONFIGURACION ──────────────────────────────────────────────────────────

var CONFIG = {
  // Hojas del sistema
  SHEETS: {
    REFERENCIAS: 'REFERENCIAS',
    TELAS: 'TELAS_X_REFERENCIA',
    CONSUMOS: 'CONSUMOS',
    CONSUMOS_CONTRA: 'CONSUMOS_CONTRAMUESTRA',
    INSUMOS: 'INSUMOS',
    PARAMETROS: 'PARAMETROS',
    HISTORIAL: 'HISTORIAL',
    ALERTAS: 'ALERTAS',
    RESUMEN: 'RESUMEN'
  },

  // Mapeo de usuarios a roles (editar con emails reales)
   ROLES: {
    'jeferson.chacon@johannaortiz.com': 'CREATIVO',
    'maria.burgos@johannaortiz.com': 'CREATIVO',   
    'yamileth.rocero@johannaortiz.com': 'CREATIVO',
    'osman.lopez@johannaortiz.com': 'CREATIVO',
    'margarita.olivo@johannaortiz.com': 'CREATIVO',
    'maria.ordonez@johannaortiz.com': 'CREATIVO',
    'claudia.reyes@johannaortiz.com': 'CREATIVO',
    'fernando.castano@johannaortiz.com': 'CREATIVO',
    'marisol.riascos@johannaortiz.com': 'TECNICO',
    'camila.villegas@johannaortiz.com': 'TECNICO',
    'cristian.gomez@johannaortiz.com': 'TECNICO',
    'daniela.garcia@johannaortiz.com': 'TECNICO',
    'karolin.cumbal@johannaortiz.com': 'TECNICO',
    'kelly.albarracin@johannaortiz.com': 'TECNICO',
    'kenny.lasso@johannaortiz.com': 'TECNICO',
    'lina.delgado@johannaortiz.com': 'TECNICO',
    'nathaly.contreras@johannaortiz.com': 'TECNICO',
    'jeferson.chacon@johannaortiz.com': 'TRAZO_Y_CORTE',
    'diego.valencia@johannaortiz.com': 'TRAZO_Y_CORTE',
    'jeferson.chacon@johannaortiz.com': 'ADMIN',
    'camila.reyes@johannaortiz.com': 'ADMIN',
    'lina.pena@johannaortiz.com': 'ADMIN'
  },

  // Umbral de alerta (%)
  ALERTA_UMBRAL: 5,

  // Carpeta de Drive para imagenes
  DRIVE_FOLDER_NAME: 'NUEVA ESTRUCTURA JO/JO - Fotos Maestro',

  // Email para alertas
  ALERT_EMAIL: 'jeferson.chacon@johannaortiz.com',

  // Columnas protegidas por area (indices de columna en CONSUMOS)
  // A=1, B=2, ..., D=AREA(4), E=TIPO_TELA(5), ..., I=CONSUMO_VALOR(9), J=OBS(10), ...
  CREATIVO_COLS: [],
  TECNICO_COLS: [],
  TRAZO_COLS: []
};

// ── MENU PERSONALIZADO ────────────────────────────────────────────────────

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('AtelierData')
    .addItem('Actualizar Dashboard', 'actualizarDashboard')
    .addSeparator()
    .addSubMenu(ui.createMenu('Fotos')
      .addItem('Subir foto de referencia', 'subirFotoReferencia')
      .addItem('Subir foto de tela', 'subirFotoTela')
      .addItem('Escanear PRENDAS', 'escanearCarpetaFotos')
      .addItem('Escanear TELAS', 'escanearCarpetaTelas'))
    .addSeparator()
    .addSubMenu(ui.createMenu('Consumos')
      .addItem('Nueva version de consumo', 'nuevaVersionConsumo')
      .addItem('Marcar como final (costeo)', 'marcarConsumoFinal'))
    .addSeparator()
    .addItem('Comparar Costeo vs Contramuestra', 'compararConsumos')
    .addItem('Enviar alertas por correo', 'enviarCorreoAlertas')
    .addSeparator()
    .addItem('Importar parametros', 'importarParametros')
    .addItem('Agregar tela a referencia', 'agregarTelaReferencia')
    .addToUi();
}

// ── CONTROL DE EDICION POR ROL ────────────────────────────────────────────

function onEdit(e) {
  try {
    var range = e.range;
    var sheet = range.getSheet();
    var sheetName = sheet.getName();
    var userEmail = Session.getActiveUser().getEmail();
    var oldValue = e.oldValue || '';
    var newValue = e.value || '';

    // Si no hay cambio real, salir
    if (oldValue === newValue) return;

    // Determinar rol del usuario
    var rol = getRolUsuario(userEmail);

    // 1. Registrar en historial
    registrarHistorial(sheetName, range, oldValue, newValue, userEmail);

    // 2. Validar permisos por rol
    if (!validarPermiso(rol, sheetName, range, e)) {
      range.setValue(oldValue);
      SpreadsheetApp.getUi().alert(
        'Acceso denegado',
        'No tienes permisos para editar esta celda.\nRol: ' + rol,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    // 3. Auto-completado desde PARAMETROS
    if (sheetName === CONFIG.SHEETS.TELAS && range.getColumn() === 4) {
      // Columna D = CODIGO_TELA -> auto-completar DESCRIPCION y ANCHO
      autoCompletarTela(range);
    }

    // 4. Validaciones de negocio
    validarReglasNegocio(sheetName, range, newValue);

    // 5. Formato condicional dinamico
    aplicarFormatoDinamico(sheet, range);

    // 6. Actualizar timestamps
    if (sheetName === CONFIG.SHEETS.REFERENCIAS) {
      actualizarTimestamps(sheet, range);
    }

  } catch (err) {
    Logger.log('Error en onEdit: ' + err.toString());
  }
}

// ── ROLES Y PERMISOS ───────────────────────────────────────────────────────

function getRolUsuario(email) {
  if (CONFIG.ROLES[email]) return CONFIG.ROLES[email];
  return 'CONSULTA'; // Rol por defecto: solo lectura
}

function validarPermiso(rol, sheetName, range, e) {
  // ADMIN puede todo
  if (rol === 'ADMIN') return true;
  // CONSULTA no puede nada
  if (rol === 'CONSULTA') return false;

  var col = range.getColumn();
  var row = range.getRow();

  // Solo hojas especificas son editables por rol
  var hojasPermitidas = [];
  switch (rol) {
    case 'CREATIVO':
      hojasPermitidas = [CONFIG.SHEETS.CONSUMOS];
      break;
    case 'TECNICO':
      hojasPermitidas = [CONFIG.SHEETS.CONSUMOS];
      break;
    case 'TRAZO_Y_CORTE':
      hojasPermitidas = [CONFIG.SHEETS.CONSUMOS, CONFIG.SHEETS.CONSUMOS_CONTRA];
      break;
  }

  if (hojasPermitidas.indexOf(sheetName) === -1) return false;

  // En CONSUMOS, validar que solo edite filas de su area
  if (sheetName === CONFIG.SHEETS.CONSUMOS) {
    var areaCell = sheet.getRange(row, 4); // Columna D = AREA
    var areaFila = areaCell.getValue();

    // Proteger columna AREA (D) y columna ES_FINAL (M) excepto para TRAZO
    if (col === 4 || (col === 13 && rol !== 'TRAZO_Y_CORTE')) return false;

    // Validar que la fila corresponda a su area
    switch (rol) {
      case 'CREATIVO':
        return areaFila === 'CREATIVO';
      case 'TECNICO':
        return areaFila === 'TECNICO';
      case 'TRAZO_Y_CORTE':
        return areaFila === 'TRAZO_Y_CORTE';
    }
  }

  return true;
}


// ── ESCANEO DE CARPETA DE FOTOS ───────────────────────────────────────────────

function escanearCarpetaFotos() {
  var refSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.REFERENCIAS);
  if (!refSheet) {
    SpreadsheetApp.getUi().alert('Error: No se encontro la hoja REFERENCIAS');
    return;
  }
  var folder = getOrCreateDriveFolder(); // raiz: JO - Fotos Maestro
  var files = folder.getFiles();
  var procesados = 0, saltados = 0, sinMatch = 0;

  while (files.hasNext()) {
    var file = files.next();
    var name = file.getName();
    // Solo PRENDA: WS27_5_PRENDA.jpg
    var match = name.match(/^(WS27|FW26|RS26|SS26|SV26|PF26)_(\d+)_PRENDA\./i);
    if (!match) { saltados++; continue; }

    var refCode = match[2];
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var url = file.getUrl();

    var data = refSheet.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]) === refCode) { // Col B = REF
        refSheet.getRange(i + 1, 3).setValue(url); // Col C = FOTO_URL
        found = true; break;
      }
    }
    if (found) procesados++;
    else { sinMatch++; Logger.log('PRENDA sin match: ' + name + ' (REF=' + refCode + ')'); }
  }

  var msg = 'Escaneo PRENDAS: ' + procesados + ' fotos registradas.';
  if (saltados > 0) msg += '\n' + saltados + ' archivos saltados (nombre invalido).';
  if (sinMatch > 0) msg += '\n' + sinMatch + ' archivos sin match (ver Logs).';
  SpreadsheetApp.getUi().alert(msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function escanearCarpetaTelas() {
  var telaSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.TELAS);
  if (!telaSheet) {
    SpreadsheetApp.getUi().alert('Error: No se encontro la hoja TELAS_X_REFERENCIA');
    return;
  }
  var folder = getOrCreateDriveFolder(); // raiz: JO - Fotos Maestro
  var files = folder.getFiles();
  var procesados = 0, saltados = 0, sinMatch = 0;

  while (files.hasNext()) {
    var file = files.next();
    var name = file.getName();
    // Solo TELA: WS27_TE00007842_TELA.png
    var match = name.match(/^(WS27|FW26|RS26|SS26|SV26|PF26)_([A-Z0-9]+)_TELA\./i);
    if (!match) { saltados++; continue; }

    var refCode = match[2];
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var url = file.getUrl();

    var data = telaSheet.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][3]) === refCode) { // Col D = CODIGO_TELA
        telaSheet.getRange(i + 1, 7).setValue(url); // Col G = TELA_FOTO_URL
        found = true; break;
      }
    }
    if (found) procesados++;
    else { sinMatch++; Logger.log('TELA sin match: ' + name + ' (CODIGO=' + refCode + ')'); }
  }

  var msg = 'Escaneo TELAS: ' + procesados + ' fotos registradas.';
  if (saltados > 0) msg += '\n' + saltados + ' archivos saltados (nombre invalido).';
  if (sinMatch > 0) msg += '\n' + sinMatch + ' archivos sin match (ver Logs).';
  SpreadsheetApp.getUi().alert(msg, SpreadsheetApp.getUi().ButtonSet.OK);
}


// ── AUTO-COMPLETADO ────────────────────────────────────────────────────────

function autoCompletarTela(range) {
  var codigo = range.getValue();
  if (!codigo) return;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.PARAMETROS);
  var codigos = sheet.getRange('F2:F200').getValues();
  var descripciones = sheet.getRange('G2:G200').getValues();

  for (var i = 0; i < codigos.length; i++) {
    if (codigos[i][0].toString().trim() === codigo.toString().trim()) {
      var row = range.getRow();
      var telaSheet = range.getSheet();
      telaSheet.getRange(row, 5).setValue(descripciones[i][0]); // Columna E = DESCRIPCION
      break;
    }
  }
}

// ── HISTORIAL ──────────────────────────────────────────────────────────────

function registrarHistorial(sheetName, range, oldValue, newValue, usuario) {
  try {
    var histSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.HISTORIAL);
    if (!histSheet) return;

    histSheet.appendRow([
      new Date(),
      usuario,
      sheetName,
      range.getRow(),
      columnToLetter(range.getColumn()),
      oldValue,
      newValue
    ]);
  } catch (e) {
    // Silencioso si falla
  }
}

// ── TIMESTAMPS ─────────────────────────────────────────────────────────────

function actualizarTimestamps(sheet, range) {
  var row = range.getRow();
  if (row < 2) return; // Skip header
  sheet.getRange(row, 14).setValue(new Date()); // Columna N = ULTIMA_MODIFICACION
  sheet.getRange(row, 15).setValue(Session.getActiveUser().getEmail()); // Columna O
}

// ── VALIDACIONES DE NEGOCIO ────────────────────────────────────────────────

function validarReglasNegocio(sheetName, range, newValue) {
  if (sheetName !== CONFIG.SHEETS.CONSUMOS) return;

  var col = range.getColumn();
  var row = range.getRow();
  var sheet = range.getSheet();

  // R02: CONSUMO_VALOR (col I=9) no puede ser 0 si ref no esta cancelada
  if (col === 9 && newValue === 0) {
    var refId = sheet.getRange(row, 3).getValue(); // Col C = ID_REFERENCIA
    var refSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.REFERENCIAS);
    var refsData = refSheet.getDataRange().getValues();
    var cancelada = false;
    for (var i = 1; i < refsData.length; i++) {
      if (refsData[i][0] === refId && refsData[i][10] === true) { // Col K = OCULTO
        cancelada = true;
        break;
      }
    }
    if (!cancelada) {
      SpreadsheetApp.getUi().alert(
        'Validacion R02',
        'El consumo no puede ser 0 en una referencia activa.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
  }

  // R03: Si ES_FINAL=TRUE, verificar que no haya otro TRUE para la misma tela/area
  if (col === 13 && newValue === true) { // Col M = ES_FINAL
    var telaId = sheet.getRange(row, 2).getValue();
    var area = sheet.getRange(row, 4).getValue();
    var allData = sheet.getDataRange().getValues();

    for (var i = 1; i < allData.length; i++) {
      if (i + 1 !== row && allData[i][1] === telaId && allData[i][3] === area && allData[i][12] === true) {
        sheet.getRange(i + 1, 13).setValue(false); // Desmarcar el anterior
        break;
      }
    }
  }
}

// ── FORMATO CONDICIONAL DINAMICO ───────────────────────────────────────────

function aplicarFormatoDinamico(sheet, range) {
  if (sheet.getName() !== CONFIG.SHEETS.TELAS) return;
  var row = range.getRow();
  var col = range.getColumn();

  // Si cambia ACTIVO (col I=9), pintar toda la fila
  if (col === 9) {
    var activo = range.getValue();
    var numCols = sheet.getLastColumn();
    var filaRange = sheet.getRange(row, 1, 1, numCols);

    if (activo === false) {
      filaRange.setBackground('#b7b7b7'); // Gris = descontinuada
    } else {
      filaRange.setBackground('#ffffff'); // Blanco = activa
    }
  }
}

// ── SUBIR IMAGEN A DRIVE ───────────────────────────────────────────────────

function subirFotoReferencia() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSheet();
  var row = sheet.getActiveCell().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.REFERENCIAS) {
    ui.alert('Error', 'Seleccione una fila en la hoja REFERENCIAS', ui.ButtonSet.OK);
    return;
  }

  var ref = sheet.getRange(row, 2).getValue();
  var html = HtmlService.createHtmlOutput(
    '<input type="file" id="f" accept="image/*" onchange="document.getElementById(\'btn\').disabled=false"><br><br>' +
    '<button id="btn" onclick="enviar()" disabled style="padding:8px 24px;cursor:pointer;background:#2C3E50;color:white;border:none;border-radius:4px;font-size:14px;">Subir Foto</button>' +
    '<p id="msg"></p>' +
    '<script>' +
    'function enviar(){' +
    '  var input=document.getElementById("f");' +
    '  if(!input.files[0])return;' +
    '  var file=input.files[0];' +
    '  var reader=new FileReader();' +
    '  reader.onload=function(e){' +
    '    var base64=e.target.result.split(",")[1];' +
    '    var mime=file.type;' +
    '    var name=file.name;' +
    '    document.getElementById("msg").innerHTML="Subiendo...";' +
    '    google.script.run' +
    '      .withSuccessHandler(function(url){google.script.host.close()})' +
    '      .withFailureHandler(function(e){document.getElementById("msg").innerHTML="<span style=color:red>Error: "+e.message+"</span>"})' +
    '      .uploadFotoBytes(base64,name,mime,' + row + ');' +
    '  };' +
    '  reader.readAsDataURL(file);' +
    '}' +
    '</script>'
  ).setWidth(380).setHeight(160);

  ui.showModalDialog(html, 'Subir foto - Ref ' + ref);
}

function uploadFotoBytes(base64data, filename, mimetype, row) {
  var decoded = Utilities.base64Decode(base64data);
  var blob = Utilities.newBlob(decoded, mimetype, filename);
  var folder = getOrCreateDriveFolder();
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.REFERENCIAS);
  sheet.getRange(row, 3).setValue(file.getUrl());
  return file.getUrl();
}

function subirFotoTela() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSheet();
  var row = sheet.getActiveCell().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.TELAS) {
    ui.alert('Error', 'Seleccione una fila en la hoja TELAS_X_REFERENCIA', ui.ButtonSet.OK);
    return;
  }

  var html = HtmlService.createHtmlOutput(
    '<input type="file" id="f" accept="image/*" onchange="document.getElementById(\'btn\').disabled=false"><br><br>' +
    '<button id="btn" onclick="enviar()" disabled style="padding:8px 24px;cursor:pointer;background:#2C3E50;color:white;border:none;border-radius:4px;font-size:14px;">Subir Foto</button>' +
    '<p id="msg"></p>' +
    '<script>' +
    'function enviar(){' +
    '  var input=document.getElementById("f");' +
    '  if(!input.files[0])return;' +
    '  var file=input.files[0];' +
    '  var reader=new FileReader();' +
    '  reader.onload=function(e){' +
    '    var base64=e.target.result.split(",")[1];' +
    '    var mime=file.type;' +
    '    var name=file.name;' +
    '    document.getElementById("msg").innerHTML="Subiendo...";' +
    '    google.script.run' +
    '      .withSuccessHandler(function(url){google.script.host.close()})' +
    '      .withFailureHandler(function(e){document.getElementById("msg").innerHTML="<span style=color:red>Error: "+e.message+"</span>"})' +
    '      .uploadFotoTelaBytes(base64,name,mime,' + row + ');' +
    '  };' +
    '  reader.readAsDataURL(file);' +
    '}' +
    '</script>'
  ).setWidth(380).setHeight(160);

  ui.showModalDialog(html, 'Subir foto de tela');
}

function uploadFotoTelaBytes(base64data, filename, mimetype, row) {
  var decoded = Utilities.base64Decode(base64data);
  var blob = Utilities.newBlob(decoded, mimetype, filename);
  var folder = getOrCreateDriveFolder();
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.TELAS);
  sheet.getRange(row, 7).setValue(file.getUrl());
  return file.getUrl();
}

function getOrCreateDriveFolder(subFolder) {
  var rootFolders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
  var root = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);
  if (!subFolder) return root;
  
  // Buscar ignorando mayusculas/minusculas (DriveApp es case-sensitive)
  var allFolders = root.getFolders();
  while (allFolders.hasNext()) {
    var f = allFolders.next();
    if (f.getName().toUpperCase() === subFolder.toUpperCase()) return f;
  }
  // Si no existe, crearla con el nombre exacto dado
  return root.createFolder(subFolder);
}

// ── GESTION DE CONSUMOS ────────────────────────────────────────────────────

function nuevaVersionConsumo() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var row = sheet.getActiveCell().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.CONSUMOS) {
    SpreadsheetApp.getUi().alert('Error', 'Seleccione una fila en la hoja CONSUMOS', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  if (row < 2) return;

  // Copiar la fila actual como nueva version
  var lastRow = sheet.getLastRow();
  var sourceRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());
  var destRange = sheet.getRange(lastRow + 1, 1);

  sourceRange.copyTo(destRange);

  // Incrementar version
  var currentVersion = sheet.getRange(row, 6).getValue(); // Col F = VERSION
  sheet.getRange(lastRow + 1, 6).setValue(Number(currentVersion) + 1);

  // Limpiar valor de consumo y observaciones
  sheet.getRange(lastRow + 1, 9).setValue(''); // CONSUMO_VALOR
  sheet.getRange(lastRow + 1, 10).setValue(''); // OBSERVACIONES

  // Marcar ES_FINAL = FALSE
  sheet.getRange(lastRow + 1, 13).setValue(false);

  // Actualizar fechas
  sheet.getRange(lastRow + 1, 14).setValue(new Date());
  sheet.getRange(lastRow + 1, 15).setValue(Session.getActiveUser().getEmail());

  sheet.getRange(lastRow + 1, 9).activate();
}

function marcarConsumoFinal() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var row = sheet.getActiveCell().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.CONSUMOS) {
    SpreadsheetApp.getUi().alert('Error', 'Seleccione una fila en CONSUMOS', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var area = sheet.getRange(row, 4).getValue();
  if (area !== 'TRAZO_Y_CORTE') {
    var resp = SpreadsheetApp.getUi().alert(
      'Confirmar',
      'Solo Trazo y Corte deberia marcar consumos finales. Continuar?',
      SpreadsheetApp.getUi().ButtonSet.YES_NO
    );
    if (resp !== SpreadsheetApp.getUi().Button.YES) return;
  }

  sheet.getRange(row, 13).setValue(true); // ES_FINAL
  SpreadsheetApp.getUi().alert('OK', 'Consumo marcado como final de costeo.', SpreadsheetApp.getUi().ButtonSet.OK);
}

function agregarTelaReferencia() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var row = sheet.getActiveCell().getRow();

  if (sheet.getName() !== CONFIG.SHEETS.REFERENCIAS) {
    SpreadsheetApp.getUi().alert('Error', 'Seleccione una referencia en REFERENCIAS', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var refId = sheet.getRange(row, 1).getValue();
  var telaSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.TELAS);
  var lastRow = telaSheet.getLastRow();
  var newRow = lastRow + 1;

  // Generar nuevo ID
  var maxId = 0;
  var ids = telaSheet.getRange('A2:A' + lastRow).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] && Number(ids[i][0]) > maxId) maxId = Number(ids[i][0]);
  }

  var ultimoOrden = 0;
  var ordenes = telaSheet.getRange('M2:M' + lastRow).getValues();
  for (var j = 0; j < ordenes.length; j++) {
    if (ordenes[j][0] && Number(ordenes[j][0]) > ultimoOrden) ultimoOrden = Number(ordenes[j][0]);
  }

  telaSheet.getRange(newRow, 1).setValue(maxId + 1); // ID_TELA
  telaSheet.getRange(newRow, 2).setValue(refId); // ID_REFERENCIA
  telaSheet.getRange(newRow, 9).setValue(true); // ACTIVO = TRUE
  telaSheet.getRange(newRow, 13).setValue(ultimoOrden + 1); // ORDEN

  telaSheet.getRange(newRow, 3).activate(); // Posicionar en USO_EN_PRENDA
}

// ── COMPARACION COSTEO vs CONTRAMUESTRA ────────────────────────────────────

function compararConsumos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var consumosSheet = ss.getSheetByName(CONFIG.SHEETS.CONSUMOS);
  var contraSheet = ss.getSheetByName(CONFIG.SHEETS.CONSUMOS_CONTRA);
  var alertasSheet = ss.getSheetByName(CONFIG.SHEETS.ALERTAS);
  var refSheet = ss.getSheetByName(CONFIG.SHEETS.REFERENCIAS);

  if (!consumosSheet || !contraSheet) {
    SpreadsheetApp.getUi().alert('Error', 'Faltan hojas CONSUMOS o CONSUMOS_CONTRAMUESTRA', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var consumosData = consumosSheet.getDataRange().getValues();
  var contraData = contraSheet.getDataRange().getValues();
  var refsData = refSheet.getDataRange().getValues();

  var alertas = [];

  // Para cada consumo final de costeo (ES_FINAL=TRUE, col 13)
  for (var i = 1; i < consumosData.length; i++) {
    if (consumosData[i][12] !== true) continue; // Solo ES_FINAL=TRUE

    var telaId = consumosData[i][1];
    var refId = consumosData[i][2];
    var tipoTela = consumosData[i][4];
    var consumoCosteo = Number(consumosData[i][8]);

    if (!consumoCosteo || consumoCosteo === 0) continue;

    // Buscar consumo de contramuestra correspondiente
    for (var j = 1; j < contraData.length; j++) {
      if (contraData[j][1] === telaId && contraData[j][3] === tipoTela) {
        var consumoContra = Number(contraData[j][7]);
        if (!consumoContra || consumoContra === 0) continue;

        var diferencia = Math.abs(consumoCosteo - consumoContra);
        var porcentaje = (diferencia / consumoCosteo) * 100;

        if (porcentaje > CONFIG.ALERTA_UMBRAL) {
          alertas.push({
            refId: refId,
            telaId: telaId,
            costeo: consumoCosteo,
            contramuestra: consumoContra,
            diferencia: porcentaje
          });
        }
      }
    }
  }

  // Registrar alertas en la hoja ALERTAS
  if (alertasSheet) {
    for (var k = 0; k < alertas.length; k++) {
      var a = alertas[k];
      alertasSheet.appendRow([
        alertasSheet.getLastRow(), // ID simple
        new Date(),
        a.refId,
        a.telaId,
        a.costeo,
        a.contramuestra,
        Math.round(a.diferencia * 100) / 100,
        false,
        ''
      ]);
    }
  }

  // Mostrar resumen
  if (alertas.length > 0) {
    var msg = 'Se encontraron ' + alertas.length + ' diferencias > ' + CONFIG.ALERTA_UMBRAL + '%:\n\n';
    for (var l = 0; l < Math.min(alertas.length, 10); l++) {
      msg += 'Ref ' + alertas[l].refId + ', Tela ' + alertas[l].telaId +
        ': Costeo=' + alertas[l].costeo + ' vs Contra=' + alertas[l].contramuestra +
        ' (' + Math.round(alertas[l].diferencia * 100) / 100 + '%)\n';
    }
    SpreadsheetApp.getUi().alert('Alertas de Consumo', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  } else {
    SpreadsheetApp.getUi().alert('OK', 'No se encontraron diferencias > ' + CONFIG.ALERTA_UMBRAL + '%', SpreadsheetApp.getUi().ButtonSet.OK);
  }

  return alertas;
}

// ── ENVIO DE CORREO DE ALERTAS ─────────────────────────────────────────────

function enviarCorreoAlertas() {
  var alertasSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.ALERTAS);
  if (!alertasSheet) {
    SpreadsheetApp.getUi().alert('Error', 'Hoja ALERTAS no encontrada', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var data = alertasSheet.getDataRange().getValues();
  var pendientes = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][7] !== true) { // ENVIADA = false
      pendientes.push(data[i]);
    }
  }

  if (pendientes.length === 0) {
    SpreadsheetApp.getUi().alert('OK', 'No hay alertas pendientes de envio', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  var refSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.REFERENCIAS);
  var refsData = refSheet.getDataRange().getValues();
  var telaSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.TELAS);
  var telasData = telaSheet.getDataRange().getValues();

  var subject = '[AtelierData] Alertas de Consumo - Diferencias > ' + CONFIG.ALERTA_UMBRAL + '%';
  var body = 'Se detectaron las siguientes diferencias entre Costeo y Contramuestra:\n\n';
  body += 'REF | TELA | COSTEO | CONTRAMUESTRA | DIF %\n';
  body += '----|------|--------|---------------|------\n';

  for (var j = 0; j < pendientes.length; j++) {
    var p = pendientes[j];
    var refName = '';
    var telaName = '';

    for (var r = 1; r < refsData.length; r++) {
      if (refsData[r][0] === p[2]) { refName = refsData[r][1]; break; }
    }
    for (var t = 1; t < telasData.length; t++) {
      if (telasData[t][0] === p[3]) { telaName = telasData[t][2]; break; }
    }

    body += refName + ' | ' + telaName + ' | ' + p[4] + ' | ' + p[5] + ' | ' + p[6] + '%\n';
  }

  body += '\n\nTotal alertas: ' + pendientes.length;
  body += '\n\nRevisar en: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl();

  MailApp.sendEmail({
    to: CONFIG.ALERT_EMAIL,
    subject: subject,
    body: body
  });

  // Marcar como enviadas
  for (var k = 0; k < pendientes.length; k++) {
    var rowIdx = k + 2; // +2 por header
    alertasSheet.getRange(rowIdx, 8).setValue(true); // ENVIADA
    alertasSheet.getRange(rowIdx, 9).setValue(new Date()); // FECHA_ENVIO
  }

  SpreadsheetApp.getUi().alert('Correo enviado', 'Se enviaron ' + pendientes.length + ' alertas a ' + CONFIG.ALERT_EMAIL, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────

function actualizarDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var resumenSheet = ss.getSheetByName(CONFIG.SHEETS.RESUMEN);
  var refSheet = ss.getSheetByName(CONFIG.SHEETS.REFERENCIAS);
  var consumosSheet = ss.getSheetByName(CONFIG.SHEETS.CONSUMOS);
  var telaSheet = ss.getSheetByName(CONFIG.SHEETS.TELAS);
  var alertasSheet = ss.getSheetByName(CONFIG.SHEETS.ALERTAS);

  if (!resumenSheet || !refSheet) return;

  resumenSheet.clear();

  // Encabezado
  resumenSheet.getRange('A1').setValue('DASHBOARD - Validacion de Telas').setFontSize(16).setFontWeight('bold');
  resumenSheet.getRange('A2').setValue('Actualizado: ' + new Date().toLocaleString());

  // KPIs
  var refsData = refSheet.getDataRange().getValues();
  var totalRefs = refsData.length - 1; // -header

  var aprobadas = 0, canceladas = 0, proceso = 0;
  for (var i = 1; i < refsData.length; i++) {
    var st = String(refsData[i][4]).toUpperCase(); // Col E = STATUS
    if (st === 'APROBADO') aprobadas++;
    else if (st === 'CANCELADO') canceladas++;
    else if (st === 'EN_PROCESO' || st === 'EN PROCESO') proceso++;
  }

  var kpis = [
    ['METRICA', 'VALOR'],
    ['Total Referencias', totalRefs],
    ['Aprobadas', aprobadas],
    ['En Proceso', proceso],
    ['Canceladas', canceladas],
    ['Telas Activas', telaSheet ? telaSheet.getDataRange().getValues().filter(function(r) { return r[8] === true; }).length : 0],
    ['Consumos Finales Costeo', consumosSheet ? consumosSheet.getDataRange().getValues().filter(function(r) { return r[12] === true; }).length : 0],
    ['Alertas Pendientes', alertasSheet ? alertasSheet.getDataRange().getValues().filter(function(r) { return r[7] === false; }).length - 1 : 0]
  ];

  resumenSheet.getRange(4, 1, kpis.length, 2).setValues(kpis);

  // Formato
  resumenSheet.getRange('A4:B4').setFontWeight('bold').setBackground('#46bdc6');
  resumenSheet.setColumnWidth(1, 200);
  resumenSheet.setColumnWidth(2, 100);

  SpreadsheetApp.getUi().alert('Dashboard actualizado', 'Los KPIs se han recalculado.', SpreadsheetApp.getUi().ButtonSet.OK);
}

// ── IMPORTAR PARAMETROS ────────────────────────────────────────────────────

function importarParametros() {
  var ui = SpreadsheetApp.getUi();
  var respuesta = ui.prompt(
    'Importar Parametros',
    'Pega la URL del Google Sheet de PARAMETROS:',
    ui.ButtonSet.OK_CANCEL
  );

  if (respuesta.getSelectedButton() !== ui.Button.OK) return;

  var url = respuesta.getResponseText();
  var paramSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.PARAMETROS);

  // Usar IMPORTRANGE para vincular datos
  var formulas = [
    ['=IMPORTRANGE("' + url + '";"PARAMETROS!A2:A")'],
    ['=IMPORTRANGE("' + url + '";"PARAMETROS!B2:B")'],
    ['=IMPORTRANGE("' + url + '";"PARAMETROS!C2:C")']
  ];

  ui.alert('Importacion',
    'Las formulas IMPORTRANGE se insertaran en PARAMETROS.\n' +
    'Asegurate de autorizar el acceso cuando aparezca el mensaje.',
    ui.ButtonSet.OK
  );
}

// ── UTILIDADES ─────────────────────────────────────────────────────────────

function columnToLetter(column) {
  var temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

// ── TRIGGERS INSTALABLES ───────────────────────────────────────────────────

function instalarTriggers() {
  // Eliminar triggers existentes
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // Trigger diario a las 8am para comparar consumos
  ScriptApp.newTrigger('tareaDiariaComparacion')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  // Trigger semanal lunes 8am para enviar correo
  ScriptApp.newTrigger('tareaSemanalCorreo')
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();
}

function tareaDiariaComparacion() {
  compararConsumos();
}

function tareaSemanalCorreo() {
  compararConsumos();
  enviarCorreoAlertas();
}
