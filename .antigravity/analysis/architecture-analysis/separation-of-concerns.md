# Separation of Concerns Analysis

## Objetivo
Detectar si UI, lógica, estado y dominio están correctamente separados.

## Evaluar
- lógica dentro de componentes,
- cálculos dentro del render,
- validaciones mezcladas con JSX,
- fetch acoplado a UI.

## Riesgos
- componentes difíciles de mantener,
- baja reutilización,
- testing complejo,
- acoplamiento alto.

## Señales positivas
- hooks personalizados,
- lógica reutilizable,
- componentes enfocados,
- dominio desacoplado.

## Preguntas
- ¿La UI conoce demasiado del negocio?
- ¿La lógica puede moverse?
- ¿La capa visual depende del dominio?

## Objetivo pedagógico
Aprender arquitectura frontend limpia.