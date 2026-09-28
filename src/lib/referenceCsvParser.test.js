import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  buildReferenceImportDocument,
  parseReferenceCsv,
  REFERENCE_CSV_HEADERS,
  REFERENCE_CSV_MAX_DATA_ROWS,
  REFERENCE_CSV_MAX_FILE_BYTES,
} from './referenceCsvParser';

const header = REFERENCE_CSV_HEADERS.join(';');

describe('parseReferenceCsv', () => {
  it('parsea UTF-8 con BOM, punto y coma, comillas y normaliza códigos', () => {
    const csv = `\uFEFF${header}\r\nSS27;2027;1;"Vestido; largo";;;; md01 ;pt02;;OSMAN\r\n`;
    const result = parseReferenceCsv(new TextEncoder().encode(csv));
    expect(result.issues).toEqual([]);
    expect(result.rows[0]).toEqual(expect.objectContaining({
      source_row: 2,
      values: expect.objectContaining({ Nombre: 'Vestido; largo', 'Código MD': 'MD01', 'Código PT': 'PT02' }),
    }));
  });

  it('convierte vacíos, N/A y NULL a ausencia sin alterar nombres de catálogo', () => {
    const csv = `${header}\nSS27;2027;2;NULL; dresses ;N/A;;null;;; Yamilet `;
    const result = parseReferenceCsv(csv);
    expect(result.rows[0].values).toEqual(expect.objectContaining({
      Nombre: null, Línea: 'dresses', Sublínea: null, 'Código MD': null, Diseñador: 'Yamilet',
    }));
  });

  it('rechaza encabezados desconocidos, duplicados y filas de ancho inválido', () => {
    const duplicate = `Colección;Año;referencia;Nombre;Línea;Sublínea;Status General;Código MD;Código PT;Tipo Ref;Código PT\nSS27;2027;1`;
    const result = parseReferenceCsv(duplicate);
    expect(result.issues.some(item => item.classification === 'FILE_ERROR')).toBe(true);
    expect(result.issues.some(item => item.message.includes('duplicados'))).toBe(true);
  });

  it('rechaza bytes que no son UTF-8', () => {
    const result = parseReferenceCsv(new Uint8Array([0xff, 0xfe, 0xfd]));
    expect(result.issues[0]).toEqual(expect.objectContaining({ classification: 'FILE_ERROR', requirement: 'CSV-001' }));
  });

  it('crea únicamente el documento contractual enviado al servidor', () => {
    const parsed = parseReferenceCsv(`${header}\nSS27;2027;1;;;;;;;;`);
    expect(buildReferenceImportDocument(parsed)).toEqual({
      template_version: '0.1', headers: REFERENCE_CSV_HEADERS, rows: parsed.rows,
    });
  });

  it('acepta opcionales ausentes y columnas reordenadas', () => {
    const result = parseReferenceCsv('referencia;Nombre;Año;Colección\n7; Vestido ;2027;SS27');
    expect(result.issues).toEqual([]);
    expect(result.headers).toEqual(['referencia', 'Nombre', 'Año', 'Colección']);
    expect(result.rows[0].values).toEqual({ referencia: '7', Nombre: 'Vestido', Año: '2027', Colección: 'SS27' });
  });

  it('canonicaliza referencias enteras antes de enviarlas al preview', () => {
    const result = parseReferenceCsv('Colección;Año;referencia\nSS27;2027;1\nSS27;2027;01');
    expect(result.issues).toEqual([]);
    expect(result.rows.map(row => row.values.referencia)).toEqual(['1', '1']);
  });

  it('carga el CSV contractual real con exactamente los 11 encabezados aprobados', () => {
    const realCsv = readFileSync(new URL('../../SS27 8 Referencias.csv', import.meta.url));
    const result = parseReferenceCsv(realCsv);
    expect(result.issues).toEqual([]);
    expect(result.headers).toEqual(REFERENCE_CSV_HEADERS);
    expect(result.headers).toHaveLength(11);
    expect(result.rows).toHaveLength(8);
  });

  it('rechaza límites internos de archivo y filas', () => {
    const oversized = parseReferenceCsv('x'.repeat(REFERENCE_CSV_MAX_FILE_BYTES + 1));
    expect(oversized.issues[0].message).toContain('límite operativo');

    const rows = Array.from({ length: REFERENCE_CSV_MAX_DATA_ROWS + 1 }, (_, index) => `SS27;2027;${index + 1}`).join('\n');
    const tooManyRows = parseReferenceCsv(`Colección;Año;referencia\n${rows}`);
    expect(tooManyRows.issues.some(item => item.message.includes(`${REFERENCE_CSV_MAX_DATA_ROWS} filas`))).toBe(true);
  });
});
