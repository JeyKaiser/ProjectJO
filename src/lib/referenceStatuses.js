export const REFERENCE_STATUS_OPTIONS = [
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'CANCELADO', label: 'Cancelado' },
  { value: 'CANCELADO_COMERCIAL', label: 'Cancelado por comercial' },
  { value: 'CANCELADO_CORTADO', label: 'Cancelado cortado' },
  { value: 'PAQUETE_COMPLETO', label: 'Paquete completo' },
  { value: 'CANCELADO_SIN_CORTAR', label: 'Cancelado sin cortar' },
  { value: 'SE_RETOMA_PROXIMA_COLECCION', label: 'Se retoma en la proxima coleccion' },
  { value: 'CANCELADO_PAQUETE_COMPLETO', label: 'Cancelado paquete completo' },
  { value: 'APROBADO_REPROGRAMACION', label: 'Aprobado reprogramacion' },
  { value: 'JUST_FOR_SHOW', label: 'Just for show' },
];

const STATUS_LABELS = new Map(REFERENCE_STATUS_OPTIONS.map(option => [option.value, option.label]));

const CANCELLED_STATUS_CODES = new Set([
  'CANCELADO',
  'CANCELADO_COMERCIAL',
  'CANCELADO_CORTADO',
  'CANCELADO_SIN_CORTAR',
  'CANCELADO_PAQUETE_COMPLETO',
]);

const COMPLETED_STATUS_CODES = new Set([
  'APROBADO',
  'PAQUETE_COMPLETO',
  'APROBADO_REPROGRAMACION',
]);

const PAUSED_STATUS_CODES = new Set([
  'SE_RETOMA_PROXIMA_COLECCION',
  'JUST_FOR_SHOW',
]);

const STATUS_STYLES = {
  APROBADO: { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  CANCELADO: { bg: '#ebeff7', border: '#9ca3af', text: '#374151' },
  CANCELADO_COMERCIAL: { bg: '#e5e7eb', border: '#9ca3af', text: '#374151' },
  CANCELADO_CORTADO: { bg: '#e5e7eb', border: '#9ca3af', text: '#374151' },
  CANCELADO_SIN_CORTAR: { bg: '#e5e7eb', border: '#9ca3af', text: '#374151' },
  CANCELADO_PAQUETE_COMPLETO: { bg: '#e5e7eb', border: '#9ca3af', text: '#374151' },
  EN_PROCESO: { bg: '#fef9c3', border: '#eab308', text: '#854d0e' },
  PAQUETE_COMPLETO: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  SE_RETOMA_PROXIMA_COLECCION: { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
  APROBADO_REPROGRAMACION: { bg: '#dcfce7', border: '#16a34a', text: '#166534' },
  JUST_FOR_SHOW: { bg: '#e0f2fe', border: '#0284c7', text: '#075985' },
};

export function getReferenceStatusLabel(status) {
  if (!status) return '';
  return STATUS_LABELS.get(status) || String(status).replace(/_/g, ' ');
}

export function getReferenceStatusStyle(status) {
  return STATUS_STYLES[status] || { bg: 'var(--gray-100)', border: 'var(--gray-300)', text: 'var(--gray-600)' };
}

export function isCancelledStatus(status) {
  return CANCELLED_STATUS_CODES.has(status);
}

export function getReferenceStatusBucket(status) {
  if (isCancelledStatus(status)) return 'paused';
  if (COMPLETED_STATUS_CODES.has(status)) return 'completed';
  if (PAUSED_STATUS_CODES.has(status)) return 'paused';
  return 'inProcess';
}

export function getReferenceStatusSubfase(status) {
  if (isCancelledStatus(status) || PAUSED_STATUS_CODES.has(status)) return 0;
  if (COMPLETED_STATUS_CODES.has(status)) return 6.2;
  return 1.1;
}
