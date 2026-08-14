# Auditoría de Accesibilidad (a11y)

## 1. Propósito
Asegurar que la aplicación sea usable por cualquier persona, independientemente de sus capacidades visuales, motoras o cognitivas, cumpliendo con los estándares corporativos y normativas legales (WCAG).

## 2. Criterios de Evaluación
- **Contraste y Color:** Relación de contraste adecuada (mínimo 4.5:1 para texto normal) y no depender exclusivamente del color para transmitir información crítica (ej. errores).
- **Navegabilidad por Teclado:** Todos los flujos operativos deben ser completables usando únicamente el teclado, vital para entornos de digitación rápida.
- **Lectores de Pantalla:** Uso semántico de HTML y atributos ARIA correctos para etiquetas, roles y estados.
- **Escalabilidad y Responsividad:** Soportar zoom de texto hasta 200% sin pérdida de funcionalidad.

## 3. Pasos de Ejecución
1. **Auditoría Automatizada:** Ejecutar herramientas como Lighthouse, axe-core o WAVE en pantallas clave.
2. **Prueba de Teclado (Tab Test):** Desconectar el mouse e intentar completar procesos core (creación, edición, consulta). Verificar el "focus outline".
3. **Simulación Visual:** Usar filtros de daltonismo o simuladores de bajo contraste para verificar la legibilidad de gráficas de datos (dashboards).
4. **Revisión de Jerarquía:** Comprobar la estructura de encabezados (H1-H6) y el uso de landmarks (main, nav, aside).

## 4. Evidencia Requerida
- Reportes generados por herramientas de auditoría (axe, Lighthouse).
- Capturas de pantalla mostrando pérdida de foco o elementos inalcanzables por teclado.
- Ejemplos de uso incorrecto o nulo de etiquetas semánticas y ARIA.
