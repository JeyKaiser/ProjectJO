# Architecture Challenge — Scale to 100k Users

## Objetivo
Analizar cómo evolucionaría ProjectJO-Antigravity bajo una carga masiva de usuarios y datos.

## Escenario
La aplicación ahora:
- maneja 100k usuarios,
- múltiples equipos,
- miles de referencias,
- actualizaciones en tiempo real,
- dashboards concurrentes.

## Problemas esperados
- renders excesivos,
- navegación lenta,
- Context API sobrecargado,
- bundle demasiado grande,
- CSS difícil de mantener,
- componentes gigantes.

## Retos
1. Identificar cuellos de botella.
2. Separar responsabilidades arquitectónicas.
3. Diseñar estrategia de escalabilidad.
4. Proponer lazy loading.
5. Analizar necesidad de backend real.
6. Evaluar state management alternativo.

## Preguntas guía
- ¿Qué parte colapsaría primero?
- ¿Qué componentes deberían dividirse?
- ¿Dónde aplicar code splitting?
- ¿Context API sigue siendo suficiente?
- ¿Qué métricas deberían monitorearse?

## Objetivo pedagógico
Desarrollar pensamiento de arquitectura escalable y evaluación de tradeoffs.