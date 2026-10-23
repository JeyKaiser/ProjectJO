import { expect, it } from 'vitest';
import { restrictPilotCollections } from '../src/lib/pilotScope';

it('does not hide other collections when pilot setting is absent', () => {
  expect(restrictPilotCollections([{ code: 'SS27' }, { code: 'FW26' }], '')).toHaveLength(2);
});

it('filters only the isolated SS27 pilot view when explicitly opted in', () => {
  expect(restrictPilotCollections([{ code: 'SS27' }, { code: 'FW26' }], 'SS27')).toEqual([{ code: 'SS27' }]);
});

it('rejects a configured code other than SS27 instead of silently falling back', () => {
  expect(() => restrictPilotCollections([{ code: 'FW26' }], 'FW26')).toThrow(/SS27/);
});
