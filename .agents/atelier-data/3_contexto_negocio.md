# Pilar 3: Contexto de Negocio (Business Rules & Apparel Glossary)

Este documento contiene las reglas de negocio, la estructura de la base de datos de colecciones (Matriz JO), el glosario especializado y las reglas formales de validación para que **AtelierData** interprete correctamente el significado de cada columna y fila dentro de los archivos del proyecto.

---

## 👔 1. El Glosario Especializado de Alta Costura

El agente debe comprender perfectamente los siguientes términos al analizar los datos y generar reportes:

- **Referencia (Ref)**: El identificador numérico de una prenda de vestir en desarrollo dentro de una colección. Una referencia puede constar de varias filas en la base de datos si utiliza múltiples materiales.
- **Referente**: Una prenda de una colección anterior tomada como base para la moldería y tallas de una nueva referencia.
- **Muestra Diseño (Código MD)**: Código temporal asignado a la prenda mientras se encuentra en etapa de diseño y confección de la primera muestra física (talla base 2 o XS).
- **Producto Terminado (Código PT)**: Código final y definitivo asignado a la referencia en SAP una vez que la muestra inicial ha sido aprobada por la diseñadora senior.
- **Laboratorio**: Un corte parcial de piezas de tela realizado para ensamblar y probar el comportamiento de la tela, elasticidad o moldería antes de cortar la prenda completa. Sirve para evitar desperdicio de material y reprocesos.
- **Contramuestra (Código OT)**: Orden de Traslado. Una prenda de muestra confeccionada en la base textil final pero que no pertenece a las unidades de producción comercial, usada para validar el escalado de tallas y el encogimiento físico antes de iniciar producción en masa.
- **Descolar**: Proceso de nivelación en el maniquí o mesa de corte para eliminar diferencias físicas de longitud o "colas" que surgen cuando los tejidos (especialmente planos o al bies) se estiran durante el corte o costura.
- **Trazadores**: Expertos en el área de corte que simulan la distribución de las piezas de moldería sobre el ancho útil de la tela (trazo) para reducir al mínimo absoluto el desperdicio de material.
- **Audaces**: Software especializado en diseño de patrones, escalado y cálculo digital de trazos y consumos óptimos.
- **Nota de Fabricación (SAP)**: Documento de reserva de materiales e insumos creado en el ERP SAP antes de trasladar físicamente las materias primas a la planta de producción.
- **Semielaborado**: Pieza que hace parte de la prenda y que tiene procesos especiales como bordados que se integran posteriormente a la confección de la prenda principal.
- **Marquilla**: Etiqueta o sello distintivo para productos textiles (ropa, accesorios).
- **Maquila**: Sistema de producción basado en un contrato donde una empresa (contratante) paga a otra (maquiladora) para que transforme materia prima o ensamble productos o preste un servicio.
- **Montaje en Maniquí**: Proceso que consiste en poner la prenda o alguna de las piezas de la prenda en un maniquí y empezar a hacer pliegues, prenses, drapeados, ubicaciones de insumos, ajuste de moños, puntadas especiales, posicionar boleros o descolar.

---

## 📊 2. Arquitectura de la Matriz de Colección (Google Sheets/Excel)

La base de datos se almacena en el archivo `PROTOTIPO V.01.xlsx` y consta de dos pestañas principales:

1. **MATRIZ**: El registro maestro secuencial del ciclo de vida de cada prenda. Contiene columnas agrupadas desde la columna **A** hasta la columna **HD**.
2. **PARAMETROS**: Guarda los menús desplegables estandarizados que alimentan la hoja de MATRIZ (Diseñadores, Modistas, Bases Textiles, Líneas, etc.).

> **Nota estructural crítica**: La fila 8 contiene celdas combinadas que agrupan columnas de la fila 9. Los encabezados reales están en la fila 9. Al leer el archivo con pandas, se debe usar `header=1` (0-indexed) o procesar la fila 9 como nombres de columna. Las filas 1-7 pueden contener metadatos o estar vacías.

### Mapeo Completo de Columnas con Tipos de Dato

