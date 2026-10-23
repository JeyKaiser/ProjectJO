import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const catalog = readFileSync(new URL('../migracion/030_ss27_catalog_additive.sql', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../migracion/031_ss27_workflow.sql', import.meta.url), 'utf8');
const runbook = readFileSync(new URL('../docs/piloto-ss27-operacion.md', import.meta.url), 'utf8');

it('030 never broadens browser INSERT on montage for creator; core writes montage internally', () => {
  expect(catalog).not.toMatch(/GRANT INSERT ON jo\.montage_mannequin TO authenticated/);
  expect(catalog).not.toMatch(/CREATE POLICY rbac_montage_creator_insert_030/);
  expect(catalog).not.toMatch(/DROP POLICY.*montage_mannequin/);
  expect(workflow).toMatch(/INSERT INTO jo\.montage_mannequin\(reference_id,montage_type\)/);
  expect(catalog).toMatch(/ELSIF NEW\.status_id IS DISTINCT FROM OLD\.status_id AND NOT jo\.is_admin_user\(\)/);
});

it('documents attribution before retry across reload without inventing a new UUID', () => {
  expect(runbook).toMatch(/actor\+UUID\+hash del payload\+reference_id/);
  expect(runbook).toMatch(/sin UUID[\s\S]*sin recibo atribuible[\s\S]*reconciliación manual/);
  expect(runbook).toMatch(/encontrada[\s\S]*no prueba[\s\S]*ese intento/);
  expect(runbook).toMatch(/revisión Admin\/operación[\s\S]*nuevo UUID/);
});
