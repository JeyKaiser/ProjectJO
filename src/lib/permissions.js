import { ROLES } from '../context/AuthContext';

export const ALL_ROLES = Object.values(ROLES);

export const ROUTE_PERMISSIONS = {
  dashboard: ALL_ROLES,
  referentes: [ROLES.ADMIN, ROLES.CREADOR_FICHA],
  colecciones: ALL_ROLES,
  stateMachine: [ROLES.ADMIN, ROLES.CREADOR_FICHA],
  fichaNueva: [ROLES.ADMIN, ROLES.CREADOR_FICHA],
  taller: [ROLES.ADMIN, ROLES.LIDER_MODISTAS],
  tallerCorte: [ROLES.ADMIN, ROLES.CORTADOR, ROLES.LIDER_CORTADOR],
  consumos: [ROLES.ADMIN, ROLES.TRAZADOR],
  trazador: [ROLES.ADMIN, ROLES.TRAZADOR],
  comparativoTrazos: [ROLES.ADMIN, ROLES.TRAZADOR],
  fichaFinal: [ROLES.ADMIN, ROLES.ESPECIFICADORA],
  configuracion: [ROLES.ADMIN],
  adminColecciones: [ROLES.ADMIN],
  adminCodigos: [ROLES.ADMIN],
  adminInsumos: [ROLES.ADMIN],
  guiaUsuario: [ROLES.ADMIN],
  creativo: [ROLES.ADMIN, ROLES.CREATIVO],
  importarCorte: [ROLES.ADMIN, ROLES.CORTADOR, ROLES.LIDER_CORTADOR],
  informesCorte: [ROLES.ADMIN, ROLES.CORTADOR, ROLES.LIDER_CORTADOR],
};

export function canAccessRole(role, allowedRoles) {
  return Boolean(role && Array.isArray(allowedRoles) && allowedRoles.includes(role));
}

export function canAccessRoute(route, role) {
  return canAccessRole(role, ROUTE_PERMISSIONS[route]);
}
