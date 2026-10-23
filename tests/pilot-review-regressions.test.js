import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../migracion/031_ss27_workflow.sql', import.meta.url), 'utf8');
const api = readFileSync(new URL('../src/lib/api.js', import.meta.url), 'utf8');
const detail = readFileSync(new URL('../src/pages/ReferenciaDetalle.jsx', import.meta.url), 'utf8');

it('does not mark legacy workflow rows as pilot merely by installing 031', () => {
  expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS pilot_version bigint(?![^;]*DEFAULT 0)/);
  expect(sql).toMatch(/pilot_version bigint[^;]*DEFAULT NULL/);
});

it('never reassigns a late resolved fork to a stale trunk', () => {
  expect(sql).not.toMatch(/IF was_merge THEN[\s\S]*?st\.current_state:=st\.main_trunk_state/);
  expect(sql).toMatch(/st\.main_trunk_state:=dest/);
});

it('ensures the exact suspended fork snapshot before restoring it', () => {
  expect(sql).toMatch(/jsonb_array_length\(ep\.fork_snapshot\)/);
  expect(sql).toMatch(/to_jsonb\(f\) - 'updated_at'/);
  expect(sql).toMatch(/item - 'updated_at'/);
  expect(sql).toMatch(/st\.sub_states IS DISTINCT FROM '\{\}'::text\[\]/);
});

it('checks a selected referent exists and cannot be the newly created reference before linking', () => {
  expect(sql).toMatch(/referent_reference_id'\)::integer\s*=\s*new_ref\.id[\s\S]*RAISE EXCEPTION/);
  expect(sql).toMatch(/PERFORM 1 FROM jo\.references WHERE id=\(p_payload->>'referent_reference_id'\)::integer FOR KEY SHARE/);
  expect(sql).toMatch(/FOR KEY SHARE[\s\S]*INSERT INTO jo\.references_referents/);
});

it('detail requests the legacy garment type and exposes its historical hint', () => {
  expect(api).toMatch(/tipo_prendas\(name\),reference_type,collections\(name, code\)/);
  expect(detail).toMatch(/legacyTipoHint/);
});

const db = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ supabase: db }));
import { pilotWorkflowEvent } from '../src/state-machine/lib/supabase';
import { getAvailableEvents } from '../src/state-machine/services/transitionService';

it('does not expose pilot transitions for globally cancelled states', () => {
  expect(getAvailableEvents('cancelado', { pilot_version: 2, sub_states: ['bordado'] })).toEqual([]);
});

it('unassigned codes start pending, never derived or assigned', () => {
  expect(api).toMatch(/useReferenceCodes\(dbRefId, referenceNumber\) \{\s*const \[codes, setCodes\] = useState\(\{ md: null, pt: null, mdStatus: 'SIN_ASIGNAR', ptStatus: 'SIN_ASIGNAR' \}\)/);
});

it('pilot core is only exposed to SS27, with nonpilot creation blocked rather than partial', () => {
  const ui = readFileSync(new URL('../src/pages/FichaTecnicaForm.jsx', import.meta.url), 'utf8');
  expect(ui).not.toMatch(/await createReference\(/);
  expect(ui).not.toMatch(/supabase\.from\('montage_mannequin'\)\.insert/);
});

it('read-only verification checks required functions, triggers, effective grants and RLS', () => {
  const verify = readFileSync(new URL('../migracion/verify_030_031_ss27.sql', import.meta.url), 'utf8');
  expect(verify).toMatch(/to_regprocedure\('jo\.guard_reference_catalog_status_030\(\)'\)/);
  expect(verify).toMatch(/pg_trigger/);
  expect(verify).toMatch(/has_function_privilege/);
  expect(verify).toMatch(/has_table_privilege/);
  expect(verify).toMatch(/relrowsecurity/);
  expect(verify).toMatch(/pg_policies/);
  expect(verify).toMatch(/RAISE EXCEPTION/);
  expect(verify).toMatch(/pg_get_userbyid\(p\.proowner\)/);
  expect(verify).toMatch(/NOT EXISTS \(SELECT 1 FROM pg_policies/);
  expect(verify).toMatch(/tr\.tgfoid=to_regprocedure\('jo\.'\|\|expected\.function_name\)/);
});

it('keeps the same request id and expected version across ambiguous transport retries', async () => {
  db.rpc.mockReset();
  db.rpc.mockResolvedValueOnce({ error: new Error('network') }).mockResolvedValueOnce({ data: { pilot_version: 8 }, error: null });
  await expect(pilotWorkflowEvent(901, 'AVANZAR_CONCEPTO', 7)).rejects.toThrow('network');
  await pilotWorkflowEvent(901, 'AVANZAR_CONCEPTO', 7);
  expect(db.rpc.mock.calls[1][1].p_request_id).toBe(db.rpc.mock.calls[0][1].p_request_id);
  expect(db.rpc.mock.calls[1][1].p_expected_version).toBe(7);
});

it('does not retry a stale version by changing the payload of its request id', async () => {
  db.rpc.mockReset(); db.from.mockReset();
  db.rpc.mockResolvedValueOnce({ error: { code: '40001', message: 'Version obsoleta' } });
  await expect(pilotWorkflowEvent(902, 'AVANZAR_CONCEPTO', 7)).rejects.toMatchObject({ code: '40001' });
  expect(db.rpc).toHaveBeenCalledTimes(1);
});
