# Contrato de colecciones

> **Estado:** APROBADA  
> **Versión:** 0.1  
> **Idioma:** español  
> **Identificador:** COL  
> **Referencia:** SPEC-DRAFT 003 aprobado

## Propósito y alcance

Esta especificación define el contrato de las colecciones, sus temporadas y
años, la unicidad del número de referencia, las precondiciones de importación y
la transición del año duplicado en `references.year`.

Aplica a `collections`, `collection_years`, `references` y a los procesos que
consultan o importan referencias. No crea colecciones ni años y no sustituye
otros contratos del dominio.

## Definiciones y reglas

### Código oficial y temporada

- Una colección representa exactamente una temporada y un año.
- Las temporadas válidas son `WS`, `SS`, `SV`, `RS`, `PF` y `FW`.
- `collection.code` es el código oficial de cuatro caracteres: dos caracteres
  de temporada seguidos de dos dígitos de año. Son válidos, por ejemplo,
  `WS26`, `SS27`, `SV26`, `RS26`, `PF26` y `FW26`.
- Los dos dígitos `00`–`99` se interpretan como los años 2000–2099,
  respectivamente. Por ejemplo, `SS27` representa el año 2027. Cualquier
  código cuyo año representado quede fuera de 2000–2099 debe rechazarse.
- No son válidos códigos de dos caracteres como `SS` en `collection.code`.
- `collection.season` contiene únicamente el código de temporada de dos
  caracteres (`WS`, `SS`, `SV`, `RS`, `PF` o `FW`).
- El año representado por `collection.code` es el año de la colección y es su
  única fuente canónica.

### Nombre comercial

`collection.name` es opcional y puede estar en español o en inglés. Es un
nombre comercial descriptivo y no es un identificador técnico ni reemplaza a
`collection.code`. Cuando no se informa, se almacena inicialmente como cadena
vacía `''` para mantener compatibilidad; las nuevas colecciones no deben usar
`NULL` para este campo.

### Año de colección y referencias

- Cada colección de cuatro caracteres tiene un único año en `collection_years`,
  el año representado por `collection.code`.
- `collection_years` se mantiene temporalmente por compatibilidad, pero no debe
  contener varios años distintos para una misma colección de cuatro caracteres.
  Una relación con un año diferente al representado por el código es inválida.
- El número de referencia es único por colección + año durante la transición.
  La restricción técnica transitoria es
  `UNIQUE(collection_id, year, reference_number)`.
- Mientras exista `references.year`, toda inserción o actualización nueva de una
  referencia debe exigir que `references.year` coincida con el año derivado de
  `collections.code`; una discrepancia nueva debe rechazarse.
- Una vez completada la transición y confirmada la unicidad de un solo año por
  colección, la restricción objetivo es
  `UNIQUE(collection_id, reference_number)`. No es válido repetir un número en
  dos años distintos dentro de una misma colección; tales años no pueden
  coexistir válidamente en `collection_years`.
- Las colecciones existentes fueron revisadas: no tienen códigos de dos
  caracteres en `collections.code`; los códigos de temporada de dos caracteres
  están en `collections.season`.

### Precondiciones de importación

- La colección y el año deben existir antes de importar referencias u otros
  datos dependientes.
- La importación no crea colecciones ni años.
- Una importación puede ser parcialmente válida: los registros válidos se
  procesan y cada registro inválido se rechaza con su error específico.
- Si la colección o el año requerido no existe, se rechaza el registro afectado
  y se informa la precondición incumplida.

## Requisitos

### COL-001 — Código oficial de colección

El sistema debe aceptar como `collection.code` únicamente códigos oficiales de
cuatro caracteres formados por una temporada válida y dos dígitos de año. Los
dos dígitos deben representar un año entre 2000 y 2099, inclusive; los valores
fuera de ese rango deben rechazarse.

### COL-002 — Temporadas válidas

El sistema debe reconocer como temporadas válidas únicamente `WS`, `SS`, `SV`,
`RS`, `PF` y `FW`.

### COL-003 — Separación de código y temporada

`collection.season` debe conservar el código de temporada de dos caracteres y
`collection.code` debe conservar el código oficial de cuatro caracteres. Un
código de temporada de dos caracteres no debe almacenarse como
`collection.code`.

### COL-004 — Nombre comercial

`collection.name` puede estar vacío o contener un nombre comercial en español o
inglés; cuando no se informa en una nueva colección, debe almacenarse como `''`
y no como `NULL`. No debe utilizarse como identificador técnico.

### COL-005 — Un año por colección

Cada colección representada por un código de cuatro caracteres debe asociarse
en `collection_years` exactamente al año 2000–2099 representado por dicho
código. No se permiten años distintos ni el uso de varios años para la misma
colección.

### COL-006 — Compatibilidad temporal de `collection_years`

El sistema debe mantener `collection_years` temporalmente para compatibilidad,
sin permitir que contradiga el año de `collections.code`.

### COL-007 — Unicidad del número de referencia

