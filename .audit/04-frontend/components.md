# Auditoría de Componentes

## 1. Propósito
Asegurar que los componentes UI son atómicos, reutilizables, composicionales y altamente cohesivos.

## 2. Criterios de Evaluación
- **Atomicidad:** ¿Están los componentes descompuestos en unidades mínimas funcionales (átomos, moléculas, organismos)?
- **Composición vs Herencia:** Preferencia por la composición (children, slots, render props) sobre la herencia o configuración rígida.
- **Interfaces (Props):** Interfaces de props claras, documentadas y no excesivamente grandes.
- **Lógica en Componentes:** ¿Se está filtrando lógica de negocio dentro de los componentes UI? (Debe evitarse).

## 3. Pasos de Ejecución
1. **Inspección Visual de Código:** Buscar componentes "dios" (God Components) que manejan UI y lógica de negocio simultáneamente.
2. **Análisis de Props:** Identificar componentes con más de 7-10 props (indicador de falta de composición).
3. **Revisión de Duplicidad:** Buscar componentes similares implementados varias veces con ligeras variaciones (deberían ser parametrizables).

## 4. Evidencia Requerida
- Código de componentes "dios" que mezclan llamadas a API, lógica de estado y renderizado.
- Lista de componentes duplicados.
- Ejemplos de interfaces de props mal definidas o ambiguas.
