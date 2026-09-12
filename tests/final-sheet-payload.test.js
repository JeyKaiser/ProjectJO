import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMock = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('../src/lib/supabase', () => ({
  default: supabaseMock,
  uploadImage: vi.fn(),
}));

import { buildFinalSheetPayload, readFinalSheet, saveFinalSheet } from '../src/lib/api';

function queryResult(result) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    in: vi.fn(() => query),
    order: vi.fn(() => query),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
}

describe('final sheet payload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes scopes, materials, care, counter-samples, and quality issues', () => {
    const payload = buildFinalSheetPayload({
      referenceId: 42,
      compositions: {
        MUESTRA: {
          id: 7,
          sap_registered: true,
          description_usauk: '  cotton  ',
          materials: [{ material: 'Algodon', percentage: '80' }, { material: '', percentage: '20' }],
        },
      },
      careInstructions: [{ id: 3, care_type_id: 1, instruction: 'Lavar frio' }],
      contramuestras: [
        { codigo_ot: 'OT-1', status: 'activa', codigo_nota: 'N-1' },
        { codigo_ot: 'OT-2', status: 'activa' },
      ],
      qualityIssues: [{ area: 'Costura', classification: 'Mayor', resolved: false }],
    });

    expect(payload.reference_id).toBe(42);
    expect(payload.scopes.MUESTRA.composition).toMatchObject({
      id: 7,
      reference_id: 42,
      description_usauk: 'cotton',
    });
    expect(payload.scopes.MUESTRA.materials).toEqual([
      { composition_id: 7, material: 'Algodon', percentage: 80 },
    ]);
    expect(payload.scopes.PRODUCCION.composition.scope).toBe('PRODUCCION');
    expect(payload.contramuestras.map(row => row.status)).toEqual(['activa', 'utilizada']);
    expect(payload.care_instructions[0].care_type_id).toBe(1);
    expect(payload.quality_issues[0]).toMatchObject({ area: 'Costura', resolved: false });
  });

  it('reads normalized data and resolves composition materials', async () => {
    const results = {
      references: { data: { id: 42, reference_number: 7, name: 'Aurora' }, error: null },
      compositions: { data: [{ id: 7, reference_id: 42, scope: 'MUESTRA', description_usauk: 'cotton' }], error: null },
      care_types: { data: [{ id: 1, type: 'Lavado', description: 'Lavar' }], error: null },
      care_instructions: { data: [{ id: 3, care_type_id: 1, instruction: 'Lavar frio' }], error: null },
      contramuestras: { data: [{ id: 4, status: 'active', nota_fabricacion_id: 9 }], error: null },
      notas_fabricacion: { data: [{ id: 9, codigo_nota: 'N-1', observaciones: 'Revisar' }], error: null },
      quality_issues: { data: [{ id: 5, area: 'Costura', resolved: 1 }], error: null },
      composition_materials: { data: [{ id: 8, composition_id: 7, material: 'Algodon', percentage: 80 }], error: null },
      reference_codes: { data: [{ reference_id: 42, code_type: 'MD', code: 'MD-007' }], error: null },
    };
    supabaseMock.from.mockImplementation(table => queryResult(results[table] || { data: [], error: null }));

    const result = await readFinalSheet(42);

    expect(result.reference.codigoMD).toBe('MD-007');
    expect(result.reference.codigoPT).toBe('PT03007');
    expect(result.compositions.MUESTRA.materials).toEqual([
      { id: 8, composition_id: 7, material: 'Algodon', percentage: 80 },
    ]);
    expect(result.careInstructions[0].care_type).toEqual({ id: 1, type: 'Lavado', description: 'Lavar' });
    expect(result.contramuestras[0]).toMatchObject({ status: 'activa', codigo_nota: 'N-1' });
    expect(result.qualityIssues[0].resolved).toBe(false);
  });

  it('rejects invalid reference ids before querying Supabase', async () => {
    await expect(readFinalSheet('REF-42')).rejects.toThrow('reference_id numerico valido');
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it('delegates saving to the final-sheet RPC and propagates errors', async () => {
    const payload = { reference_id: 42, version: 1 };
    supabaseMock.rpc.mockResolvedValueOnce({ data: { saved: true }, error: null });

    await expect(saveFinalSheet(payload)).resolves.toEqual({ saved: true });
    expect(supabaseMock.rpc).toHaveBeenCalledWith('save_final_sheet', { p_payload: payload });

    const error = new Error('RPC failed');
    supabaseMock.rpc.mockResolvedValueOnce({ data: null, error });
    await expect(saveFinalSheet(payload)).rejects.toThrow('RPC failed');
  });
});
