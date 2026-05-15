# Architecture Challenge — Migration to Real Backend

## Objetivo
Diseñar la transición desde archivos mockeados hacia una arquitectura real basada en API.

## Estado actual
El proyecto depende de:
- src/data/colecciones.js
- src/data/personas.js
- src/data/referentes.js

## Objetivo de migración
Integrar:
- REST API o GraphQL,
- autenticación real,
- persistencia,
- manejo de errores,
- loading states,
- cache.

## Retos
1. Identificar dependencias actuales.
2. Diseñar capa de servicios.
3. Evitar acoplar fetch con UI.
4. Mantener consistencia de estados.
5. Diseñar estructura escalable.

## Riesgos
- lógica duplicada,
- estado inconsistente,
- exceso de requests,
- loading desordenado.

## Objetivo pedagógico
Comprender separación entre frontend y capa de datos.