Durante la transición, el número de referencia debe ser único mediante
`UNIQUE(collection_id, year, reference_number)`. Tras verificar que cada
colección tiene un único año y completar la migración descrita en este contrato,
la restricción debe cambiarse a `UNIQUE(collection_id, reference_number)`. No se
debe permitir repetir un número en años distintos dentro de una misma colección.
Mientras exista `references.year`, toda inserción o actualización nueva debe
comprobar que ese valor coincide con el año derivado de `collections.code`; si no
coincide, la operación debe rechazarse.

### COL-008 — Catálogos previos a la importación

Las colecciones y los años requeridos deben existir antes de importar. La
importación no debe crearlos de forma explícita ni implícita.

### COL-009 — Derivación final del año

El año de referencia debe derivarse finalmente de `collections.code`.
Mientras exista `references.year`, las inserciones y actualizaciones nuevas deben
exigir que coincida con el año derivado de `collections.code` y rechazar toda
discrepancia nueva. La columna es una duplicación heredada y transitoria, no la
fuente definitiva del año.

### COL-010 — Transición protegida de `references.year`

La migración de `references.year` debe realizarse mediante auditoría, corrección
de inconsistencias históricas de forma trazable, migración de consumidores,
verificación de cero dependencias, cambio de la restricción de unicidad,
validación y un rollback preparado y probado antes de retirar la columna. Las
discrepancias nuevas se rechazan mientras la columna exista.

### COL-011 — Compatibilidad con colecciones existentes

Los consumidores deben interpretar los datos existentes conforme a la
separación vigente: códigos de cuatro caracteres en `collections.code` y
códigos de temporada de dos caracteres en `collections.season`.

## Escenarios

### Escenario 1 — Alta de una colección válida

**Dado** que la temporada es `SS` y los dos dígitos son `27`,  
**cuando** se registra la colección,  
**entonces** `collection.code` es `SS27`, representa 2027, y
`collection.season` es `SS`.

### Escenario 2 — Rechazo de código incompleto o fuera de rango

**Dado** un intento de registrar `SS` o un código cuyos dos dígitos no
representen un año entre 2000 y 2099,  
**cuando** se valida la colección,  
**entonces** el registro se rechaza.

### Escenario 3 — Nombre comercial opcional

**Dado** una colección con `collection.code = WS26`,  
**cuando** no se informa `collection.name` o se informa un nombre en español o
inglés,  
**entonces** una nueva colección almacena `''` si falta el nombre y sigue siendo
identificable técnicamente por `collection.code`; no se almacena `NULL` por
omisión.

### Escenario 4 — Consistencia de `collection_years`

**Dado** una colección `WS26`,  
**cuando** se registra su relación en `collection_years`,  
**entonces** solo se permite el año 2026 y se rechaza cualquier año distinto o
una segunda relación con otro año.

### Escenario 5 — Unicidad contextual y transición de referencias

**Dado** el mismo número de referencia,  
**cuando** se registra en colecciones distintas,  
**entonces** puede existir una referencia por colección; dentro de la misma
colección se rechaza el duplicado y no se admite repetirlo en un segundo año.
Durante la transición se aplica `UNIQUE(collection_id, year, reference_number)`
y, tras la migración, `UNIQUE(collection_id, reference_number)`.

### Escenario 6 — Importación parcialmente válida sin catálogos previos

**Dado** un lote con registros válidos y registros cuya colección o año no
existen,  
**cuando** se importa el lote,  
**entonces** se procesan los registros válidos, se rechaza cada registro
afectado con su error y no se crean datos maestros faltantes.

### Escenario 7 — Año durante la transición

**Dado** una referencia con `references.year` heredado,  
**cuando** se consulta el año canónico,  
**entonces** se obtiene desde `collections.code`; cualquier diferencia histórica
se audita, se corrige y se deja trazable durante la transición protegida.

### Escenario 8 — Rechazo de discrepancia nueva

**Dado** una colección cuyo año derivado de `collections.code` es 2026,  
**cuando** se inserta o actualiza una referencia nueva con
`references.year = 2027`,  
**entonces** la operación se rechaza y no crea ni modifica la referencia.

### Escenario 9 — Unicidad sin duplicados entre años

**Dado** una referencia con el mismo número en una colección,  
**cuando** se intenta registrar ese número con otro año dentro de la misma
colección,  
**entonces** se rechaza; la unicidad transitoria usa
`UNIQUE(collection_id, year, reference_number)` y, una vez garantizada la
consistencia del año, la restricción se cambia a
`UNIQUE(collection_id, reference_number)`.

## Criterios de aceptación

- La especificación está en español, se identifica como `COL`, versión `0.1` y
  estado `APROBADA`, sin preguntas abiertas.
- `collections.code` solo admite códigos de cuatro caracteres con una de las
  seis temporadas válidas; `00`–`99` representa 2000–2099 y todo valor fuera de
  ese rango se rechaza.
- `collections.season` contiene el código de temporada de dos caracteres y no
  se confunde con `collections.code`.
- `collection.name` está documentado como opcional, comercial y no técnico; la
  ausencia se almacena como `''`, nunca como `NULL` en nuevas colecciones.
