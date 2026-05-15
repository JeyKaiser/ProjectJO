# Performance Audit Template

## Objetivo
Evaluar el rendimiento del frontend y detectar cuellos de botella en renderizado, estado, routing y bundle.

## Zonas a analizar
- render lifecycle
- re-renderizados innecesarios
- context providers
- memoización
- listas grandes
- carga de rutas
- tamaño del bundle

## Preguntas clave
- ¿Qué dispara renders innecesarios?
- ¿Hay cálculos costosos dentro del render?
- ¿Se está usando memoización con criterio?
- ¿Las rutas pesadas están diferidas?
- ¿El estado global está amplificando renders?

## Riesgos frecuentes
- mutación de estado
- props recreadas
- callbacks recreados
- contexto sobredimensionado
- bundle inicial excesivo

## Resultado esperado
- hallazgos de performance
- impacto estimado
- acciones correctivas
- prioridades técnicas