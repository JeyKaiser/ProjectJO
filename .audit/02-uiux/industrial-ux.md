# Auditoría de UX Industrial

## 1. Propósito
Evaluar la idoneidad de la interfaz para entornos de alta productividad, fábricas, almacenes o centros de control, donde la velocidad de captura de datos y la densidad de información son críticas.

## 2. Criterios de Evaluación
- **Densidad de Datos:** Capacidad de mostrar grandes volúmenes de información (tablas densas) sin abrumar, permitiendo escaneo visual rápido.
- **Captura Rápida (Power Usage):** Soporte para atajos de teclado globales, macros, y entrada de datos sin interrupciones del ratón.
- **Tolerancia Ambiental:** Diseños aptos para pantallas industriales (bajo brillo, reflejos, uso de guantes/pantallas resistivas si aplica).
- **Integración de Hardware:** Compatibilidad fluida con lectores de códigos de barras, RFID, balanzas u otros periféricos.

## 3. Pasos de Ejecución
1. **Prueba de Digitación Masiva:** Evaluar la velocidad para ingresar 50 registros continuos (ej. lecturas de calidad).
2. **Validación de Tablas de Datos:** Revisar capacidades de paginación virtual, fijación de columnas (sticky headers/columns), filtros avanzados y exportación masiva.
3. **Simulación Periférica:** Interceptar inputs como si provinieran de un escáner de código de barras (entrada rápida seguida de 'Enter') y medir el comportamiento.
4. **Análisis de Pantallas de Control:** Revisar dashboards operativos asegurando que las alertas críticas y semáforos de estado son inconfundibles a varios metros de distancia.

## 4. Evidencia Requerida
- Métricas de tiempo de ejecución para entrada de datos masiva.
- Pruebas de rendimiento de renderizado en tablas con >1000 filas.
- Casos documentados donde el sistema falla o se ralentiza bajo input de hardware industrial.
