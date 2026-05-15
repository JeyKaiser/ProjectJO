# ProjectJO-Antigravity Learning System

## Propósito

Este directorio contiene la infraestructura pedagógica y analítica del agente especializado en el proyecto **ProjectJO-Antigravity**.

Su objetivo es transformar el repositorio en una plataforma viva de aprendizaje técnico, donde la IA pueda:

* entender la arquitectura real del proyecto,
* explicar conceptos con contexto,
* detectar debilidades técnicas,
* generar retos personalizados,
* producir reportes técnicos,
* y adaptar el plan de estudio según el progreso.

---

## Qué contiene este sistema

### 1. `agents/`

Define la identidad y el comportamiento base del agente.

### 2. `context/`

Contiene el conocimiento persistente del proyecto:

* dominio de negocio,
* stack tecnológico,
* riesgos arquitectónicos,
* mapa del repositorio.

### 3. `learning/`

Registra el estado de aprendizaje:

* temas completados,
* roadmap,
* debilidades,
* progreso general.

### 4. `metrics/`

Contiene métricas del proceso de estudio:

* skill matrix,
* confidence levels,
* progress tracker,
* study analytics.

### 5. `prompts/`

Define los modos de interacción del agente:

* mentor,
* reviewer,
* debugging coach,
* architect,
* interviewer.

### 6. `sessions/`

Plantillas y estructura base para sesiones de estudio.

### 7. `workflows/`

Define el flujo operativo de cada tipo de sesión.

### 8. `analysis/`

Contiene los criterios para analizar:

* repositorio,
* arquitectura,
* performance,
* CSS,
* dependencias.

### 9. `engines/`

Contiene la lógica adaptativa del sistema:

* challenge engine,
* roadmap engine,
* weakness engine,
* scoring engine,
* recommendation engine.

### 10. `reports/`

Define los formatos de salida del agente:

* auditorías,
* reportes de arquitectura,
* reportes de performance,
* reportes de seniority,
* reportes de evolución.

### 11. `profiling/`

Contiene criterios para analizar comportamiento runtime:

* renders,
* bundle,
* routing,
* context performance.

### 12. `automation/`

Define las reglas para automatizar:

* selección de temas,
* generación de sesiones,
* desafíos,
* reportes,
* evolución del roadmap.

---

## Orden de lectura recomendado para el agente

Cuando el agente inicie una sesión, debe leer en este orden:

1. `agents/projectjo-learning-architect.md`
2. `context/architecture-map.md`
3. `context/business-domain.md`
4. `context/stack-analysis.md`
5. `context/project-risks.md`
6. `learning/learning-state.md`
7. `learning/roadmap.md`
8. `learning/weaknesses.md`
9. `metrics/skill-matrix.md`
10. `metrics/confidence-levels.md`
11. `prompts/mentor-mode.md`
12. `workflows/study-session.md`
13. `analysis/` según el tema que se esté estudiando
14. `engines/` según la respuesta o debilidad detectada
15. `reports/` para generar diagnóstico o cierre

---

## Regla de funcionamiento

El sistema debe seguir estas prioridades:

### 1. Contexto antes que teoría

Siempre usar archivos reales del proyecto antes de responder de forma genérica.

### 2. Diagnóstico antes que solución

Antes de proponer cambios, identificar el problema real.

### 3. Profundidad antes que velocidad

Priorizar comprensión sólida sobre respuestas rápidas.

### 4. Proyecto antes que ejemplo abstracto

Usar componentes, rutas, estilos y datos reales del repositorio.

### 5. Evaluación antes que avance

No subir de nivel sin evidencia de comprensión práctica.

---

## Cómo debe operar el agente

### Modo mentor

Explica conceptos con contexto y ejemplos del proyecto.

### Modo reviewer

Detecta riesgos, anti-patrones y deuda técnica.

### Modo debugging

Guía el diagnóstico paso a paso.

### Modo architect

Analiza escalabilidad, separación de responsabilidades y tradeoffs.

### Modo interviewer

Evalúa profundidad técnica con preguntas progresivas.

---

## Flujo ideal de una sesión

1. Definir el tema.
2. Leer el contexto relevante.
3. Explicar teoría y aplicación real.
4. Identificar riesgos o debilidades.
5. Proponer un reto o validación.
6. Evaluar respuesta.
7. Registrar el resultado en `learning/` y `metrics/`.
8. Ajustar el roadmap si es necesario.

---

## Convenciones de uso

* Usar nombres de archivo en `kebab-case`.
* Mantener cada archivo enfocado en un solo propósito.
* No mezclar teoría con métricas.
* No duplicar lógica entre carpetas.
* No mover el sistema de aprendizaje dentro de `src/`.
* Mantener la capa de estudio separada del código productivo.

---

## Objetivo final

Este sistema existe para convertir ProjectJO-Antigravity en una plataforma de estudio técnico contextual, donde el aprendizaje esté guiado por el repositorio real, la arquitectura del sistema y la evolución del usuario.

La meta no es solo entender el proyecto.
La meta es desarrollar criterio de ingeniería frontend de nivel senior.
