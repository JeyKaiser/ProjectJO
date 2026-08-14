# Auditoría de Respaldo y Recuperación (Backup)

## 1. Propósito
Garantizar la disponibilidad de los datos ante desastres o errores humanos.

## 2. Criterios de Evaluación
- **Frecuencia:** RPO (Recovery Point Objective) y RTO (Recovery Time Objective) definidos y probados.
- **Almacenamiento:** Backups almacenados fuera de la infraestructura principal (off-site, S3).
- **Verificación:** Pruebas periódicas de restauración (no solo de respaldo).
- **Seguridad:** Backups cifrados y con acceso restringido.

## 3. Pasos de Ejecución
1. **Verificación:** Listar fechas y tamaños de los backups recientes.
2. **Test de Restauración:** (Bajo entorno controlado) Intentar restaurar una copia.
3. **Revisión de Política:** Documentación del plan de recuperación.

## 4. Evidencia Requerida
- Registro de logs de ejecución de backups.
- Documento de políticas de RPO/RTO.
