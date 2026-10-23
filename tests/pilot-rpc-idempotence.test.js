import { expect, it, vi, beforeEach } from 'vitest';
const db = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ supabase: db, default: db }));
import { pilotWorkflowEvent } from '../src/state-machine/lib/supabase';

beforeEach(() => vi.clearAllMocks());

it('reuses the same request_id and version after an uncertain network failure', async () => {
  db.rpc.mockResolvedValueOnce({ data: null, error: new Error('network timeout') })
    .mockResolvedValueOnce({ data: { pilot_version: 6 }, error: null });
  await expect(pilotWorkflowEvent(41, 'AVANZAR_DISENO', 5, {})).rejects.toThrow('network timeout');
  await pilotWorkflowEvent(41, 'AVANZAR_DISENO', 5, {});
  const [first, second] = db.rpc.mock.calls;
  expect(first[1].p_request_id).toBe(second[1].p_request_id);
  expect(second[1].p_expected_version).toBe(5);
});

it('rejects known version conflict; a refreshed new attempt gets a new ID', async () => {
  db.rpc.mockResolvedValueOnce({ data: null, error: { code: '40001', message: 'Version obsoleta' } })
    .mockResolvedValueOnce({ data: { pilot_version: 8 }, error: null });
  await expect(pilotWorkflowEvent(41, 'APROBAR_COSTO', 6, {})).rejects.toMatchObject({ code: '40001' });
  expect(db.rpc).toHaveBeenCalledTimes(1);
  await pilotWorkflowEvent(41, 'APROBAR_COSTO', 7, {});
  const [first, second] = db.rpc.mock.calls;
  expect(first[1].p_request_id).not.toBe(second[1].p_request_id);
  expect(second[1].p_expected_version).toBe(7);
});
