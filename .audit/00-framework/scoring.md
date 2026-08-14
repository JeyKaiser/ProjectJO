# Sistema de Puntuación (Scoring)

## 1. Modelo de Madurez por Frente
Cada frente evaluado recibe una calificación de 0 a 100, basada en la ausencia de hallazgos críticos y la adopción de prácticas corporativas e industriales.

### Escala de Calificación
- **0 - 25 (Crítico):** El sistema presenta fallas estructurales graves. Alto riesgo operativo, de seguridad o de pérdida de datos. Inviable para entornos industriales.
- **26 - 50 (Deficiente):** Existen deficiencias significativas que comprometen la escalabilidad y mantenibilidad. Requiere intervención inmediata en áreas clave.
- **51 - 75 (Aceptable):** El sistema es funcional y cumple con estándares básicos, pero carece de robustez en automatización, resiliencia o monitoreo avanzado.
- **76 - 100 (Óptimo):** Arquitectura robusta, escalable, segura y completamente observable. Altamente confiable para operaciones industriales críticas.

## 2. Penalizaciones por Hallazgos
El puntaje de cada frente inicia en 100 y se reduce según la severidad de los hallazgos confirmados empíricamente:
- **Hallazgo Crítico (S1):** -20 puntos por ocurrencia.
- **Hallazgo Alto (S2):** -10 puntos por ocurrencia.
- **Hallazgo Medio (S3):** -5 puntos por ocurrencia.
- **Hallazgo Bajo (S4):** -1 punto por ocurrencia.

*Nota: El puntaje mínimo por frente está topado en 0.*

## 3. Puntuación Global
El "Technical Health Score" global es el promedio ponderado de los frentes. Frentes críticos (Seguridad, Base de Datos, Infraestructura, Operaciones Industriales) tienen un multiplicador de x1.5 en el cálculo global debido a su impacto en la continuidad del negocio.
