import { expect, it } from 'vitest';
import { describeGarmentType } from '../src/lib/garmentType';

it('shows unclassified historic reference with explicit legacy hint, never infers concrete type', () => {
  expect(describeGarmentType(null, 'SILUETA')).toEqual({
    label: 'Tipo concreto pendiente de clasificación',
    legacyHint: 'Valor histórico (reference_type): SILUETA',
  });
});

it('displays selected concrete type even when catalog option is hidden, without legacy hint', () => {
  expect(describeGarmentType('Vestido', 'BASICA')).toEqual({ label: 'Vestido', legacyHint: '' });
});
