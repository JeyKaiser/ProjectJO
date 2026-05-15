# Debugging Challenge — Router Navigation Bug

## Escenario
Al navegar entre referencias, algunos datos permanecen visualmente aunque la URL cambie.

## Síntomas
- información antigua renderizada,
- estados persistentes incorrectos,
- navegación inconsistente.

## Hipótesis posibles
- estado local no reiniciado,
- dependencia faltante en useEffect,
- key incorrecta,
- params no sincronizados.

## Objetivos
1. Analizar lifecycle.
2. Revisar dependencias.
3. Verificar sincronización de rutas.
4. Detectar renders stale.

## Archivos sugeridos
- App.jsx
- ReferenciaDetalle.jsx
- Router configuration

## Objetivo pedagógico
Entender relación entre routing y renderizado.