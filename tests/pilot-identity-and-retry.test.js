import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

const db = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ default: db, uploadImage: vi.fn() }));
import { loadDashboardReferences, getReferenceById, isDefinitiveCreateError, resolveReferenceCodes, selectDashboardReference } from '../src/lib/api';

it('routes identical numbers to the collection and year in the URL', () => {
  const collections = [
    { nombre: 'Summer Sun', anios: [{ anio: 2027, referencias: [{ referenceNumber: '19', dbId: 11 }] }] },
    { nombre: 'Winter Sun', anios: [{ anio: 2027, referencias: [{ referenceNumber: '19', dbId: 12 }] }] },
  ];
  expect(selectDashboardReference(collections, 'winter-sun', 2027, '19').ref.dbId).toBe(12);
  expect(selectDashboardReference(collections, 'summer-sun', 2027, '19').ref.dbId).toBe(11);
  expect(selectDashboardReference(collections, 'winter-sun', 2026, '19').ref).toBeUndefined();
});

it('reads by primary key when two collections share the same year and number', async () => {
  const rows = [{ id: 11, collection_id: 2, year: 2027, reference_number: '19' },
    { id: 12, collection_id: 3, year: 2027, reference_number: '19' }];
  const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
  query.select.mockReturnValue(query); query.eq.mockReturnValue(query);
  query.maybeSingle.mockImplementation(async () => ({ data: rows.find(r => r.id === query.eq.mock.lastCall[1]), error: null }));
  db.from.mockReturnValue(query);
  expect(await getReferenceById(12)).toMatchObject({ id: 12, collection_id: 3 });
  expect(query.eq).toHaveBeenCalledWith('id', 12);
  const hooks = readFileSync(new URL('../src/lib/api.js', import.meta.url), 'utf8');
  expect(hooks).not.toMatch(/\.eq\('reference_number', refNum\)/);
  expect(hooks).toMatch(/useConsumos\(dbRefId\)[\s\S]*?\.eq\('reference_id', Number\(dbRefId\)\)/);
});

it('loads every dashboard page, including records after a full first page', async () => {
  const query = { select: vi.fn(), order: vi.fn(), gt: vi.fn(), limit: vi.fn() };
  query.select.mockReturnValue(query); query.order.mockReturnValue(query); query.gt.mockReturnValue(query);
  query.limit.mockResolvedValueOnce({ data: Array.from({ length: 500 }, (_, i) => ({ id: i + 1 })), error: null })
    .mockResolvedValueOnce({ data: [{ id: 501 }], error: null })
    .mockResolvedValueOnce({ data: [], error: null });
  db.from.mockReturnValue(query);
  const refs = await loadDashboardReferences();
  expect(refs).toHaveLength(501);
  expect(refs.at(-1).id).toBe(501);
  expect(query.gt).toHaveBeenCalledWith('id', 500);
});

it('continues loading when PostgREST caps a page below the requested limit', async () => {
  const query = { select: vi.fn(), order: vi.fn(), gt: vi.fn(), limit: vi.fn() };
  query.select.mockReturnValue(query); query.order.mockReturnValue(query); query.gt.mockReturnValue(query);
  query.limit.mockResolvedValueOnce({ data: [{ id: 1 }], error: null })
    .mockResolvedValueOnce({ data: [{ id: 2 }], error: null })
    .mockResolvedValueOnce({ data: [], error: null });
  db.from.mockReturnValue(query);
  expect((await loadDashboardReferences()).map(r => r.id)).toEqual([1, 2]);
});

it('fetches code assignments beyond the first server-limited page', async () => {
  const query = { select: vi.fn(), in: vi.fn(), eq: vi.fn(), order: vi.fn(), gt: vi.fn(), limit: vi.fn() };
  for (const method of ['select', 'in', 'eq', 'order', 'gt']) query[method].mockReturnValue(query);
  query.limit.mockResolvedValueOnce({ data: [{ id: 1, reference_id: 11, code_type: 'MD', code: 'MD-A' }], error: null })
    .mockResolvedValueOnce({ data: [{ id: 2, reference_id: 12, code_type: 'PT', code: 'PT-B' }], error: null })
    .mockResolvedValueOnce({ data: [], error: null });
  db.from.mockReturnValue(query);
  expect(await resolveReferenceCodes([11, 12])).toEqual({ 11: { MD: 'MD-A' }, 12: { PT: 'PT-B' } });
});

it('never discards uncertain create identity, but allows correction after definitive DB rejection', () => {
  expect(isDefinitiveCreateError({ code: '23505' })).toBe(true);
  expect(isDefinitiveCreateError({ code: 'PGRST116' })).toBe(false);
  expect(isDefinitiveCreateError(new Error('network timeout'))).toBe(false);
  const ui = readFileSync(new URL('../src/pages/FichaTecnicaForm.jsx', import.meta.url), 'utf8');
  expect(ui).toMatch(/if \(isDefinitiveCreateError\(err\)\) pendingCreate\.current = null/);
  expect(ui).toMatch(/Descartar intento/);
});

it('separates global Admin-only status edits from SS27-only workflow transitions', () => {
  const sql = readFileSync(new URL('../migracion/030_ss27_catalog_additive.sql', import.meta.url), 'utf8');
  const workflow = readFileSync(new URL('../migracion/031_ss27_workflow.sql', import.meta.url), 'utf8');
  expect(sql).toMatch(/ELSIF NEW\.status_id IS DISTINCT FROM OLD\.status_id AND NOT jo\.is_admin_user\(\)/);
  expect(sql).not.toMatch(/ELSIF NEW IS DISTINCT FROM OLD AND NOT jo\.is_admin_user\(\)/);
  expect(workflow).toMatch(/pilot_workflow_event_031[\s\S]*current_user_has_role\('Administrador'\)[\s\S]*c\.code='SS27'/);
});
