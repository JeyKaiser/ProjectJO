# Auditoría de Calidad Backend

## 1. Propósito
Evaluar la arquitectura de backend, su mantenibilidad, cumplimiento de principios SOLID y la calidad técnica del código base.

## 2. Criterios de Evaluación
- **Arquitectura:** Adopción de arquitecturas desacopladas (Clean Architecture, Hexagonal, Onion).
- **Principios SOLID:** Cumplimiento de Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation y Dependency Inversion.
- **Gestión de Dependencias:** Uso adecuado de Inyección de Dependencias (DI).
- **Calidad de Código:** Complejidad ciclomática, duplicación de código, nombrado semántico.

## 3. Pasos de Ejecución
1. **Análisis de Capas:** Verificar que el código está organizado por capas (Controller -> Service -> Repository) y no hay fuga de lógica entre ellas.
2. **Revisión de DI:** Inspeccionar cómo se instancian los servicios (¿hay hardcoding de dependencias?).
3. **Métricas de Código:** Ejecutar herramientas de calidad (ej. SonarQube, ESLint para JS/TS).
4. **Code Review:** Revisar una muestra de PRs recientes buscando violaciones a principios de diseño.

## 4. Evidencia Requerida
- Diagrama de capas del sistema.
- Ejemplos de clases "dios" (God Objects) o lógica de negocio acoplada a controladores.
- Reporte de deuda técnica y code smells.
