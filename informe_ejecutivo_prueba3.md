# INFORME EJECUTIVO: prueba3.xlsx
## Formato de Control Consolidado de Colecciones JO

**Fecha:** 21 de mayo de 2026
**Versión:** 3.0 (Consolidación quirúrgica)
**Archivo:** `prueba3.xlsx`

---

## RESUMEN

`prueba3.xlsx` es la evolución consolidada que toma la estructura normalizada multi-hoja de `FORMATO_CONTROL_CONSOLIDADO_JO.xlsx` (6 hojas con relaciones entre sí), la enriquece con el catálogo completo de parámetros de `prueba.xlsx` (33 categorías maestras) y hereda los reportes dinámicos de `prueba2.xlsx`. El resultado es un formato quirúrgico y cohesivo de **7 hojas interconectadas, 144 columnas totales, con codificación de color por área responsable** y fórmulas automáticas para ahorro de tela y totales de producción.

---

## ARQUITECTURA DEL FORMATO

### Hoja 1: PARAMETROS (33 catálogos, visible)
**Función:** Fuente única de verdad para dropdowns y validaciones

| Grupo | Catálogos | Responsable de mantener |
|-------|-----------|------------------------|
| Recursos Humanos | Diseñadores Creativos, Diseñadores Técnicos, Trazadores, Modistas | Coordinación de Diseño |
| Segmentación | Líneas, Sublíneas, Tipos Ref, Tallajes, Colecciones, Drops | Coordinación de Diseño |
| Materiales | Usos en Prenda, Bases Textiles, Anchos | Taller + Compras |
| Catálogos Técnicos | Catalogación (Sólido/Mod Arte/Ubi Trazo), Veredictos, Tipo Bordado, Tipo Proceso Externo | Ingeniería |
| Calidad | Tipo Rechazo Calidad, Clasificación Hallazgo, Status Confección, Status Proceso Ext. | Producción + Calidad |
| Cuidados | Cuidados Lavado/Desmanche/Secado/Planchado, Woven/Knitted, Tipo Tejido | Producción |
| Características | Closure Types, Linnned, Largos, Tipo Empaque, Dificultad, Prioridades | Diseño + Producción |

> **Nota:** Esta hoja está **visible** (no oculta), a diferencia de `prueba2.xlsx`. Cualquier modificación a los catálogos se refleja inmediatamente en las validaciones de las demás hojas.

---

### Hoja 2: MATRIZ_MAESTRA (50 columnas, 1 fila por referencia)
**Función:** Corazón del formato. Registra el ciclo de vida completo de cada prenda.

#### Sección 1: PERFILAMIENTO (Columnas 1-6) → **CREATIVA**
| Col | Campo | Descripción |
|-----|-------|-------------|
| A | ID_Ref | Número secuencial único de la referencia |
| B | Cod_MD | Código de Muestra Diseño (asignado en fase 1.3) |
| C | Cod_PT | Código de Producto Terminado (asignado al aprobar) |
| D | Nombre_Referencia | Nombre descriptivo de la prenda |
| E | Color | Color comercial |
| F | Cod_Color | Código interno del color |

#### Sección 2: SEGMENTACIÓN (Columnas 7-14) → **CREATIVA**
| Col | Campo | Descripción |
|-----|-------|-------------|
| G | Coleccion | FK a catálogo COLECCIONES |
| H | Capsula/Drop | Drop A-J |
| I | Linea | FK a catálogo LINEAS |
| J | Sublínea | FK a catálogo SUBLINEAS |
| K | Tipo_Ref | Código interno (DS, OW, PS, SK, SW, TP) |
| L | Sistema_Tallaje | Letras o Números |
| M | Largo | FK a catálogo LARGOS |
| N | Closure | FK a catálogo CLOSURE TYPES |

