# Performance Challenge — Reduce Dashboard Renders

## Objetivo
Identificar y reducir renderizados innecesarios en Dashboard.jsx.

## Problema
El dashboard se vuelve lento cuando:
- hay muchas referencias,
- múltiples tarjetas,
- cambios frecuentes de estado.

## Posibles causas
- props recreadas,
- callbacks recreados,
- Context API demasiado amplio,
- listas sin memoización,
- cálculos dentro del render.

## Retos
1. Detectar qué renderiza de más.
2. Separar componentes.
3. Aplicar memoización correctamente.
4. Evitar optimización prematura.

## Conceptos clave
- React.memo
- useMemo
- useCallback
- render lifecycle
- referencia por identidad

## Objetivo pedagógico
Desarrollar criterio de optimización frontend.