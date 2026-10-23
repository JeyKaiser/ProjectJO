export function describeGarmentType(name, legacyType) {
  if (name) return { label: name, legacyHint: '' };
  return {
    label: 'Tipo concreto pendiente de clasificación',
    legacyHint: legacyType ? `Valor histórico (reference_type): ${legacyType}` : '',
  };
}