#### Sección 3: REFERENTES Y DISEÑO (Columnas 15-23) → **CREATIVA**
| Col | Campo | Descripción |
|-----|-------|-------------|
| O | Basado_En (Ref PT) | Código PT de la prenda referente |
| P | Diseñador_Creativo | FK a catálogo DISEÑADORES CREATIVOS |
| Q | Fecha_Asignacion_Creativo | Cuándo se asigna al diseñador |
| R | Consumo_Base_Historico | Consumo de colecciones pasadas (referencia) |
| S | Cambio_Molderia (SI/NO) | ¿Hubo cambio respecto al referente? |
| T | Consumo_Creativo_1 | Primer cálculo de consumo |
| U | Consumo_Creativo_2 | Segundo cálculo (si ajusta) |
| V | Consumo_Creativo_3 | Tercer cálculo (si ajusta) |
| W | Obs_Creativo | Observaciones del diseñador creativo |

#### Sección 4: MOLDERÍA BASE (Columnas 24-26) → **CREATIVA**
| Col | Campo | Descripción |
|-----|-------|-------------|
| X | Fecha_Inicio_Molderia_Diseño | Inicio de creación del patrón base |
| Y | Fecha_Fin_Molderia_Diseño | Finalización del patrón base |
| Z | Comentarios_Molderia_Diseño | Hallazgos del patronista |

#### Sección 5: LABORATORIO (Columnas 27-30) → **TALLER**
| Col | Campo | Descripción |
|-----|-------|-------------|
| AA | Modista_Muestra | FK a catálogo MODISTAS |
| AB | Status_Taller | Etapa actual en taller (En Corte, En Confección, En Lavado, etc.) |
| AC | Fotos_Internas (SI/NO) | ¿Ya se tomaron fotos internas? |
| AD | Requiere_Muestra (SI/NO) | ¿Es una referencia nueva que requiere muestra física? |

#### Sección 6: VALIDACIÓN TÉCNICA (Columnas 31-38) → **INGENIERÍA**
| Col | Campo | Descripción |
|-----|-------|-------------|
| AE | Medicion_Fase_1 (Fecha) | Primera medición con modelo |
| AF | Comentarios_Medicion_1 | Observaciones de la medición |
| AG | Veredicto_Dir_Creativa | FK a catálogo (Aprobada Directa, con Comentarios, Rechazada) |
| AH | Diseñador_Tecnico | FK a catálogo DISEÑADORES TÉCNICOS |
| AI | Diseñador_Contramuestra | Responsable de revisar contramuestra (DT o DU, nunca ambos) |
| AJ | Fecha_Inicio_Molderia_Ing | Inicio de escalado industrial |
| AK | Fecha_Fin_Molderia_Ing | Fin de escalado industrial |
| AL | Comentarios_Molderia_Ing | Hallazgos del diseñador técnico |

#### Sección 7: INDUSTRIALIZACIÓN (Columnas 39-41) → **PRODUCCIÓN**
| Col | Campo | Descripción |
|-----|-------|-------------|
| AM | Especificadora | FK a catálogo ESPECIFICADORAS |
| AN | Fecha_Inicio_Especificacion | Inicio de ficha técnica de producción |
| AO | Fecha_Fin_Especificacion | Entrega de ficha técnica completa |

#### Sección 8: STATUS Y ENTREGABLES (Columnas 42-50) → **TRANSVERSAL**
| Col | Campo | Descripción |
|-----|-------|-------------|
| AP | Status_Referencia | APROBADO, EN PROCESO, CANCELADO, etc. |
| AQ | Entregable_Creativo_OK? | OK / EN PROCESO / Pendiente |
| AR | Entregable_Tecnico_OK? | OK / EN PROCESO / Pendiente |
| AS | Entregable_Trazador_OK? | OK / EN PROCESO / Pendiente |
| AT | Envio_Mod_Arte_OK? | OK / N/A (solo aplica si Mod Arte = SI) |
| AU | Fecha_Liberacion_Diseno_a_Ing | Fecha de handoff entre fases |
| AV | Fecha_Liberacion_Ing_a_Prod | Fecha de handoff entre fases |
| AW | Temperatura (Fase Actual) | Color semáforo: AZUL/AMBAR/NARANJA/ROJO |
| AX | Observaciones_Generales | Notas transversales de cualquier área |

