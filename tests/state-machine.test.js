import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/state-machine/lib/supabase', () => ({
  getReferenceState: vi.fn(),
  upsertReferenceState: vi.fn(),
  insertHistory: vi.fn(),
  getReference: vi.fn(),
}));

vi.mock('../src/state-machine/services/thresholdService', () => ({
  getThreshold: vi.fn().mockResolvedValue(45),
}));

import { getReferenceState, insertHistory, upsertReferenceState } from '../src/state-machine/lib/supabase';
import { getAvailableEvents, isValidTransition, transition } from '../src/state-machine/services/transitionService';

const baseState = {
  reference_id: 1,
  collection_id: 1,
  current_state: 'concepto',
  previous_state: null,
  main_trunk_state: 'concepto',
  sub_states: [],
  completed_sub_states: [],
  waiting_for_merge: false,
  consumption_initial: 100,
  consumption_contramuestra: null,
  timestamp_entry: new Date().toISOString(),
  assigned_role: null,
  assigned_person_id: null,
};

function mockSuccessfulPersistence(state = baseState) {
  getReferenceState.mockResolvedValue({ data: state, error: null });
  upsertReferenceState.mockResolvedValue({ data: {}, error: null });
  insertHistory.mockResolvedValue({ data: {}, error: null });
}

describe('state machine external contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows only the configured event from each linear state', () => {
    expect(isValidTransition('concepto', 'AVANZAR_CONCEPTO')).toBe(true);
    expect(isValidTransition('concepto', 'APROBAR_COSTO')).toBe(false);
    expect(isValidTransition('completado', 'AVANZAR_CONCEPTO')).toBe(false);
  });

  it('filters fork and merge events from the available actions', () => {
    const state = { ...baseState, current_state: 'diseno' };
    expect(getAvailableEvents('diseno', state)).toContain('FORK_BORDADO');
    expect(getAvailableEvents('diseno', { ...state, sub_states: ['bordado'] })).not.toContain('FORK_BORDADO');
    expect(getAvailableEvents('union', { ...state, waiting_for_merge: false })).not.toContain('MERGE_UNION');
    expect(getAvailableEvents('union', { ...state, waiting_for_merge: true })).toContain('MERGE_UNION');
  });

  it('persists a linear transition with previous state and history', async () => {
    mockSuccessfulPersistence();

    const result = await transition(1, 'AVANZAR_CONCEPTO');

    expect(result.current_state).toBe('diseno');
    expect(result.previous_state).toBe('concepto');
    expect(upsertReferenceState).toHaveBeenCalledOnce();
    expect(insertHistory).toHaveBeenCalledOnce();
  });

  it('requires justification when a consumption changes', async () => {
    mockSuccessfulPersistence();

    await expect(
      transition(1, 'AVANZAR_CONCEPTO', { consumptionInitial: 150 })
    ).rejects.toThrow('La justificación es obligatoria');
    expect(upsertReferenceState).not.toHaveBeenCalled();
  });

  it('completes a fork and waits for merge until all branches finish', async () => {
    const state = {
      ...baseState,
      current_state: 'diseno',
      sub_states: ['bordado', 'sublimado'],
    };
    mockSuccessfulPersistence(state);

    const afterFirstBranch = await transition(1, 'COMPLETAR_BORDADO');
    expect(afterFirstBranch.current_state).toBe('diseno');
    expect(afterFirstBranch.sub_states).toEqual(['sublimado']);

    mockSuccessfulPersistence({
      ...state,
      sub_states: ['sublimado'],
      completed_sub_states: ['bordado'],
    });
    const afterAllBranches = await transition(1, 'COMPLETAR_SUBLIMADO');
    expect(afterAllBranches.current_state).toBe('union');
    expect(afterAllBranches.waiting_for_merge).toBe(true);
  });
});
