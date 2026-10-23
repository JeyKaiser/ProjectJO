import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/state-machine/lib/supabase', () => ({
  getReference: vi.fn(), getReferenceState: vi.fn(), pilotWorkflowEvent: vi.fn(),
  upsertReferenceState: vi.fn(), insertHistory: vi.fn(),
}));
vi.mock('../src/state-machine/services/thresholdService', () => ({ getThreshold: vi.fn().mockResolvedValue(45) }));
vi.mock('../src/state-machine/services/alertService', () => ({ evaluateAlert: vi.fn().mockResolvedValue({ alertLevel: 'none' }) }));

import * as db from '../src/state-machine/lib/supabase';
import { transition, initializeReference, getAvailableEvents } from '../src/state-machine/services/transitionService';

describe('pilot transition routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.getReference.mockResolvedValue({ data: { year: 2027, collections: { code: 'SS27', year: 2027 } }, error: null });
    db.getReferenceState.mockResolvedValue({ data: { current_state: 'diseno', pilot_version: 3 }, error: null });
    db.pilotWorkflowEvent.mockResolvedValue({ reference_id: 9, current_state: 'costeo', pilot_version: 4 });
  });

  it('routes pilot transition to RPC and never writes state/history separately', async () => {
    const result = await transition(9, 'AVANZAR_DISENO');
    expect(result.current_state).toBe('costeo');
    expect(db.pilotWorkflowEvent).toHaveBeenCalledWith(9, 'AVANZAR_DISENO', 3, {});
    expect(db.upsertReferenceState).not.toHaveBeenCalled();
    expect(db.insertHistory).not.toHaveBeenCalled();
  });

  it('does not initialize a historical SS27 reference without a verified workflow', async () => {
    db.getReferenceState.mockResolvedValue({ data: null, error: null });
    await expect(initializeReference(9)).rejects.toThrow(/revisión manual/i);
    expect(db.pilotWorkflowEvent).not.toHaveBeenCalled();
    expect(db.upsertReferenceState).not.toHaveBeenCalled();
  });

  it('allows completing/rejecting an active fork from a later trunk without closing commercial', () => {
    const state = { sub_states: ['bordado'], completed_sub_states: [], cancelled_sub_states: [], pilot_version: 5 };
    const events = getAvailableEvents('comercial', state);
    expect(events).toContain('COMPLETAR_BORDADO');
    expect(events).toContain('RECHAZAR_BORDADO');
    expect(events).not.toContain('CERRAR_COMERCIAL');
  });

  it('hides actions on resolved/cancelled branches and manual merge on the pilot', () => {
    const state = { sub_states: [], completed_sub_states: ['bordado'], cancelled_sub_states: ['sublimado'], pilot_version: 6, waiting_for_merge: true };
    expect(getAvailableEvents('diseno', state)).not.toContain('FORK_SUBLIMADO');
    expect(getAvailableEvents('diseno', state)).not.toContain('RECHAZAR_SUBLIMADO');
    expect(getAvailableEvents('union', state)).not.toContain('MERGE_UNION');
  });
});
