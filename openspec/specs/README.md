# Índice de especificaciones

## Propósito

Este índice describe cómo consultar y mantener las especificaciones de este
directorio. La documentación organiza las decisiones y requisitos aprobados, y
mantiene su trazabilidad con la implementación y la verificación. Este índice no
crea requisitos de negocio ni sustituye las especificaciones.

## Jerarquía de verdad

La especificación aprobada aplicable es la fuente principal de verdad. En caso de
discrepancia, prevalece sobre la implementación, la configuración y la
documentación auxiliar. La referencia documental, de mayor a menor autoridad, es:

1. Especificaciones aprobadas.
2. Decisiones y registros aprobados que las complementen.
3. Implementación y configuración que materialicen lo aprobado.
4. Documentación auxiliar, ejemplos y notas de trabajo.

Una propuesta, borrador, conversación o implementación no constituye por sí sola
una decisión aprobada ni modifica una especificación vigente.

## Estados documentales

Los estados que pueden aplicarse a documentos y requisitos son: **PROPUESTA**,
**BORRADOR**, **EN REVISIÓN**, **APROBADA**, **IMPLEMENTADA**, **VERIFICADA** y
**OBSOLETA**. Se usan según corresponda: los estados de implementación y
verificación describen etapas distintas y no reemplazan la aprobación documental.
Solo una versión identificada como **APROBADA** es fuente de verdad para
implementar. Las observaciones sin resolver se mantienen como pendientes, sin
interpretarlas como aprobación.

## Flujo de trabajo

El flujo documental y de entrega es:

1. **Propuesta:** se plantea un cambio; aún no autoriza implementación.
2. **Revisión:** se comprueban claridad, consistencia, trazabilidad,
   verificabilidad e impacto sobre documentos relacionados.
3. **Aprobación:** se registra la decisión y la versión aprobada. Los requisitos
   no deben implementarse antes de esta etapa.
4. **Implementación:** se materializa la especificación aprobada y se conserva
   la relación con sus identificadores.
5. **Verificación:** se comprueba la implementación frente a los requisitos y se
   conserva evidencia del resultado.

Implementar no equivale a verificar. La existencia de código o configuración no
demuestra por sí sola que el requisito haya sido validado.

## Documentos existentes

| Documento | Identificador | Estado | Contenido |
|---|---|---|---|
| [`constitucion-sdd.md`](constitucion-sdd.md) | Sin identificador formal | APROBADA | Reglas de especificación, trazabilidad, aprobación y uso documental. |
| [`dominio/glosario.md`](dominio/glosario.md) | GLO | APROBADA | Definiciones comunes del dominio (`GLO-001` a `GLO-026`). |
| [`colecciones/contrato-colecciones.md`](colecciones/contrato-colecciones.md) | COL | APROBADA | Contrato de colecciones y requisitos `COL-001` a `COL-011`. |
| [`importaciones/contrato-csv-referencias.md`](importaciones/contrato-csv-referencias.md) | CSV | APROBADA | Contrato CSV de referencias y requisitos `CSV-001` a `CSV-023`. |

## Identificadores futuros pendientes

Los identificadores `REF`, `COD` y `WF` quedan reservados como identificadores
futuros pendientes de especificación. Su mención no crea requisitos ni implica
que exista una especificación aprobada para esos dominios. Los identificadores
formales se asignarán al documentar y aprobar los requisitos correspondientes.

## Reglas de cambio

- Todo cambio a una especificación debe conservar su historial, explicar el
  motivo y señalar los requisitos, implementaciones y pruebas afectados.
- Las modificaciones siguen el mismo proceso de revisión y aprobación que la
  especificación original; una contradicción con una especificación vigente no
  se implementa antes de aprobar la nueva versión.
- Los cambios deben mantener la trazabilidad entre necesidad, requisito,
  implementación y evidencia de verificación. Las referencias reemplazadas u
  obsoletas se conservan como historial y no se presentan como vigentes.
- Las decisiones o asuntos pendientes se hacen explícitos; no se completan por
  inferencia ni se consideran aprobados de forma implícita.
