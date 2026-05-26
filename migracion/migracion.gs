
jeferson rengifo <jeykokaiser2023@gmail.com>
6:03 (hace 1 hora)
para mí

/**
 * AtelierData - Script de Migracion (Ejecutar UNA SOLA VEZ)
 *
 * Lee el Sheet original "1.VALIDACION DE TELAS", resuelve celdas combinadas,
 * y migra los datos al nuevo formato relacional multi-hoja.
 *
 * INSTRUCCIONES:
 * 1. Crea un Google Sheet NUEVO en blanco
 * 2. Ve a Extensiones > Apps Script, pega este codigo completo
 * 3. Edita ID_SHEET_ORIGEN (linea ~35) con el ID del Sheet original
 *    (Lo sacas de la URL: docs.google.com/spreadsheets/d/<ID>/edit)
 * 4. Ejecuta la funcion migrarTodo()
 * 5. Autoriza los permisos cuando te los pida
 * 6. Espera ~30-60 segundos. Recarga el Sheet.
 * 7. BORRA este script y pega Code.gs (el de automatizacion permanente)
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACION - EDITAR AQUI
// ═══════════════════════════════════════════════════════════════════════════

var ID_SHEET_ORIGEN = "https://docs.google.com/spreadsheets/d/1qR7EC_jcmP3GVI13tf_c9pYmKTfLo7wX3NQkaXIvtGo/edit?gid=1686955175#gid=1686955175";
var HOJA_ORIGEN = "1.VALIDACION DE TELAS";

function extraerIdDeUrl(input) {
  var match = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : input;
}


// ═══════════════════════════════════════════════════════════════════════════
// MAPA DE COLUMNAS (0-indexed desde Google Sheets API, sin freezebar)
// A=0, B=1, ..., O=14, P=15, Q=16, ..., BN=65
// ═══════════════════════════════════════════════════════════════════════════


var C = {
  REF: 0, FOTO: 1, REFERENCIA: 2, STATUS: 3,
  MOD_ARTE: 4, UBI_TRAZO: 5, VAR_COLOR_1: 6, VAR_COLOR_2: 7,
  LARGO: 8, USO_PRENDA: 9, CODIGO_TELA: 10, DESC_TELA: 11,
  ANCHO: 12, TELA_FOTO: 13, CONSUMO_BASE: 14,
  CREATIVO_DIS: 15, CREATIVO_MOLD: 16,
  CREATIVO_C1: 17, CREATIVO_C2: 18, CREATIVO_C3: 19, CREATIVO_OBS: 20,
  TECNICO_DIS: 21,
  TECNICO_SOL_T: 22, TECNICO_SOL_U: 23,
  TECNICO_SOL_C1: 24, TECNICO_SOL_C2: 25, TECNICO_SOL_C3: 26,
  TECNICO_MA_T: 27, TECNICO_MA_U: 28,
  TECNICO_MA_C1: 29, TECNICO_MA_C2: 30, TECNICO_MA_C3: 31,
  TECNICO_UT_T: 32, TECNICO_UT_U: 33,
  TECNICO_UT_C1: 34, TECNICO_UT_C2: 35, TECNICO_UT_C3: 36,
  TECNICO_OBS: 37,
  TRAZO_SOL_T: 38, TRAZO_SOL_U: 39,
  TRAZO_SOL_C1: 40, TRAZO_SOL_C2: 41, TRAZO_SOL_C3: 42, TRAZO_SOL_C4: 43,
  TRAZO_MA_T: 44, TRAZO_MA_U: 45,
  TRAZO_MA_C1: 46, TRAZO_MA_C2: 47, TRAZO_MA_C3: 48, TRAZO_MA_C4: 49,
  TRAZO_UT_T: 50, TRAZO_UT_U: 51, TRAZO_UT_C1: 52, TRAZO_UT_C2: 53, TRAZO_UT_OBS: 54,
  CONTRA_SOL_T: 55, CONTRA_SOL_U: 56, CONTRA_SOL_C1: 57,
  CONTRA_SOL_C2: 58, CONTRA_SOL_C3: 59, CONTRA_SOL_C4: 60,
  CONTRA_MA_T: 61, CONTRA_MA_U: 62, CONTRA_MA_C1: 63,
  CONTRA_MA_C2: 64, CONTRA_MA_C3: 65, CONTRA_MA_C4: 66,
  CONTRA_UT_T: 67, CONTRA_UT_U: 68, CONTRA_UT_C1: 69, CONTRA_UT_C2: 70, CONTRA_OBS: 71
};

var BLOQUE_FILAS = 19;   // Cada referencia ocupa 19 filas
var FILA_INICIO_DATOS = 6; // Fila 7 del sheet = indice 6 (0-indexed) [ACTUALIZADO v2.1: +2 filas header extra]

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════


function limpiar(val) {
  if (val === undefined || val === null || val === "") return "";
  var t = String(val).trim();
  if (t === "#N/A" || t === "#¡REF!" || t === "N/A" || t === "-") return "";
  return t;
}

function esNumeroRef(t) {
  t = limpiar(t);
  return /^\d+$/.test(t);
}

function parseConsumo(val) {
  var t = limpiar(val);
  if (!t) return null;
  t = t.replace(",", ".").replace(/CMS|MTS|Mts/gi, "").trim();
  var n = parseFloat(t);
  return isNaN(n) ? null : n;
}

function contieneInsumos(texto) {
  var t = texto.toUpperCase();
  return t.indexOf("INSUMO") >= 0;
}

function fechaHoy() {
  var d = new Date();
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}


// ═══════════════════════════════════════════════════════════════════════════
// 1. RESOLVER CELDAS COMBINADAS
// ═══════════════════════════════════════════════════════════════════════════

function forwardFillGrid(grid) {
  var colsFijas = [0, 1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 21, 37, 54, 71];
  var numFilas = grid.length;
  var numCols = grid[0] ? grid[0].length : 0;
  for (var ci = 0; ci < colsFijas.length; ci++) {
    var col = colsFijas[ci];
    if (col >= numCols) continue;
    var ultimoValor = "";
    for (var r = 0; r < numFilas; r++) {
      var val = limpiar(String(grid[r][col]));
      if (val !== "") { ultimoValor = val; }
      else if (ultimoValor !== "") { grid[r][col] = ultimoValor; }
    }
  }
  return grid;
}


// ═══════════════════════════════════════════════════════════════════════════
// 2. CREAR HOJAS DESTINO CON HEADERS
// ═══════════════════════════════════════════════════════════════════════════

function crearHojasDestino(ss) {
  var hojas = {
    "RESUMEN": [
      ["DASHBOARD - Validacion de Telas", ""],
      ["Actualizado: " + fechaHoy(), ""],
      ["", ""],
      ["METRICA", "VALOR"]
    ],
    "REFERENCIAS": [[
      "ID_REFERENCIA", "REF", "FOTO_URL", "NOMBRE_SISTEMA", "STATUS",
      "MOD_ARTE", "UBI_TRAZO", "VARIACION_COLOR_1", "VARIACION_COLOR_2",
      "LARGO", "OCULTO", "FECHA_COSTEO", "FECHA_CREACION",
      "ULTIMA_MODIFICACION", "USUARIO_MODIFICACION"
    ]],
    "TELAS_X_REFERENCIA": [[
      "ID_TELA", "ID_REFERENCIA", "USO_EN_PRENDA", "CODIGO_TELA",
      "DESCRIPCION_TELA", "ANCHO", "TELA_FOTO_URL", "CONSUMO_BASE",
      "ACTIVO", "FECHA_CAMBIO", "MOTIVO_CAMBIO", "TELA_REEMPLAZO_ID", "ORDEN"
    ]],
    "CONSUMOS": [[
      "ID_CONSUMO", "ID_TELA", "ID_REFERENCIA", "AREA", "TIPO_TELA",
      "VERSION", "TALLA", "UND", "CONSUMO_VALOR", "OBSERVACIONES",
      "DISEÑADOR", "CAMBIO_MOLDERIA", "ES_FINAL",
      "FECHA_REGISTRO", "USUARIO_REGISTRO"
    ]],
    "CONSUMOS_CONTRAMUESTRA": [[
      "ID_CONSUMO", "ID_TELA", "ID_REFERENCIA", "TIPO_TELA",
      "VERSION", "TALLA", "UND", "CONSUMO_VALOR", "OBSERVACIONES",
      "FECHA_REGISTRO", "USUARIO_REGISTRO"
    ]],
    "INSUMOS": [[
      "ID_INSUMO", "ID_REFERENCIA", "NOMBRE_INSUMO",
      "CONSUMO_CREATIVO", "CONSUMO_TECNICO", "CONSUMO_TRAZO",
      "CONSUMO_CONTRAMUESTRA", "OBSERVACIONES"
    ]],
    "PARAMETROS": [
      ["STATUS", "SI_NO", "AREAS", "TIPOS_TELA", "MOTIVOS_CAMBIO",
       "CODIGOS_TELA", "DESCRIPCION_TELA", "DISEÑADORES_CREATIVOS",
       "DISEÑADORES_TECNICOS", "ROLES"],
      ["APROBADO", "SI", "CREATIVO", "SOLIDO", "SIN_STOCK", "", "", "", "", "ADMIN"],
      ["CANCELADO", "NO", "TECNICO", "MOD_ARTE", "COSTO_ELEVADO", "", "", "", "", "CREATIVO"],
      ["EN_PROCESO", "", "TRAZO_Y_CORTE", "UBICACION_TRAZO", "CALIDAD", "", "", "", "", "TECNICO"],
      ["RECHAZADO", "", "", "", "OTRO", "", "", "", "", "TRAZO_Y_CORTE"],
      ["PENDIENTE", "", "", "", "", "", "", "", "", "CONSULTA"]
    ],
    "HISTORIAL": [[
      "FECHA", "USUARIO", "HOJA", "ID_REGISTRO", "CAMPO",
      "VALOR_ANTERIOR", "VALOR_NUEVO"
    ]],
    "ALERTAS": [[
      "ID_ALERTA", "FECHA", "ID_REFERENCIA", "ID_TELA",
      "CONSUMO_COSTEO", "CONSUMO_CONTRAMUESTRA",
      "DIFERENCIA_PORCENTAJE", "ENVIADA", "FECHA_ENVIO"
    ]]
  };

  var nombres = Object.keys(hojas);
  for (var i = 0; i < nombres.length; i++) {
    var nombre = nombres[i];
    var sheet;
    try {
      sheet = ss.insertSheet(nombre, i);
    } catch (e) {
      sheet = ss.getSheetByName(nombre);
      sheet.clear();
    }
    if (hojas[nombre].length > 0) {
      sheet.getRange(1, 1, hojas[nombre].length, hojas[nombre][0].length)
        .setValues(hojas[nombre]);
    }
    // Formato basico de header
    if (hojas[nombre].length > 0 && hojas[nombre][0].length > 0) {
      sheet.getRange(1, 1, 1, hojas[nombre][0].length)
        .setFontWeight("bold")
        .setBackground("#46bdc6")
        .setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// 3. EXTRAER DATOS DE UN BLOQUE DE 19 FILAS
// ═══════════════════════════════════════════════════════════════════════════

function extraerBloque(grid, inicio, refId, telaIdInicial, consumoIdInicial, insumoIdInicial) {
  // Valores generales (de la primera fila del bloque)
  var r0 = inicio;
  var refNum = limpiar(String(grid[r0][C.REF]));
  var status = limpiar(String(grid[r0][C.STATUS]));
  var modArte = limpiar(String(grid[r0][C.MOD_ARTE]));
  var ubiTrazo = limpiar(String(grid[r0][C.UBI_TRAZO]));
  var varC1 = limpiar(String(grid[r0][C.VAR_COLOR_1]));
  var varC2 = limpiar(String(grid[r0][C.VAR_COLOR_2]));
  var largo = limpiar(String(grid[r0][C.LARGO]));
  var nombre = limpiar(String(grid[r0][C.REFERENCIA]));
  var creativoDis = limpiar(String(grid[r0][C.CREATIVO_DIS]));
  var creativoMold = limpiar(String(grid[r0][C.CREATIVO_MOLD]));
  var tecnicoDis = limpiar(String(grid[r0][C.TECNICO_DIS]));
  var foto = limpiar(String(grid[r0][C.FOTO])); // Puede ser texto de imagen

  var hoy = fechaHoy();

  var refRow = [
    refId, refNum, foto, nombre, status,
    modArte, ubiTrazo, varC1, varC2, largo,
    status.toUpperCase() === "CANCELADO" ? true : false,
    "", hoy, hoy, "migracion"
  ];

  // --- Telas (filas 0-12 del bloque) ---
  var telas = [];
  var telaId = telaIdInicial;

  for (var local = 0; local < 13; local++) {
    var row = inicio + local;
    if (row >= grid.length) break;
    var uso = limpiar(String(grid[row][C.USO_PRENDA]));
    var cod = limpiar(String(grid[row][C.CODIGO_TELA]));
    var desc = limpiar(String(grid[row][C.DESC_TELA]));
    var ancho = limpiar(String(grid[row][C.ANCHO]));
    var telaFoto = limpiar(String(grid[row][C.TELA_FOTO]));
    var consumoBase = limpiar(String(grid[row][C.CONSUMO_BASE]));

    if (!uso && !cod) continue;

    telas.push({
      id: telaId,
      row: [telaId, refId, uso, cod, desc, ancho, telaFoto, consumoBase,
            true, "", "", "", telas.length + 1]
    });
    telaId++;
  }

  // --- Consumos Creativo (filas 0-12) ---
  var consCreativo = [];
  for (var lc = 0; lc < 13 && lc < telas.length; lc++) {
    var r = inicio + lc;
    for (var v = 0; v < 3; v++) {
      var colConsumo = [C.CREATIVO_C1, C.CREATIVO_C2, C.CREATIVO_C3][v];
      var val = parseConsumo(grid[r][colConsumo]);
      if (val !== null) {
        consCreativo.push([
          null, telas[lc].id, refId, "CREATIVO", "SOLIDO", String(v + 1),
          "", "", val,
          v === 0 ? limpiar(String(grid[r][C.CREATIVO_OBS])) : "",
          creativoDis, creativoMold, false, hoy, "migracion"
        ]);
      }
    }
  }

  // --- Consumos Tecnico (filas 0-12) ---
  var consTecnico = [];
  var obsTecnico = limpiar(String(grid[inicio][C.TECNICO_OBS]));

  for (var lt = 0; lt < 13 && lt < telas.length; lt++) {
    var rowT = inicio + lt;
    var tipos = [
      { nombre: "SOLIDO", cols: [C.TECNICO_SOL_C1, C.TECNICO_SOL_C2, C.TECNICO_SOL_C3] },
      { nombre: "MOD_ARTE", cols: [C.TECNICO_MA_C1, C.TECNICO_MA_C2, C.TECNICO_MA_C3] },
      { nombre: "UBICACION_TRAZO", cols: [C.TECNICO_UT_C1, C.TECNICO_UT_C2, C.TECNICO_UT_C3] }
    ];
    for (var ti = 0; ti < tipos.length; ti++) {
      for (var v2 = 0; v2 < tipos[ti].cols.length; v2++) {
        var val2 = parseConsumo(grid[rowT][tipos[ti].cols[v2]]);
        if (val2 !== null) {
          consTecnico.push([
            null, telas[lt].id, refId, "TECNICO", tipos[ti].nombre, String(v2 + 1),
            "", "", val2, obsTecnico, tecnicoDis, "", false, hoy, "migracion"
          ]);
        }
      }
    }
  }

  // --- Consumos Trazo y Corte (filas 0-12) ---
  var consTrazo = [];
  var obsTrazo = limpiar(String(grid[inicio][C.TRAZO_UT_OBS]));

  for (var ltr = 0; ltr < 13 && ltr < telas.length; ltr++) {
    var rowTr = inicio + ltr;
    var tiposTr = [
      { nombre: "SOLIDO", cols: [C.TRAZO_SOL_C1, C.TRAZO_SOL_C2, C.TRAZO_SOL_C3, C.TRAZO_SOL_C4] },
      { nombre: "MOD_ARTE", cols: [C.TRAZO_MA_C1, C.TRAZO_MA_C2, C.TRAZO_MA_C3, C.TRAZO_MA_C4] },
      { nombre: "UBICACION_TRAZO", cols: [C.TRAZO_UT_C1, C.TRAZO_UT_C2] }
    ];
    for (var tti = 0; tti < tiposTr.length; tti++) {
      for (var v3 = 0; v3 < tiposTr[tti].cols.length; v3++) {
        var val3 = parseConsumo(grid[rowTr][tiposTr[tti].cols[v3]]);
        if (val3 !== null) {
          consTrazo.push([
            null, telas[ltr].id, refId, "TRAZO_Y_CORTE", tiposTr[tti].nombre, String(v3 + 1),
            "", "", val3, obsTrazo, "", "", true, hoy, "migracion"
          ]);
        }
      }
    }
  }

  // --- Consumos Contramuestra (filas 0-12) ---
  var consContra = [];
  var obsContra = limpiar(String(grid[inicio][C.CONTRA_OBS]));

  for (var lct = 0; lct < 13 && lct < telas.length; lct++) {
    var rowCt = inicio + lct;
    var tiposCt = [
      { nombre: "SOLIDO", cols: [C.CONTRA_SOL_C1, C.CONTRA_SOL_C2, C.CONTRA_SOL_C3, C.CONTRA_SOL_C4] },
      { nombre: "MOD_ARTE", cols: [C.CONTRA_MA_C1, C.CONTRA_MA_C2, C.CONTRA_MA_C3, C.CONTRA_MA_C4] },
      { nombre: "UBICACION_TRAZO", cols: [C.CONTRA_UT_C1, C.CONTRA_UT_C2] }
    ];
    for (var tci = 0; tci < tiposCt.length; tci++) {
      for (var v4 = 0; v4 < tiposCt[tci].cols.length; v4++) {
        var valCt = parseConsumo(grid[rowCt][tiposCt[tci].cols[v4]]);
        if (valCt !== null) {
          consContra.push([
            null, telas[lct].id, refId, tiposCt[tci].nombre, String(v4 + 1),
            "", "", valCt, obsContra, hoy, "migracion"
          ]);
        }
      }
    }
  }

  // --- Insumos (filas 14-18 del bloque) ---
  var insumos = [];
  for (var li = 14; li <= 18; li++) {
    var rowI = inicio + li;
    if (rowI >= grid.length) break;
    var nombreIns = limpiar(String(grid[rowI][C.USO_PRENDA]));
    if (!nombreIns || contieneInsumos(nombreIns)) continue;

    insumos.push([
      null, refId, nombreIns,
      parseConsumo(grid[rowI][C.CREATIVO_C1]) || "",
      parseConsumo(grid[rowI][C.TECNICO_SOL_C1]) || "",
      parseConsumo(grid[rowI][C.TRAZO_SOL_C1]) || "",
      parseConsumo(grid[rowI][C.CONTRA_SOL_C1]) || "",
      ""
    ]);
  }

  return {
    refRow: refRow,
    telas: telas,
    consCreativo: consCreativo,
    consTecnico: consTecnico,
    consTrazo: consTrazo,
    consContra: consContra,
    insumos: insumos
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. ESCRIBIR DATOS ACUMULADOS EN LAS HOJAS DESTINO
// ═══════════════════════════════════════════════════════════════════════════

function escribirDatos(ss, refsRows, telasRows, consumosRows, contraRows, insumosRows) {
  // REFERENCIAS
  var hojaRef = ss.getSheetByName("REFERENCIAS");
  if (refsRows.length > 0) {
    hojaRef.getRange(2, 1, refsRows.length, refsRows[0].length).setValues(refsRows);
  }

  // TELAS_X_REFERENCIA
  var hojaTelas = ss.getSheetByName("TELAS_X_REFERENCIA");
  if (telasRows.length > 0) {
    hojaTelas.getRange(2, 1, telasRows.length, telasRows[0].length).setValues(telasRows);
    // Formato condicional: filas grises si ACTIVO=FALSE
    var ultFilaTelas = telasRows.length + 1;
    hojaTelas.getRange("A2:M" + ultFilaTelas).setBorder(true, true, true, true, false, false);
  }

  // CONSUMOS
  var hojaCons = ss.getSheetByName("CONSUMOS");
  if (consumosRows.length > 0) {
    hojaCons.getRange(2, 1, consumosRows.length, consumosRows[0].length).setValues(consumosRows);
  }

  // CONSUMOS_CONTRAMUESTRA
  var hojaContra = ss.getSheetByName("CONSUMOS_CONTRAMUESTRA");
  if (contraRows.length > 0) {
    hojaContra.getRange(2, 1, contraRows.length, contraRows[0].length).setValues(contraRows);
  }

  // INSUMOS
  var hojaIns = ss.getSheetByName("INSUMOS");
  if (insumosRows.length > 0) {
    hojaIns.getRange(2, 1, insumosRows.length, insumosRows[0].length).setValues(insumosRows);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. ORQUESTADOR PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

function migrarTodo() {
  var ui = SpreadsheetApp.getUi();

  try {
    // --- 5A. Crear hojas en el sheet NUEVO (destino) ---
    var ssDestino = SpreadsheetApp.getActiveSpreadsheet();
    ui.alert("Paso 1/4", "Creando las 9 hojas en el Sheet nuevo...", ui.ButtonSet.OK);
    crearHojasDestino(ssDestino);
    Logger.log("Hojas destino creadas.");

    // --- 5B. Abrir Sheet ORIGEN ---
    ui.alert("Paso 2/4",
      "Abriendo el Sheet origen: " + HOJA_ORIGEN + "\n\nID: " + ID_SHEET_ORIGEN,
      ui.ButtonSet.OK);

    var idOrigen = extraerIdDeUrl(ID_SHEET_ORIGEN);
    var ssOrigen = SpreadsheetApp.openById(idOrigen);
    var hojaOrigen = ssOrigen.getSheetByName(HOJA_ORIGEN);
    if (!hojaOrigen) {
      var hojas = [];
      var todas = ssOrigen.getSheets();
      for (var h = 0; h < todas.length; h++) {
        hojas.push(todas[h].getName());
      }
      throw new Error("No se encontro la hoja '" + HOJA_ORIGEN +
        "'. Hojas disponibles: " + hojas.join(", "));
    }

    // --- 5C. Leer datos y resolver celdas combinadas ---
    var grid = hojaOrigen.getDataRange().getValues();
    Logger.log("Grid leido: " + grid.length + " filas x " + (grid[0] ? grid[0].length : 0) + " columnas");

    grid = forwardFillGrid(grid);

    // --- 5D. Procesar bloques de referencias ---
    ui.alert("Paso 3/4",
      "Datos leidos. Procesando referencias...\n\n" +
      "Esto puede tomar ~30 segundos para 50 referencias.",
      ui.ButtonSet.OK);

    var refsRows = [];
    var telasRows = [];
    var consumosRows = [];
    var contraRows = [];
    var insumosRows = [];

    var refId = 1;
    var telaIdGlobal = 1;
    var consumoIdGlobal = 1;
    var insumoIdGlobal = 1;

    var totalFilas = grid.length;
    var idx = FILA_INICIO_DATOS;
    var refsProcesadas = 0;

    while (idx < totalFilas) {
      if (idx >= grid.length) break;
      var celdaRef = limpiar(String(grid[idx][C.REF]));

      if (esNumeroRef(celdaRef)) {
        var bloque = extraerBloque(grid, idx, refId, telaIdGlobal, consumoIdGlobal, insumoIdGlobal);

        refsRows.push(bloque.refRow);

        for (var ti = 0; ti < bloque.telas.length; ti++) {
          telasRows.push(bloque.telas[ti].row);
          telaIdGlobal++;
        }

        for (var ci = 0; ci < bloque.consCreativo.length; ci++) {
          bloque.consCreativo[ci][0] = consumoIdGlobal;
          consumosRows.push(bloque.consCreativo[ci]);
          consumoIdGlobal++;
        }
        for (var cti = 0; cti < bloque.consTecnico.length; cti++) {
          bloque.consTecnico[cti][0] = consumoIdGlobal;
          consumosRows.push(bloque.consTecnico[cti]);
          consumoIdGlobal++;
        }
        for (var ctr = 0; ctr < bloque.consTrazo.length; ctr++) {
          bloque.consTrazo[ctr][0] = consumoIdGlobal;
          consumosRows.push(bloque.consTrazo[ctr]);
          consumoIdGlobal++;
        }
        for (var cco = 0; cco < bloque.consContra.length; cco++) {
          bloque.consContra[cco][0] = consumoIdGlobal;
          contraRows.push(bloque.consContra[cco]);
          consumoIdGlobal++;
        }
        for (var ini = 0; ini < bloque.insumos.length; ini++) {
          bloque.insumos[ini][0] = insumoIdGlobal;
          insumosRows.push(bloque.insumos[ini]);
          insumoIdGlobal++;
        }

        refId++;
        refsProcesadas++;
        idx += BLOQUE_FILAS;
      } else {
        idx++;
      }
    }

    // --- 5E. Escribir todo en las hojas destino ---
    ui.alert("Paso 4/4",
      "Escribiendo " + refsProcesadas + " referencias migradas...\n\n" +
      "Referencias: " + refsRows.length + "\n" +
      "Telas: " + telasRows.length + "\n" +
      "Consumos: " + consumosRows.length + "\n" +
      "Contramuestra: " + contraRows.length + "\n" +
      "Insumos: " + insumosRows.length,
      ui.ButtonSet.OK);

    escribirDatos(ssDestino, refsRows, telasRows, consumosRows, contraRows, insumosRows);

    // --- Resultado final ---
    ui.alert("MIGRACION COMPLETADA!",
      "Se migraron exitosamente:\n\n" +
      "  " + refsProcesadas + " referencias\n" +
      "  " + telaIdGlobal + " telas\n" +
      "  " + (consumoIdGlobal - 1) + " registros de consumo\n" +
      "  " + (insumoIdGlobal - 1) + " insumos\n\n" +
      "PROXIMO PASO:\n" +
      "1. Borra este script (Migracion.gs)\n" +
      "2. Pega Code.gs (automatizacion permanente)\n" +
      "3. Edita los emails en CONFIG.ROLES\n" +
      "4. Ejecuta onOpen() y instalarTriggers()",
      ui.ButtonSet.OK);

    Logger.log("Migracion completada: " + refsProcesadas + " refs, " +
      telaIdGlobal + " telas, " + (consumoIdGlobal - 1) + " consumos, " +
      (insumoIdGlobal - 1) + " insumos");

  } catch (err) {
    ui.alert("ERROR EN MIGRACION",
      "Ocurrio un error:\n\n" + err.toString() +
      "\n\nVerifica:\n" +
      "- ID_SHEET_ORIGEN esta correcto\n" +
      "- La hoja '" + HOJA_ORIGEN + "' existe en el Sheet origen\n" +
      "- Tienes permisos de lectura en el Sheet origen",
      ui.ButtonSet.OK);
    Logger.log("Error: " + err.toString());
    throw err;
  }
}
