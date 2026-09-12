import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

const env = globalThis.process?.env || {};
const integrationEnabled = Boolean(env.RUN_SUPABASE_INTEGRATION === 'true'
  && env.SUPABASE_TEST_URL
  && env.SUPABASE_TEST_ANON_KEY
  && env.SUPABASE_TEST_USER_EMAIL
  && env.SUPABASE_TEST_USER_PASSWORD
  && env.SUPABASE_TEST_ADMIN_EMAIL
  && env.SUPABASE_TEST_ADMIN_PASSWORD);

function createTestClient() {
  return createClient(env.SUPABASE_TEST_URL, env.SUPABASE_TEST_ANON_KEY, {
    db: { schema: 'jo' },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signedInClient(email, password) {
  const client = createTestClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

describe.skipIf(!integrationEnabled)('Supabase Auth/RLS/RPC integration', () => {
  it('limits account visibility and resolves the authenticated user role', async () => {
    const userClient = await signedInClient(env.SUPABASE_TEST_USER_EMAIL, env.SUPABASE_TEST_USER_PASSWORD);
    const { data: accounts, error: accountError } = await userClient
      .from('user_accounts')
      .select('email, auth_user_id, active');

    expect(accountError).toBeNull();
    expect(accounts).toHaveLength(1);
    expect(accounts[0].email.toLowerCase()).toBe(env.SUPABASE_TEST_USER_EMAIL.toLowerCase());
    expect(accounts[0].active).toBe(true);
    expect(accounts[0].auth_user_id).toBeTruthy();

    const { data: isAdmin, error: roleError } = await userClient
      .rpc('current_user_has_role', { required_role: 'Administrador' });
    expect(roleError).toBeNull();
    expect(isAdmin).toBe(false);
  });

  it('resolves the admin role and rejects anonymous Ficha Final writes', async () => {
    const adminClient = await signedInClient(env.SUPABASE_TEST_ADMIN_EMAIL, env.SUPABASE_TEST_ADMIN_PASSWORD);
    const { data: isAdmin, error: roleError } = await adminClient
      .rpc('current_user_has_role', { required_role: 'Administrador' });
    expect(roleError).toBeNull();
    expect(isAdmin).toBe(true);

    const anonymousClient = createTestClient();
    const { data: anonymousAccounts, error: accountError } = await anonymousClient
      .from('user_accounts')
      .select('email');
    expect(accountError).toBeNull();
    expect(anonymousAccounts).toEqual([]);

    const { error: rpcError } = await anonymousClient.rpc('save_final_sheet', {
      p_payload: { reference_id: 1 },
    });
    expect(rpcError).not.toBeNull();
  });

  it('rejects non-admin writes to the code pool', async () => {
    const userClient = await signedInClient(env.SUPABASE_TEST_USER_EMAIL, env.SUPABASE_TEST_USER_PASSWORD);
    const { data, error } = await userClient
      .from('code_pool')
      .insert({
        code: `RLS-TEST-${Date.now()}`,
        code_type: 'MD',
        status: 'DISPONIBLE',
      })
      .select('id')
      .maybeSingle();

    expect(error).not.toBeNull();

    // Clean up only if the policy was accidentally too permissive.
    if (data?.id) {
      const adminClient = await signedInClient(env.SUPABASE_TEST_ADMIN_EMAIL, env.SUPABASE_TEST_ADMIN_PASSWORD);
      await adminClient.from('code_pool').delete().eq('id', data.id);
    }
  });
});
