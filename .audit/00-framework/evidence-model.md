# Modelo de Evidencia

## 1. Principio de Verificabilidad
Todo hallazgo registrado en la auditoría debe estar respaldado por evidencia objetiva, reproducible y rastreable. No se aceptan suposiciones, inferencias ni juicios de valor sin sustento empírico verificable.

## 2. Tipos de Evidencia Aceptados

### A. Evidencia Estática (Código y Configuración)
- **Fragmentos de código (Code Snippets):** Bloques de código fuente exactos.
- **Configuraciones:** Archivos como `package.json`, `docker-compose.yml`, scripts de infraestructura.
- **Resultados de Análisis:** Logs de linters, reportes de herramientas SAST, árboles de dependencias.

### B. Evidencia Dinámica (Ejecución y Rendimiento)
- **Métricas de Perfilado:** Capturas de React Profiler, Network tab en DevTools, tiempos de respuesta de endpoints de API.
- **Logs de Ejecución:** Trazas de errores (stack traces), logs del servidor, dumps de base de datos.

### C. Evidencia Operativa e Industrial
- **Validación de Entorno:** Políticas IAM, configuraciones de Supabase/Postgres, reglas RLS.
- **Registros de Integración:** Payloads fallidos hacia/desde sistemas corporativos, auditoría de datos textileriales (Matriz), aserciones de consistencia.

## 3. Estructura de Captura de Evidencia
Cada hallazgo documentado en las plantillas de auditoría debe incluir:
1. **Fuente:** Archivo, componente, URL o servidor específico.
2. **Artefacto:** El fragmento de código, log o salida del sistema que demuestra la falla.
3. **Condición de Reproducción:** Pasos exactos para replicar el escenario evaluado.
4. **Contraste de Criterio:** Explicación técnica de por qué la evidencia contraviene el estándar corporativo.
