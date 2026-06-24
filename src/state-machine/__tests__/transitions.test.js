import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  getReferenceState: vi.fn(),
  upsertReferenceState: vi.fn(),
  insertHistory: vi.fn(),
  getReference: vi.fn(),
  getHistory: vi.fn(),
  getAllStates: vi.fn(),
  getReferencesByIds: vi.fn(),
  getThresholdConfigs: vi.fn(),
  client: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

vi.mock('../services/thresholdService', () => ({
  getThreshold: vi.fn().mockResolvedValue(45),
}));

import { transition, isValidTransition, getAvailableEvents } from '../services/transitionService';
import * as supabase from '../lib/supabase';

const MOCK_STATE = {
  reference_id: 1,
  collection_id: 1,
  current_state: 'concepto',
  previous_state: null,
  main_trunk_state: 'concepto',
  sub_states: [],
  completed_sub_states: [],
  waiting_for_merge: false,
  alert_level: 'none',
  consumption_initial: 100,
  consumption_contramuestra: null,
  consumption_diff: null,
  threshold_cm: 45,
  timestamp_entry: new Date(Date.now() - 86400000).toISOString(),
  last_updated: new Date().toISOString(),
  lifecycle_status: 'active',
};

describe('transitionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isValidTransition', () => {
    it('permite AVANZAR_CONCEPTO desde concepto', () => {
      expect(isValidTransition('concepto', 'AVANZAR_CONCEPTO')).toBe(true);
    });

    it('permite AVANZAR_DISENO desde diseno', () => {
      expect(isValidTransition('diseno', 'AVANZAR_DISENO')).toBe(true);
    });

    it('permite APROBAR_COSTO desde costeo', () => {
      expect(isValidTransition('costeo', 'APROBAR_COSTO')).toBe(true);
    });

    it('permite RECHAZAR desde costeo', () => {
      expect(isValidTransition('costeo', 'RECHAZAR')).toBe(true);
    });

    it('NO permite AVANZAR_CONCEPTO desde diseno', () => {
      expect(isValidTransition('diseno', 'AVANZAR_CONCEPTO')).toBe(false);
    });

    it('NO permite APROBAR_COSTO desde concepto', () => {
      expect(isValidTransition('concepto', 'APROBAR_COSTO')).toBe(false);
    });

    it('permite FORK_BORDADO desde diseno', () => {
      expect(isValidTransition('diseno', 'FORK_BORDADO')).toBe(true);
    });

    it('permite FORK_BORDADO desde industrializacion', () => {
      expect(isValidTransition('industrializacion', 'FORK_BORDADO')).toBe(true);
    });

    it('NO permite FORK_BORDADO desde concepto', () => {
      expect(isValidTransition('concepto', 'FORK_BORDADO')).toBe(false);
    });

    it('permite COMPLETAR_BORDADO desde bordado', () => {
      expect(isValidTransition('bordado', 'COMPLETAR_BORDADO')).toBe(true);
    });

    it('permite MERGE_UNION desde union', () => {
      expect(isValidTransition('union', 'MERGE_UNION')).toBe(true);
    });

    it('NO permite MERGE_UNION desde concepto', () => {
      expect(isValidTransition('concepto', 'MERGE_UNION')).toBe(false);
    });

    it('permite CERRAR_COMERCIAL desde comercial', () => {
      expect(isValidTransition('comercial', 'CERRAR_COMERCIAL')).toBe(true);
    });

    it('NO permite transiciones desde completado', () => {
      expect(isValidTransition('completado', 'AVANZAR_CONCEPTO')).toBe(false);
    });
  });

  describe('getAvailableEvents', () => {
    it('incluye FORK_BORDADO si no está activo ni completado', () => {
      const events = getAvailableEvents('diseno', MOCK_STATE);
      expect(events).toContain('FORK_BORDADO');
    });

    it('excluye FORK_BORDADO si ya está activo en sub_states', () => {
      const state = { ...MOCK_STATE, current_state: 'diseno', sub_states: ['bordado'] };
      const events = getAvailableEvents('diseno', state);
      expect(events).not.toContain('FORK_BORDADO');
    });

    it('excluye FORK_BORDADO si ya está completado', () => {
      const state = { ...MOCK_STATE, current_state: 'diseno', completed_sub_states: ['bordado'] };
      const events = getAvailableEvents('diseno', state);
      expect(events).not.toContain('FORK_BORDADO');
    });

    it('incluye MERGE_UNION solo cuando waiting_for_merge es true', () => {
      const state = { ...MOCK_STATE, current_state: 'union', waiting_for_merge: true };
      const events = getAvailableEvents('union', state);
      expect(events).toContain('MERGE_UNION');
    });

    it('excluye MERGE_UNION cuando waiting_for_merge es false', () => {
      const state = { ...MOCK_STATE, current_state: 'union', waiting_for_merge: false };
      const events = getAvailableEvents('union', state);
      expect(events).not.toContain('MERGE_UNION');
    });
  });

  describe('transition (linear flow)', () => {
    it('avanza de concepto a diseno', async () => {
      supabase.getReferenceState.mockResolvedValue({ data: MOCK_STATE, error: null });
      supabase.upsertReferenceState.mockResolvedValue({ data: {}, error: null });
      supabase.insertHistory.mockResolvedValue({ data: {}, error: null });

      const result = await transition(1, 'AVANZAR_CONCEPTO');
      expect(result.current_state).toBe('diseno');
      expect(result.previous_state).toBe('concepto');
    });

    it('avanza de diseno a costeo', async () => {
      const state = { ...MOCK_STATE, current_state: 'diseno', previous_state: 'concepto' };
      supabase.getReferenceState.mockResolvedValue({ data: state, error: null });
      supabase.upsertReferenceState.mockResolvedValue({ data: {}, error: null });
      supabase.insertHistory.mockResolvedValue({ data: {}, error: null });

      const result = await transition(1, 'AVANZAR_DISENO');
      expect(result.current_state).toBe('costeo');
    });

    it('completa secuencia completa lineal', async () => {
      const flow = [
        { from: 'concepto', event: 'AVANZAR_CONCEPTO', to: 'diseno' },
        { from: 'diseno', event: 'AVANZAR_DISENO', to: 'costeo' },
        { from: 'costeo', event: 'APROBAR_COSTO', to: 'industrializacion' },
        { from: 'industrializacion', event: 'APROBAR_INDUSTR', to: 'produccion' },
        { from: 'produccion', event: 'APROBAR_PRODUCCION', to: 'comercial' },
        { from: 'comercial', event: 'CERRAR_COMERCIAL', to: 'completado' },
      ];

      let currentState = { ...MOCK_STATE };

      for (const step of flow) {
        currentState = { ...currentState, current_state: step.from };
        supabase.getReferenceState.mockResolvedValue({ data: currentState, error: null });
        supabase.upsertReferenceState.mockResolvedValue({ data: {}, error: null });
        supabase.insertHistory.mockResolvedValue({ data: {}, error: null });

        const result = await transition(1, step.event);
        expect(result.current_state).toBe(step.to);
        currentState = result;
      }
    });
  });

  describe('transition (fork/merge)', () => {
    it('crea fork de bordado desde diseno', async () => {
      const state = { ...MOCK_STATE, current_state: 'diseno' };
      supabase.getReferenceState.mockResolvedValue({ data: state, error: null });
      supabase.upsertReferenceState.mockResolvedValue({ data: {}, error: null });
      supabase.insertHistory.mockResolvedValue({ data: {}, error: null });

      const result = await transition(1, 'FORK_BORDADO');
      expect(result.sub_states).toContain('bordado');
      expect(result.current_state).toBe('diseno');
    });

    it('completa fork de bordado y entra en union', async () => {
      const state = {
        ...MOCK_STATE, current_state: 'diseno',
        sub_states: ['bordado'], completed_sub_states: [],
        waiting_for_merge: false,
      };

      supabase.getReferenceState.mockResolvedValue({ data: state, error: null });
      supabase.upsertReferenceState.mockResolvedValue({ data: {}, error: null });
      supabase.insertHistory.mockResolvedValue({ data: {}, error: null });

      const result = await transition(1, 'COMPLETAR_BORDADO');
      expect(result.sub_states).not.toContain('bordado');
      expect(result.completed_sub_states).toContain('bordado');
      expect(result.current_state).toBe('union');
      expect(result.waiting_for_merge).toBe(true);
    });

    it('hace merge desde union de vuelta al tronco principal', async () => {
      const state = {
        ...MOCK_STATE, current_state: 'union',
        previous_state: 'diseno', main_trunk_state: 'diseno',
        sub_states: [], completed_sub_states: ['bordado'],
        waiting_for_merge: true,
      };

      supabase.getReferenceState.mockResolvedValue({ data: state, error: null });
      supabase.upsertReferenceState.mockResolvedValue({ data: {}, error: null });
      supabase.insertHistory.mockResolvedValue({ data: {}, error: null });

      const result = await transition(1, 'MERGE_UNION');
      expect(result.current_state).toBe('diseno');
      expect(result.waiting_for_merge).toBe(false);
      expect(result.completed_sub_states).toEqual([]);
    });

    it('fork multiple: bordado + sublimado, merge solo al completar ambos', async () => {
      const state = {
        ...MOCK_STATE, current_state: 'diseno',
        sub_states: ['bordado', 'sublimado'],
        completed_sub_states: [],
        waiting_for_merge: false,
      };

      // Completar bordado
      supabase.getReferenceState.mockResolvedValue({ data: state, error: null });
      supabase.upsertReferenceState.mockResolvedValue({ data: {}, error: null });
      supabase.insertHistory.mockResolvedValue({ data: {}, error: null });

      const afterBordado = await transition(1, 'COMPLETAR_BORDADO');
      expect(afterBordado.current_state).toBe('diseno');
      expect(afterBordado.waiting_for_merge).toBe(false);
      expect(afterBordado.sub_states).toEqual(['sublimado']);
      expect(afterBordado.completed_sub_states).toEqual(['bordado']);

      // Completar sublimado while bordado already done
      const state2 = {
        ...MOCK_STATE, current_state: 'diseno',
        sub_states: ['sublimado'],
        completed_sub_states: ['bordado'],
        waiting_for_merge: false,
      };

      supabase.getReferenceState.mockResolvedValue({ data: state2, error: null });
      supabase.upsertReferenceState.mockResolvedValue({ data: {}, error: null });
      supabase.insertHistory.mockResolvedValue({ data: {}, error: null });
      const afterSublimado = await transition(1, 'COMPLETAR_SUBLIMADO');
      expect(afterSublimado.current_state).toBe('union');
      expect(afterSublimado.waiting_for_merge).toBe(true);
      expect(afterSublimado.sub_states).toEqual([]);
      expect(afterSublimado.completed_sub_states).toEqual(['bordado', 'sublimado']);
    });
  });

  describe('transition (rechazo de costeo)', () => {
    it('rechaza desde costeo de vuelta a diseno', async () => {
      const state = { ...MOCK_STATE, current_state: 'costeo', previous_state: 'diseno' };
      supabase.getReferenceState.mockResolvedValue({ data: state, error: null });
      supabase.upsertReferenceState.mockResolvedValue({ data: {}, error: null });
      supabase.insertHistory.mockResolvedValue({ data: {}, error: null });

      const result = await transition(1, 'RECHAZAR', { justification: 'Faltan piezas' });
      expect(result.current_state).toBe('diseno');
    });
  });

  describe('justification requirement', () => {
    it('NO requiere justificacion si los consumos no cambian', async () => {
      const state = { ...MOCK_STATE, current_state: 'concepto', consumption_initial: 100 };
      supabase.getReferenceState.mockResolvedValue({ data: state, error: null });
      supabase.upsertReferenceState.mockResolvedValue({ data: {}, error: null });
      supabase.insertHistory.mockResolvedValue({ data: {}, error: null });

      await expect(transition(1, 'AVANZAR_CONCEPTO', {})).resolves.toBeDefined();
    });

    it('REQUIERE justificacion si consumptionInitial cambia', async () => {
      const state = { ...MOCK_STATE, current_state: 'concepto', consumption_initial: 100 };
      supabase.getReferenceState.mockResolvedValue({ data: state, error: null });

      await expect(
        transition(1, 'AVANZAR_CONCEPTO', { consumptionInitial: 150 })
      ).rejects.toThrow('justificación');
    });

    it('REQUIERE justificacion si consumptionContramuestra cambia', async () => {
      const state = { ...MOCK_STATE, current_state: 'concepto', consumption_contramuestra: 100 };
      supabase.getReferenceState.mockResolvedValue({ data: state, error: null });

      await expect(
        transition(1, 'AVANZAR_CONCEPTO', { consumptionContramuestra: 160 })
      ).rejects.toThrow('justificación');
    });

    it('acepta si se provee justificacion cuando los consumos cambian', async () => {
      const state = { ...MOCK_STATE, current_state: 'concepto', consumption_initial: 100 };
      supabase.getReferenceState.mockResolvedValue({ data: state, error: null });
      supabase.upsertReferenceState.mockResolvedValue({ data: {}, error: null });
      supabase.insertHistory.mockResolvedValue({ data: {}, error: null });

      const result = await transition(1, 'AVANZAR_CONCEPTO', {
        consumptionInitial: 150,
        justification: 'Se añadió forro interno por transparencia',
      });
      expect(result.current_state).toBe('diseno');
    });
  });
});
