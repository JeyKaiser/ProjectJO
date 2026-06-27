export const STATES = {
  CONCEPTO: 'concepto',
  DISENO: 'diseno',
  COSTEO: 'costeo',
  INDUSTRIALIZACION: 'industrializacion',
  PRODUCCION: 'produccion',
  COMERCIAL: 'comercial',
  BORDADO: 'bordado',
  SUBLIMADO: 'sublimado',
  PROCESO_EXTERNO: 'proceso_externo',
  UNION: 'union',
  PAUSADO: 'pausado',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado',
};

export const STATE_LABELS = {
  concepto: 'Concepto',
  diseno: 'Diseño',
  costeo: 'Costeo',
  industrializacion: 'Industrialización',
  produccion: 'Producción',
  comercial: 'Comercial',
  bordado: 'Bordado',
  sublimado: 'Sublimado',
  proceso_externo: 'Proceso Externo',
  union: 'Unión',
  pausado: 'Pausado',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

export const STATE_COLORS = {
  concepto: '#8B5CF6',
  diseno: '#3B82F6',
  costeo: '#F59E0B',
  industrializacion: '#EF4444',
  produccion: '#10B981',
  comercial: '#6366F1',
  bordado: '#EC4899',
  sublimado: '#14B8A6',
  proceso_externo: '#F97316',
  union: '#A855F7',
  pausado: '#6B7280',
  completado: '#22C55E',
  cancelado: '#DC2626',
};

export const STATE_ICONS = {
  concepto: '💡',
  diseno: '✏️',
  costeo: '💰',
  industrializacion: '🏭',
  produccion: '👗',
  comercial: '🛒',
  bordado: '🪡',
  sublimado: '🖨️',
  proceso_externo: '📦',
  union: '🔗',
  pausado: '⏸️',
  completado: '✅',
  cancelado: '❌',
};

export const MAIN_TRUNK_STATES = [
  'concepto', 'diseno', 'costeo',
  'industrializacion', 'produccion', 'comercial', 'completado',
];

export const PARALLEL_STATES = ['bordado', 'sublimado', 'proceso_externo'];

export const TERMINAL_STATES = ['completado', 'cancelado'];

export const ROLE_MAP = {
  concepto: 'Diseñador Creativo',
  diseno: 'Diseñador Técnico',
  costeo: 'Jeferson',
  industrializacion: 'Trazador',
  produccion: 'Líder de Modistas',
  comercial: 'Comercial',
  bordado: 'Supervisora de Bordado',
  sublimado: 'Proveedor de Sublimado',
  proceso_externo: 'Proveedor Externo',
  union: 'Coordinador de Producción',
};

export const ALERT_LEVELS = {
  NONE: 'none',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

export const ALERT_COLORS = {
  none: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
};
