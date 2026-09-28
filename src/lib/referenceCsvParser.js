export const REFERENCE_CSV_HEADERS = Object.freeze([
  'Colección', 'Año', 'referencia', 'Nombre', 'Línea', 'Sublínea',
  'Status General', 'Código MD', 'Código PT', 'Tipo Ref', 'Diseñador',
]);

export const REFERENCE_CSV_TEMPLATE_VERSION = '0.1';
export const REFERENCE_CSV_REQUIRED_HEADERS = Object.freeze(['Colección', 'Año', 'referencia']);

// Límites operativos internos (no forman parte del contrato de columnas CSV).
export const REFERENCE_CSV_MAX_FILE_BYTES = 5 * 1024 * 1024;
export const REFERENCE_CSV_MAX_DATA_ROWS = 5000;

function issue(classification, requirement, message, field = null, row = null) {
  return { severity: 'ERROR', classification, requirement, message, field, row };
}

function decodeUtf8(input) {
  if (typeof input === 'string') return input.replace(/^\uFEFF/, '');
  if (!(input instanceof ArrayBuffer) && !ArrayBuffer.isView(input)) {
    throw new TypeError('El parser requiere texto UTF-8, ArrayBuffer o Uint8Array');
  }
  const bytes = input instanceof ArrayBuffer
    ? new Uint8Array(input)
    : new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '');
}

function parseSemicolonCsv(text) {
  const records = [];
  let record = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
    } else if (character === '"' && value.length === 0) {
      quoted = true;
    } else if (character === ';') {
      record.push(value);
      value = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      record.push(value);
      records.push(record);
      record = [];
      value = '';
    } else {
      value += character;
    }
  }

  if (quoted) throw new Error('Comillas CSV sin cerrar');
  if (value.length || record.length) {
    record.push(value);
    records.push(record);
  }
  return records;
}

export function normalizeReferenceCsvValue(value, header) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || /^(N\/A|NULL)$/i.test(trimmed)) return null;
  if (header === 'referencia' && /^\d+$/.test(trimmed)) {
    const numeric = BigInt(trimmed);
    if (numeric > 0n && numeric <= 2147483647n) return numeric.toString();
  }
  return header === 'Código MD' || header === 'Código PT' ? trimmed.toUpperCase() : trimmed;
}

export function parseReferenceCsv(input) {
  const inputBytes = typeof input === 'string'
    ? new TextEncoder().encode(input).byteLength
    : input instanceof ArrayBuffer
      ? input.byteLength
      : ArrayBuffer.isView(input) ? input.byteLength : 0;
  if (inputBytes > REFERENCE_CSV_MAX_FILE_BYTES) {
    return {
      headers: [], rows: [],
      issues: [issue('FILE_ERROR', 'CSV-001', `El archivo supera el límite operativo de ${REFERENCE_CSV_MAX_FILE_BYTES / (1024 * 1024)} MB`)],
    };
  }

  let text;
  try {
    text = decodeUtf8(input);
  } catch (error) {
    return {
      headers: [], rows: [],
      issues: [issue('FILE_ERROR', 'CSV-001', `El archivo no es UTF-8 válido: ${error.message}`)],
    };
  }

  let records;
  try {
    records = parseSemicolonCsv(text);
  } catch (error) {
    return { headers: [], rows: [], issues: [issue('FILE_ERROR', 'CSV-001', error.message)] };
  }

  while (records.length && records.at(-1).every(cell => !String(cell).trim())) records.pop();
  if (!records.length) {
    return { headers: [], rows: [], issues: [issue('FILE_ERROR', 'CSV-001', 'El archivo está vacío')] };
  }

  const headers = records[0].map(header => String(header).trim());
  const issues = [];
  const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicateHeaders.length) {
    issues.push(issue('FILE_ERROR', 'CSV-001', `Encabezados duplicados: ${[...new Set(duplicateHeaders)].join(', ')}`));
  }
  const unknown = headers.filter(header => !REFERENCE_CSV_HEADERS.includes(header));
  const missingRequired = REFERENCE_CSV_REQUIRED_HEADERS.filter(header => !headers.includes(header));
  if (unknown.length || missingRequired.length) {
    issues.push(issue(
      'FILE_ERROR', 'CSV-001',
      unknown.length
        ? `Columnas no reconocidas: ${unknown.join(', ')}`
        : `Faltan columnas obligatorias: ${missingRequired.join(', ')}`,
    ));
  }

  const rows = [];
  records.slice(1).forEach((record, index) => {
    const sourceRow = index + 2;
    if (record.every(cell => !String(cell).trim())) return;
    if (record.length !== headers.length) {
      issues.push(issue('FILE_ERROR', 'CSV-001', `La fila tiene ${record.length} columnas; se esperaban ${headers.length}`, null, sourceRow));
      return;
    }
    const values = {};
    headers.forEach((header, column) => {
      values[header] = normalizeReferenceCsvValue(record[column], header);
    });
    rows.push({ source_row: sourceRow, values });
  });

  if (!rows.length) issues.push(issue('FILE_ERROR', 'CSV-001', 'El archivo no contiene filas de datos'));
  if (rows.length > REFERENCE_CSV_MAX_DATA_ROWS) {
    issues.push(issue('FILE_ERROR', 'CSV-001', `El archivo supera el límite operativo de ${REFERENCE_CSV_MAX_DATA_ROWS} filas de datos`));
  }
  return { template_version: REFERENCE_CSV_TEMPLATE_VERSION, headers, rows, issues };
}

export function buildReferenceImportDocument(parsed) {
  return {
    template_version: REFERENCE_CSV_TEMPLATE_VERSION,
    headers: parsed.headers,
    rows: parsed.rows,
  };
}