---

### Hoja 3: CONSUMO_MATERIALES (15 columnas, multi-fila por referencia)
**Función:** Registro normalizado de cada material usado por referencia
**Área responsable:** **TALLER** (alistamiento) + **INGENIERÍA** (consumos calculados)

| Col | Campo | Quién lo llena |
|-----|-------|----------------|
| A | ID_Ref | Vinculación a MATRIZ_MAESTRA |
| B | Tipo_Material | TALLER: FK a USOS EN PRENDA (Tela Lucir, Forro, Fusionable, Sesgo, etc.) |
| C | Cod_Material_SAP | TALLER: Código SAP del material |
| D | Descripcion_Material | TALLER: Nombre descriptivo |
| E | Ancho_Util_Tela (m) | TALLER: Ancho real de la tela |
| F | Base_Textil | TALLER: FK a BASES TEXTILES |
| G | Ubicacion_Trazo (SI/NO) | INGENIERÍA: Catalogación de trazo |
| H | Modificacion_Arte (SI/NO) | INGENIERÍA: Catalogación de arte |
| I | All_Over (SI/NO) | INGENIERÍA: Catalogación especial |
| J | Consumo_Base (m) | CREATIVA: Consumo histórico de referencia |
| K | Consumo_Creativo (m) | CREATIVA: Cálculo del diseñador creativo |
| L | Consumo_Tecnico (m) | INGENIERÍA: Cálculo del diseñador técnico |
| M | Consumo_Trazador (m) | INGENIERÍA: Cálculo final del trazador |
| N | Ahorro_Optimizado (m) | **Automático:** =Consumo_Creativo - Consumo_Trazador |
| O | %_Ahorro | **Automático:** =Ahorro / Consumo_Creativo * 100 |

> **Ventaja clave:** Una referencia puede usar múltiples materiales (ej. Tela Lucir + Tela Forro + Sesgo). Cada material ocupa su propia fila, permitiendo trazabilidad independiente del ahorro por tipo de material.

---

### Hoja 4: COMPOSICION_MARQUILLAS (14 columnas)
**Función:** Contenido de marquillas legales para muestra y producción
**Área responsable:** **PRODUCCIÓN**

| Col | Campo | Quién lo llena |
|-----|-------|----------------|
| A | ID_Ref | Vinculación |
| B | Tipo_Marquilla | PRODUCCIÓN: MUESTRA o PRODUCCION |
| C | Info_SAP (SI/NO) | PRODUCCIÓN: ¿Ya se subió a SAP? |
| D | Desc_USA_UK | PRODUCCIÓN: Descripción comercial en inglés |
| E | Fiber_Composition | PRODUCCIÓN: Composición porcentual de fibras |
| F | Inside_Composition | PRODUCCIÓN: Composición del forro |
| G | Include | PRODUCCIÓN: Elementos adicionales (borlas, cinturones) |
| H | Woven_Knitted | PRODUCCIÓN: WOVEN (plano) o KNITTED (punto) |
| I | Cuidado_Lavado | PRODUCCIÓN: Instrucciones de lavado |
| J | Cuidado_Desmanche | PRODUCCIÓN: Instrucciones de blanqueo |
| K | Cuidado_Secado | PRODUCCIÓN: Instrucciones de secado |
| L | Cuidado_Planchado | PRODUCCIÓN: Instrucciones de planchado |
| M | Cuidados_Includes | PRODUCCIÓN: Instrucciones adicionales |
| N | Observaciones | PRODUCCIÓN: Notas sobre composiciones |

