# Constitución SDD

> **Estado:** APROBADA  
> **Versión:** 0.1  
> **Idioma:** español  
> **Fecha:** 2026-09-10

## Propósito

Esta Constitución define las reglas mínimas para redactar, aprobar, conservar y
usar especificaciones dentro del desarrollo guiado por especificaciones (SDD).
Su objetivo es mantener una fuente de verdad verificable y una trazabilidad
completa entre la necesidad documentada, su implementación y su validación.

No define requisitos de negocio concretos. Los requisitos de negocio se
establecen únicamente en especificaciones aprobadas.

## Jerarquía de verdad

La especificación aprobada es la fuente principal de verdad. Ante una
discrepancia, se debe consultar la especificación aprobada antes de interpretar
el código, la base de datos, la configuración o la documentación auxiliar.

La jerarquía de referencia es:

1. Especificación aprobada.
2. Decisiones y registros aprobados que la complementen.
3. Implementación y configuración que materialicen la especificación.
4. Documentación auxiliar, ejemplos y notas de trabajo.

Una implementación no modifica por sí sola la especificación ni crea un
requisito aprobado.

## Reglas de especificación

- Las especificaciones se redactan únicamente en español.
- Cada requisito futuro tendrá un identificador formal por dominio, por
  ejemplo: `REF-001`, `COL-001`, `COD-001` y `WF-001`.
- Cada requisito debe ser claro, verificable y suficientemente preciso para
  relacionarlo con su implementación y sus pruebas.
- Las ambigüedades deben resolverse en la especificación antes de implementar.
- Los documentos aprobados se almacenan en el repositorio y se versionan con
  Git.
- La aplicación prioriza la trazabilidad sobre la comodidad operativa.
- Una propuesta, un borrador o una conversación no equivale a una decisión
  aprobada.

## Lenguaje normativo

En esta Constitución, **debe** expresa una obligación, **no debe** expresa una
prohibición, **puede** expresa una posibilidad y **debería** expresa una
recomendación. Los requisitos aprobados deben emplear lenguaje que permita
distinguir obligaciones, prohibiciones y recomendaciones.

## Reglas de negocio/tecnología

Las reglas de negocio pertenecen a las especificaciones del dominio y no deben
deducirse de decisiones técnicas. La tecnología debe implementar las reglas
aprobadas sin sustituirlas ni alterar su significado.

Las decisiones tecnológicas deben documentar su relación con las
especificaciones que soportan. Cuando una limitación técnica impida cumplir
una especificación, el trabajo debe detenerse o registrarse como excepción
pendiente de aprobación; no debe resolverse mediante un cambio silencioso de
requisito.

## Integridad y trazabilidad

Cada requisito implementado debe poder rastrearse desde su identificador hasta
la parte correspondiente de la solución y sus validaciones. Los cambios deben
conservar el contexto suficiente para conocer qué se modificó, por qué se
modificó y qué evidencia confirma el resultado.

La trazabilidad debe mantenerse también cuando un requisito se divide, se
reemplaza o deja de aplicar. Las referencias obsoletas deben conservarse como
historial, sin presentarlas como vigentes.

## Estados/procesos

Los documentos y requisitos deben distinguir, como mínimo, entre propuesta,
borrador, en revisión, aprobada, implementada, verificada y obsoleta cuando
esos estados sean aplicables.

Un requisito no debe tratarse como vigente para implementación antes de su
aprobación. La implementación y la verificación son estados distintos:
implementar no equivale a validar.

## Catálogos/datos maestros

Los catálogos y datos maestros deben tener una definición documentada, un
identificador estable y una fuente de mantenimiento identificable. Sus cambios
deben conservar trazabilidad y no deben introducir valores contradictorios con
las especificaciones aprobadas.

Esta Constitución no crea catálogos ni datos maestros concretos.

## Seguridad/permisos

Los requisitos de seguridad y permisos deben estar expresados en una
especificación aprobada, con el alcance y las condiciones que correspondan.
La implementación debe aplicar el principio de menor privilegio y no debe
conceder acceso por conveniencia operativa cuando la especificación no lo
autorice.

Las decisiones de acceso deben ser trazables a la especificación, al rol o a
la regla aprobada que las justifica.

## Importaciones

Toda importación debe tener reglas documentadas para identificar el origen, el
formato, la correspondencia de campos, la validación, los errores y el
resultado. La importación no debe ocultar errores ni convertir datos de forma
silenciosa cuando eso afecte su significado.

Los resultados y las incidencias relevantes de una importación deben poder
relacionarse con la especificación aplicable y con la evidencia de validación.

## Cambios de BD

Todo cambio de base de datos debe estar respaldado por una especificación o
decisión aprobada y debe conservar un historial versionado. El cambio debe
considerar su impacto en datos existentes, integridad, permisos,
compatibilidad y reversibilidad cuando corresponda.

La base de datos no constituye por sí sola la fuente principal de verdad de un
requisito.

## Compatibilidad

Los cambios deben identificar la compatibilidad esperada con los consumidores,
datos, integraciones y versiones afectadas. Si se requiere una ruptura de
compatibilidad, debe estar explícitamente documentada y aprobada antes de su
implementación.

## Pruebas

Las pruebas deben verificar los requisitos aprobados y conservar una referencia
a sus identificadores. La evidencia debe permitir distinguir entre una prueba
ejecutada, una prueba aprobada y una validación pendiente.

La ausencia de una prueba no convierte una implementación en conforme. Las
pruebas deben cubrir, según corresponda, comportamiento correcto, errores,
permisos, integridad y compatibilidad definidos por la especificación.

## Cambios de especificación

Una modificación de una especificación debe conservar su historial, explicar el
motivo del cambio y señalar los requisitos, implementaciones y pruebas
afectados. El cambio debe pasar por el mismo proceso de revisión y aprobación
que la especificación original.

Cuando una modificación contradiga una especificación aprobada vigente, no debe
implementarse hasta que la nueva versión sea aprobada.

## Revisión/aprobación

La revisión debe comprobar claridad, consistencia interna, ausencia de
contradicciones, trazabilidad, verificabilidad e impacto sobre artefactos
relacionados. La aprobación debe quedar registrada junto con la versión
aprobada.

Solo una versión identificada como aprobada puede actuar como fuente principal
de verdad. Las observaciones no resueltas deben permanecer visibles como
pendientes y no deben interpretarse como aprobación implícita.

## Conservación del conocimiento

Las decisiones aprobadas, sus especificaciones, relaciones, revisiones y
evidencias deben conservarse en el repositorio. Los documentos aprobados se
versionan con Git para preservar su evolución y permitir su consulta histórica.

La eliminación o sustitución de un documento no debe destruir el conocimiento
necesario para entender decisiones anteriores. El contenido obsoleto debe
marcarse como tal y conservar sus referencias relevantes.

## Estructura documental propuesta

La documentación SDD puede organizarse con la siguiente estructura:

```text
openspec/
└── specs/
    ├── constitucion-sdd.md
    ├── <dominio>/
    │   ├── <requisito>.md
    │   └── decisiones.md
    └── README.md
```

Cada especificación de dominio debería incluir, cuando aplique:

1. Metadatos de estado, versión, idioma y fecha.
2. Propósito y alcance.
3. Requisitos con identificadores formales.
4. Reglas, estados, datos y permisos relacionados.
5. Criterios de aceptación y pruebas.
6. Referencias de trazabilidad y decisiones asociadas.
7. Historial de cambios.

Esta estructura es una propuesta de organización documental; no crea por sí
misma requisitos de negocio.
