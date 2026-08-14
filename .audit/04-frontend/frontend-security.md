# Auditoría de Seguridad Frontend

## 1. Propósito
Mitigar ataques del lado del cliente y proteger al usuario final de vulnerabilidades comunes de la web.

## 2. Criterios de Evaluación
- **XSS (Cross-Site Scripting):** Sanitize de entradas de usuario, uso seguro de `dangerouslySetInnerHTML`, Content Security Policy (CSP).
- **CSRF (Cross-Site Request Forgery):** Protección en peticiones de estado (cookies HttpOnly, tokens anti-CSRF).
- **Gestión de Sesión:** Manejo seguro de JWT/tokens (almacenamiento en memoria vs cookies).
- **Exposición de Datos:** No exponer información sensible (llaves API, tokens, lógica de negocio) en código fuente del cliente.

## 3. Pasos de Ejecución
1. **Escaneo de Vulnerabilidades:** Ejecutar `npm audit` y herramientas de análisis estático (SAST) enfocadas en seguridad web.
2. **Revisión de CSP:** Verificar las políticas de seguridad de contenido en las cabeceras HTTP.
3. **Prueba de Inyección:** Intentar inyectar scripts en formularios de entrada para verificar la sanitización.
4. **Inspección de Almacenamiento:** Revisar donde se guardan tokens de autenticación.

## 4. Evidencia Requerida
- Configuración de CSP ausente o permisiva (`*`).
- Evidencia de inyección XSS exitosa en formularios.
- Tokens de sesión almacenados en `localStorage` (alto riesgo).
