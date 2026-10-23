import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../migracion/031_ss27_workflow.sql', import.meta.url), 'utf8');
const facade = readFileSync(new URL('../migracion/032_ss27_create_receipt.sql', import.meta.url), 'utf8');
const runbook = readFileSync(new URL('../docs/piloto-ss27-operacion.md', import.meta.url), 'utf8');

it('never grants the mutable 031 core to browser roles, even temporarily between migrations', () => {
  expect(sql).toMatch(/REVOKE ALL ON FUNCTION jo\.pilot_create_reference_031\(jsonb,uuid\) FROM PUBLIC,anon,authenticated/);
  expect(sql).not.toMatch(/GRANT EXECUTE ON FUNCTION jo\.pilot_create_reference_031\(jsonb,uuid\) TO authenticated/);
  expect(facade).toMatch(/REVOKE ALL ON FUNCTION jo\.pilot_create_reference_032\(jsonb,uuid\) FROM PUBLIC,anon/);
  expect(facade).toMatch(/GRANT EXECUTE ON FUNCTION jo\.pilot_create_reference_032\(jsonb,uuid\) TO authenticated/);
  expect(runbook).toMatch(/core 031[\s\S]*sin EXECUTE[\s\S]*authenticated/);
});

it('stops at old receipts for manual examination of receipt, sheet and history without inference', () => {
  expect(facade).toMatch(/IF EXISTS \(SELECT 1 FROM jo\.pilot_reference_create_requests\)[\s\S]*RAISE EXCEPTION/);
  expect(runbook).toMatch(/recibo[\s\S]*ficha[\s\S]*historial[\s\S]*sin rellenar[\s\S]*032/);
});

it('spells out manual gates for zero/multiple fork cancel/reopen and history without snapshots', () => {
  expect(runbook).toMatch(/cancelar al crear[\s\S]*0 forks[\s\S]*varios forks[\s\S]*históricas sin snapshot/);
  expect(runbook).toMatch(/NOT_VALIDATED/);
});

const deps = vi.hoisted(() => ({ getAllStates: vi.fn(), getPilotStates: vi.fn(), getReferencesByIds: vi.fn(), getCollections: vi.fn() }));
vi.mock('../src/state-machine/lib/supabase', () => deps);

it('loads pilot alert sources only from SS27/2027 and batches reference details', async () => {
  vi.stubEnv('VITE_PILOT_COLLECTION_CODE', 'SS27');
  vi.resetModules();
  deps.getCollections.mockResolvedValue({ data: [{ id: 3, code: 'SS27', year: 2027, name: 'SS27' },
    { id: 4, code: 'FW27', year: 2027, name: 'FW27' }] });
  deps.getPilotStates.mockResolvedValue({ data: [
    { id: 1, collection_id: 3, reference_id: 10, references: { year: 2027 }, alert_level: 'critical' },
    { id: 2, collection_id: 3, reference_id: 11, references: { year: 2027 }, alert_level: 'warning' },
    { id: 3, collection_id: 4, reference_id: 12, references: { year: 2027 }, alert_level: 'critical' },
  ], error: null });
  deps.getReferencesByIds.mockResolvedValue({ data: [
    { id: 10, collection_id: 3, year: 2027, reference_number: '19' },
    { id: 11, collection_id: 3, year: 2027, reference_number: '20' },
  ], error: null });
  const { loadAlertSource, clearCollectionsCache } = await import('../src/state-machine/services/inboxService');
  clearCollectionsCache();
  const { states, refs } = await loadAlertSource();
  expect(states.map(s => s.reference_id)).toEqual([10, 11]);
  expect(refs.map(r => r.id)).toEqual([10, 11]);
  expect(deps.getPilotStates).toHaveBeenCalledWith(3);
  expect(deps.getAllStates).not.toHaveBeenCalled();
  expect(deps.getReferencesByIds).toHaveBeenCalledTimes(1);
  vi.unstubAllEnvs();
});

it('does not cache a failed collection request or missing SS27 as empty pilot alerts', async () => {
  vi.stubEnv('VITE_PILOT_COLLECTION_CODE', 'SS27');
  vi.resetModules();
  const { loadAlertSource, clearCollectionsCache } = await import('../src/state-machine/services/inboxService');
  clearCollectionsCache();
  deps.getCollections.mockReset();
  deps.getPilotStates.mockReset();
  deps.getCollections.mockResolvedValueOnce({ data: null, error: new Error('request rejected') })
    .mockResolvedValueOnce({ data: [], error: null });
  await expect(loadAlertSource()).rejects.toThrow('request rejected');
  await expect(loadAlertSource()).rejects.toThrow(/SS27.*no disponible/i);
  expect(deps.getCollections).toHaveBeenCalledTimes(2);
  expect(deps.getPilotStates).not.toHaveBeenCalled();
  vi.unstubAllEnvs();
});

it('shows no alerts after a valid SS27 collection with zero states', async () => {
  vi.stubEnv('VITE_PILOT_COLLECTION_CODE', 'SS27');
  vi.resetModules();
  const { loadAlertSource, clearCollectionsCache } = await import('../src/state-machine/services/inboxService');
  clearCollectionsCache();
  deps.getCollections.mockReset();
  deps.getPilotStates.mockReset();
  deps.getReferencesByIds.mockReset();
  deps.getCollections.mockResolvedValue({ data: [{ id: 3, code: 'SS27', year: 2027 }] });
  deps.getPilotStates.mockResolvedValue({ data: [], error: null });
  expect(await loadAlertSource()).toEqual({ states: [], refs: [] });
  expect(deps.getReferencesByIds).not.toHaveBeenCalled();
  vi.unstubAllEnvs();
});
