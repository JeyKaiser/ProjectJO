# Estados de la Auditoría y Ciclo de Vida

## 1. Estados de la Fase de Auditoría
- **DRAFT (Borrador):** La evaluación técnica está en curso. Se están ejecutando análisis estáticos/dinámicos y documentando evidencias.
- **REVIEW (Revisión):** El análisis ha finalizado. El equipo auditor consolida los hallazgos y realiza control de calidad sobre las evidencias.
- **ISSUED (Emitido):** El reporte ejecutivo y la matriz de hallazgos han sido presentados formalmente a los stakeholders.
- **REMEDIATION (Remediación):** El equipo de ingeniería está aplicando las correcciones basadas en el roadmap estratégico.
- **CLOSED (Cerrado):** Se han validado las remediaciones implementadas y re-calculado el score general.

## 2. Ciclo de Vida de los Hallazgos (Findings)
Cada vulnerabilidad, defecto arquitectónico o deuda técnica documentada transita por los siguientes estados:
- **OPEN:** El hallazgo ha sido detectado, categorizado y respaldado con evidencia técnica.
- **ACCEPTED:** El equipo de desarrollo reconoce el hallazgo y lo integra al product backlog.
- **MITIGATED:** Se implementó una solución temporal (workaround) que reduce la severidad inmediata, pero requiere refactorización de fondo.
- **FALSE_POSITIVE:** Tras revisión técnica conjunta, se determina que el comportamiento es intencional o está asegurado por una capa superior no visible en el análisis inicial. El hallazgo se invalida.
- **REMEDIATED:** El equipo implementó la corrección definitiva en el código base o infraestructura.
- **VERIFIED:** El equipo auditor re-evaluó la sección afectada y confirma la eliminación del riesgo. Pasa a estado cerrado.
