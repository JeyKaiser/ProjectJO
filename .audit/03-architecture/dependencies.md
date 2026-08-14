# Auditoría de Dependencias

## 1. Propósito
Evaluar el ecosistema de bibliotecas de terceros, frameworks y herramientas subyacentes, gestionando el riesgo de la cadena de suministro de software (Supply Chain Risk).

## 2. Criterios de Evaluación
- **Actualidad y Mantenimiento:** Uso de versiones estables, soportadas (no End-of-Life) y con actividad reciente por parte de la comunidad.
- **Seguridad de Dependencias:** Ausencia de vulnerabilidades conocidas (CVEs) en librerías directas y transitivas.
- **Redundancia:** Evitar múltiples librerías que hacen exactamente lo mismo (ej. moment.js, date-fns y dayjs en el mismo proyecto).
- **Licenciamiento corporativo:** Asegurar que las licencias de código abierto de terceros (ej. GPL, MIT, Apache) son compatibles con las políticas de distribución de la empresa.

## 3. Pasos de Ejecución
1. **Generación de SBOM (Software Bill of Materials):** Extraer la lista completa de dependencias (`package.json`, `requirements.txt`, `pom.xml`, etc.).
2. **Análisis de Vulnerabilidades:** Ejecutar herramientas tipo `npm audit`, `OWASP Dependency-Check` o Snyk.
3. **Auditoría de Licencias:** Escanear el SBOM buscando licencias restrictivas (Copyleft fuerte) que puedan comprometer la propiedad intelectual corporativa.
4. **Revisión de "Bloat":** Identificar librerías gigantescas usadas para funciones triviales (ej. Lodash entero para usar un solo método).

## 4. Evidencia Requerida
- Reporte SBOM consolidado.
- Listado crítico de CVEs detectados (S1 y S2).
- Reporte de dependencias redundantes o abandonadas por sus creadores.
