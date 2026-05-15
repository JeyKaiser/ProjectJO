# Domain Separation Report

## Objetivo
Analizar si el dominio del negocio está correctamente separado de la interfaz.

## Qué se evalúa
- ubicación de reglas de negocio
- pureza de funciones de dominio
- dependencia de componentes respecto al negocio
- claridad de estados y transiciones

## Riesgos
- lógica de negocio dentro del render
- validaciones mezcladas con UI
- reglas duplicadas
- semántica débil o inconsistente

## Indicadores positivos
- funciones puras
- utils claras
- hooks delgados
- componentes enfocados en presentación
- dominio fácil de testear

## Resultado esperado
- diagnóstico de separación
- puntos de fuga entre capas
- recomendaciones de refactor
- prioridades de aislamiento del dominio