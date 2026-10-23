import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

// Static gate only. It cannot validate SQL execution or permissions in Postgres.
const migrationPath = new URL('../migracion/030_ss27_catalog_additive.sql', import.meta.url);
const migration = existsSync(migrationPath) ? readFileSync(migrationPath, 'utf8') : '';

describe('pilot additive migration source contract (NOT runtime-validated)', () => {
  it('retains legacy data and uses the existing int4 catalog', () => {
    expect(migration).toMatch(/tipo_prenda_id\s+integer/i);
    expect(migration).toMatch(/REFERENCES jo\.tipo_prendas\(id\) ON DELETE RESTRICT/i);
    expect(migration).toMatch(/ON CONFLICT DO NOTHING/i);
    expect(migration).not.toMatch(/DROP\s+(?:TABLE|TYPE|COLUMN).*reference_type/i);
  });
  it('enforces Admin-only global status and non-admin create default in the database', () => {
    expect(migration).toMatch(/BEFORE INSERT OR UPDATE ON jo\.references/i);
    expect(migration).toMatch(/jo\.is_admin_user\(\)/i);
    expect(migration).toMatch(/EN_PROCESO/i);
  });
  it('requires type on new rows while leaving existing nullable rows untouched', () => {
    expect(migration).toMatch(/IF NEW\.tipo_prenda_id IS NULL THEN/);
    expect(migration).not.toMatch(/ALTER COLUMN tipo_prenda_id SET NOT NULL/i);
  });
});
