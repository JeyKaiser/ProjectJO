import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const ROLES = {
  ADMIN: 'Administrador',
  CREADOR_FICHA: 'Creador de Ficha',
  CREATIVO: 'Diseñador Creativo',
  TECNICO: 'Diseñador Técnico',
  LIDER_MODISTAS: 'Líder de Modistas',
  TRAZADOR: 'Trazador',
  ESPECIFICADORA: 'Especificadora'
};

export const AuthProvider = ({ children }) => {
  // Inicializar con el rol guardado en localStorage o por defecto ADMIN
  const [role, setRole] = useState(() => {
    return localStorage.getItem('userRole') || ROLES.ADMIN;
  });

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('userRole', role);
  }, [role]);

  const value = {
    role,
    setRole,
    isAdmin: role === ROLES.ADMIN,
    isCreadorFicha: role === ROLES.CREADOR_FICHA,
    isCreativo: role === ROLES.CREATIVO,
    isTecnico: role === ROLES.TECNICO,
    isLiderModistas: role === ROLES.LIDER_MODISTAS,
    isTrazador: role === ROLES.TRAZADOR,
    isEspecificadora: role === ROLES.ESPECIFICADORA
  };

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
