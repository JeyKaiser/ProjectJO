# Contrato de importación CSV de referencias

> **Estado:** APROBADA  
> **Versión:** 0.1  
> **Idioma:** español  
> **Identificador:** CSV  
> **Referencia:** SPEC-DRAFT 004 aprobado

## Propósito y alcance

Esta especificación define el contrato para importar referencias desde un archivo
CSV. Establece el formato, la validación, los permisos, la vista previa, la
confirmación, la creación del lote y el tratamiento de incidencias.

En esta versión la importación se limita a referencias pertenecientes a una sola
colección y un solo año ya existentes. No crea colecciones, años, catálogos,
referencias auxiliares ni datos maestros faltantes. El CSV v0.1 no importa ni
determina el proceso general; los procesos se gestionarán posteriormente desde la
lógica de la aplicación. Tampoco incluye telas, estados por área, bordados ni
procesos externos repetibles.

## Metadatos y operación

- El tipo de operación es `IMPORTACION_CSV`.
- Cada ejecución confirmada genera un lote de importación con identificador,
  usuario, fecha, colección, año, nombre u origen del archivo, versión de esta
  plantilla y resultado.
- La versión de plantilla no es una columna del CSV. Se registra únicamente en
  el lote de importación.
- Una carga puede ser parcialmente válida: las filas válidas pueden procesarse y
  cada fila inválida conserva su incidencia específica, salvo que exista un
  `FILE_ERROR` o `LOT_ERROR`, que bloquea todo el lote.
- La vista previa valida y muestra el resultado previsto, pero no escribe datos,
  no crea referencias y no crea catálogos.
- La escritura solo ocurre después de una confirmación global del lote.

## Formato y reglas de datos

El CSV representa una fila por referencia. Los nombres de columna reconocidos son
los siguientes; las columnas no reconocidas deben reportarse como `ERROR`:

| Campo CSV | Regla |
|---|---|
| `Colección` | Obligatorio. Debe identificar la única colección existente del lote. |
| `Año` | Obligatorio. Debe coincidir con el único año de la colección y del lote. |
| `referencia` | Obligatorio. Debe ser un entero positivo y participa en la identidad colección + año + referencia. |
| `Nombre` | Opcional. En una referencia nueva, si se omite o llega vacío, se persiste como `''`, no como `NULL`. En una referencia existente, si se omite o llega vacío, no modifica el nombre existente. |
| `Línea` | Opcional. Si se informa, debe corresponder a un valor existente del catálogo. |
| `Sublínea` | Opcional. Si se informa, debe corresponder a un valor existente y tener una `Línea` informada y válida. |
| `Status General` | Opcional; puede venir vacío. Si se informa, debe ser un valor existente y válido del catálogo correspondiente. |
| `Código MD` | Opcional e independiente de `Código PT`. Si se informa, debe existir y estar disponible. |
| `Código PT` | Opcional e independiente de `Código MD`. Si se informa, debe existir y estar disponible. |
| `Tipo Ref` | Se conserva en la plantilla como dato informativo dentro del lote. El valor oficial `tipo_ref` se deriva de la `Línea`; una contradicción se registra como `WARNING` y no altera el tipo derivado. Sin `Línea`, una referencia nueva persiste `tipo_ref = ''`; una existente conserva su `tipo_ref`. |
| `Diseñador` | Opcional. Si no existe en el catálogo, la fila conserva una incidencia `WARNING`; no se crea el diseñador automáticamente. |

Los campos opcionales ausentes o vacíos se interpretan según la regla de cada
campo. En una actualización, una celda vacía significa no modificar el valor
existente; en una referencia nueva se persiste el vacío definido por cada campo.
`Código MD` y `Código PT` son independientes y ambos pueden estar vacíos;
no es necesario informar uno de ellos ni ambos, y uno no se deriva del otro. Los códigos informados no
se crean, reservan ni sustituyen automáticamente.

La normalización aprobada se ejecuta en este orden: decodificación UTF-8 con o
sin BOM, parseo CSV, `trim`, detección de ausencia y, después, normalización
específica por campo. La detección de vacío, `N/A` y el literal `NULL` es
insensible a mayúsculas/minúsculas después de aplicar `trim`. Los códigos se
normalizan a mayúsculas; no se aplican mayúsculas automáticamente a nombres de
catálogos. Los encabezados duplicados se rechazan. Los valores desconocidos no
se convierten silenciosamente.

