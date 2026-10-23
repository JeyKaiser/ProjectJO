import { expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ default: db, uploadImage: vi.fn() }));
import { loadReferenceMontages } from '../src/lib/api';

it('shows persisted normalized montage, choosing the latest row per reference', async () => {
  const query = { select: vi.fn(), in: vi.fn(), order: vi.fn(), limit: vi.fn(), lt: vi.fn() };
  query.select.mockReturnValue(query);
  query.in.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.lt.mockReturnValue(query);
  query.limit.mockResolvedValueOnce({ data: [
    { id: 10, reference_id: 1, montage_type: 'Drapeado' },
    { id: 7, reference_id: 1, montage_type: 'No aplica' },
    { id: 8, reference_id: 2, montage_type: 'Prensados' },
  ], error: null }).mockResolvedValueOnce({ data: [], error: null });
  db.from.mockReturnValue(query);

  expect(await loadReferenceMontages([1, 2])).toEqual({ 1: 'Drapeado', 2: 'Prensados' });
  expect(db.from).toHaveBeenCalledWith('montage_mannequin');
});

it('pages montage rows by descending id to avoid silent PostgREST row truncation', async () => {
  const query = { select: vi.fn(), in: vi.fn(), order: vi.fn(), limit: vi.fn(), lt: vi.fn() };
  query.select.mockReturnValue(query); query.in.mockReturnValue(query);
  query.order.mockReturnValue(query); query.lt.mockReturnValue(query);
  query.limit.mockResolvedValueOnce({ data: Array.from({ length: 500 }, (_, i) => ({
    id: 1000 - i, reference_id: 1, montage_type: 'Drapeado',
  })), error: null }).mockResolvedValueOnce({ data: [{ id: 500, reference_id: 2, montage_type: 'Descole' }], error: null })
    .mockResolvedValueOnce({ data: [], error: null });
  db.from.mockReturnValue(query);
  expect(await loadReferenceMontages([1, 2])).toEqual({ 1: 'Drapeado', 2: 'Descole' });
  expect(query.lt).toHaveBeenCalledWith('id', 501);
});

it('continues montage pagination despite a server cap below the requested limit', async () => {
  const query = { select: vi.fn(), in: vi.fn(), order: vi.fn(), limit: vi.fn(), lt: vi.fn() };
  for (const method of ['select', 'in', 'order', 'lt']) query[method].mockReturnValue(query);
  query.limit.mockResolvedValueOnce({ data: [{ id: 8, reference_id: 1, montage_type: 'Drapeado' }], error: null })
    .mockResolvedValueOnce({ data: [{ id: 7, reference_id: 2, montage_type: 'Descole' }], error: null })
    .mockResolvedValueOnce({ data: [], error: null });
  db.from.mockReturnValue(query);
  expect(await loadReferenceMontages([1, 2])).toEqual({ 1: 'Drapeado', 2: 'Descole' });
});
