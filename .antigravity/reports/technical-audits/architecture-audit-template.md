# Architecture Audit Template

## Objetivo
Evaluar la arquitectura del proyecto en términos de separación de responsabilidades, escalabilidad y claridad del diseño.

## Áreas analizadas
- estructura de carpetas
- distribución de lógica
- estado global
- dominio del negocio
- routing
- reutilización de componentes

## Preguntas guía
- ¿La arquitectura refleja el dominio real?
- ¿Las capas están bien separadas?
- ¿La UI depende demasiado de la lógica?
- ¿El estado está donde debe estar?
- ¿La estructura soporta crecimiento?

## Riesgos a detectar
- god components
- dependencia cruzada excesiva
- lógica de negocio dentro de la UI
- providers demasiado amplios
- carpetas sin propósito claro

## Evaluación
### Puntos fuertes
- modularidad
- claridad
- predictibilidad
- separación adecuada

### Puntos débiles
- acoplamiento
- duplicación
- complejidad innecesaria
- baja escalabilidad

## Salida esperada
- diagnóstico arquitectónico
- severidad de problemas
- recomendaciones concretas
- prioridades de refactorización