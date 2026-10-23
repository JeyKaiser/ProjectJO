import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ default: db, uploadImage: vi.fn() }));
import { createGarmentType, setGarmentTypeActive } from '../src/lib/api';

describe('garment catalog write contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a named active type without sending legacy enum values', async () => {
    const query = { insert: vi.fn().mockResolvedValue({ error: null }) };
    db.from.mockReturnValue(query);
    await createGarmentType(' Traje ', 'Formal');
    expect(db.from).toHaveBeenCalledWith('tipo_prendas');
    expect(query.insert).toHaveBeenCalledWith({ name: 'Traje', description: 'Formal', active: true });
  });

  it('hides a type instead of deleting the historical value', async () => {
    const query = { update: vi.fn(), eq: vi.fn().mockResolvedValue({ error: null }) };
    query.update.mockReturnValue(query);
    db.from.mockReturnValue(query);
    await setGarmentTypeActive(4, false);
    expect(query.update).toHaveBeenCalledWith({ active: false });
    expect(query.eq).toHaveBeenCalledWith('id', 4);
  });
});
