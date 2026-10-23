import { expect, it, vi, afterEach } from 'vitest';

const serviceDb = vi.hoisted(() => ({
  getAllStates: vi.fn(), getPilotStates: vi.fn(), getReferencesByIds: vi.fn(), getCollections: vi.fn(),
}));
vi.mock('../src/state-machine/lib/supabase', () => serviceDb);

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

it('counts only SS27/2027 pilot inbox rows and loads reference details as one batch', async () => {
  vi.stubEnv('VITE_PILOT_COLLECTION_CODE', 'SS27');
  vi.resetModules();
  serviceDb.getCollections.mockResolvedValue({ data: [{ id: 3, name: 'SS27', code: 'SS27', year: 2027 },
    { id: 4, name: 'WS27', code: 'WS27', year: 2027 }] });
  serviceDb.getPilotStates.mockResolvedValue({ data: [
    { id: 1, reference_id: 10, collection_id: 3, current_state: 'concepto' },
    { id: 2, reference_id: 11, collection_id: 3, current_state: 'diseno' },
    { id: 3, reference_id: 12, collection_id: 4, current_state: 'concepto' },
  ] });
  serviceDb.getReferencesByIds.mockResolvedValue({ data: [
    { id: 10, year: 2027, reference_number: '19', reference_codes: [] },
    { id: 11, year: 2027, reference_number: '20', reference_codes: [] },
    { id: 12, year: 2027, reference_number: '19', reference_codes: [] },
  ] });
  const { getInbox, clearCollectionsCache } = await import('../src/state-machine/services/inboxService');
  clearCollectionsCache();
  const items = await getInbox();
  expect(items.map(item => item.referenceId).sort()).toEqual([10, 11]);
  expect(serviceDb.getPilotStates).toHaveBeenCalledWith(3);
  expect(serviceDb.getAllStates).not.toHaveBeenCalled();
  expect(serviceDb.getReferencesByIds).toHaveBeenCalledTimes(1);
});
