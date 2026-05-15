# Render Performance Report

## Objetivo
Evaluar el costo de renderizado de la interfaz y localizar puntos de optimización.

## Qué observar
- renders innecesarios
- props recreadas
- cálculos pesados en render
- listas extensas
- componentes con estado mal aislado

## Riesgos
- UI lenta
- actualizaciones costosas
- cascadas de re-render
- experiencia inconsistente

## Indicadores de mejora
- memoización útil
- separación de componentes
- cálculo diferido
- estado más local
- menos referencias nuevas por render

## Resultado esperado
- diagnóstico de performance
- causa raíz probable
- optimización recomendada
- prioridad de intervención