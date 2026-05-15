# State Architecture Report

## Objetivo
Analizar cómo se organiza, distribuye y consume el estado en la aplicación.

## Criterios
- ownership del estado
- estado local vs global
- granularidad de contextos
- sincronización entre vistas
- dependencia de renders

## Riesgos
- prop drilling excesivo
- estado duplicado
- contextos demasiado amplios
- información difícil de rastrear
- re-renderizado en cascada

## Señales de buen diseño
- el estado vive cerca de quien lo usa
- contextos pequeños y específicos
- datos derivados centralizados
- flujos predecibles

## Salida esperada
- mapa del estado
- zonas de riesgo
- oportunidades de simplificación
- recomendaciones de arquitectura