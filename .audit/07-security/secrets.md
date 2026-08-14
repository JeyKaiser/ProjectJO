# Auditoría de Gestión de Secretos

## 1. Propósito
Prevenir la fuga de credenciales sensibles.

## 2. Criterios de Evaluación
- **No Hardcoding:** Ningún secreto en el código fuente.
- **Gestión:** Uso de Secret Manager, Vault, variables de entorno.
- **Rotación:** Ciclos de rotación definidos.

## 3. Pasos de Ejecución
1. **Escaneo:** Buscar secretos en el repo (`git-secrets`, `trufflehog`).
2. **Configuración:** Revisar cómo se inyectan las credenciales.

## 4. Evidencia Requerida
- Lista de secretos encontrados en el código (hardcoded).
