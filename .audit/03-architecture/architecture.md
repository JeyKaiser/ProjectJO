# Auditoría de Arquitectura de Software

## 1. Propósito
Evaluar la estructura fundamental del sistema, sus componentes principales y cómo interactúan entre sí, asegurando que el diseño soporta los objetivos de negocio actuales y futuros.

## 2. Criterios de Evaluación
- **Alineación con el Negocio:** El estilo arquitectónico (Monolito, Microservicios, Serverless, Hexagonal) debe ser el adecuado para el tamaño, madurez y necesidades del dominio corporativo.
- **Separación de Responsabilidades:** Capas bien definidas (Presentación, Dominio, Infraestructura) sin cruce de lógica no autorizada.
- **Documentación Arquitectónica:** Existencia y actualización de diagramas de arquitectura (ej. modelo C4), ADRs (Architecture Decision Records) y diagramas de secuencia.
- **Gestión del Estado:** Definición clara de dónde y cómo se almacena el estado (Stateless vs Stateful).

## 3. Pasos de Ejecución
1. **Levantamiento Documental:** Solicitar y revisar diagramas arquitectónicos y documentación técnica.
2. **Mapeo de Capas:** Analizar la estructura de carpetas y el flujo de llamadas desde el controlador hasta la base de datos para confirmar que se respeta la arquitectura declarada.
3. **Revisión de Anti-patrones:** Buscar el anti-patrón "Big Ball of Mud", lógica de negocio en controladores, o acceso a base de datos desde vistas.
4. **Evaluación de Resiliencia Arquitectónica:** Identificar puntos únicos de falla (SPOF) en el diseño de alto nivel.

## 4. Evidencia Requerida
- Diagramas AS-IS generados o corregidos por el auditor.
- Code snippets mostrando violaciones de límites arquitectónicos (ej. un DTO de UI inyectado directamente en la capa de persistencia).
- Identificación de SPOFs arquitectónicos.
