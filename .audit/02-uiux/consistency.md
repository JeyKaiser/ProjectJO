# Auditoría de Consistencia UI

## 1. Propósito
Verificar que la aplicación mantiene una apariencia y comportamiento uniformes a través de todos sus módulos, reduciendo la fricción mental del usuario y los costos de desarrollo.

## 2. Criterios de Evaluación
- **Sistema de Diseño (Design System):** Uso de una paleta de colores, tipografía, espaciado e iconografía estandarizada.
- **Patrones de Interacción:** Las acciones similares (guardar, cancelar, filtrar, exportar) deben ubicarse en el mismo lugar y comportarse igual en toda la app.
- **Componentes Reutilizables:** Evitar la duplicación de código de UI (ej. múltiples implementaciones de un botón primario).
- **Tono y Voz:** Consistencia en la redacción técnica, mensajes de error y etiquetas (ej. no mezclar "Eliminar" y "Borrar").

## 3. Pasos de Ejecución
1. **Inventario de Componentes:** Extraer y comparar elementos comunes (botones, modales, tablas, inputs) de diferentes vistas.
2. **Revisión de Tema (Theming):** Verificar la configuración de CSS/Tailwind o el theme provider para asegurar que no se están usando valores "mágicos" o harcodeados (ej. `color: #ff0000` en lugar de `var(--error-color)`).
3. **Auditoría de Nomenclatura:** Leer los copies de al menos 5 módulos distintos buscando divergencias terminológicas.

## 4. Evidencia Requerida
- Collage comparativo de UI mostrando inconsistencias visuales (ej. 4 tipos distintos de select dropdowns).
- Code snippets con estilos en línea (inline styles) o valores hardcodeados en lugar de tokens del design system.
- Glosario de inconsistencias en textos de la UI.
