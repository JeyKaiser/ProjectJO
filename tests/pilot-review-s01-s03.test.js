import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../migracion/031_ss27_workflow.sql', import.meta.url), 'utf8');
const runbook = readFileSync(new URL('../docs/piloto-ss27-operacion.md', import.meta.url), 'utf8');

it('aborts on duplicate SS27/year/number with IDs before creating the pilot unique index', () => {
  const block = sql.slice(sql.indexOf('-- Identidad única SOLO'), sql.indexOf('-- F03/F01: RPC core'));
  expect(block).toMatch(/string_agg\(.*ids/);
  expect(block).toMatch(/GROUP BY collection_id,year,reference_number HAVING count\(\*\)>1/);
  expect(block).toMatch(/RAISE EXCEPTION '031: duplicados/);
  expect(block.indexOf('RAISE EXCEPTION')).toBeLessThan(block.indexOf('CREATE UNIQUE INDEX pilot_ss27_reference_identity_031'));
});

it('documents recovery after a timeout surviving page reload without claiming non-creation', () => {
  expect(runbook).toMatch(/recarga de página[\s\S]*SS27\/2027\/reference_number/);
  expect(runbook).toMatch(/recibo actor\+UUID\+hash del payload\+reference_id/);
  expect(runbook).toMatch(/revisión Admin\/operación antes\s+de cualquier nuevo UUID/);
  expect(runbook).toMatch(/timeout no demuestra ausencia/);
});