> **Nota:** Cada referencia puede tener 2 filas: una para la muestra de colección y otra para las contramuestras de producción.

---

### Hoja 5: CONTROL_CONTRAMUESTRAS (18 columnas)
**Función:** Gestión de la explosión de contramuestras y logística SAP
**Área responsable:** **PRODUCCIÓN** + **INGENIERÍA**

| Col | Campo | Quién lo llena |
|-----|-------|----------------|
| A | ID_Ref | Vinculación |
| B | Cod_OT | PRODUCCIÓN: Código OT asignado en SAP |
| C | Nombre_Contramuestra | PRODUCCIÓN: "OT" + nombre de referencia |
| D | Talla_Contramuestra | INGENIERÍA: Talla en que se confecciona |
| E | Color_Contramuestra | TALLER: Color físico de la contramuestra |
| F | Diseñador_Encargado | INGENIERÍA: FK a DISEÑADORES TÉCNICOS |
| G | Modista_CM | TALLER: FK a MODISTAS |
| H | Status_Confeccion | TALLER: Estado actual |
| I | Tipo_Rechazo_Planta | PRODUCCIÓN: Si aplica, FK a TIPO RECHAZO CALIDAD |
| J | Prioridad | PRODUCCIÓN: 1-10 |
| K | Drop | PRODUCCIÓN: A-J |
| L | Fecha_Meta_Entrega | PRODUCCIÓN: Fecha compromiso |
| M | Reprogramacion (SI/NO) | PRODUCCIÓN: ¿Se reprogramó la entrega? |
| N | Unidades_Cortadas | TALLER: Cantidad de unidades |
| O | Nota_Fabricacion_SAP | PRODUCCIÓN: Código de nota en SAP |
| P | Gestion_Nota (Fecha) | PRODUCCIÓN: Fecha de creación de nota |
| Q | Fecha_Traslado_SAP | PRODUCCIÓN: Fecha de traslado en sistema |
| R | Fecha_Despacho_ZF | PRODUCCIÓN: Fecha de envío físico a producción |

---

### Hoja 6: CURVA_TALLAS (14 columnas)
**Función:** Distribución de unidades de producción por talla
**Área responsable:** **PRODUCCIÓN** (datos comerciales)

| Col | Campo |
|-----|-------|
| A | ID_Ref |
| B-H | T_0 a T_12 (tallas numéricas) |
| I-M | T_XS a T_XL (tallas alfabéticas) |
| N | TOTAL (=SUMA automática) |

> **Lógica:** Las referencias con tallaje numérico llenan las columnas B-H (y 0 en I-M). Las de tallaje alfabético llenan I-M (y 0 en B-H). El TOTAL se calcula automáticamente.

---

### Hoja 7: REPORTES_DINAMICOS
**Función:** Dashboard ejecutivo de una sola pantalla
**Secciones:**

| # | Sección | Indicadores |
|---|---------|-------------|
| 1 | Estado General | Total refs, distribución por fase, score de salud, tasa de aprobación |
| 2 | Carga de Trabajo | Refs activas por área, % carga, responsables clave, cuellos de botella |
| 3 | Ahorro de Consumos | Comparativo Creativo vs Trazador, % ahorro, ahorro total proyectado |
| 4 | Embudo de Progreso | Visualización funnel mostrando cuántas referencias hay en cada fase |
| 5 | Leyenda de Colores | Guía visual: AZUL=Creativa, AMBAR=Taller, NARANJA=Ingeniería, ROJO=Producción |

---

## MAPA DE RESPONSABILIDAD POR ÁREA

