# Auditoría de Concurrencia

## 1. Propósito
Evaluar la robustez del sistema ante accesos simultáneos a recursos compartidos, evitando condiciones de carrera (race conditions) y bloqueos inconsistentes.

## 2. Criterios de Evaluación
- **Estrategias de Bloqueo:** Uso de bloqueos optimistas (versiones) vs. pesimistas (locks de base de datos) según el caso de uso.
- **Consistencia:** Garantía de que operaciones concurrentes no corrompen el estado del negocio.
- **Performance:** Minimización del tiempo de bloqueo de recursos para no degradar la latencia.
- **Deadlocks:** Identificación y manejo de situaciones de bloqueo mutuo.

## 3. Pasos de Ejecución
1. **Identificación de Recursos Críticos:** Listar los datos con mayor probabilidad de escritura concurrente (ej. stock, saldos, estados de pedido).
2. **Pruebas de Estrés:** Simular peticiones simultáneas sobre el mismo recurso para validar la integridad.
3. **Análisis de Código:** Revisar cómo se gestionan las transacciones y si se usan mecanismos de control de concurrencia adecuados.

## 4. Evidencia Requerida
- Casos detectados de race conditions (ej. doble descuento de stock).
- Código fuente implementando bloqueos incorrectos o inexistentes.
- Deadlocks reportados en los logs de la base de datos.
