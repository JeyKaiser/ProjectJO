# Auditoría de Renderizado

## 1. Propósito
Optimizar la estrategia de renderizado para maximizar el rendimiento percibido y el SEO, equilibrando el uso de cliente y servidor.

## 2. Criterios de Evaluación
- **Estrategia:** ¿Uso de CSR, SSR, SSG o ISR? ¿Es la adecuada para la naturaleza de los datos?
- **Hydration:** Identificar errores de "hydration mismatch" entre el contenido estático del servidor y el dinámico del cliente.
- **Code Splitting:** Implementación de lazy loading (`React.lazy`, `Suspense`) para reducir el bundle inicial.
- **Optimización de Activos:** Compresión de imágenes, fuentes y manejo de caché de estáticos.

## 3. Pasos de Ejecución
1. **Auditoría de Network:** Verificar el tamaño y tiempos de carga de recursos en la primera carga.
2. **Simulación de Hydration:** Revisar consola buscando advertencias de desajuste entre SSR y cliente.
3. **Análisis de Lazy Loading:** Comprobar si las rutas y componentes pesados se cargan bajo demanda.

## 4. Evidencia Requerida
- Capturas de la pestaña "Network" mostrando bundles gigantes en el primer load.
- Logs de advertencias de Hydration.
- Métricas de Lighthouse/Core Web Vitals.