| Columna | Nombre | Tipo | Valores Válidos / Formato |
|---------|--------|------|---------------------------|
| **A** | Ref | `int` | Número secuencial único por colección |
| **B** | Imagen | `str` | URL o ruta de imagen |
| **C** | Código MD | `str` | Código temporal de muestra diseño |
| **D** | Código PT | `str` | Código SAP final; vacío si no aprobado |
| **E** | Nombre referencia | `str` | Texto descriptivo de la prenda |
| **F** | Color | `str` | Nombre del color |
| **G** | Cod color | `str` | Código interno de color |
| **H** | Foto basado en | `str` | URL/ruta foto del referente |
| **I** | PT (Referente) | `str` | Código PT del referente |
| **J** | Basado en | `str` | Nombre de la referencia tomada como base |
| **K** | Status | `str` | `EN PROCESO`, `APROBADO`, `CANCELADO`, `PAQUETE COMPLETO` |
| **L** | Diseñador | `str` | Nombre del diseñador creativo responsable |
| **M** | Status taller | `str` | Etapa actual en el flujo de taller |
| **N** | Modista | `str` | Nombre de la modista asignada |
| **O** | Fotos internas | `str` | `SI` / `NO` |
| **P** | Línea | `str` | Vestidos, Tops, Faldas, Pantalones, Chaquetas, etc. |
| **Q** | Sublínea | `str` | Subcategoría dentro de la línea |
| **R** | Tipo ref | `str` | Clasificación interna de referencia |
| **S** | Tallaje | `str` | `0-12` (numérico), `XS-XL` (alfabético), o `0-12 / XS-XL` (mixto) |
| **T** | Largo | `str` | Mini, Midi, Maxi, etc. |
| **U** | Closure | `str` | Tipo de cierre de la prenda |
| **V** | Largo (2) | `str` | *(Funcionalidad por definir)* |
| **W** | Includes | `str` | `SI` / `NO` |
| **X** | Includes paquete completo | `str` | *(Funcionalidad por definir)* |
| **Y** | Código tela lucir principal | `str` | Código de tela en muestra |
| **Z** | Foto tela | `str` | URL/ruta de foto de tela |
| **AA** | Descripción tela | `str` | Nombre/descripción de la tela de muestra |
| **AB** | Ancho tela | `float` | Ancho útil en metros (ej: 1.50) |
| **AC** | Base Textil | `str` | Lino, Algodón, Seda, Poliéster, etc. |
| **AD** | Ubicación en trazo | `str` | `SI` / `NO` |
| **AE** | Modificación de arte | `str` | `SI` / `NO` |
| **AF** | All over | `str` | `SI` / `NO` |
| **AG** | Variación de color | `str` | `SI` / `NO` |
| **AH** | Ref (variación) | `str` | Números de referencias que comparten moldería |
| **AI** | Tipo de empaque | `str` | Características especiales de embalaje |
| **AJ** | Bordado aplica | `str` | `SI` / `NO` |
| **AK** | Bordado descripción | `str` | Características del bordado cuando aplica |
| **AL** | Semielaborado aplica | `str` | `SI` / `NO` |
| **AM** | Semielaborado descripción | `str` | Características del semielaborado cuando aplica |
| **AN** | Proveedor externo | `str` | Nombre del proveedor |
| **AO** | Proceso externo | `str` | Descripción del proceso |
| **AP** | Costo externo | `float` | Valor numérico del costo |
| **AQ** | Bordado status | `str` | Estado actual del bordado/semielaborado |
| **AR** | Terminado taller costeo | `str` | `OK` si terminado |
| **AS** | Entregable creativo | `str` | `OK` si entregado |
| **AT** | Entregable técnico | `str` | `OK` si entregado |
| **AU** | Entregable trazador | `str` | `OK` si entregado |
| **AV** | Envío MOD arte | `str` | `OK` si enviado (aplica cuando AE=SI) |
| **AW** | Telas comentarios | `str` | *(Funcionalidad por definir)* |
| **AX** | Telas bordado status | `str` | *(Funcionalidad por definir)* |
| **AY** | Telas terminado taller | `str` | *(Funcionalidad por definir)* |
| **AZ** | Insumos proceso externo | `str` | *(Funcionalidad por definir)* |
| **BA** | Insumos costo | `str` | *(Funcionalidad por definir)* |
| **BB** | Bordado status extra | `str` | *(Funcionalidad por definir)* |
| **BC** | Bordado terminado taller | `str` | *(Funcionalidad por definir)* |
| **BD** | Entrega parcial | `str` | `X` si debe costearse para fecha estimada |
| **BE** | Especificación confección #1 | `str` | Novedades para confección |
| **BF** | Escalado moldería #1 | `str` | Novedades para escalado; puede contener código PT referente |
| **BG** | Tiras continuas | `str` | Novedades sobre tiras continuas |
| **BH** | Dificultad de prenda | `str` | `BAJA`, `INTERMEDIA`, `ALTA` |
| **BI** | Dificultad de bordado | `str` | `BAJA`, `INTERMEDIA`, `ALTA` |
| **BJ** | Prioridades first buy | `int` | Valor numérico de prioridad comercial |
| **BK** | Prioridades bordado | `int` | Valor numérico de prioridad |
| **BL** | Bordado tipo | `str` | `SEMIELABORADO`, `EN PRENDA`, `NINGUNO` |
| **BM** | Prioridades textil stock | `str` | *(Por definir)* |
| **BN** | Comentarios ingeniería | `str` | Observaciones de ingeniería |
| **BO** | Comentarios trazo | `str` | Moldería parecida/igual reportada |
| **BP** | Comentarios costeo | `str` | Observaciones del área de costeo |
| **BQ** | Sugerencia MOD/UBC | `str` | Aporte del equipo de consumos sobre catalogación |
| **BR** | Requiere muestra | `str` | `SI` (nueva) / `NO` (ya existe referencia igual) |
| **BS** | Grupo/estilo | `str` | *(Por definir)* |
| **BT** | Fecha validación MP | `date` | Día del reporte del hallazgo |
| **BU** | Área de afectación | `str` | Área que ocasionó la situación |
| **BV** | Clasificación del hallazgo | `str` | `INCONSISTENCIAS`, `FALTA DE INFORMACIÓN`, `FALTANTES`, `CAMBIOS`, `FALTA DE ANÁLISIS`, `OTROS` |
| **BW** | MP (Materia Prima) | `str` | Insumos o telas/hilos involucrados |
| **BX** | Clasificación de MP | `str` | *(Por definir)* |
| **BY** | Tipo de ejecución | `str` | Acción correctiva aplicada |
| **BZ** | Info SAP muestra | `str` | `SI` / `NO` |
| **CA** | Description USA-UK | `str` | Descripción de la prenda en inglés |
| **CB** | Fiber Composition | `str` | Porcentajes de composición de tela lucir (ej: `100% Linen`) |
| **CC** | Woven | `str` | `WOVEN` (plano) o `KNITTED` (punto) |
| **CD** | Inside | `str` | Composición porcentual del forro |
| **CE** | Include | `str` | Elementos adicionales (borlas, cinturones) |
| **CF** | Observaciones composición | `str` | Comentarios adicionales |
| **CG** | Info SAP producción | `str` | `SI` / `NO` |
| **CH** | Description USA-UK prod | `str` | Descripción en inglés para producción |
| **CI** | Fiber Composition prod | `str` | Composición para producción |
| **CJ** | Woven prod | `str` | `WOVEN` o `KNITTED` para producción |
| **CK** | Inside prod | `str` | Composición forro producción |
| **CL** | Include prod | `str` | Elementos adicionales producción |
| **CM** | Observaciones comp prod | `str` | Comentarios producción |
| **CN** | Comex | `str` | *(Por definir)* |
| **CO** | Proceso cuidados | `str` | Proceso especial de cuidados |
| **CP** | Lavado | `str` | Instrucciones de lavado (ej: `HAND WASH COLD`) |
| **CQ** | Logo de Lavado | `str` | Símbolo de lavado |
| **CR** | Desmanche | `str` | Instrucciones de blanqueo (ej: `DO NOT BLEACH`) |
| **CS** | Logo de Desmanche | `str` | Símbolo de blanqueo |
| **CT** | Secado | `str` | Instrucciones de secado (ej: `DO NOT TUMBLE DRY`) |
| **CU** | Logo de Secado | `str` | Símbolo de secado |
| **CV** | Planchado | `str` | Instrucciones de planchado |
| **CW** | Logo de plancha | `str` | Símbolo de planchado |
| **CX** | Cuidados includes | `str` | Otros cuidados adicionales |
| **CY** | Talla 0 | `int` | Unidades vendidas talla 0 |
| **CZ** | Talla 2 | `int` | Unidades vendidas talla 2 |
| **DA** | Talla 4 | `int` | Unidades vendidas talla 4 |
| **DB** | Talla 6 | `int` | Unidades vendidas talla 6 |
| **DC** | Talla 8 | `int` | Unidades vendidas talla 8 |
| **DD** | Talla 10 | `int` | Unidades vendidas talla 10 |
| **DE** | Talla 12 | `int` | Unidades vendidas talla 12 |
| **DF** | XS | `int` | Unidades vendidas talla XS |
| **DG** | S | `int` | Unidades vendidas talla S |
| **DH** | M | `int` | Unidades vendidas talla M |
| **DI** | L | `int` | Unidades vendidas talla L |
| **DJ** | XL | `int` | Unidades vendidas talla XL |
| **DK** | TOTAL | `int` | Suma total de todas las unidades |
| **DL** | Tipo de tejido | `str` | `PLANO`, `PUNTO`, `CUERO`, `OTRO` |
| **DM** | Complejidad corte | `str` | `BAJA`, `INTERMEDIA`, `ALTA` |
| **DN** | Envío corte maquilas | `str` | `SI` / `NO` |
| **DO** | Complejidad confección | `str` | `BAJA`, `INTERMEDIA`, `ALTA` |
| **DP** | Envío confección maquilas | `str` | `APLICA` / `NO APLICA` |
| **DQ** | Tipo montaje maniquí | `str` | Descole, drapeado, prenses, ubicación insumos, ajuste moños, puntadas especiales |
| **DR** | (Vacía) | — | Columna intencionalmente vacía |
| **DS** | Proyecto montaje | `str` | Referencia de colección pasada con montaje similar |
| **DT** | Diseñador técnico contramuestra | `str` | ⚠️ EXCLUSIVO: si tiene valor, DU debe estar vacío |
| **DU** | Diseñador creativo contramuestra | `str` | ⚠️ EXCLUSIVO: si tiene valor, DT debe estar vacío |
| **DV** | Fecha inicio moldería | `date` | Inicio de corrección de moldería |
| **DW** | Fecha finalización moldería | `date` | Fin de corrección de moldería |
| **DX** | Comentarios moldería | `str` | Hallazgos del técnico/creativo |
| **DY** | Tipo proceso externo | `str` | Tipo de proceso que llevará alguna pieza |
| **DZ** | Fecha recibido pieza | `date` | Entrega por el proveedor |
| **EA** | Fecha entrega pieza | `date` | Recepción por el proveedor |
| **EB** | Status proceso externo | `str` | Estado actual del proceso |
| **EC** | Fecha de corte #1 | `date` | Primera entrega a corte |
| **ED** | Tipo de corte #1 | `str` | `PRENDA COMPLETA`, `LABORATORIO`, `PIEZA`, `REPOSICIÓN` |
| **EE** | Fecha de corte #2 | `date` | Segunda entrega a corte |
| **EF** | Tipo de corte #2 | `str` | Tipo de corte #2 |
| **EG** | Fecha de corte #3 | `date` | Tercera entrega a corte |
| **EH** | Tipo de corte #3 | `str` | Tipo de corte #3 |
| **EI** | Fecha de corte #4 | `date` | Cuarta entrega a corte |
| **EJ** | Tipo de corte #4 | `str` | Tipo de corte #4 |
| **EK** | Observaciones de corte | `str` | Comentarios del cortador |
| **EL** | Total cortes de piezas | `int` | Sumatoria de cortes tipo `PIEZA` |
| **EM** | Total cortes de muestras | `int` | Sumatoria de cortes tipo `PRENDA COMPLETA` o `REPOSICIÓN` |
| **EN** | Modista confección | `str` | Persona asignada para confección de contramuestra |
| **EO** | Fecha inicio confección | `date` | Inicio de confección |
| **EP** | Fecha entrega confección | `date` | Entrega de confección |
| **EQ** | Status confección | `str` | Estado actual de confección |
| **ER** | Observaciones modista | `str` | Comentarios de la modista |
| **ES** | Observaciones técnico #1 | `str` | Comentarios del diseñador técnico |
| **ET** | Observaciones técnico #2 | `str` | Comentarios adicionales del técnico |
| **EU** | Tiempo confección (min) | `float` | Minutos de confección registrados por Ingeniería |
| **EV** | Estado prenda planta | `str` | `APROBADA` / `RECHAZADA` |
| **EW** | Tipo de rechazo | `str` | `MEDIDAS`, `CALIDAD DE CONFECCIÓN`, `COHERENCIA CON FICHA TÉCNICA`, etc. |
| **EX** | Feedback producción | `str` | Comentarios de la planta de producción |
| **EY** | Medición fase 1 | `date` | Fecha primera medición en modelo |
| **EZ** | Comentarios medición 1 | `str` | Observaciones tras primera medición |
| **FA** | Medición fase 2 | `date` | Fecha segunda medición |
| **FB** | Comentarios medición 2 | `str` | Observaciones tras segunda medición |
| **FC** | Medición fase 3 | `date` | Fecha tercera medición |
| **FD** | Comentarios medición 3 | `str` | Observaciones tras tercera medición |
| **FE** | Medición fase 4 | `date` | Fecha cuarta medición |
| **FF** | Comentarios medición 4 | `str` | Observaciones tras cuarta medición |
| **FG** | Medición fase 5 | `date` | Fecha quinta medición |
| **FH** | Comentarios medición 5 | `str` | Observaciones tras quinta medición |
| **FI** | Foto contramuestra | `str` | Checkbox de foto tomada |
| **FJ** | Revisión | `str` | *(Por definir)* |
| **FK** | Clasificación | `str` | *(Por definir)* |
| **FL** | Fecha entrega a Ficha | `date` | Entrega al área de ficha técnica |
| **FM** | Especificadora | `str` | Persona encargada de ficha técnica de producción |
| **FN** | Inicio especificación | `date` | Fecha de inicio de especificación |
| **FO** | Revisión materiales | `str` | Checkbox de revisión SAP |
| **FP** | Entrega ficha bordado | `str` | Checkbox de entrega |
| **FQ** | Fecha entrega ficha bordado | `date` | Fecha de entrega |
| **FR** | Fecha final especificación | `date` | Fecha de entrega de especificaciones |
| **FS** | Prioridad contramuestras | `int` | Valor numérico de 1 a 10 |
| **FT** | Fecha meta entrega | `date` | Fecha estimada de entrega |
| **FU** | Drops | `str` | Asignación alfabética A-Z de grupos |
| **FV** | Status contramuestra | `str` | Estado actual de la contramuestra |
| **FW** | (Vacía) | — | Columna intencionalmente vacía |
| **FX** | Fecha liberación diseño | `date` | *(Por definir)* |
| **FY** | Fecha liberación ingeniería | `date` | *(Por definir)* |
| **FZ** | Foto contramuestra | `str` | *(Por definir)* |
| **GA** | Unidades cortadas | `int` | *(Por definir)* |
| **GB** | Nombre contramuestra | `str` | Formato: `OT` + número de referencia (ej: `OT02801`) |
| **GC** | Talla contramuestra | `str` | Talla en que se confeccionó la contramuestra |
| **GD** | Color contramuestra | `str` | Color de la contramuestra (misma base textil que col AC) |
| **GE** | Reprogramación | `str` | `SI` / `NO` |
| **GF** | Código OT | `str` | Código SAP de la contramuestra |
| **GG** | Nota de Fabricación | `str` | Código SAP para reservar/separar materiales |
| **GH** | Gestión de Nota | `date` | Fecha de creación de Nota en SAP |
| **GI** | Fecha traslado SAP | `date` | Fecha del documento de traslado en SAP |
| **GJ** | Fecha despacho ZF | `date` | Fecha de envío físico a producción |
| **GK** | Liberación ficha física | `str` | *(Por definir)* |
| **GL** | Hallazgos reprogramación | `str` | *(Por definir)* |
| **GM** | Clasificación situaciones prod | `str` | *(Por definir)* |
| **GN** | Tipo situación producción | `str` | *(Por definir)* |
| **GO** | Observaciones escalado | `str` | *(Por definir)* |
| **GP** | Clasificación situac ficha | `str` | *(Por definir)* |
| **GQ** | Variables ficha | `str` | *(Por definir)* |
| **GR** | Observaciones ficha | `str` | *(Por definir)* |
| **GS** | Clasificación situac bordado | `str` | *(Por definir)* |
| **GT** | Variables bordado | `str` | *(Por definir)* |
| **GU** | Observaciones bordado | `str` | *(Por definir)* |
| **GV** | Clasificación situac consumos | `str` | *(Por definir)* |
| **GW** | Variables consumos | `str` | *(Por definir)* |
| **GX** | Observaciones consumos | `str` | *(Por definir)* |
| **GY** | Clasificación situac compras | `str` | *(Por definir)* |
| **GZ** | Variables compras | `str` | *(Por definir)* |
| **HA** | Área encargada | `str` | *(Por definir)* |
| **HB** | Observaciones compras | `str` | *(Por definir)* |
| **HC** | Corrección realizada Audaces | `str` | *(Por definir)* |
| **HD** | Situaciones en corte | `str` | *(Por definir)* |