| Área | Hojas que alimenta | Columnas en MATRIZ_MAESTRA | Tipo de datos |
|------|-------------------|---------------------------|---------------|
| **CREATIVA** (Diseño) | MATRIZ_MAESTRA (cols 1-26), CONSUMO_MATERIALES (consumo creativo) | ID_Ref, Cod_MD, Perfilamiento, Segmentación, Referentes, Consumos Creativos, Moldería Base | Texto, Fechas, Numérico (m) |
| **TALLER** (Laboratorio) | MATRIZ_MAESTRA (cols 27-30), CONSUMO_MATERIALES (alistamiento), CONTROL_CONTRAMUESTRAS (modista, unidades) | Modista, Status_Taller, Fotos, Materiales, Corte | Texto, Fechas, Catálogos |
| **INGENIERÍA** (Validación) | MATRIZ_MAESTRA (cols 31-38), CONSUMO_MATERIALES (consumos técnico y trazador), CONTROL_CONTRAMUESTRAS (talla, diseñador) | Mediciones, Ajustes, Escalado, Consumos Técnicos, Trazos, Catalogación | Fechas, Numérico (m), Catálogos |
| **PRODUCCIÓN** (Industrialización) | MATRIZ_MAESTRA (cols 39-41), COMPOSICION_MARQUILLAS, CONTROL_CONTRAMUESTRAS (SAP, logística), CURVA_TALLAS | Especificación, Marquillas, Contramuestras, SAP, Unidades, Calidad | Fechas, Texto, Numérico (unids) |
| **TRANSVERSAL** (Todas) | MATRIZ_MAESTRA (cols 42-50), REPORTES_DINAMICOS (consulta) | Status, Entregables, Fechas de Liberación | Catálogos, Fechas |

---

## FLUJO DE DATOS ENTRE HOJAS

```
CREAR REFERENCIA (CREATIVA)
  ↓
  MATRIZ_MAESTRA: ID_Ref=1, Cod_MD=MD-02801, Perfilamiento completo
  ↓
ALISTAR MATERIALES (TALLER)
  ↓
  CONSUMO_MATERIALES: ID_Ref=1, Tipo=Tela Lucir, Cod_SAP=TEL-88902
  CONSUMO_MATERIALES: ID_Ref=1, Tipo=Tela Forro, Cod_SAP=TEL-33410
  ↓
CALCULAR CONSUMOS (CREATIVA → INGENIERIA)
  ↓
  CONSUMO_MATERIALES: Consumo_Creativo=2.05, Consumo_Tecnico=1.99, Consumo_Trazador=1.85
  CONSUMO_MATERIALES: Ahorro_Optimizado=0.20 (Automático), %_Ahorro=9.8% (Automático)
  ↓
REGISTRAR MARQUILLAS (PRODUCCION)
  ↓
  COMPOSICION_MARQUILLAS: Muestra + Produccion
  ↓
EXPLOTAR CONTRAMUESTRA (PRODUCCION)
  ↓
  CONTROL_CONTRAMUESTRAS: Cod_OT=OT-00870, Nota_Fabricacion=NOT-778901
  ↓
CARGAR UNIDADES (PRODUCCION)
  ↓
  CURVA_TALLAS: XS=150, S=300, M=450, L=250, XL=100, TOTAL=1250
  ↓
MONITOREAR (COORDINACION)
  ↓
  REPORTES_DINAMICOS: 1 ref en Industrializacion, 25% tasa de aprobacion
```

---

## REGLAS DE NEGOCIO IMPLEMENTADAS

| ID | Regla | Severidad | Dónde se verifica |
|----|-------|-----------|-------------------|
| R01 | Cod_PT no puede existir sin Cod_MD | CRÍTICA | MATRIZ_MAESTRA |
| R02 | APROBADO requiere Cod_PT no vacío | CRÍTICA | MATRIZ_MAESTRA |
| R03 | TOTAL tallas = SUMA de todas las tallas | CRÍTICA | CURVA_TALLAS (fórmula) |
| R04 | Entregable Creativo OK → consumos > 0 | ALTA | MATRIZ_MAESTRA + CONSUMO_MATERIALES |
| R05 | Entregable Técnico OK → consumos > 0 | ALTA | MATRIZ_MAESTRA + CONSUMO_MATERIALES |
| R06 | Entregable Trazador OK → consumos > 0 | ALTA | MATRIZ_MAESTRA + CONSUMO_MATERIALES |
| R07 | Contramuestra: DT o DU, nunca ambos | ALTA | MATRIZ_MAESTRA |
| R08 | Consumos no pueden ser 0 en refs activas | ALTA | CONSUMO_MATERIALES |
| R09 | Fecha Fin Moldería no anterior a Fecha Inicio | ALTA | MATRIZ_MAESTRA |
| R10 | Status APROBADO → todos los entregables en OK | CRÍTICA | MATRIZ_MAESTRA |

