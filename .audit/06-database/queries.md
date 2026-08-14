# Auditoría de Consultas (Queries)

## 1. Propósito
Optimizar el acceso a los datos, evitando consultas pesadas, bloqueos y degradación del rendimiento.

## 2. Criterios de Evaluación
- **Eficiencia:** Uso correcto de `INDEX` (b-tree, gin, gist), evitar `SELECT *`.
- **Estructura:** Consultas declarativas vs. Procedimientos almacenados (usar con moderación).
- **Concurrencia:** Evitar bloqueos pesados en operaciones de lectura.
- **Explain Plans:** Análisis de planes de ejecución para consultas críticas.

## 3. Pasos de Ejecución
1. **Identificación de 'Slow Queries':** Analizar el log de consultas lentas de la DB.
2. **Ejecución de `EXPLAIN ANALYZE`:** Revisar los planes de ejecución de las queries core.
3. **Verificación de Índices:** Confirmar si existen índices para las columnas usadas en `WHERE` y `JOIN`.

## 4. Evidencia Requerida
- Listado de consultas lentas identificadas.
- Capturas de `EXPLAIN ANALYZE` mostrando escaneos de tabla completa (Sequential Scans) innecesarios.
