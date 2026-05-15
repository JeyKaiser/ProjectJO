# Rerender Detection

## Objetivo
Detectar renderizados innecesarios en componentes React.

## Qué observar
- props recreadas,
- callbacks recreados,
- cambios de referencia,
- context updates,
- estados mal ubicados.

## Señales de rerender innecesario
- render sin cambio visual,
- render por referencia nueva,
- render propagado desde contexto,
- listas completas rerenderizadas.

## Riesgos
- UI lenta,
- consumo innecesario,
- degradación progresiva.

## Estrategia de análisis
1. identificar trigger,
2. identificar propagación,
3. detectar costo,
4. decidir si optimizar.

## Objetivo pedagógico
Comprender qué provoca realmente un rerender en React.