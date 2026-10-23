import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { classificationFields, CLASIFICACION_OPTIONS } from '../src/lib/traceClassification';

it.each([
  ['SOLIDA', false, false, false],
  ['MOD_ARTE', true, false, false],
  ['UBICACION_TRAZO', false, true, false],
])('maps selector %s to persisted trace flags', (code, art, location, allOver) => {
  expect(classificationFields(code)).toEqual({ has_art_modification: art, has_trace_location: location, has_all_over: allOver });
});

it('keeps the accented UI label separate from the canonical persisted code', () => {
  expect(CLASIFICACION_OPTIONS.find(option => option.value === 'UBICACION_TRAZO')?.label).toBe('Ubicación en Trazo');
  const form = readFileSync(new URL('../src/pages/FichaTecnicaForm.jsx', import.meta.url), 'utf8');
  expect(form).toMatch(/\.\.\.classificationFields\(formData\.clasificacion\)/);
});

it('stores original result in a forward-only 032 receipt and never reads mutable reference on retry', () => {
  const sql = readFileSync(new URL('../migracion/032_ss27_create_receipt.sql', import.meta.url), 'utf8');
  expect(sql).toMatch(/ADD COLUMN result jsonb/);
  expect(sql).toMatch(/IF EXISTS \(SELECT 1 FROM jo\.pilot_reference_create_requests\)/);
  expect(sql).toMatch(/IF existing\.payload IS DISTINCT FROM p_payload/);
  expect(sql).toMatch(/RETURN existing\.result/);
  expect(sql).toMatch(/UPDATE jo\.pilot_reference_create_requests SET result=created/);
  expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTION jo\.pilot_create_reference_031\(jsonb,uuid\) FROM authenticated/);
  expect(sql).toMatch(/CREATE OR REPLACE FUNCTION jo\.pilot_create_reference_032/);
  // If reference.name is edited after commit, the retry must bypass the
  // mutable jo.references row and read only the immutable receipt snapshot.
  expect(sql.indexOf('RETURN existing.result')).toBeLessThan(sql.indexOf('created:=jo.pilot_create_reference_031'));
  expect(sql).not.toMatch(/SELECT to_jsonb\(r\) FROM jo\.references/);
  const api = readFileSync(new URL('../src/lib/api.js', import.meta.url), 'utf8');
  expect(api).toMatch(/supabase\.rpc\('pilot_create_reference_032'/);
  const verify = readFileSync(new URL('../migracion/verify_030_031_ss27.sql', import.meta.url), 'utf8');
  expect(verify).toMatch(/has_function_privilege\('authenticated','jo\.pilot_create_reference_032\(jsonb,uuid\)'/);
  expect(verify).toMatch(/has_function_privilege\('authenticated','jo\.pilot_create_reference_031\(jsonb,uuid\)'/);
  expect(verify).toMatch(/to_regclass\('jo\.pilot_reference_create_requests'\)/);
  const runbook = readFileSync(new URL('../docs/piloto-ss27-operacion.md', import.meta.url), 'utf8');
  expect(runbook).toMatch(/030_ss27_catalog_additive\.sql[\s\S]*031_ss27_workflow\.sql[\s\S]*032_ss27_create_receipt\.sql/);
});
