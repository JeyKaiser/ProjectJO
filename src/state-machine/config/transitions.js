export const TRANSITIONS = {
  concepto: { AVANZAR_CONCEPTO: 'diseno' },
  diseno: {
    AVANZAR_DISENO: 'costeo',
    FORK_BORDADO: 'bordado',
    FORK_SUBLIMADO: 'sublimado',
    FORK_PROCESO_EXT: 'proceso_externo',
    COMPLETAR_BORDADO: null,
    COMPLETAR_SUBLIMADO: null,
    COMPLETAR_EXT: null,
    RECHAZAR_BORDADO: null,
    RECHAZAR_SUBLIMADO: null,
    RECHAZAR_EXT: null,
  },
  costeo: {
    APROBAR_COSTO: 'industrializacion',
    RECHAZAR: 'diseno',
  },
  industrializacion: {
    APROBAR_INDUSTR: 'produccion',
    FORK_BORDADO: 'bordado',
    FORK_SUBLIMADO: 'sublimado',
    FORK_PROCESO_EXT: 'proceso_externo',
    COMPLETAR_BORDADO: null,
    COMPLETAR_SUBLIMADO: null,
    COMPLETAR_EXT: null,
    RECHAZAR_BORDADO: null,
    RECHAZAR_SUBLIMADO: null,
    RECHAZAR_EXT: null,
  },
  produccion: {
    APROBAR_PRODUCCION: 'comercial',
  },
  comercial: {
    CERRAR_COMERCIAL: 'completado',
  },
  bordado: {
    COMPLETAR_BORDADO: 'union',
    RECHAZAR_BORDADO: 'diseno',
  },
  sublimado: {
    COMPLETAR_SUBLIMADO: 'union',
    RECHAZAR_SUBLIMADO: 'diseno',
  },
  proceso_externo: {
    COMPLETAR_EXT: 'union',
    RECHAZAR_EXT: 'diseno',
  },
  union: {
    MERGE_UNION: null,
  },
  pausado: {
    REANUDAR: null,
  },
  completado: {},
  cancelado: {},
};

export const FORK_EVENTS = ['FORK_BORDADO', 'FORK_SUBLIMADO', 'FORK_PROCESO_EXT'];
export const COMPLETE_EVENTS = ['COMPLETAR_BORDADO', 'COMPLETAR_SUBLIMADO', 'COMPLETAR_EXT'];

export const EVENT_TO_FORK_TYPE = {
  FORK_BORDADO: 'bordado',
  FORK_SUBLIMADO: 'sublimado',
  FORK_PROCESO_EXT: 'proceso_externo',
};

export const COMPLETE_TO_EVENT = {
  bordado: 'COMPLETAR_BORDADO',
  sublimado: 'COMPLETAR_SUBLIMADO',
  proceso_externo: 'COMPLETAR_EXT',
};

export const EVENT_TO_COMPLETE_TYPE = {
  COMPLETAR_BORDADO: 'bordado',
  COMPLETAR_SUBLIMADO: 'sublimado',
  COMPLETAR_EXT: 'proceso_externo',
};

export const MAIN_STATES_WITH_FORKS = ['diseno', 'industrializacion'];
