import { createContext, useContext, useState, useEffect, useMemo } from 'react';

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

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => localStorage.getItem('userRole') || ROLES.ADMIN);
  const [isServer, setIsServer] = useState(true);
  const [roleLocked, setRoleLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/whoami')
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.isServer) {
          setIsServer(true);
          setRoleLocked(false);
        } else {
          setIsServer(false);
          const assignedRole = data.role || ROLES.VISITANTE;
          setRole(assignedRole);
          localStorage.setItem('userRole', assignedRole);
          setRoleLocked(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setIsServer(true);
        setRoleLocked(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!roleLocked) {
      localStorage.setItem('userRole', role);
    }
  }, [role, roleLocked]);

  const safeSetRole = (newRole) => {
    if (!roleLocked) setRole(newRole);
  };

  const value = useMemo(() => ({
    role,
    setRole: safeSetRole,
    isServer,
    roleLocked,
    loading,
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
  }), [role, isServer, roleLocked, loading]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--gray-50)', fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="sidebar-logo-icon" style={{ margin: '0 auto 16px' }}>JO</div>
          <p style={{ color: 'var(--gray-600)' }}>Verificando acceso...</p>
        </div>
      </div>
    );
  }

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
