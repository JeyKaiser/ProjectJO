import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMock = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock('../src/lib/supabase', () => ({
  default: supabaseMock,
  uploadImage: vi.fn(),
}));

import { createReference, validateReferenceLineSubline } from '../src/lib/api';

function referenceQuery(result) {
  const query = {
    insert: vi.fn(() => query),
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    single: vi.fn(() => Promise.resolve(result)),
  };
  return query;
}

describe('technical sheet persistence contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists the reference fields and preserves explicit false values', async () => {
    const query = referenceQuery({ data: { id: 19, reference_number: '19' }, error: null });
    supabaseMock.from.mockReturnValue(query);

    const result = await createReference({
      collection_id: 3,
      year: 2026,
      reference_number: '19',
      name: 'Blusa Aurora',
      color: 'Azul',
      color_code: 'A-01',
      length_description: 'Midi',
      length_cm: 72,
      has_embroidery: false,
      has_semielaborated: true,
      priority_first_buy: 1,
      drop_entrega: 'A',
      status_id: 2,
      linned: false,
      requiere_muestra: true,
      line_id: 8,
      subline_id: 25,
      tipo_prenda_id: 14,
    });

    expect(result.data).toEqual({ id: 19, reference_number: '19' });
    expect(supabaseMock.from).toHaveBeenCalledWith('references');
    expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({
      collection_id: 3,
      year: 2026,
      reference_number: '19',
      name: 'Blusa Aurora',
      has_embroidery: false,
      has_semielaborated: true,
      linned: false,
      requiere_muestra: true,
      tipo_prenda_id: 14,
      line_id: 8,
      subline_id: 25,
      is_hidden: false,
    }));
  });

  it('returns Supabase errors for the form to handle', async () => {
    const error = new Error('reference_number already exists');
    supabaseMock.from.mockReturnValue(referenceQuery({ data: null, error }));

    const result = await createReference({ reference_number: '19', name: 'Duplicada', tipo_prenda_id: 14, line_id: 8, subline_id: 25 });

    expect(result.error).toBe(error);
  });

  it('rejects subline without line before querying Supabase', async () => {
    const result = await createReference({ reference_number: '20', name: 'Sin catálogo', tipo_prenda_id: 14, subline_id: 25 });

    expect(result.data).toBeNull();
    expect(result.error.message).toBe('La sublínea requiere una línea.');
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it('permits blank line/subline and persists independent maquila flags', async () => {
    const query = referenceQuery({ data: { id: 20 }, error: null });
    supabaseMock.from.mockReturnValue(query);
    await createReference({ reference_number: '20', tipo_prenda_id: 14, status_id: 2, envio_corte_maquila: true });
    expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({
      tipo_prenda_id: 14, line_id: null, subline_id: null,
      envio_corte_maquila: true, envio_confeccion_maquila: false,
    }));
  });

  it('requires concrete type before any network request', async () => {
    const result = await createReference({ reference_number: '20' });
    expect(result.error.message).toMatch(/tipo de prenda/i);
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it('validates membership against the sublines loaded for the selected line', () => {
    expect(validateReferenceLineSubline({})).toBeNull();
    expect(validateReferenceLineSubline({ line_id: 1 })).toBeNull();
    expect(validateReferenceLineSubline({ line_id: 1, subline_id: 2, availableSublines: [{ id: 2, name: 'ANKLE' }] })).toBeNull();
    expect(validateReferenceLineSubline({ line_id: 1, subline_id: 3, availableSublines: [{ id: 2, name: 'ANKLE' }] }))
      .toBe('La sublínea no pertenece a la línea seleccionada.');
  });
});