---

## 📐 3. Reglas de Negocio Fundamentales

### 3.1 Ciclo de Vida de una Referencia

```
[Ficha Técnica] → [MD asignado] → [Moldería inicial talla 2/XS] → [Corte muestra]
→ [Confección muestra] → [Aprobación Johanna Ortiz] → [PT asignado]
→ [Escalado tallas] → [Trazos/Consumos] → [Contramuestra OT] → [Producción]
```

### 3.2 Reglas de Estados y Transiciones

| ID | Regla | Severidad |
|----|-------|-----------|
| **R01** | Un `Código PT` no puede existir sin un `Código MD` previo en la misma referencia | 🔴 CRÍTICA |
| **R02** | `Status = APROBADO` implica que debe existir un `Código PT` asignado | 🔴 CRÍTICA |
| **R03** | `Status = CANCELADO` no debería tener `Código PT` asignado (posible error de datos) | 🟠 ALTA |
| **R04** | `Entregable creativo = OK` requiere que los consumos creativos (columnas de consumo 1/2/3) tengan valores > 0 | 🟠 ALTA |
| **R05** | `Entregable técnico = OK` requiere que al menos uno de los consumos técnicos tenga valor > 0 según aplique | 🟠 ALTA |
| **R06** | `Entregable trazador = OK` requiere que los consumos del trazador estén registrados | 🟠 ALTA |
| **R07** | `TOTAL` (col DK) debe ser igual a la suma de todas las columnas de tallas (CY-DJ) | 🔴 CRÍTICA |
| **R08** | Las unidades por talla deben corresponder al `Tallaje` declarado en columna S (numérico, alfabético o mixto) | 🟡 MEDIA |

