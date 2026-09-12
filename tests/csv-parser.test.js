import { describe, expect, it } from 'vitest';
import { parseValidationTelas } from '../src/lib/csvParser';

describe('validation fabric parser', () => {
  it('parses references, fabrics, and creative consumption versions from CSV', async () => {
    const csv = [
      'REF,NOMBRE,CODIGO TELA,DESCRIPCION TELA,USO,ANCHO,CONSUMO BASE,CONSUMO 1,CONSUMO 2',
      '100,Blusa Aurora,TL-01,Algodon blanco,SOLIDO,150,2.5,3.2,3.4',
    ].join('\n');

    const result = await parseValidationTelas(new TextEncoder().encode(csv), 'fixture.csv');

    expect(result.errores).toEqual([]);
    expect(result.referencias).toHaveLength(1);
    expect(result.referencias[0]).toMatchObject({ reference_number: '100', name: 'Blusa Aurora' });
    expect(result.telas[0]).toMatchObject({ codigo_tela: 'TL-01', ancho: 150, consumo_base: 2.5 });
    expect(result.consumos).toEqual(expect.arrayContaining([
      expect.objectContaining({ ref_num: '100', role: 'CREATIVO', version: 1, consumo_valor: 3.2 }),
      expect.objectContaining({ ref_num: '100', role: 'CREATIVO', version: 2, consumo_valor: 3.4 }),
    ]));
  });

  it('reports files without a REF header', async () => {
    const csv = 'NOMBRE,CODIGO TELA\nBlusa,TL-01';
    const result = await parseValidationTelas(new TextEncoder().encode(csv), 'invalid.csv');

    expect(result.error).toContain('fila de encabezados');
  });
});
