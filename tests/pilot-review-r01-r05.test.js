import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../migracion/031_ss27_workflow.sql', import.meta.url), 'utf8');
const catalog = readFileSync(new URL('../migracion/030_ss27_catalog_additive.sql', import.meta.url), 'utf8');

it('serializes same UUID before receipt lookup, preserving successful retry result under concurrency', () => {
  const create = sql.slice(sql.indexOf('CREATE OR REPLACE FUNCTION jo.pilot_create_reference_031'));
  expect(create).toMatch(/pg_advisory_xact_lock\(hashtextextended\(p_request_id::text,0\)\)/);
  expect(create.indexOf('pg_advisory_xact_lock')).toBeLessThan(create.indexOf('SELECT * INTO existing FROM jo.pilot_reference_create_requests'));
  expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS jo\.pilot_reference_create_requests \(\s*request_id uuid PRIMARY KEY/);
});

it('limits new reference INSERTs to SS27 but permits unrelated UPDATE fields and global Admin status edits', () => {
  expect(catalog).toMatch(/IF TG_OP='INSERT' THEN[\s\S]*NEW\.year IS DISTINCT FROM 2027/);
  expect(catalog).toMatch(/ELSIF NEW\.status_id IS DISTINCT FROM OLD\.status_id AND NOT jo\.is_admin_user\(\)/);
  expect(catalog).not.toMatch(/IF TG_OP='UPDATE' AND NOT jo\.is_admin_user\(\)/);
  const runbook = readFileSync(new URL('../docs/piloto-ss27-operacion.md', import.meta.url), 'utf8');
  expect(runbook).toMatch(/referencias antiguas de otras colecciones/);
  expect(runbook).toMatch(/altas fuera de SS27.*deshabilitad/i);
});

it('does not present the static verifier as a passed runtime JWT/RLS/concurrency certification', () => {
  const verify = readFileSync(new URL('../migracion/verify_030_031_ss27.sql', import.meta.url), 'utf8');
  const runbook = readFileSync(new URL('../docs/piloto-ss27-operacion.md', import.meta.url), 'utf8');
  expect(verify).toMatch(/NO-RUN/);
  expect(verify).toMatch(/RAISE EXCEPTION/);
  expect(verify).toMatch(/CATALOG_PREFLIGHT_ONLY_NOT_RUNTIME_CERTIFICATION/);
  expect(runbook).toMatch(/JWT\/RLS\/rollback\/concurrencia[\s\S]*NOT_VALIDATED/);
});

const db = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ default: db, uploadImage: vi.fn() }));
import { loadDashboardReferences, searchReferences } from '../src/lib/api';

it('applies collection and year filters server-side on every dashboard page', async () => {
  const query = { select: vi.fn(), eq: vi.fn(), order: vi.fn(), gt: vi.fn(), limit: vi.fn() };
  for (const key of ['select','eq','order','gt']) query[key].mockReturnValue(query);
  query.limit.mockResolvedValueOnce({ data: [{ id: 101, collection_id: 3, year: 2027 }], error: null })
    .mockResolvedValueOnce({ data: [{ id: 102, collection_id: 3, year: 2027 }], error: null })
    .mockResolvedValueOnce({ data: [], error: null });
  db.from.mockReturnValue(query);
  expect(await loadDashboardReferences([3], 2027)).toHaveLength(2);
  expect(query.eq.mock.calls.filter(args => args[0] === 'collection_id')).toHaveLength(3);
  expect(query.eq.mock.calls.filter(args => args[0] === 'year')).toHaveLength(3);
  const api = readFileSync(new URL('../src/lib/api.js', import.meta.url), 'utf8');
  expect(api).toMatch(/collectionsQuery = collectionsQuery\.eq\('code', 'SS27'\)\.eq\('year', 2027\)/);
});

it('finds actual assigned PT on correct reference despite duplicate reference numbers across collections', async () => {
  const refs = [{ id: 11, reference_number: '19', collection_id: 2, name: 'Abrigo', year: 2027,
    collections: { name: 'Winter Sun', code: 'WS27' } },
  { id: 12, reference_number: '19', collection_id: 3, name: 'Vestido', year: 2027,
    collections: { name: 'Summer Sun', code: 'SS27' } }];
  const calls = [];
  const createQuery = table => {
    let pastCursor = false;
    const q = { select: vi.fn(), eq: vi.fn(), ilike: vi.fn(), in: vi.fn(), order: vi.fn(), gt: vi.fn(), limit: vi.fn() };
    for (const key of ['select','eq','ilike','in','order']) q[key].mockReturnValue(q);
    q.gt.mockImplementation(() => { pastCursor = true; return q; });
    q.limit.mockImplementation(async () => ({ data: pastCursor ? [] : table === 'reference_codes'
      ? [{ reference_id: 12, code_type: 'PT', code: 'PT0319', active: true }]
      : table === 'references' && q.in.mock.calls.length ? [refs[1]] : [], error: null }));
    calls.push({ table, q });
    return q;
  };
  db.from.mockImplementation(createQuery);
  const results = await searchReferences('PT0319', { collectionId: 3, year: 2027 });
  expect(results).toMatchObject([{ id: 12, collectionId: 3, codigoPT: 'PT0319', collectionName: 'Summer Sun' }]);
  expect(results.some(row => row.id === 11)).toBe(false);
  const ptQuery = calls.find(c => c.table === 'reference_codes').q;
  expect(ptQuery.eq).toHaveBeenCalledWith('references.collection_id', 3);
  expect(ptQuery.eq).toHaveBeenCalledWith('references.year', 2027);
  expect(calls.find(c => c.table === 'references' && c.q.in.mock.calls.length).q.eq).toHaveBeenCalledWith('collection_id', 3);
});