`Línea`, `Sublínea`, estados generales, diseñadores y códigos son datos maestros:
la importación solo puede usar valores existentes. Una advertencia no contradice
una regla de integridad; un valor inexistente que sea obligatorio o necesario
para la relación se rechaza como `ERROR`, mientras que un diseñador inexistente
se trata específicamente como `WARNING`.

## Requisitos

### CSV-001 — Archivo CSV reconocible

El sistema debe aceptar un archivo CSV con encabezados reconocibles, una fila por
referencia y codificación declarada o compatible. Un archivo ilegible, vacío sin
filas de datos o con columnas desconocidas debe producir incidencias `ERROR` y no
puede confirmarse.

### CSV-002 — Una sola colección y un solo año

El lote debe contener exactamente una colección y un año. Todas las filas deben
referir la misma colección y el mismo año; cualquier mezcla produce `ERROR` en
las filas afectadas y el lote no puede confirmarse mientras no sea consistente.

### CSV-003 — Colección y año existentes

La colección y el año deben existir antes de la importación y el año debe ser el
canónico de la colección. La importación no debe crear, corregir ni duplicar la
colección o el año.

### CSV-004 — Permiso de importación

Solo un usuario con rol `Administrador` puede cargar, previsualizar o confirmar
una importación CSV. Cualquier otro usuario debe ser rechazado antes de escribir
y debe recibir una incidencia de autorización.

### CSV-005 — Nombre vacío compatible

El campo `Nombre` puede estar vacío. En una referencia nueva, cuando no se
informa, el valor debe persistirse como cadena vacía `''`, nunca como `NULL` por
efecto de la importación. En una referencia existente, `Nombre` vacío o ausente
no debe modificar el nombre existente. Esta regla es específica de `Nombre` y
no contradice la regla general de que una celda vacía en una actualización no
modifica el valor existente.

### CSV-006 — Línea y sublínea opcionales

`Línea` y `Sublínea` son opcionales. Una `Sublínea` solo puede aceptarse cuando
`Línea` está informada, existe y la relación entre ambas es válida. Un valor
inexistente, una relación inválida o una sublínea sin línea produce `ERROR`; la
ausencia de ambos es válida.

### CSV-007 — Status General opcional

`Status General` puede omitirse o venir vacío. Si contiene un valor, este debe
existir y ser válido en el catálogo correspondiente; no se debe inventar ni
convertir silenciosamente un estado desconocido.

### CSV-008 — Códigos MD y PT independientes

`Código MD` y `Código PT` son campos opcionales e independientes. La fila puede
tener solo MD, solo PT, ambos o ninguno. Un código
informado debe existir y estar disponible; la importación no crea códigos ni
deriva uno a partir del otro.

### CSV-009 — Disponibilidad de códigos

El sistema debe validar la existencia y disponibilidad de cada Código MD o PT
informado dentro del contexto de la operación. Un código inexistente, no
disponible o incompatible debe producir `ERROR` en la fila y no debe asignarse
parcialmente.

### CSV-010 — Tipo Ref informativo y tipo oficial derivado

`Tipo Ref` debe conservarse como dato informativo de la plantilla cuando esté
presente. Cuando `Línea` esté informada y sea válida, el sistema debe derivar el
`tipo_ref` oficial desde ella; el valor oficial no se toma del CSV. Si el `Tipo
Ref` informado contradice el tipo derivado, la fila se carga y conserva el
`tipo_ref` derivado, registrando una incidencia `WARNING`. Cuando `Línea` esté
vacía en una referencia nueva, el `tipo_ref` oficial debe quedar como cadena
vacía `''`, y el `Tipo Ref` del CSV permanece únicamente como dato informativo.
En una referencia existente, una `Línea` vacía no modifica ni la `Línea`
existente ni `tipo_ref`; una celda vacía nunca borra una línea. El borrado
explícito de una línea requiere un marcador distinto de la celda vacía.

### CSV-011 — Diseñador inexistente como warning

Si `Diseñador` no existe en el catálogo, el sistema debe conservar la incidencia
`WARNING`, no crear el diseñador y no convertir automáticamente la advertencia
en un nuevo dato maestro. La política de confirmación debe mostrarla
explícitamente al Administrador.

### CSV-012 — Incidencias y clasificación de errores

Cada incidencia debe indicar al menos severidad (`ERROR` o `WARNING`), fila,
campo cuando aplique, código de requisito y mensaje. `ERROR` impide procesar la
fila; `WARNING` permite procesarla conforme a la política de confirmación del
lote y nunca debe ocultarse. La clasificación operativa es `FILE_ERROR` para un
archivo ilegible o inválido, `LOT_ERROR` para una inconsistencia del lote, y
`ROW_ERROR` para un rechazo de fila. `FILE_ERROR` y `LOT_ERROR` bloquean todo el
lote; `ROW_ERROR` rechaza solo la fila afectada y las filas válidas continúan.

