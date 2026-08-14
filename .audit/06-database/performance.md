# Auditoría de Rendimiento de Base de Datos

## 1. Propósito
Asegurar que la base de datos escala adecuadamente bajo carga y mantiene latencias aceptables.

## 2. Criterios de Evaluación
- **Caching:** Uso de caché a nivel de consulta o tabla (ej. Redis).
- **Conexiones:** Gestión eficiente del pool de conexiones.
- **Hardware/Cloud:** Configuración del motor (memoria, CPU, IOPS).
- **Mantenimiento:** Políticas de vacuuming, reindexación y limpieza de logs.

## 3. Pasos de Ejecución
1. **Monitorización:** Revisar métricas de CPU/RAM/IOPS durante picos de carga.
2. **Configuración:** Revisar parámetros de configuración del motor de DB.
3. **Pool:** Verificar límites y tiempo de espera del pool de conexiones.

## 4. Evidencia Requerida
- Gráficas de monitorización de recursos.
- Configuración de conexión del cliente de DB hacia el servidor.
