import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

// Static smoke gates; neither syntax nor transaction isolation is DB-validated.
const file = new URL('../migracion/031_ss27_workflow.sql', import.meta.url);
const sql = existsSync(file) ? readFileSync(file, 'utf8') : '';

describe('SS27 workflow migration source gate (NOT DB validation)', () => {
  it('scopes all workflow writes to SS27 and active Administrador', () => {
    expect(sql).toMatch(/collections.*SS27|code='SS27'/s);
    expect(sql).toMatch(/current_user_has_role\('Administrador'\)/);
    expect(sql).toMatch(/SECURITY DEFINER SET search_path=''/);
    expect(sql).toMatch(/FOR UPDATE/);
  });
  it('keeps request idempotence and append-only history with automatic merge', () => {
    expect(sql).toMatch(/request_id uuid PRIMARY KEY/i);
    expect(sql).toMatch(/MERGE_UNION/);
    expect(sql).toMatch(/state_history/);
    expect(sql).not.toMatch(/DELETE FROM jo\.state_history/i);
  });
  it('snapshots active forks per global cancellation episode and blocks direct pilot writes', () => {
    expect(sql).toMatch(/pilot_cancel_episodes/);
    expect(sql).toMatch(/BEFORE UPDATE OF status_id ON jo\.references/i);
    expect(sql).toMatch(/reference_states.*state_history|state_history.*reference_states/s);
    expect(sql).toMatch(/snapshot_pilot_global_cancel_031\(\)[\s\S]*IF NOT EXISTS \(SELECT 1 FROM jo\.pilot_reference_create_requests/);
    expect(sql).toMatch(/pilot_workflow_event_031\([\s\S]*IF NOT EXISTS \(SELECT 1 FROM jo\.pilot_reference_create_requests/);
  });
  it('persists consumption edits and requires justification in the same RPC transaction', () => {
    expect(sql).toMatch(/consumptionInitial/);
    expect(sql).toMatch(/requires_justification/);
    expect(sql).toMatch(/consumption_change/);
  });
});
