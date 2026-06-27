import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/thresholdService', () => ({
  getThreshold: vi.fn(),
  getDefaultThreshold: vi.fn(() => 45),
}));

import { evaluateAlert, evaluateAlertSync } from '../services/alertService';
import { getThreshold } from '../services/thresholdService';

describe('alertService', () => {
  describe('evaluateAlert (async, with threshold lookup)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('retorna none si no hay consumos', async () => {
      const result = await evaluateAlert(1, null, null);
      expect(result.alertLevel).toBe('none');
    });

    it('retorna critical si diff >= threshold', async () => {
      getThreshold.mockResolvedValue(45);
      const result = await evaluateAlert(1, 100, 148);
      expect(result.alertLevel).toBe('critical');
      expect(result.consumptionDiff).toBe(48);
      expect(result.alertReason).toContain('crítica');
    });

    it('retorna warning si diff >= 75% del threshold', async () => {
      getThreshold.mockResolvedValue(45);
      const result = await evaluateAlert(1, 100, 135);
      expect(result.alertLevel).toBe('warning');
      expect(result.consumptionDiff).toBe(35);
    });

    it('retorna none si diff < 75% del threshold', async () => {
      getThreshold.mockResolvedValue(45);
      const result = await evaluateAlert(1, 100, 120);
      expect(result.alertLevel).toBe('none');
      expect(result.consumptionDiff).toBe(20);
    });

    it('usa threshold de referencia personalizado', async () => {
      getThreshold.mockResolvedValue(30);
      const result = await evaluateAlert(1, 100, 130);
      expect(result.alertLevel).toBe('critical');
      expect(result.threshold).toBe(30);
    });

    it('usa threshold por defecto si no hay config', async () => {
      getThreshold.mockResolvedValue(45);
      const result = await evaluateAlert(1, 100, 200);
      expect(result.alertLevel).toBe('critical');
      expect(result.consumptionDiff).toBe(100);
    });
  });

  describe('evaluateAlertSync (sync, with explicit threshold)', () => {
    it('retorna critical con threshold 45 y diff 48', () => {
      const result = evaluateAlertSync(100, 148, 45);
      expect(result.alertLevel).toBe('critical');
      expect(result.consumptionDiff).toBe(48);
    });

    it('retorna critical con threshold 30 y diff 35', () => {
      const result = evaluateAlertSync(100, 135, 30);
      expect(result.alertLevel).toBe('critical');
    });

    it('retorna warning con threshold 45 y diff 35', () => {
      const result = evaluateAlertSync(100, 135, 45);
      expect(result.alertLevel).toBe('warning');
    });

    it('retorna none con threshold 45 y diff 20', () => {
      const result = evaluateAlertSync(100, 120, 45);
      expect(result.alertLevel).toBe('none');
    });

    it('retorna diff absoluto (independiente de orden)', () => {
      const result1 = evaluateAlertSync(100, 150, 45);
      const result2 = evaluateAlertSync(150, 100, 45);
      expect(result1.consumptionDiff).toBe(50);
      expect(result2.consumptionDiff).toBe(50);
    });

    it('retorna none si no hay datos', () => {
      const result = evaluateAlertSync(null, null, 45);
      expect(result.alertLevel).toBe('none');
      expect(result.consumptionDiff).toBe(0);
    });
  });
});