- Una colección de cuatro caracteres tiene exactamente su año representado por
  el código en `collection_years`, mientras la tabla se conserva por
  compatibilidad.
- Durante la transición se aplica
  `UNIQUE(collection_id, year, reference_number)`; después se cambia y valida
  `UNIQUE(collection_id, reference_number)`, sin repetir números en años
  distintos dentro de una colección.
- Mientras exista `references.year`, toda inserción o actualización nueva exige
  que coincida con el año derivado de `collections.code`; una discrepancia nueva
  se rechaza.
- Se documenta que las colecciones y años deben existir antes de importar, que
  la importación no crea catálogos y que puede aceptar lotes parcialmente
  válidos con errores por registro.
- El año canónico se deriva de `collections.code` y la transición de
  `references.year` incluye rechazo de discrepancias nuevas, auditoría y
  corrección trazable de discrepancias históricas, migración de consumidores,
  verificación de cero dependencias, cambio de constraint, validación y
  rollback.
- Se documenta la compatibilidad con los datos existentes sin códigos de dos
  caracteres en `collections.code`.
- Los requisitos COL-001 a COL-011 tienen reglas o escenarios verificables y no
  incluyen preguntas abiertas.

## Transición de `references.year`

`references.year` se conservará únicamente como duplicación heredada/transitoria
mientras existan consumidores que dependan de él. Durante esta transición se
mantiene la regla de unicidad
`UNIQUE(collection_id, year, reference_number)` y no se permiten duplicados del
mismo número en años distintos dentro de una colección. Mientras exista la
columna, toda inserción o actualización nueva debe validar que coincide con el
año derivado de `collections.code`; una discrepancia nueva se rechaza.
La transición debe seguir estas etapas, en este orden:

1. **Auditoría:** comparar cada valor con el año derivado de `collections.code`,
   identificar ausencias y diferencias, inventariar consumidores y detectar
   duplicados que impedirían el cambio posterior de constraint.
2. **Corrección:** corregir los valores inconsistentes históricos y las filas
   inválidas de `collection_years`, registrar la evidencia y resolver duplicados
   mediante una decisión de datos trazable; no elegir silenciosamente el valor
   heredado. Las discrepancias nuevas no se corrigen silenciosamente: se
   rechazan en la inserción o actualización.
3. **Migración de consumidores:** modificar consultas, importaciones, reportes
   y demás consumidores para usar el año derivado de `collections.code`, y
   verificar que los nuevos escritores no introduzcan inconsistencias.
4. **Verificación de cero dependencias:** comprobar mediante inventario de
   código, consultas, jobs, reportes y pruebas que ningún consumidor autorizado
   dependa de `references.year` ni de la unicidad basada en el año heredado.
5. **Cambio de constraint:** solo después de las etapas anteriores y de
   garantizar la consistencia entre `references.year` y el año derivado de
   `collections.code`, cambiar la restricción a
   `UNIQUE(collection_id, reference_number)` y conservar el esquema de rollback
   hasta completar la validación. La restricción final impide duplicados por años
   distintos dentro de una misma colección.
6. **Validación:** ejecutar comprobaciones de integridad, unicidad, importación,
   consultas y regresión; confirmar que cada colección tiene un único año y que
   el año canónico siempre deriva de `collections.code`.
7. **Rollback:** si falla la validación, revertir el cambio de constraint y las
   migraciones de consumidores de forma controlada, restaurar la regla
   `UNIQUE(collection_id, year, reference_number)`, conservar la evidencia y
   corregir antes de reintentar. Retirar `references.year` únicamente después
   de una validación satisfactoria.

Durante toda la transición, una discrepancia debe ser visible y trazable. La
columna heredada no debe convertirse en una nueva fuente de verdad.

## Compatibilidad con legacy

- Los registros existentes de `collections.code` se interpretan como códigos
  oficiales de cuatro caracteres; no se requiere convertir códigos de dos
  caracteres en ese campo porque la revisión confirmó que no existen.
- Los valores de temporada de dos caracteres existentes permanecen en
  `collections.season`.
- `collection_years` permanece disponible temporalmente para consumidores legacy,
  pero sus filas deben corresponder al único año del código de la colección.
- Los consumidores legacy que lean `references.year` deben migrarse conforme a
  la sección de transición y no deben usarlo como fuente definitiva.
- Las importaciones legacy también están sujetas a la existencia previa de la
  colección y del año; no pueden crear catálogos faltantes y pueden procesar
  parcialmente un lote, informando errores por registro.

## Historial

| Versión | Estado | Cambio |
|---|---|---|
| 0.1 | Aprobada | Versión aprobada basada en SPEC-DRAFT 003, con temporadas `WS`, `SS`, `SV`, `RS`, `PF` y `FW`, códigos de cuatro caracteres, interpretación 2000–2099 de los dos dígitos, nombre opcional almacenado como `''`, un único año por colección, unicidad transitoria y final de referencias, importación parcial sin creación de catálogos y transición protegida de `references.year`. |
