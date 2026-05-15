# Debugging Challenge — Temperature Bar State Bug

## Escenario
La barra de temperaturas no refleja correctamente el estado real de una prenda después de cambiar de fase.

## Síntomas
- el color no cambia,
- el componente no se actualiza,
- algunas referencias muestran estados anteriores.

## Hipótesis posibles
- estado mutado directamente,
- props desactualizadas,
- render no disparado,
- lógica de transición incorrecta,
- memoización mal aplicada.

## Objetivos
1. Identificar causa raíz.
2. Analizar flujo de datos.
3. Verificar render lifecycle.
4. Detectar dependencia incorrecta.

## Archivos sugeridos
- TemperatureBar.jsx
- ReferenciaDetalle.jsx
- colecciones.js

## Regla
No saltar directamente a la solución.
Primero razonar.