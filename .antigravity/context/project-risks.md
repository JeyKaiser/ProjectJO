# Project Risks — ProjectJO-Antigravity

## Riesgo 1: Componentes monolíticos
Algunas vistas pueden concentrar demasiadas responsabilidades:
- renderizado,
- lógica de negocio,
- formularios,
- navegación,
- transformación de datos.

### Impacto
- mantenimiento difícil,
- testing complejo,
- re-renders innecesarios,
- alta probabilidad de bugs.

## Riesgo 2: CSS global monolítico
Un archivo CSS muy grande puede causar:
- colisiones de clases,
- dependencia implícita entre pantallas,
- miedo a refactorizar,
- uso excesivo de `!important`.

### Impacto
- baja escalabilidad visual,
- deuda técnica acumulada,
- difícil reutilización.

## Riesgo 3: Lógica de negocio dentro de UI
Si el cálculo de temperaturas, fases o estados vive dentro de un componente visual, la lógica queda acoplada al render.

### Impacto
- poca reutilización,
- difícil testeo,
- bugs en reglas de transición.

## Riesgo 4: Prop drilling y estado mal distribuido
Si el estado se propaga por demasiados niveles o se usa Context para todo, el sistema puede volverse ineficiente o difícil de comprender.

### Impacto
- jerarquías complejas,
- re-renderizado amplio,
- bajo control de dependencia.

## Riesgo 5: Falta de separación por capas
Cuando la UI, el dominio y la infraestructura se mezclan, la arquitectura se vuelve frágil.

### Impacto
- cambios costosos,
- baja trazabilidad,
- alta dificultad para escalar.

## Prioridades de mitigación
1. Extraer lógica pura.
2. Reducir tamaño de componentes.
3. Modularizar CSS.
4. Centralizar dominio en utils o services.
5. Introducir hooks personalizados donde aporte claridad.