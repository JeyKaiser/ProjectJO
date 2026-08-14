# Definición de Niveles de Severidad

## S1 - Crítico (Critical)
- **Impacto:** Detiene por completo la operación industrial o corporativa. Compromete gravemente la seguridad (ej. inyección SQL, exposición de credenciales). Implica pérdida, corrupción irrecuperable o inconsistencia grave de datos.
- **Tiempo de Respuesta (SLA):** Inmediato (< 4 horas).
- **Ejemplos:** Base de datos sin respaldos verificables, APIs expuestas sin autenticación, caídas del sistema bajo carga normal, integración rota con SAP/ERP principal, datos críticos modificables sin trazabilidad.

## S2 - Alto (High)
- **Impacto:** Degradación severa del rendimiento o pérdida de funcionalidad importante. No hay interrupción total, pero se requiere trabajo manual significativo o workarounds operacionales para mantener la producción.
- **Tiempo de Respuesta (SLA):** Corto plazo (< 48 horas).
- **Ejemplos:** Consultas a base de datos sin optimizar que causan bloqueos temporales, ausencia de pruebas automatizadas en flujos de negocio core, arquitectura monolítica fuertemente acoplada que impide despliegues seguros.

## S3 - Medio (Medium)
- **Impacto:** Deficiencias arquitectónicas, deuda técnica acumulada o fallos funcionales menores. No detienen la operación pero incrementan los costos de mantenimiento, limitan la escalabilidad a futuro y degradan la mantenibilidad.
- **Tiempo de Respuesta (SLA):** Próximo Sprint (1-2 semanas).
- **Ejemplos:** Renderizados innecesarios en frontend, dependencias circulares detectadas, logs insuficientes para debugging rápido, falta de índices en tablas de crecimiento moderado.

## S4 - Bajo (Low)
- **Impacto:** Problemas estéticos, advertencias de linters sin impacto funcional, deuda técnica menor, inconsistencias en UI/UX o falta de documentación en componentes no críticos.
- **Tiempo de Respuesta (SLA):** Backlog (según prioridad general).
- **Ejemplos:** Nombres de variables inconsistentes, falta de comentarios, dependencias desactualizadas sin vulnerabilidades conocidas.
