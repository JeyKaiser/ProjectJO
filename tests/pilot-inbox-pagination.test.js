import { expect, it, vi, beforeEach } from 'vitest';

const db = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ supabase: db }));
import { getPilotStates, getReferencesByIds } from '../src/state-machine/lib/supabase';
import { readFileSync } from 'node:fs';
beforeEach(() => db.from.mockReset());

it('loads the pilot inbox only after resolving the SS27 collection id, never by scanning every state', () => {
  const service = readFileSync(new URL('../src/state-machine/services/inboxService.js', import.meta.url), 'utf8');
  expect(service).toMatch(/fetchCollections\(\)[\s\S]*getPilotStates\(pilotCollection\.id\)/);
  expect(service).not.toMatch(/const \{ data: states \} = await getAllStates\(\);/);
});

it('filters reference_states by SS27 collection/year before paging; includes records across short pages', async () => {
  const q = { select: vi.fn(), eq: vi.fn(), order: vi.fn(), gt: vi.fn(), limit: vi.fn() };
  for (const key of ['select','eq','order','gt']) q[key].mockReturnValue(q);
  q.limit.mockResolvedValueOnce({ data: [{ id: 1, reference_id: 10, collection_id: 3, references: { year: 2027 } }], error: null })
    .mockResolvedValueOnce({ data: [{ id: 2, reference_id: 11, collection_id: 3, references: { year: 2027 } }], error: null })
    .mockResolvedValueOnce({ data: [], error: null });
  db.from.mockReturnValue(q);
  const { data } = await getPilotStates(3);
  expect(data.map(s => s.reference_id)).toEqual([10, 11]);
  expect(q.eq).toHaveBeenCalledWith('collection_id', 3);
  expect(q.eq).toHaveBeenCalledWith('references.collection_id', 3);
  expect(q.eq).toHaveBeenCalledWith('references.year', 2027);
  expect(q.gt).toHaveBeenCalledWith('id', 1);
});

it('loads reference details in batches, not per inbox item, and dedupes overlapping state IDs', async () => {
  const q = { select: vi.fn(), in: vi.fn(), order: vi.fn(), gt: vi.fn(), limit: vi.fn() };
  for (const key of ['select','in','order','gt']) q[key].mockReturnValue(q);
  q.limit.mockResolvedValueOnce({ data: [{ id: 10, reference_number: '19', year: 2027 }], error: null })
    .mockResolvedValueOnce({ data: [{ id: 11, reference_number: '19', year: 2027 }], error: null })
    .mockResolvedValueOnce({ data: [], error: null });
  db.from.mockReturnValue(q);
  const { data } = await getReferencesByIds([10, 10, 11]);
  expect(data.map(ref => ref.id)).toEqual([10, 11]);
  expect(q.in).toHaveBeenCalledWith('id', [10, 11]);
  expect(db.from).toHaveBeenCalledTimes(3); // two pages + empty sentinel, not per ref
});