---

## MEJORAS RESPECTO A FORMATOS ANTERIORES

| Característica | PROTOTIPO V.01 | FORMATO JO | prueba2.xlsx | **prueba3.xlsx** |
|---------------|----------------|------------|-------------|-------------------|
| Estructura | Monolítica (~210 cols) | Normalizada (6 hojas) | Normalizada (7 hojas) | **Normalizada (7 hojas) + PARAMETROS visible** |
| PARAMETROS | Básico (hoja oculta) | 10 categorías | Oculto con 5 cats | **33 categorías visibles** |
| Consumos | Columnas repetidas | Multi-fila normalizado | No incluido | **Multi-fila con fórmulas de ahorro** |
| Marquillas | 2 bloques repetidos | 1 hoja dedicada | No incluido | **Muestra + Producción en misma hoja** |
| Contramuestras | 15 columnas sueltas | 9 columnas | No incluido | **18 columnas con ciclo SAP completo** |
| Curva de Tallas | 13 columnas | 14 columnas con SUM | No incluido | **14 columnas con SUM automática** |
| Reportes | Manual | No | Dashboard estático | **Dashboard ejecutivo 5 secciones** |
| Codificación color | No | No | No | **5 colores por área (semaforo)** |
| Fórmulas automáticas | SUM básico | Ahorro en CONSUMO | COUNTIF básico | **Ahorro, % Ahorro, SUM tallas, condicionales** |
| Trazabilidad | Implícita | ID_Ref como FK | Explícita (novedades) | **ID_Ref como FK en 6 hojas** |

---

## DATOS DE EJEMPLO INCLUIDOS

El archivo incluye **4 referencias** en diferentes fases para demostrar el flujo completo:

| Ref | Nombre | Fase Actual | Temperatura | Materiales |
|-----|--------|-------------|-------------|------------|
| 1 | Femininity Dramatic Dress | INDUSTRIALIZACION | ROJO | 2 (Lucir + Forro) |
| 2 | Sunset Vacation Panty | VALIDACION TECNICA | NARANJA | 1 (Lucir) |
| 3 | Femininity Dramatic Dress V2 | LABORATORIO | AMBAR | 2 (Lucir + Fusionable) |
| 4 | Ocean Breeze Kimono | IDEACION Y DISENO | AZUL | 1 (Lucir) |

---

## RECOMENDACIONES DE USO

1. **Al crear una referencia nueva:** Completar primero MATRIZ_MAESTRA (secciones 1-4), luego CONSUMO_MATERIALES.
2. **Los dropdowns** se deben configurar como Data Validation vinculados a la hoja PARAMETROS (no implementados en esta versión demo para mantener compatibilidad).
3. **Las fórmulas de ahorro** en CONSUMO_MATERIALES se calculan automáticamente; no se deben sobrescribir.
4. **CURVA_TALLAS** solo requiere llenar las tallas activas (numéricas O alfabéticas); las inactivas van en 0.
5. **REPORTES_DINAMICOS** es una hoja de solo lectura; sirve como dashboard para coordinadores.

---

**Archivo generado:** `prueba3.xlsx`
**Script generador:** `crear_prueba3.py` (reproducible y documentado)
**Total columnas:** 144 (suma de las 7 hojas)
**Total hojas:** 7
