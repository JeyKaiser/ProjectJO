import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { parseMatriz } from '../src/lib/matrizParser';

function workbookBytes(rows) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, 'MATRIZ');
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
}

describe('matrix parser', () => {
  it('finds the REF header and maps fixed matrix columns', async () => {
    const header = Array(190).fill('');
    header[0] = 'REF';
    const row = Array(190).fill('');
    row[0] = '200';
    row[4] = 'Pantalon Delta';
    row[5] = 'Azul';
    row[10] = 'APROBADO';
    row[100] = '12';

    const preamble = Array.from({ length: 9 }, (_, index) => [`Preamble ${index + 1}`]);
    const result = await parseMatriz(workbookBytes([...preamble, header, row]));

    expect(result.totalRefs).toBe(1);
    expect(result.referencias[0]).toMatchObject({
      reference_number: '200',
      name: 'Pantalon Delta',
      color: 'Azul',
      status: 'APROBADO',
    });
    expect(result.secciones.produccionUnits).toContainEqual({ ref_num: 200, talla: '0', cantidad: 12 });
  });
});