### CSV-013 — Carga parcial

El sistema debe permitir que las filas válidas de un lote parcialmente válido se
procesen y que las filas con `ERROR` queden rechazadas con sus incidencias. El
resultado debe distinguir filas válidas, rechazadas y advertidas, sin convertir
un error de una fila en datos silenciosos de otra.

### CSV-014 — Lote de importación

Toda ejecución debe quedar asociada a un lote que registre el archivo, usuario,
colección, año, versión de plantilla, estado, resumen de filas e incidencias.
Las filas y sus resultados deben poder rastrearse hasta ese lote.

### CSV-015 — Tipo de operación

El lote y sus registros deben identificarse con el tipo `IMPORTACION_CSV`. No se
debe registrar esta operación como una carga genérica ni perder su origen CSV.

### CSV-016 — Vista previa sin escritura

La vista previa debe ejecutar las validaciones, derivaciones e incidencias y
mostrar el resultado esperado, pero no debe insertar, actualizar, reservar ni
crear ningún dato. Una vista previa no constituye confirmación.

### CSV-017 — Confirmación global y revalidación transaccional

La escritura requiere una confirmación global explícita del Administrador sobre
el lote mostrado en la vista previa. Una referencia existente requiere esa
confirmación global aunque su fila no tenga cambios relevantes. No se permite
confirmar silenciosamente por fila ni omitir la confirmación por ausencia de
cambios. En la confirmación se revalida todo el lote dentro de una única
transacción, especialmente la disponibilidad actual de los códigos informados y
la existencia actual de las referencias. Un fallo propio de una fila, como un
código que dejó de estar disponible o una referencia que cambió, convierte esa
fila en `ROW_ERROR` y permite continuar con las demás filas válidas. Una misma
fila nunca se aplica parcialmente. Un `FILE_ERROR`, `LOT_ERROR` o fallo técnico
provoca rollback de todo el lote. Por tanto, “no se escribe parcialmente”
significa que no se escribe parcialmente una fila y que todo fallo bloqueante o
técnico revierte el lote completo; no impide la carga parcial de filas válidas
frente a `ROW_ERROR`.

### CSV-018 — Referencias existentes

El sistema debe identificar las referencias ya existentes mediante la clave
compuesta colección + año + referencia, comparar sus datos importables
y señalar cambios relevantes y no relevantes. Una
referencia existente solo puede actualizarse o conservarse como resultado del
lote después de la confirmación global; la ausencia de cambios no elimina esta
precondición.

### CSV-023 — Referencia e identidad de fila

La columna CSV obligatoria `referencia` debe contener un entero positivo. La
identidad de una fila es la combinación colección + año + referencia; esa clave
determina si la importación crea una referencia nueva o actualiza una existente.

### CSV-019 — No crear catálogos

La importación no debe crear ni completar automáticamente colecciones, años,
líneas, sublíneas, estados, códigos MD/PT, diseñadores u otros catálogos. Los
valores faltantes deben producir la incidencia definida por este contrato.

### CSV-020 — Exclusiones de la versión 0.1

Esta versión no debe importar telas, estados por área, bordados ni procesos
externos repetibles. Esos datos deben rechazarse como columnas o contenido fuera
de alcance, sin escritura implícita ni reinterpretación como campos de referencia.
El CSV tampoco contiene ni contendrá una columna para proceso general.

### CSV-021 — Versión de plantilla solo en el lote

La versión de plantilla debe registrarse únicamente en los metadatos del lote de
importación. Si el CSV contiene una columna de versión, debe rechazarse como
columna no reconocida y fuera de alcance. La versión del lote no se obtiene de
esa columna ni su ausencia como columna es un error.

### CSV-022 — Proceso general fuera del CSV v0.1

El CSV v0.1 no contiene ni contendrá una columna para proceso general, y no
importa ni determina ese proceso. El proceso general futuro deberá contemplar
desarrollo textil (antes concepto), desarrollo coleccion y comunicaciones (antes
diseño), first buy, market y final buy (antes costeo), industrialización,
producción, comercial y cancelado. Comunicaciones y market existen
conceptualmente aunque aún no tengan implementación. Los procesos se gestionarán
posteriormente desde la lógica de la aplicación.

## Escenarios de aceptación

### Escenario 1 — Lote básico válido