### 3.3 Reglas de Exclusividad y Asignación

| ID | Regla | Severidad |
|----|-------|-----------|
| **R09** | Una contramuestra solo puede tener UN responsable: DT (técnico) O DU (creativo). Nunca ambos simultáneamente. | 🔴 CRÍTICA |
| **R10** | `Variación de color = SI` (col AG) implica que `Ref variación` (col AH) debe contener al menos un número de referencia | 🟡 MEDIA |
| **R11** | `Modificación de arte = SI` (col AE) implica que `Envío MOD arte` (col AV) debe ser `OK` para que la referencia avance | 🟠 ALTA |
| **R12** | `Bordado aplica = SI` (col AJ) requiere que `Bordado descripción` (col AK) no esté vacío | 🟡 MEDIA |
| **R13** | `Semielaborado aplica = SI` (col AL) requiere que `Semielaborado descripción` (col AM) no esté vacío | 🟡 MEDIA |
| **R14** | `Requiere muestra = SI` (col BR) implica que es una referencia completamente nueva sin referente previo | 🟢 BAJA |

### 3.4 Reglas de Consumos de Tela

| ID | Regla | Severidad |
|----|-------|-----------|
| **R15** | Consumos creativos y técnicos no pueden ser 0 o vacíos para referencias con Status != CANCELADO | 🟠 ALTA |
| **R16** | Si `Mod Arte = SI` y `Ubi Trazo = NO`, el consumo del técnico debe estar en columna de CONSUMO MOD ARTE | 🟡 MEDIA |
| **R17** | Si `Mod Arte = NO` y `Ubi Trazo = SI`, el consumo del técnico debe estar en columna de CONSUMO UBI TRAZO | 🟡 MEDIA |
| **R18** | Si ambos son `NO`, el consumo debe estar en columna de CONSUMO SOLIDO | 🟡 MEDIA |
| **R19** | El consumo del trazador no debe ser mayor que el consumo del diseñador (debe existir ahorro o ser igual) | 🟡 MEDIA |
| **R20** | `Ancho tela` (col AB) debe ser > 0 si existe `Código tela` (col Y) asignado | 🟠 ALTA |

