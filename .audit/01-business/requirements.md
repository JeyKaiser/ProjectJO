# Auditoría de Requerimientos

## 1. Propósito
Verificar que los requerimientos funcionales y no funcionales (Atributos de Calidad) están correctamente definidos, priorizados y materializados en el código fuente, garantizando que el sistema cumple su propósito de negocio.

## 2. Criterios de Evaluación
- **Completitud:** Todos los casos de uso industriales y reglas corporativas críticas tienen cobertura funcional en el sistema.
- **Trazabilidad:** Existe un vínculo claro entre el requerimiento de negocio (ej. historia de usuario, ticket) y el código implementado/desplegado (commits, PRs).
- **Atributos de Calidad (NFRs):** Los requerimientos de disponibilidad, rendimiento, seguridad y usabilidad están definidos cuantitativamente (ej. "tiempo de respuesta < 200ms").
- **Control de Cambios:** Existe un proceso formal para la gestión, aprobación e implementación de cambios en los requerimientos.

## 3. Pasos de Ejecución
1. **Revisión Documental:** Analizar el backlog, documentos de especificación (PRD) y criterios de aceptación.
2. **Matriz de Trazabilidad:** Seleccionar una muestra aleatoria de requerimientos críticos y rastrearlos hasta el código fuente y las pruebas asociadas.
3. **Evaluación de NFRs:** Comprobar si los atributos de calidad industriales están documentados y si existe instrumentación para medirlos empíricamente.
4. **Análisis de Brechas (Gap Analysis):** Identificar funcionalidades críticas del negocio que no están soportadas o están sub-soportadas por el software actual.

## 4. Evidencia Requerida
- Matriz de trazabilidad (Requerimiento -> Código -> Prueba).
- Documentación de Requerimientos No Funcionales (NFRs).
- Ejemplos de tickets/historias de usuario con criterios de aceptación incompletos o ambiguos.
