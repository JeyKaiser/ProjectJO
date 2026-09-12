import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/state-machine/services/thresholdService', () => ({
  getThreshold: vi.fn().mockResolvedValue(45),
}));

import { evaluateAlert, evaluateAlertSync, evaluateComparativoAlert } from '../src/state-machine/services/alertService';

describe('alert service external contract', () => {
  it('returns no alert when one consumption is missing', async () => {
    await expect(evaluateAlert(1, null, 120)).resolves.toMatchObject({
      alertLevel: 'none',
      consumptionDiff: 0,
    });
  });

  it('classifies warning and critical thresholds', () => {
    expect(evaluateAlertSync(100, 135, 45).alertLevel).toBe('warning');
    expect(evaluateAlertSync(100, 150, 45).alertLevel).toBe('critical');
    expect(evaluateAlertSync(150, 100, 45).consumptionDiff).toBe(50);
  });

  it('raises a critical comparative alert from three differences', () => {
    expect(evaluateComparativoAlert(['ancho', 'piezas', 'telas'])).toMatchObject({
      alertLevel: 'critical',
      totalDifferences: 3,
    });
  });
});
