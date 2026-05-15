# Weaknesses — ProjectJO Learning System

## Debilidades técnicas detectadas
- Dificultad para distinguir render de re-render.
- Confusión entre `useMemo` y `useCallback`.
- Tendencia a mezclar lógica de negocio con componentes visuales.
- Dificultad para identificar componentes demasiado grandes.
- Riesgo de depender demasiado del CSS global.

## Debilidades pedagógicas
- Explicar teoría sin conectar con el código real.
- Memorizar conceptos sin poder aplicarlos.
- Entender rutas sin comprender el flujo del estado.
- Confundir abstracción con complejidad innecesaria.

## Prioridades
### Alta
- rendimiento
- separación de responsabilidades
- arquitectura del dominio

### Media
- composición de componentes
- rutas dinámicas
- organización de CSS

### Baja
- micro-optimización prematura
- abstracciones innecesarias

## Regla
Cada debilidad debe convertirse en un objetivo de práctica concreta.