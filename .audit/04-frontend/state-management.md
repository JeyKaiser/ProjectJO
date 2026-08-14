# Auditoría de Gestión de Estado

## 1. Propósito
Evaluar cómo se gestiona, persiste y sincroniza el estado de la aplicación (UI y Datos), evitando fugas de memoria, inconsistencias y sobre-renderizado.

## 2. Criterios de Evaluación
- **Estrategia de Estado:** ¿Se usa el estado adecuado para el caso adecuado? (Estado Global vs Estado Local vs Estado de Servidor/Caché).
- **Rendimiento:** Evitar "prop drilling" excesivo y re-renderizados innecesarios causados por actualizaciones globales ineficientes.
- **Persistencia:** Gestión correcta del estado en el cliente (LocalStorage, SessionStorage) considerando riesgos de seguridad y sincronización.
- **Reactividad:** ¿Es predecible el flujo de datos? (Acciones, Reductores, Efectos).

## 3. Pasos de Ejecución
1. **Auditoría de Patrones:** Identificar la herramienta utilizada (Redux, Zustand, Context, React Query) y si su uso es idiomatico.
2. **Revisión de Efectos:** Buscar usos incorrectos de `useEffect` para sincronización de datos que deberían ser manejados por librerías de caché (como `react-query` o `swr`).
3. **Profiler de Rendimiento:** Usar React DevTools Profiler para detectar componentes que se renderizan sin cambios reales en los props.
4. **Inspección de Almacenamiento:** Revisar qué datos se guardan en el navegador y si contienen información sensible sin cifrado.

## 4. Evidencia Requerida
- Capturas de React DevTools mostrando re-renders innecesarios.
- Ejemplos de "prop drilling" complejo.
- Identificación de datos sensibles almacenados en plano en `localStorage`.
