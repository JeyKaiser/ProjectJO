# Auditoría de Autorización

## 1. Propósito
Garantizar el principio de menor privilegio mediante el control de acceso a recursos.

## 2. Criterios de Evaluación
- **RBAC/ABAC:** Implementación consistente de roles o atributos.
- **Granularidad:** Control a nivel de objeto o acción.
- **Seguridad de Servidor:** Verificación en el lado del servidor, no solo UI.

## 3. Pasos de Ejecución
1. **Prueba de Acceso:** Intentar acceder a rutas prohibidas con un usuario de bajo privilegio.
2. **Revisión de Políticas:** Verificar cómo se definen los permisos.

## 4. Evidencia Requerida
- Evidencia de acceso no autorizado a recursos restringidos (IDOR).
