# Render Cascade Analysis

## Objetivo
Analizar cómo un cambio de estado puede provocar múltiples renders encadenados.

## Qué evaluar
- parent renders,
- child renders,
- context propagation,
- prop chains,
- render depth.

## Riesgos
- cascadas invisibles,
- renders exponenciales,
- componentes costosos renderizados repetidamente.

## Señales comunes
- provider global enorme,
- props recreadas en padres,
- listas dependientes del estado global.

## Objetivo pedagógico
Pensar en flujo de renderizado como sistema completo.