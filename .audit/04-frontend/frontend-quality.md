# Auditoría de Calidad Frontend

## 1. Propósito
Evaluar la mantenibilidad, robustez y adherencia a estándares de ingeniería en el frontend, garantizando un código limpio, legible y escalable.

## 2. Criterios de Evaluación
- **Estandarización:** Uso consistente de linters (ESLint, Prettier), tipado fuerte (TypeScript obligatorio en entornos empresariales).
- **Estructura del Proyecto:** Organización lógica de archivos (feature-based vs technical-based), evitando carpetas monolíticas.
- **Deuda Técnica:** Análisis de dependencias obsoletas, código muerto, y complejidad ciclomática de componentes.
- **Documentación de Código:** Presencia de JSDoc/TSDoc en funciones complejas y utilidades.

## 3. Pasos de Ejecución
1. **Análisis Estático:** Ejecutar herramientas de linting y reportar violaciones críticas.
2. **Revisión de Tipado:** Verificar el uso de `any` o tipos implícitos peligrosos (esential: `noImplicitAny: true`).
3. **Análisis de Complejidad:** Identificar componentes excesivamente largos (>300 líneas) o con alta densidad de lógica.
4. **Análisis de Bundle:** Verificar el tamaño final del bundle de producción y sus dependencias más pesadas.

## 4. Evidencia Requerida
- Reportes de linting y métricas de complejidad (ej. SonarQube).
- Ejemplos de uso excesivo de `any` o código sin tipar.
- Configuración de `tsconfig.json` y `eslint.config.js`.
