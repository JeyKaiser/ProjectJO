# Auditoría de Gestión de Errores

## 1. Propósito
Garantizar que el sistema gestiona errores de forma elegante, segura y diagnóstica, sin exponer detalles internos y facilitando el debugging.

## 2. Criterios de Evaluación
- **Global Error Handler:** Existencia de un interceptor o middleware global que capture excepciones.
- **Seguridad:** Los errores nunca deben exponer trazas de pila (stack traces), configuraciones de DB o nombres de tablas al cliente (solo al log).
- **Logging:** Logs estructurados (JSON), correlacionables con un Request ID único para trazabilidad.
- **Resiliencia:** Manejo de errores recuperables (retries, fallbacks).

## 3. Pasos de Ejecución
1. **Fuzzing de Errores:** Enviar payloads malformados, ids inexistentes, valores fuera de rango para ver la respuesta del sistema.
2. **Análisis de Logs:** Verificar si los logs capturan el error y el contexto suficiente para el diagnóstico.
3. **Revisión de Seguridad:** Confirmar que no hay exposición de información interna en errores 500.

## 4. Evidencia Requerida
- Capturas de respuestas 500 que exponen el stack trace.
- Logs incompletos o desestructurados.
- Falta de Request ID en los logs impidiendo trazar una petición a través de microservicios.
