# Auditoría de Usabilidad

## 1. Propósito
Garantizar que la interfaz de usuario de la aplicación permita a los operarios, analistas y gerentes realizar sus tareas de manera eficiente, con una curva de aprendizaje mínima y previniendo errores humanos costosos.

## 2. Criterios de Evaluación
- **Eficiencia de Tareas:** Medición del tiempo y esfuerzo (clics, navegación) requeridos para completar flujos críticos.
- **Prevención y Recuperación de Errores:** Validaciones en tiempo real, mensajes de error claros, y capacidad de deshacer acciones (undo) en procesos no destructivos.
- **Carga Cognitiva:** Eliminación de información irrelevante, agrupamiento lógico de datos y uso adecuado del espacio en blanco (whitespace).
- **Feedback del Sistema:** Indicadores de estado claros durante procesos asíncronos (cargas, guardados, cálculos).

## 3. Pasos de Ejecución
1. **Evaluación Heurística:** Recorrer las pantallas clave usando las 10 heurísticas de Nielsen.
2. **Pruebas de Flujo:** Ejecutar los 5 procesos más comunes simulando el comportamiento de un usuario novato.
3. **Análisis de Formularios:** Revisar etiquetas, validaciones en línea, tabulación lógica y manejo de errores.
4. **Validación de Feedback:** Forzar estados de latencia (throttling de red) para comprobar la presencia de skeleton loaders, spinners o disable states.

## 4. Evidencia Requerida
- Capturas de pantalla destacando violaciones heurísticas.
- Grabaciones de pantalla mostrando flujos con alta fricción o falta de feedback.
- Análisis de tiempos de respuesta percibidos por el usuario.
