# Glosario del dominio

> **Estado:** APROBADA  
> **Versión:** 0.1  
> **Idioma:** español  
> **Identificador:** GLO  
> **Fecha:** 2026-09-12

## Propósito y alcance

Esta especificación define el significado común de los términos utilizados en
la gestión de colecciones, referencias, muestras y producción. Es la fuente de
verdad para interpretar estos conceptos en el dominio.

## Definiciones

### GLO-001 — Referencia

Prenda de vestir individual en desarrollo dentro de una colección. Una
referencia puede constar de varias filas cuando utiliza múltiples materiales.

### GLO-002 — Referente

Prenda de una colección anterior tomada como base para la moldería y las tallas
de una nueva referencia.

### GLO-003 — Número de referencia

Número que identifica una referencia dentro de una colección y un año. Es único
solo dentro de esa combinación de colección + año.

### GLO-004 — Colección

Conjunto de referencias agrupadas para una temporada y un año. Tiene un código
oficial de cuatro caracteres, combinación de temporada + año, por ejemplo
`WS26`, `SS26`, `SV26`, `RS26`, `PF26` o `FW26`, y además un nombre descriptivo
que puede estar en español o en inglés, por ejemplo *Amazonas*, *Alma*,
*Candelaria*, *Awesome* o *Truth*. `collection.code` identifica la colección;
`collection.name` la describe. `collection.code` siempre tiene cuatro
caracteres y `collection.name` es el nombre descriptivo.

### GLO-005 — Temporada

Periodo comercial al que pertenece una colección. Forma parte de la
combinación que compone el código oficial de la colección.

### GLO-006 — Año

Periodo anual asociado a una colección y a sus referencias.

### GLO-007 — Línea

Categoría principal de la prenda, como vestidos, tops, faldas, pantalones o
chaquetas.

### GLO-008 — Sublínea

Subcategoría dentro de una línea.

### GLO-009 — Código MD

Código temporal de Muestra de Diseño asignado a la prenda mientras se encuentra
en etapa de diseño y confección de la primera muestra física. El código MD es
único.

### GLO-010 — Código PT

Código final y definitivo de Producto Terminado asignado a la referencia en SAP
una vez aprobada la muestra inicial por la diseñadora senior. El código PT es
único.

### GLO-011 — Muestra de Diseño

Primera muestra física de la prenda, confeccionada durante las etapas de diseño
y desarrollo, normalmente en la talla base 2 o XS.

### GLO-012 — Producto Terminado

Referencia cuya muestra inicial fue aprobada por la diseñadora senior y que
cuenta con el código final PT en SAP.

### GLO-013 — Contramuestra

Prenda de muestra confeccionada en la base textil final que no pertenece a las
unidades de producción comercial. Se utiliza para validar el escalado de tallas
y el encogimiento físico antes de iniciar la producción en masa.

### GLO-014 — Código OT

Código de la Orden de Traslado asociada a una contramuestra.

### GLO-015 — Laboratorio

Corte parcial de piezas de tela que se ensambla y prueba para analizar el
comportamiento de la tela, la elasticidad o la moldería antes de cortar la
prenda completa. Sirve para evitar desperdicio de material y reprocesos.

### GLO-016 — Semielaborado

Pieza que hace parte de la prenda y que tiene procesos especiales, como
bordados, para integrarse posteriormente a la confección de la prenda
principal.

### GLO-017 — Descolar

Proceso de nivelación en el maniquí o en la mesa de corte para eliminar las
diferencias físicas de longitud o “colas” que surgen cuando los tejidos se
estiran durante el corte o la costura.

### GLO-018 — Montaje en maniquí

Proceso de poner la prenda o alguna de sus piezas en un maniquí para realizar
pliegues, prenses, drapeados, ubicar insumos, ajustar moños, ejecutar puntadas
especiales, posicionar boleros o descolar.

### GLO-019 — Trazador

Experto del área de corte que simula la distribución de las piezas de moldería
sobre el ancho útil de la tela para reducir el desperdicio de material.

### GLO-020 — Audaces

Software especializado para crear y editar patrones o moldes, realizar
escalados, crear trazos, calcular consumos y elaborar fichas técnicas.

### GLO-021 — Nota de Fabricación (SAP)

Documento de reserva de materiales e insumos creado en el ERP SAP antes de
trasladar físicamente las materias primas a la planta de producción.

### GLO-022 — Marquilla

Etiqueta o sello distintivo para productos textiles, como ropa y accesorios.

### GLO-023 — Maquila

Sistema de producción basado en un contrato por el que una empresa contratante
paga a otra empresa maquiladora para transformar materia prima, ensamblar
productos o prestar un servicio.

### GLO-024 — Estado general

Clasificación global de una referencia. Puede tomar, entre otros, los valores
`EN_PROCESO`, `APROBADO`, `CANCELADO`, `CANCELADO_CORTADO`,
`CANCELADO_SIN_CORTAR` y `PAQUETE_COMPLETO`. Es independiente de las etapas y
los estados del workflow. Las variantes `CANCELADO_*` pertenecen
exclusivamente al estado general. El estado general no sustituye el historial
ni el último proceso conocido.

### GLO-025 — Estado temporal del workflow

Estado que representa la etapa temporal de una referencia dentro del flujo de
trabajo. `pausado` pertenece a este estado temporal y no al estado general.

### GLO-026 — Validación, WARNING y ERROR

Resultado de una comprobación aplicada a un registro. Un `WARNING` informa una
condición que requiere atención, pero permite continuar. Un `ERROR` impide
únicamente el registro afectado; no impide continuar con los demás registros.

## Criterios de aceptación

- El documento se identifica como `GLO`, versión `0.1`, estado `APROBADA`,
  idioma español y fecha `2026-09-12`.
- Están presentes y numeradas las definiciones `GLO-001` a `GLO-026`.
- La definición de colección distingue `collection.code` de
  `collection.name`, y el código se especifica con cuatro caracteres.
- Los códigos MD y PT se definen como únicos, y el número de referencia como
  único dentro de colección + año.
- Se distinguen `pausado` del estado general y se documenta el comportamiento
  de `WARNING` y `ERROR`.
- El estado general se define como la clasificación global de la referencia,
  independiente de las etapas y estados del workflow; incluye los ejemplos
  `EN_PROCESO`, `APROBADO`, `CANCELADO`, `CANCELADO_CORTADO`,
  `CANCELADO_SIN_CORTAR` y `PAQUETE_COMPLETO`, y no sustituye el historial ni
  el último proceso conocido.
- El contenido es una especificación aprobada en español y no una lista de
  preguntas.

## Historial

| Versión | Fecha | Cambio |
|---|---|---|
| 0.1 | 2026-09-12 | Versión aprobada con las aclaraciones sobre colección, códigos MD/PT, ámbito del número de referencia, estados del workflow y validaciones; se incorporan Muestra de Diseño y Producto Terminado. |
