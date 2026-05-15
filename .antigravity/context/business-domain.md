# Business Domain — ProjectJO-Antigravity

## Propósito del dominio
ProjectJO-Antigravity organiza el flujo de trabajo alrededor del ciclo de vida de prendas de vestir y su avance dentro de un proceso operativo por fases. La interfaz no solo presenta datos: representa estados semánticos del negocio llamados "temperaturas".

## Concepto central: Temperaturas
Las temperaturas son una abstracción visual y funcional del estado de una prenda dentro del proceso. Sirven para:
- representar avance,
- comunicar responsabilidades,
- indicar transición entre fases,
- facilitar lectura rápida del estado actual.

## Interpretación funcional
La UI debe reflejar el estado del negocio de forma clara, consistente y predecible. Esto implica que cada temperatura debe tener:
- un significado concreto,
- una transición válida,
- una representación visual estable,
- una lógica de negocio separada del render.

## Principios del dominio
- El estado de la prenda es más importante que el adorno visual.
- La semántica del color debe ser consistente.
- La lógica de transición no debe depender del componente visual.
- Los cambios de fase deben poder validarse sin depender de la interfaz.

## Entidades conceptuales
- Prenda
- Colección
- Referencia
- Fase
- Temperatura
- Responsable
- Estado operativo
- Registro de avance

## Riesgo arquitectónico
Si la lógica del dominio se mezcla con la UI, el sistema se vuelve difícil de testear, mantener y escalar. Por eso el dominio debe vivir en funciones puras, utils o capas de negocio claramente separadas.

## Objetivo pedagógico
Este dominio debe enseñarse como un ejemplo de arquitectura orientada al negocio, no como una simple pantalla de frontend.