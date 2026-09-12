import { describe, expect, it } from 'vitest';
import { ROLES } from '../src/context/AuthContext';
import { canAccessRole, canAccessRoute } from '../src/lib/permissions';

describe('permissions contract', () => {
  it('allows only the configured roles for protected routes', () => {
    expect(canAccessRoute('dashboard', ROLES.VISITANTE)).toBe(true);
    expect(canAccessRoute('fichaNueva', ROLES.CREADOR_FICHA)).toBe(true);
    expect(canAccessRoute('fichaNueva', ROLES.CREATIVO)).toBe(false);
    expect(canAccessRoute('adminCodigos', ROLES.ADMIN)).toBe(true);
    expect(canAccessRoute('adminCodigos', ROLES.TRAZADOR)).toBe(false);
  });

  it('rejects missing or malformed permission lists', () => {
    expect(canAccessRole('', [ROLES.ADMIN])).toBe(false);
    expect(canAccessRole(ROLES.ADMIN, null)).toBe(false);
    expect(canAccessRoute('unknown', ROLES.ADMIN)).toBe(false);
  });
});
