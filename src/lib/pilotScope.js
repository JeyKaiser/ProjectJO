// Only a presentation filter. Postgres RPCs enforce the SS27 write scope.
export const PILOT_COLLECTION_CODE = import.meta.env.VITE_PILOT_COLLECTION_CODE || '';

export function restrictPilotCollections(collections, pilotCode = PILOT_COLLECTION_CODE) {
  if (!pilotCode) return collections;
  if (pilotCode !== 'SS27') throw new Error('Piloto permitido únicamente para SS27.');
  return collections.filter(collection => collection.code === pilotCode);
}
