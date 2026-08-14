# Auditoría de Integridad de Datos

## 1. Propósito
Garantizar la veracidad, consistencia y trazabilidad de los datos a lo largo de todo el ciclo de vida del sistema.

## 2. Criterios de Evaluación
- **Constraints a nivel de DB:** Uso de `CHECK`, `UNIQUE` y triggers para validar reglas de negocio inmutables.
- **RLS (Row Level Security):** Si aplica (ej. Postgres/Supabase), verificar políticas de aislamiento de datos.
- **Auditoría:** Existencia de columnas de control (created_at, updated_by) y tablas de auditoría (logs de cambios).
- **Consistencia:** Ausencia de datos huérfanos o inconsistencias referenciales.

## 3. Pasos de Ejecución
1. **Test de Integridad:** Intentar insertar datos que violen reglas de negocio conocidas.
2. **Revisión de RLS:** Auditar políticas de seguridad si el entorno lo permite.
3. **Análisis de Logs:** Revisar si las operaciones críticas quedan registradas.

## 4. Evidencia Requerida
- Reporte de validaciones de reglas de negocio fallidas a nivel DB.
- Evidencia de falta de logs de auditoría en tablas críticas.
