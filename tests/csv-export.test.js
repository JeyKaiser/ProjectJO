import { describe, expect, it, vi } from 'vitest';
import { downloadCsv, serializeCsv } from '../src/lib/csvExport';

const columns = [
  { key: 'reference', label: 'Referencia' },
  { key: 'notes', label: 'Observaciones' },
];

describe('CSV export', () => {
  it('serializes headers, values, commas, quotes, and line breaks', () => {
    const csv = serializeCsv([
      { reference: 19, notes: 'Tela, "azul"\nrevisada' },
      { reference: 20, notes: null },
    ], columns);

    expect(csv).toBe('Referencia,Observaciones\r\n19,"Tela, ""azul""\nrevisada"\r\n20,\r\n');
  });

  it('creates a downloadable CSV with the expected filename', () => {
    const click = vi.fn();
    const documentRef = { createElement: vi.fn(() => ({ click })) };
    const urlApi = { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL: vi.fn() };

    downloadCsv([{ reference: 19, notes: 'OK' }], 'reporte', columns, { documentRef, urlApi });

    const link = documentRef.createElement.mock.results[0].value;
    expect(link.download).toBe('reporte.csv');
    expect(link.href).toBe('blob:test');
    expect(click).toHaveBeenCalledOnce();
    expect(urlApi.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});
