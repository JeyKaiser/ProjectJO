import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext();

export const ROLES = {
  ADMIN: 'Administrador',
  CREADOR_FICHA: 'Creador de Ficha',
  CREATIVO: 'Diseñador Creativo',
  TECNICO: 'Diseñador Técnico',
  LIDER_MODISTAS: 'Líder de Modistas',
  TRAZADOR: 'Trazador',
  ESPECIFICADORA: 'Especificadora',
  CORTADOR: 'Cortador',
  LIDER_CORTADOR: 'Líder de Cortadores',
  BODEGA: 'Bodega',
  VISITANTE: 'Visitante',
};

const VALID_ROLES = new Set(Object.values(ROLES));

function accountError(message) {
  return new Error(message);
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [account, setAccount] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAccount = useCallback(async (authUser) => {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('id, person_id, email, display_name, role, active')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (error) {
      throw accountError('No se pudo validar tu cuenta en AtelierData.');
    }
    if (!data) {
      throw accountError('Tu correo no tiene una cuenta habilitada en AtelierData.');
    }
    if (data.active === false) {
      throw accountError('Tu cuenta de AtelierData está inactiva.');
    }
    if (!VALID_ROLES.has(data.role)) {
      throw accountError('Tu cuenta no tiene un rol válido asignado.');
    }

    return data;
  }, []);

  useEffect(() => {
    let mounted = true;
    let syncGeneration = 0;

    const syncSession = async (nextSession) => {
      if (!mounted) return;
      const generation = ++syncGeneration;

      setSession(nextSession);
      setAuthError(null);

      if (!nextSession?.user) {
        setAccount(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const nextAccount = await loadAccount(nextSession.user);
        if (mounted && generation === syncGeneration) setAccount(nextAccount);
      } catch (error) {
        if (mounted && generation === syncGeneration) {
          setAccount(null);
          setAuthError(error);
        }
      } finally {
        if (mounted && generation === syncGeneration) setLoading(false);
      }
    };

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        return syncSession(data.session);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setAccount(null);
        setAuthError(accountError('No se pudo verificar la sesión. Intenta nuevamente.'));
        setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => {
        if (mounted) void syncSession(nextSession);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadAccount]);

  const signIn = useCallback(async ({ email, password }) => {
    setAuthError(null);
    return supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const role = account?.role || ROLES.VISITANTE;
  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    account,
    email: session?.user?.email || account?.email || '',
    displayName: account?.display_name || session?.user?.user_metadata?.display_name || '',
    role,
    loading,
    authError,
    isAuthenticated: Boolean(session && account),
    signIn,
    signOut,
    isAdmin: role === ROLES.ADMIN,
    isCreadorFicha: role === ROLES.CREADOR_FICHA,
    isCreativo: role === ROLES.CREATIVO,
    isTecnico: role === ROLES.TECNICO,
    isLiderModistas: role === ROLES.LIDER_MODISTAS,
    isTrazador: role === ROLES.TRAZADOR,
    isEspecificadora: role === ROLES.ESPECIFICADORA,
    isCortador: role === ROLES.CORTADOR,
    isLiderCortadores: role === ROLES.LIDER_CORTADOR,
    isBodega: role === ROLES.BODEGA,
  }), [account, authError, loading, role, session, signIn, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
