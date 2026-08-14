# Auditoría de Migraciones

## 1. Propósito
Asegurar despliegues de base de datos predecibles, reversibles y sin tiempo de inactividad (Zero Downtime).

## 2. Criterios de Evaluación
- **Idempotencia:** Las migraciones deben ser aplicables varias veces sin error.
- **Versioning:** Sistema de control de versiones para migraciones.
- **Reversibilidad:** Existencia de scripts de `down` para cada migración.
- **Automatización:** Ejecución integrada en el pipeline de CI/CD.

## 3. Pasos de Ejecución
1. **Revisión de Scripts:** Verificar historial de migraciones.
2. **Test de Rollback:** Ejecutar `up` y luego `down` en un entorno de pruebas.
3. **Cero Downtime:** Evaluar si las migraciones bloquean tablas (ej. `ALTER TABLE` masivos).

## 4. Evidencia Requerida
- Ejemplo de migración no idempotente o sin script de rollback.
- Logs de despliegue mostrando fallos en migraciones.