### 3.5 Reglas Temporales y de Fechas

| ID | Regla | Severidad |
|----|-------|-----------|
| **R21** | `Fecha finalización moldería` (DW) no puede ser anterior a `Fecha inicio moldería` (DV) | 🟠 ALTA |
| **R22** | `Fecha entrega confección` (EP) no puede ser anterior a `Fecha inicio confección` (EO) | 🟠 ALTA |
| **R23** | `Fecha despacho ZF` (GJ) debe ser >= `Fecha traslado SAP` (GI) | 🟡 MEDIA |
| **R24** | Una contramuestra `APROBADA` (EV) no debería tener `Tipo de rechazo` (EW) con valor | 🟡 MEDIA |
| **R25** | `Fecha recibido pieza` (DZ) debería ser posterior a `Fecha entrega pieza` (EA) para procesos externos | 🟢 BAJA |

### 3.6 Jerarquía de Colecciones

```
Colección (ej: WINTER SUN, RESORT RTW, SPRING SUMMER)
  └── Cápsula (opcional)
        └── Línea (ej: Vestidos, Tops, Faldas)
              └── Sublínea (ej: Maxidress, Crop Top)
                    └── Referencia (ej: Ref 02801)
                          └── Variación de Color (misma moldería, distinto color/tela)
```

