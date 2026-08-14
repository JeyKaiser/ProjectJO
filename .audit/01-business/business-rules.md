# Auditoría de Reglas de Negocio

## 1. Propósito
Asegurar que las reglas corporativas e industriales (ej. validaciones de consumo textil, exclusividad de asignaciones, restricciones de estados) estén implementadas correctamente, de forma centralizada y segura.

## 2. Criterios de Evaluación
- **Implementación Segura:** Las reglas de negocio críticas deben aplicarse en el Backend y en la Base de Datos, nunca depender exclusivamente de validaciones en el Frontend.
- **Centralización y Cohesión:** La lógica de negocio no debe estar dispersa en controladores, vistas o scripts aislados; debe residir en una capa de dominio o servicios dedicada.
- **Exactitud Matemática/Lógica:** Las reglas deben cumplir estrictamente con los cálculos industriales esperados (ej. cálculo de eficiencia textil, mermas, tolerancias).
- **Cobertura de Casos Borde:** Las validaciones deben contemplar entradas anómalas, valores nulos, y estados concurrentes (race conditions).

## 3. Pasos de Ejecución
1. **Inventario de Reglas:** Listar las reglas de negocio críticas (ej. Reglas R01 a R25 en la Matriz JO).
2. **Análisis de Implementación:** Inspeccionar el código fuente para ubicar dónde se ejecuta cada regla. Identificar casos de "lógica en la UI" (ej. validaciones en componentes React que no tienen respaldo en API/DB).
3. **Validación Dinámica:** Ejecutar pruebas inyectando datos inválidos (bypass del frontend) para confirmar que el backend y la base de datos rechazan transacciones que violan las reglas.
4. **Revisión de Casos Borde:** Evaluar cómo responde el sistema ante valores atípicos (outliers) definidos estadísticamente.

## 4. Evidencia Requerida
- Ubicación de la lógica de negocio en la arquitectura (Code snippets demostrando reglas en UI vs Backend).
- Resultados de intentos de evasión de reglas de negocio enviando peticiones directas a la API.
- Reportes de pruebas unitarias que validen específicamente la exactitud de cálculos industriales.
