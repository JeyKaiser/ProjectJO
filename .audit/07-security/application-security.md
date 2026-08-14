# Auditoría de Seguridad de Aplicación

## 1. Propósito
Identificar y mitigar vulnerabilidades comunes siguiendo estándares como OWASP Top 10.

## 2. Criterios de Evaluación
- **Inyecciones:** SQLi, Command Injection, XSS.
- **Desconfiguraciones:** Header de seguridad (HSTS, CSP, etc.), exposición de errores.
- **Componentes Vulnerables:** Escaneo de dependencias.

## 3. Pasos de Ejecución
1. **SAST:** Análisis estático de código.
2. **DAST:** Análisis dinámico de endpoints.
3. **Revisión de Headers:** Verificar cabeceras HTTP de seguridad.

## 4. Evidencia Requerida
- Reportes de herramientas SAST/DAST.
- Capturas de cabeceras HTTP inseguras.
