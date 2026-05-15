# Performance Challenge — Lazy Loading

## Objetivo
Reducir el tamaño del bundle inicial mediante carga diferida.

## Contexto
El proyecto contiene vistas grandes:
- ConfiguracionPersonas.jsx
- FichaTecnicaForm.jsx
- ReferenciaDetalle.jsx

## Retos
1. Identificar rutas candidatas.
2. Implementar React.lazy.
3. Implementar Suspense.
4. Analizar impacto UX.

## Riesgos
- loading states pobres,
- flashes visuales,
- división incorrecta del bundle.

## Objetivo pedagógico
Comprender code splitting y optimización de carga.