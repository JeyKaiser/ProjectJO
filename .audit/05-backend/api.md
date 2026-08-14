# Auditoría de API

## 1. Propósito
Evaluar la calidad, consistencia y contractibilidad de la API (REST/GraphQL), garantizando una interfaz robusta para los consumidores.

## 2. Criterios de Evaluación
- **Diseño API:** Uso de verbos HTTP correctos, códigos de estado (2xx, 4xx, 5xx) adecuados.
- **Versioning:** Estrategia de versionamiento (ej. /v1/, /v2/) para evitar breaking changes.
- **Documentación:** Existencia de especificación OpenAPI (Swagger) actualizada automáticamente.
- **Validación de Entradas:** Validación rigurosa de payloads recibidos (DTOs, esquemas de validación).

## 3. Pasos de Ejecución
1. **Análisis de Contract:** Comparar la documentación (Swagger) contra la implementación real.
2. **Verificación de Códigos:** Revisar si la API devuelve 200 OK para errores de negocio (debería ser 400/422).
3. **Análisis de Payloads:** Verificar si se envían datos innecesarios (over-fetching) o si faltan campos obligatorios.

## 4. Evidencia Requerida
- Listado de endpoints no documentados o documentados incorrectamente.
- Ejemplos de respuestas con códigos de estado semánticamente incorrectos.
- Reporte de validaciones de entrada inexistentes o débiles.
