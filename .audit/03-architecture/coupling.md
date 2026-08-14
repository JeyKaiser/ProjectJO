# Auditoría de Acoplamiento

## 1. Propósito
Medir y reducir el grado de interdependencia entre los módulos, servicios y componentes del sistema. Un bajo acoplamiento es vital para evitar "efectos cascada" cuando se realizan cambios o ocurren fallos.

## 2. Criterios de Evaluación
- **Bajo Acoplamiento (Loose Coupling):** Los módulos deben depender de abstracciones (interfaces) y no de implementaciones concretas.
- **Acoplamiento de Datos:** Evitar que múltiples servicios compartan y escriban en la misma base de datos sin un contrato claro (Integration Database Anti-pattern).
- **Comunicación Asíncrona:** Uso adecuado de eventos, colas o pub/sub para desacoplar flujos de trabajo que no requieren respuestas en tiempo real.
- **Inyección de Dependencias (DI):** Uso sistemático de contenedores DI para gestionar la creación y ciclo de vida de los objetos.

## 3. Pasos de Ejecución
1. **Análisis de Referencias Cruzadas:** Buscar importaciones circulares y dependencias bidireccionales en el código fuente.
2. **Revisión de Integración de Base de Datos:** Identificar si múltiples aplicaciones o servicios atacan las mismas tablas directamente.
3. **Evaluación de Contratos:** Revisar cómo se comunican los módulos (llamadas a métodos directos vs. eventos).
4. **Validación de DI:** Comprobar la configuración del framework de Inyección de Dependencias y buscar instanciaciones con `new` de clases de negocio.

## 4. Evidencia Requerida
- Diagrama de grafo de dependencias mostrando cuellos de botella (hubs con demasiadas dependencias).
- Identificación de acoplamientos temporales o espaciales indeseados.
- Code snippets evidenciando instanciación rígida vs abstracciones.
