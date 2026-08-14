# Auditoría de Lógica de Negocio

## 1. Propósito
Asegurar que la lógica de negocio (el "corazón" del sistema) esté encapsulada, protegida y centralizada en servicios de dominio.

## 2. Criterios de Evaluación
- **Encapsulamiento:** La lógica de negocio NO debe residir en controladores (que solo deben orquestar) ni en repositorios (que solo deben persistir).
- **Dominio Rico:** Preferencia por entidades ricas (con comportamiento) sobre entidades anémicas (solo getters/setters).
- **Validaciones:** Reglas de negocio críticas aplicadas tanto en capa de servicio como validadas a nivel de esquema de base de datos.
- **Transaccionalidad:** Las reglas de negocio que implican múltiples cambios deben ser atómicas (transacciones).

## 3. Pasos de Ejecución
1. **Auditoría de Servicios:** Identificar si los servicios de negocio contienen toda la lógica o si está delegada erróneamente.
2. **Revisión de Transacciones:** Buscar procesos de negocio complejos donde un fallo en el medio deje datos en estado inconsistente.
3. **Análisis de Reglas:** Verificar que las reglas de negocio (Matriz JO, etc.) no estén duplicadas en múltiples servicios.

## 4. Evidencia Requerida
- Código donde la lógica de negocio esté dispersa (ej. lógica en controladores).
- Casos donde la transaccionalidad es insuficiente (causa corrupción de datos).
- Identificación de entidades anémicas.
