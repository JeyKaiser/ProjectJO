export const CLASIFICACION_OPTIONS = [
  { value: 'SOLIDA', label: 'Sólida' },
  { value: 'MOD_ARTE', label: 'Modificación de Arte' },
  { value: 'UBICACION_TRAZO', label: 'Ubicación en Trazo' },
];

export function classificationFields(code) {
  if (!CLASIFICACION_OPTIONS.some(option => option.value === code)) throw new Error('Clasificación inválida');
  return {
    has_art_modification: code === 'MOD_ARTE',
    has_trace_location: code === 'UBICACION_TRAZO',
    has_all_over: false,
  };
}
