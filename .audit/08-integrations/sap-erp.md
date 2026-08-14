# Auditoría de Integración SAP/ERP

## 1. Propósito
Validar la integridad de los datos críticos intercambiados con el ERP corporativo.

## 2. Criterios de Evaluación
- **Consistencia:** Sincronización de catálogos y transacciones.
- **Trazabilidad:** Logs de cada mensaje enviado/recibido.
- **Reintento:** Estrategias de reintento ante fallos de red.

## 3. Pasos de Ejecución
1. **Auditoría de Logs:** Revisar mensajes SAP/IDocs/RFCs.
2. **Prueba de Consistencia:** Comparar datos entre DB del sistema y SAP.

## 4. Evidencia Requerida
- Reporte de inconsistencias de datos.
- Logs de errores de comunicación SAP.