### 3.7 Catálogo de Estados (Status)

| Estado | Significado | Implicaciones |
|--------|-------------|---------------|
| `EN PROCESO` | Desarrollo activo | Puede no tener PT aún; los consumos pueden estar parciales |
| `APROBADO` | Muestra inicial aprobada por Johanna Ortiz | Debe tener PT asignado; continúa a escalado |
| `CANCELADO` | Referencia descartada | No avanza a producción; consumos pueden estar vacíos |
| `PAQUETE COMPLETO` | Todos los entregables finalizados | Creativo + Técnico + Trazador deben estar en OK |

### 3.8 Catálogos de Referencia en PARAMETROS

La hoja `PARAMETROS` contiene las listas maestras que alimentan los menús desplegables de MATRIZ:

| Catálogo | Uso en MATRIZ |
|----------|---------------|
| Diseñadores | Validar columna L (Diseñador creativo) |
| Diseñadores Técnicos | Validar columnas DT (contramuestra) |
| Modistas | Validar columnas N y EN |
| Bases Textiles | Validar columna AC |
| Líneas | Validar columna P |
| Sublíneas | Validar columna Q |
| Tipos de Referencia | Validar columna R |
| Estados | Validar columna K |

> **Regla de integridad referencial**: Los valores en MATRIZ que dependen de estos catálogos deben existir en PARAMETROS. Una discrepancia se reporta como alerta de severidad 🟡 MEDIA.
