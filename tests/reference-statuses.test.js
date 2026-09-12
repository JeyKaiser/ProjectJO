import { describe, expect, it } from 'vitest';
import {
  REFERENCE_STATUS_OPTIONS,
  getReferenceStatusBucket,
  getReferenceStatusLabel,
  isCancelledStatus,
} from '../src/lib/referenceStatuses';

describe('reference statuses', () => {
  it('exposes only the active business statuses', () => {
    const values = REFERENCE_STATUS_OPTIONS.map(option => option.value);
    expect(values).toHaveLength(11);
    expect(values).not.toContain('RECHAZADO');
    expect(values).not.toContain('PENDIENTE');
  });

  it('classifies every cancellation variant as cancelled', () => {
    expect(isCancelledStatus('CANCELADO')).toBe(true);
    expect(isCancelledStatus('CANCELADO_COMERCIAL')).toBe(true);
    expect(isCancelledStatus('CANCELADO_SIN_CORTAR')).toBe(true);
    expect(getReferenceStatusBucket('CANCELADO_CORTADO')).toBe('paused');
  });

  it('keeps status labels readable for the UI', () => {
    expect(getReferenceStatusLabel('CANCELADO_PAQUETE_COMPLETO')).toBe('Cancelado paquete completo');
    expect(getReferenceStatusLabel('UNKNOWN_STATUS')).toBe('UNKNOWN STATUS');
  });
});