**Dado** un CSV con una colección existente, su único año canónico, una
`referencia` entera positiva que no existe todavía, y nombre vacío,
solo Código MD existente y disponible, y sin status general, línea ni sublínea,
**cuando** un Administrador solicita la vista previa, **entonces** la fila es
válida, el nombre de la referencia nueva se representa como `''`, no se escribe
ningún dato y el lote se marca como pendiente de confirmación.

### Escenario 2 — Una colección y año

**Dado** un archivo con dos colecciones o dos años, **cuando** se valida,
**entonces** las filas inconsistentes reciben `ERROR` y el lote no se confirma
hasta que contenga una sola colección y un solo año.

### Escenario 3 — Códigos independientes

**Dado** una fila con solo Código PT existente y disponible y otra con solo Código
MD existente y disponible, **cuando** se valida, **entonces** ambas son válidas;
una fila sin MD y sin PT también es válida, y ningún código se crea
automáticamente.

### Escenario 4 — Línea y tipo

**Dado** una referencia nueva con una línea existente que deriva `tipo_ref = DS`, **cuando** el CSV omite
la sublínea y conserva `Tipo Ref = DS`, **entonces** se guarda el dato informativo
y el tipo oficial es `DS`; si informa un tipo distinto, la fila se carga con
`tipo_ref = DS` y recibe `WARNING`. Si `Línea` está vacía, el tipo oficial queda
`''`, aunque venga `Tipo Ref`. Para una referencia existente, una `Línea` vacía
no modifica ni la línea ni `tipo_ref`; una celda vacía nunca borra una línea y
su borrado explícito requiere un marcador distinto de vacío.

### Escenario 5 — Diseñador inexistente

**Dado** un diseñador que no existe, **cuando** se genera la vista previa,
**entonces** aparece una incidencia `WARNING`, no se crea el diseñador y la fila
permanece distinguible como advertida.

### Escenario 6 — Parcialidad e incidencias

**Dado** un lote con filas válidas, una fila con Código MD no disponible y una
fila con diseñador inexistente, **cuando** el Administrador revisa la vista
previa, **entonces** la primera puede procesarse, la segunda se rechaza con
`ERROR` y la tercera conserva `WARNING`, todo dentro del mismo lote.

### Escenario 7 — Confirmación de existente sin cambios

**Dado** una fila que corresponde a una referencia existente y no cambia ningún
dato relevante, **cuando** el Administrador intenta escribir, **entonces** el
sistema exige la confirmación global del lote y no escribe antes de recibirla.

### Escenario 8 — Exclusiones y versión

**Dado** un CSV con una columna de versión, telas, bordados o procesos externos repetibles,
**cuando** se valida, **entonces** la columna de versión recibe `ERROR` por ser no
reconocida/fuera de alcance, los contenidos fuera de alcance reciben `ERROR` sin
crear datos y la versión de plantilla queda registrada únicamente en el lote.

### Escenario 9 — Proceso general fuera del CSV

**Dado** un CSV que intenta incluir una columna de proceso general, **cuando** se
valida, **entonces** la columna se rechaza como no reconocida y el proceso no se
importa ni se determina; telas, estados por área, bordados y procesos externos
repetibles permanecen fuera de alcance.

### Escenario 10 — Revalidación y clasificación de incidencias

**Dado** un lote con una fila válida, una fila con `ROW_ERROR` y una inconsistencia
`LOT_ERROR`, **cuando** se confirma, **entonces** el lote completo queda bloqueado;
sin el `LOT_ERROR`, la fila válida continúa y solo la fila con `ROW_ERROR` se
rechaza. La confirmación siempre revalida transaccionalmente códigos disponibles
y referencias existentes.

### Escenario 11 — Actualización y normalización

**Dado** una referencia existente con `Nombre` vacío o ausente y otras celdas
vacías, **cuando** se confirma, **entonces** el nombre existente y los demás
valores existentes no se modifican; para una referencia nueva se persiste el
vacío definido por el campo, incluido `Nombre = ''`. Para una referencia nueva
con `Línea` vacía, `tipo_ref = ''`; para una existente, la `Línea` vacía no
modifica ni la línea ni `tipo_ref`. `trim`, mayúsculas en códigos, UTF-8 con o
sin BOM, detección case-insensitive de vacío, `N/A` y `NULL`, y encabezados
duplicados se procesan conforme a la normalización aprobada, sin convertir
valores desconocidos silenciosamente.

### Escenario 12 — Revalidación fila a fila y rollback

