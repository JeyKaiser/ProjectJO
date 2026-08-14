# Auditoría de Esquema de Base de Datos

## 1. Propósito
Evaluar la estructura de la base de datos (DDL), su normalización, relaciones y coherencia con el modelo de dominio.

## 2. Criterios de Evaluación
- **Normalización:** Cumplimiento de 3FN/BCNF según sea necesario. Evitar redundancias innecesarias.
- **Relaciones:** Uso de llaves foráneas para integridad referencial. Identificación de relaciones muchos-a-muchos explícitas.
- **Tipado:** Uso correcto de tipos de datos para eficiencia y precisión (ej. `DECIMAL` para dinero, no `FLOAT`).
- **Convenciones:** Nomenclatura consistente (snake_case/camelCase), prefijos de tablas, y uso de UUIDs vs autoincrementales.

## 3. Pasos de Ejecución
1. **Inspección de DDL:** Revisar scripts de creación de tablas.
2. **Validación de Integridad:** Comprobar la existencia de constraints `FOREIGN KEY` y `NOT NULL`.
3. **Análisis de Diseño:** Evaluar el uso de tipos de datos adecuados para los casos de uso industriales.

## 4. Evidencia Requerida
- Diagrama Entidad-Relación (ERD) generado.
- Ejemplos de columnas con tipos de datos ineficientes o riesgosos.
