# Context Performance Report

## Objetivo
Analizar el impacto del Context API en el rendimiento de la app.

## Criterios
- tamaño del provider
- frecuencia de cambios
- cantidad de consumidores
- posibilidad de fragmentar contextos
- propagación de renders

## Riesgos
- renders globales excesivos
- provider demasiado grande
- acoplamiento entre consumidores
- actualizaciones innecesarias

## Señales de buen uso
- contextos específicos
- datos bien segmentados
- proveedor delgado
- consumo controlado

## Resultado esperado
- evaluación del contexto
- impacto en rendimiento
- recomendaciones de división
- estrategia de reducción de renders