**Dado** un lote confirmado cuya revalidación detecta que un código dejó de estar
disponible o que una referencia cambió, **cuando** se ejecuta la confirmación,
**entonces** esa fila recibe `ROW_ERROR`, no se aplica parcialmente y las demás
filas válidas continúan. Si se detecta `FILE_ERROR`, `LOT_ERROR` o un fallo
técnico, **entonces** la transacción única revierte todo el lote.

### Escenario 13 — Referencia ausente o inválida

**Dado** una fila cuya columna `referencia` está ausente, vacía, contiene cero,
un número negativo o un valor no entero, **cuando** se valida, **entonces** la
fila recibe `ROW_ERROR` con `ERROR` en `referencia`, no se crea ni actualiza
ninguna referencia y las demás filas válidas pueden continuar.

## Criterios de aceptación

- El documento está en español, identificado como `CSV`, versión `0.1`, estado
  `APROBADA` y sin preguntas abiertas.
- Conserva y define verificablemente `CSV-001` a `CSV-023`.
- Exige la columna obligatoria `referencia` como entero positivo e identifica
  cada fila por colección + año + referencia en campos, requisitos, escenarios
  y criterios.
- Exige una sola colección/año existente, permiso exclusivo de Administrador,
  carga parcial, lote `IMPORTACION_CSV`, vista previa sin escritura y
  confirmación global.
- Permite nombre vacío `''`, status general vacío, línea y sublínea opcionales
  con sus reglas, y códigos MD/PT independientes, incluso cuando ambos están
  vacíos, si los códigos informados existen y están disponibles.
- Para `Nombre`, persiste `''` únicamente en referencias nuevas cuando la celda
  está vacía o ausente; en referencias existentes, `Nombre` vacío o ausente no
  modifica el nombre existente, conforme a la regla general de que las celdas
  vacías en actualizaciones no modifican valores existentes.
- Conserva `Tipo Ref` como informativo, deriva el `tipo_ref` oficial desde la
  línea, registra contradicciones como `WARNING` y prevalece el tipo derivado;
  con línea vacía persiste el tipo oficial como `''`.
- Trata diseñadores inexistentes como `WARNING`, registra incidencias
  `ERROR`/`WARNING` y no crea catálogos.
- Clasifica `FILE_ERROR` y `LOT_ERROR` como bloqueantes del lote y `ROW_ERROR`
  como rechazo solo de la fila, permitiendo continuar a las filas válidas;
  revalida códigos disponibles y referencias existentes transaccionalmente en la
  confirmación.
- Identifica referencias existentes por colección + año + referencia,
  conserva celdas vacías en actualizaciones y persiste los vacíos definidos por
  campo en referencias nuevas; para `Nombre`, una referencia nueva con celda
  vacía o ausente obtiene `''`, mientras una existente conserva su nombre; para
  `Línea`, una referencia nueva con celda vacía obtiene `tipo_ref = ''`, mientras
  una existente conserva línea y `tipo_ref`; una celda vacía nunca borra. Aplica
  la normalización aprobada y rechaza encabezados duplicados.
- Rechaza como `ROW_ERROR` una `referencia` ausente, vacía, cero, negativa o no
  entera, sin crear ni actualizar esa fila.
- Revalida todo el lote en una única transacción; clasifica los fallos propios
  de fila como `ROW_ERROR` sin aplicar una fila parcialmente, permite continuar
  con las filas válidas y revierte todo el lote ante `FILE_ERROR`, `LOT_ERROR` o
  fallo técnico.
- Exige confirmación global para referencias existentes aun sin cambios
  relevantes y registra la versión de plantilla únicamente en el lote.
- Rechaza columnas de versión como no reconocidas/fuera de alcance, registra la
  versión únicamente en el lote, no permite importar ni determinar el proceso
  general desde el CSV y excluye telas, estados por área, bordados y procesos
  externos repetibles de esta versión.

## Historial

| Versión | Estado | Fecha | Cambio |
|---|---|---|---|
| 0.1 | APROBADA | 2026-09-23 | Aprobación de SPEC-DRAFT 004 como contrato CSV de referencias; se incorporan las decisiones confirmadas y se cierran todas las preguntas abiertas. |
| 0.1 | APROBADA | 2026-09-23 | Aclaraciones aprobadas sobre códigos MD/PT vacíos, derivación de `tipo_ref`, columna de versión, proceso general del workflow y exclusiones. |
| 0.1 | APROBADA | 2026-09-23 | Aclaraciones aprobadas sobre `referencia`, actualizaciones con `Línea` vacía, revalidación transaccional, atomicidad por fila, clasificación de fallos y orden de normalización. |
