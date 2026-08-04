# PROYECTO: GESTIÓN DE COLECCIONES JO

**Fecha Inicio:** 22 de enero de 2026

## Descripción General

El proyecto pretende crear una aplicación web que ayude en la gestión del ciclo de vida de las referencias (prendas de vestir) de una empresa dedicada a la producción de prendas de vestir de alta calidad y con criterios de calidad y trazabilidad de los procesos que intervienen en el proceso de la creación de una prenda. 
se usan 2 archivos de google sheets por coleccion, uno para la matriz de referencias y otro para guardar las telas (lucir, forros, fusionables, etc) e insumos (cintas, argollas, cierres, etc) que se van a usar en las referencias. la estructura que se maneja es la siguiente:
1. por cada fila se pone una tela o insumo que se va a usar en la referencia
2. una referencia puede tener una tela o mas, asi como un insumo o mas. Cada insumo o tela ocupa una fila
3. La columna A, registra REF, que indica el numero de referencia (1,2,3,4,...)
4. la columna B, registra FOTO, que indica la foto de la prenda
5. la columna C, registra NOMBRE, que indica el nombre de la prenda  (en esta columna tambien se registra el codigo PT)
6. la columna D, registra ESTADO, que indica el estado de la referencia(en proceso, aprobado, cancelado, paquete completo, etc)
7. la columna E, registra MOD. ARTE, que indica con un SI/NO si la referencia tiene modificaciones de arte
8. la columna F, registra UBI. TRAZO, que indica con un SI/NO si la referencia tiene una ubicacion de trazo
9. la columna G y H, registran VARIACION DE COLOR, que indica con un numero cual otra referencia dentro de la coleccion comparte la misma molderia (lo que la diferenciaria seria el color o la tela asignada)
10. la columna I, registra el largo de la prenda
11. la columna J, registra USO EN PRENDA, que indica como se va a usar la tela en la prenda (ej. tela lucir(principal), tela forro(forro), tela fusionable, sesgo lucir, sesgo forro, sesgo fusionable,etc), una prenda puede tener varias telas de lucir, asi como varias telas de forro, etc.
12. la columna K, registra CODIGO TELA, que indica el codigo de la tela a usar
13. la columna L, registra DESCRIPCION TELA, que indica el nombre de la tela
14. la columna M, registra ANCHO, que indica que ancho util tiene la tela
15. la columna N, registra FOTO TELA, que indica la foto de la tela
16. la columna O, registra CONSUMO BASE, que indica cuanto consumia esta referencia en colecciones pasadas

-----de la columna P a la columna U, es un area especifica para los consumos de tela que deben registrar los diseñadores creativos---
17. la columna P, registra DISEÑADOR CREATIVO, que indica que diseñador creativo es el responsable de esta referencia
18. la columna Q, registra CAMBIO MODERIA, que indica si (SI/NO) hay un cambio de molderia o se mantiene respecto al referente
19. la columna R, registra CONSUMO 1, que indica el primer consumo que calculo el diseñador creativo
20. la columna S, registra CONSUMO 2, que indica el segundo consumo que calculo el diseñador creativo
21. la columna T, registra CONSUMO 3, que indica el tercer consumo que calculo el diseñador creativo
22. la columna U, registra OBSERVACIONES, que indica las observaciones que tiene el diseñador creativo, aqui tambien se suele indicar las caracteristicas de los sesgos que tiene la prenda (consumo lineal, ancho del sesgo, sentido del sesgo, etc)

-----de la columna V a la columna Z, es un area especifica para los consumos de tela que deben registrar los diseñadores tecnicos---
23. la columna V, registra DISEÑADOR TECNICO, que indica que diseñador tecnico es el responsable de esta referencia
24. la columna W, registra CONSUMO SOLIDO, que registra el consumo de tela en la talla mas grande en letras(XL) o numeros(12) y siempre y cuando la en la columna E y F registren NO
25. la columna X, registra CONSUMO MOD ARTE, que registra el consumo de tela en la talla mas grande en letras(XL) o numeros(12) y siempre y cuando la en la columna E registren SI y en la columna F registre NO
26. la columna Y, registra CONSUMO UBI TRAZO, que registra el consumo de tela en la talla mas grande en letras(XL) o numeros(12) y siempre y cuando la en la columna E registren NO y en la columna F registren SI
27. la columna Z, registra OBSERVACIONES, que indica las observaciones que tiene el diseñador tecnico, aqui tambien se suele indicar las caracteristicas de los sesgos que tiene la prenda (consumo lineal, ancho del sesgo, sentido del sesgo, etc)

-----de la columna AA a la columna AQ, es un area especifica para los consumos de tela que deben registrar los trazadores (que son personas con conocimientos en corte de prendas, telas y manejo de piezas y expertos en reducir consumos)---
--de la columna AA a la columna AF se registran los consumos de las referencias que estan catalogadas como solidas
28. la columna AA, registra la TALLA, indica la talla con la que fue calculado el consumo de la referencia, para el caso de las referencias solidas, se suele calcular el consumo en la talla intermedia, es decir en la talla M (letras) o en la talla 8 (numeros)
29. la columna AB, 
30. la columna AC,
31. la columna AD,
32. la columna AE,
33. la columna AF,








la referencia nace creando(Gabriela) una ficha tecnica en un hoja fisica donde estan las caracteristicas de la prenda, el diseñador creativo analiza la ficha y las observaciones que pueda tener y crea un molde inicial en la talla 2 o XS (segun lo que indique la ficha tecnica) al cual se le asigna un codigo MD (muestra diseño), el creativo se apoya en el area de corte para cortar los moldes creados en la tela asignada para la muestra diseño, el cortador de esta area se encarga de cortar los moldes en la tela asignada para la muestra diseño, llevando registro de la tela que se utiliza para la muestra diseño, la fecha de corte y quien la corto. una vez cortados los moldes, el creativo se apoya en una modista para la confeccion de la muestra diseño, la modista se encarga de confeccionar la muestra diseño, llevando registro de la modista que confecciono la muestra diseño, la fecha de confeccion y quien la confecciono. una vez confeccionada la muestra diseño, el creativo la presenta a Johanna Ortiz (Diseñadora creativa senior) para su aprobación, si la muestra diseño es aprobada, se le asigna un codigo PT (producto terminado) y el diseñador creativo termina la molderia con todas las caracteristicas definitivos del molde solo en la talla base (2 o XS), si la muestra diseño no es aprobada, se hacen los ajustes necesarios y se repite el proceso de presentarla hasta que sea aprobada. el diseñador creativo pasa el molde base al:
lider de diseñadores tecnicos quien asigna a uno de los diseñadores tecnicos que estan bajo su cargo para que este diseñador tecnico se encargue de escalar el molde base a las otras tallas que se hallan definido en la ficha tecnica, ya sean en letras (xs-s-m-l-xl) o en numeros (0-2-4-6-8-10-12), basandose en la molderia escalada el diseñador tecnico por medio de un software de diseño de moldes llamado Audaces Tizada, simula cuanta tela se llevaria para poder cortar toda una prenda completa en la talla mayor que tenga la referencia ya sea en letras o en numeros, el diseñador tecnico registra la cantidad de tela que se llevaria para poder cortar toda una prenda completa en la talla mayor que tenga la referencia ya sea en letras o en numeros en la hoja de excel que reposa en el drive de la coleccion correspondiente a la referencia, en la columna 

La información se maneja por colecciones:
- WINTER SUN
- RESORT RTW
- SPRING SUMMER
- SUMMER VACATION
- PREFALL RTW
- FALL WINTER

Y por cápsulas.

### Contexto Actual

Hasta el momento se ha manejado un archivo que reposa en la nube en un SaaS de Google llamado Google Drive en un documento de Google Sheets. El archivo "PROTOTIPO V.01.xlsx" es una copia del archivo real en la plataforma de Google. Cada colección tiene un Google Drive diferente con el fin de no hacer más grande la información que pueda contener y mantener separado y organizado en el drive los archivos sheets por carpetas.

El archivo PROTOTIPO V.01 contiene 2 hojas:
- **MATRIZ:** contiene información acerca del ciclo de vida de una prenda en una sola fila
- **PARAMETROS:** guarda la información de los menús desplegables que se usan en la hoja MATRIZ

> **Nota:** En la fila 8 existen varios segmentos de columnas combinadas que agrupan varias columnas de la fila 9

---

## Notación Utilizada

**LETRA DE LA COLUMNA: NOMBRE DE LA COLUMNA - DESCRIPCIÓN DE LA COLUMNA**


## Hoja MATRIZ

En la hoja MATRIZ se procura que en las columnas se evidencien las etapas de manera secuencial. Cada columna cumple un propósito específico basado en las cabeceras de la fila 9:

### Información Básica

- **A - Ref:** Número de referencia
- **B - Imagen:** Foto de la prenda
- **C - Código MD:** Código inicial asignado cuando la referencia se crea y mientras está en la etapa de muestra
- **D - Código PT:** Código que será el del producto cuando ya esté terminado
- **E - Nombre referencia:** Nombre de la referencia
- **F - Color:** Color de la prenda
- **G - Cod color:** Código del color asignado a la prenda, basado en la tela principal

### REFERENTES (Columnas H a J)

- **H - Foto basado en:** Foto de la prenda que se va a tener como referente
- **I - PT:** Código PT de la referencia tomada como referente
- **J - Basado en:** Nombre de la referencia tomada como referente

### Información General

- **K - Status:** Representa el estado general de la referencia
- **L - Diseñador:** Nombre de la persona encargada de crear la moldería (patrones) inicial

### STATUS DE COLECCIÓN (Columnas M a O)
- **M - Status taller:** Etapa en que está la prenda
- **N - Modista:** Persona encargada de confeccionar la muestra inicial
- **O - Fotos internas:** Indica si ya se le tomaron las fotos internas a la muestra inicial

### Características de la Prenda

- **P - Línea:** Línea a la que pertenece la prenda
- **Q - Sublínea:** Sublínea a la que pertenece la prenda
- **R - Tipo ref:** Tipo de referencia interno
- **S - Tallaje:** Grupo de tallas que manejará la referencia
- **T - Largo:** Denominación del largo
- **U - Closure:** Tipo de cierre de la prenda
- **V - Largo:** *(Funcionalidad no clara actualmente)*

### INCLUDES (Columnas W a X)

- **W - Includes:** Indica si lleva algún tipo de prenda adicional de acompañantes
- **X - Includes de paquete completo en planta:** *(Funcionalidad no clara actualmente)*

### TELA DE LUCIR (Columnas Y a AF)

- **Y - Código tela de lucir principal en muestra:** Tela asignada para el corte de la muestra inicial
- **Z - Foto tela:** Foto de la tela física asignada para el corte de la muestra inicial
- **AA - Descripción tela:** Nombre/descripción de la tela asignada para el corte de la muestra inicial
- **AB - Ancho tela:** Ancho de la tela asignada para el corte de la muestra inicial
- **AC - Base Textil:** Base textil de la tela asignada para el corte de la muestra inicial
- **AD - Ubicación en trazo:** Sí/No, si la referencia está catalogada como ubicación en trazo
- **AE - Modificación de arte:** Sí/No, si la referencia está catalogada como modificación de arte
- **AF - All over:** Sí/No, si la referencia está catalogada como all over

### VARIACIÓN DE COLOR (Columnas AG a AH)

- **AG - Variación de color:** Sí/No, si la referencia tiene otra referencia que comparte la misma moldería
- **AH - Ref:** Número de la(s) otra(s) referencia(s) que comparte la misma moldería

### EMPAQUES (Columna AI)

- **AI - Tipo de empaque:** Comentarios de características especiales que debe tener el embalaje de la referencia

### BORDADO EN PRENDA (Columnas AJ a AK)

- **AJ - Aplica o no aplica:** Indica si la referencia tiene un bordado en prendas
- **AK - Descripción:** Breve descripción de las características del bordado cuando sea SÍ

### SEMIELABORADOS (Columnas AL a AM)

- **AL - Aplica o no aplica:** Indica si la referencia tiene alguna pieza de semielaborado
- **AM - Descripción:** Breve descripción de las características del semielaborado cuando sea SÍ

### PROCESO EXTERNO (Columnas AN a AP)

- **AN - Proveedor:** Proveedor que realizará algún proceso externo relacionado con alguna pieza o toda la referencia
- **AO - Proceso externo:** Descripción del proceso externo que realizará el proveedor
- **AP - Costo:** Valor numérico que indica el costo del proceso externo

### Estados y Entregas (Columnas AQ a AV)

- **AQ - Bordado status:** Estado actual en que está el bordado o semielaborado de la referencia
- **AR - Terminado en taller para costeo telas:** OK si la referencia ya está totalmente terminada
- **AS - Entregable creativo:** OK si el diseñador creativo ya registró sus consumos de telas
- **AT - Entregable técnico:** OK si el diseñador técnico ya registró sus consumos de telas
- **AU - Entregable trazador:** OK si el trazador ya registró sus consumos de telas
- **AV - Envío de MOD de arte:** OK si el trazador ya envió al ilustrador el archivo .dxf (aplica si columna AE es SÍ)

### TELAS (Columnas AW a AY)

- **AW - Comentarios:** *(Funcionalidad no clara actualmente)*
- **AX - Bordado status:** *(Funcionalidad no clara actualmente)*
- **AY - Terminado en taller para costeo telas:** *(Funcionalidad no clara actualmente)*

### INSUMOS (Columnas AZ a BA)

- **AZ - Proceso externo:** *(Funcionalidad no clara actualmente)*
- **BA - Costo:** *(Funcionalidad no clara actualmente)*

### BORDADO (Columnas BB a BC)

- **BB - Bordado status:** *(Funcionalidad no clara actualmente)*
- **BC - Terminado en taller para costeo telas:** *(Funcionalidad no clara actualmente)*

### Entregas (Columna BD)
- **BD - Entrega parcial (fecha estimada):** Se registra con una X si la referencia debe quedar costeada para la fecha estimada

### TIME COLECTION (Columnas BE a BS)

- **BE - Especificación de confección #1:** Novedad o característica a tener en cuenta al confeccionar (dirigido al líder de modistas y a la modista)
- **BF - Escalado moldería #1:** Novedad o característica para escalar la moldería; puede contener código PT/nombre/descripción de otra referencia referente (dirigido al líder de diseñadores técnicos)
- **BG - Tiras continuas:** Novedad relacionada a tiras continuas (dirigido al líder de diseñadores técnicos)
- **BH - Dificultad de prenda:** Complejidad de la prenda en confección (dirigido al líder de modistas y a la modista)
- **BI - Dificultad de bordado:** Complejidad de la prenda para el proceso de bordado
- **BJ - Prioridades first buy:** Nivel de prioridad dado por el área comercial (valor numérico)
- **BK - Prioridades bordado:** Nivel de prioridad (valor numérico)
- **BL - Bordado (semielaborado/en prenda):** Describe si lleva bordado en prenda, semielaborado o ninguno
- **BM - Prioridades textil stock:** *(Por definir)*
- **BN - Comentarios ingeniería:** Comentarios del área de ingeniería sobre la prenda
- **BO - Comentarios trazo:** Moldería parecida/igual reportada por diseño técnico
- **BP - Comentarios costeo:** Comentarios del área de costeo sobre la prenda
- **BQ - Sugerencia MOD/UBC:** Aporte del equipo de consumos sobre catalogación (columnas AD, AE, AF)
- **BR - Requiere muestra sí/no:** Sí si es una referencia totalmente nueva; No si anteriormente se ha sacado una referencia igual
- **BS - Grupo/estilo:** *(Por definir)*

### VALIDACIÓN DE MP (Columnas BT a BY)
Grupo de columnas para reportar novedades encontradas en producción en relación a la confección:

- **BT - Fecha:** Día en que se reporta el hallazgo o novedad
- **BU - Área de afectación:** Área involucrada que ocasionó la situación
- **BV - Clasificación del hallazgo:** Categoría de la situación (inconsistencias, falta de información, faltantes, cambios, falta de análisis u otros)
- **BW - MP:** Materia prima involucrada (insumos o telas/hilos)
- **BX - Clasificación de MP:** *(Por definir)*
- **BY - Tipo de ejecución:** Acción correctiva aplicada a la situación hallada

### COMPOSICIÓN MUESTRA COLECCIÓN (Columnas BZ a CF)
Detalle del contenido de las marquillas que deben llevar las muestras:

- **BZ - Información SAP:** Indica si los datos de composiciones ya fueron subidos a SAP
- **CA - Description USA-UK:** Descripción de la prenda
- **CB - Fiber Composition:** Indicación en porcentajes de las composiciones de la tela de lucir (ej: 100% Linen, 95% Cotton y 5% spandex)
- **CC - Woven:** Indica en inglés si el tejido es plano (woven) o de punto (knitted)
- **CD - Inside:** Indicación en porcentajes de las composiciones de la tela de forro
- **CE - Include:** Indica si lleva elementos adicionales (borlas, cinturones, etc.)
- **CF - Observaciones:** Comentarios adicionales sobre composición de materiales
- 

### COMPOSICIONES PRODUCCIÓN (Columnas CG a CM)
Detalle del contenido de las marquillas que deben llevar las contramuestras:

- **CG - Información SAP:** Indica si los datos de composiciones ya fueron subidos a SAP
- **CH - Description USA-UK:** Descripción de la prenda
- **CI - Fiber Composition:** Indicación en porcentajes de las composiciones de la tela de lucir
- **CJ - Woven:** Indica si el tejido es plano (woven) o de punto (knitted)
- **CK - Inside:** Indicación en porcentajes de las composiciones de la tela de forro
- **CL - Include:** Indica si lleva elementos adicionales
- **CM - Observaciones:** Comentarios adicionales

### Comex (Columna CN)

- **CN - Comex:** *(Por definir)*


### CUIDADOS DE LA PRENDA (Columnas CO a CX)
Descripción de los cuidados para mantener/cuidar/preservar la prenda:

- **CO - Proceso:** Especifica si tuvo algún proceso especial
- **CP - Lavado:** Recomendaciones de lavado (HAND WASH COLD, WASH WITH SIMILAR COLORS, etc.)
- **CQ - Logo de Lavado:** Logos de lavado relacionados
- **CR - Desmanche:** Recomendaciones de desmanche (DO NOT BLEACH, etc.)
- **CS - Logo de Desmanche:** Logos relacionados
- **CT - Secado:** Recomendaciones de secado (DO NOT TUMBLE DRY, etc.)
- **CU - Logo de Secado:** Logos relacionados
- **CV - Planchado:** Recomendaciones de planchado (DO NOT IRON, etc.)
- **CW - Logo de plancha:** Logos relacionados
- **CX - Cuidados includes prenda:** Otros cuidados además de los descritos


### UNIDADES DE PRODUCCIÓN (Columnas CY a DK)
Valor numérico entero que representa la cantidad de prendas vendidas por talla:

- **CY - 0:** Talla 0
- **CZ - 2:** Talla 2
- **DA - 4:** Talla 4
- **DB - 6:** Talla 6
- **DC - 8:** Talla 8
- **DD - 10:** Talla 10
- **DE - 12:** Talla 12
- **DF - XS:** Talla XS
- **DG - S:** Talla S
- **DH - M:** Talla M
- **DI - L:** Talla L
- **DJ - XL:** Talla XL
- **DK - TOTAL:** Suma de todos los valores (totalidad de unidades vendidas)


### MAQUILA (Columnas DL a DP)

- **DL - Tipo de tejido:** Clasificación en español (tejido plano, de punto, cuero u otro)
- **DM - Nivel de complejidad en corte:** Nivel de dificultad estimado (baja, intermedia o alta)
- **DN - Envío de corte a maquilas:** Indica si fue enviada a maquila para corte
- **DO - Nivel de complejidad en confección:** Nivel de dificultad estimado (baja, intermedia o alta)
- **DP - Envío de confección a maquilas:** Aplica o no aplica si fue/será enviada a maquila

### MONTAJE EN MANIQUÍ (Columnas DQ a DS)

- **DQ - Tipo de montaje en maniquí:** Describe tipo de montaje (descole, drapeado, prenses, ubicación de insumos, ajuste de moños, puntadas especiales)
- **DR - Vacía:** (Columna vacía)
- **DS - Proyecto de montaje en maniquí:** Referencia de colección pasada con montaje similar

### DISEÑADOR DE CONTRAMUESTRA (Columnas DT a DU)

> **Nota:** Solo puede existir una persona asignada. Si hay alguien en DT, no puede haber en DU y viceversa.

- **DT - Diseñador técnico:** Persona encargada de revisar escala, corte y entregable técnico
- **DU - Diseñador creativo:** Persona encargada de revisar escala, corte y entregable técnico (asume rol de diseñador técnico)

### MOLDERÍA (Columnas DV a DX)

- **DV - Fecha de Inicio de moldería:** Fecha cuando empieza a corregir/acomodar/industrializar la moldería
- **DW - Fecha de finalización de moldería:** Fecha cuando termina de corregir/acomodar/industrializar la moldería
- **DX - Comentarios hallazgos moldería:** Observaciones del técnico/creativo

### PROCESOS EXTERNOS (Columnas DY a EB)

- **DY - Tipo de proceso externo:** Tipo de proceso que llevará alguna pieza
- **DZ - Fecha recibido de pieza:** Fecha de entrega por el proveedor
- **EA - Fecha de entrega de pieza:** Fecha cuando el proveedor recibe la pieza
- **EB - Status del proceso:** Estado actual del proceso externo


### CORTE DE CONTRAMUESTRAS (Columnas EC a EM)
Características de las piezas o prendas entregadas al área de corte:

- **EC - Fecha de corte #1:** Primera entrega a corte
- **ED - Tipo de corte #1:** Tipo de corte (prenda completa, laboratorio, pieza, reposición, etc.)
- **EE - Fecha de corte #2:** Segunda entrega a corte
- **EF - Tipo de corte #2:** Tipo de corte #2
- **EG - Fecha de corte #3:** Tercera entrega a corte
- **EH - Tipo de corte #3:** Tipo de corte #3
- **EI - Fecha de corte #4:** Cuarta entrega a corte
- **EJ - Tipo de corte #4:** Tipo de corte #4
- **EK - Observaciones de corte:** Comentarios del cortador
- **EL - Total cortes de piezas:** Sumatoria cuando tipo de corte es "Pieza"
- **EM - Total cortes de muestras:** Sumatoria cuando tipo de corte es "prenda completa" o "reposición contramuestra"

### CONFECCIÓN (Columnas EN a EX)

- **EN - Modista:** Persona asignada para la confección de contramuestra
- **EO - Fecha de inicio de Confección:** Fecha de inicio de confección
- **EP - Fecha de entrega de Confección:** Fecha de entrega de confección
- **EQ - Status confección:** Estado actual de la confección
- **ER - Observaciones de confección modista:** Comentarios de la modista
- **ES - Observaciones de confección #1 Técnico:** Comentarios del diseñador técnico
- **ET - Observaciones de confección #2 Técnico:** Comentarios adicionales del diseñador técnico
- **EU - Tiempo de confección Ingeniería:** Cantidad de minutos demora de la modista
- **EV - Estado de la prenda - Planta producción:** APROBADA o RECHAZADA
- **EW - Tipo de rechazo - Planta producción:** Tipo de rechazo (Medidas, calidad de confección, Coherencia con ficha técnica, etc.)
- **EX - Feedback de comentarios - Planta producción:** Comentarios de la planta de producción

### MEDICIÓN (Columnas EY a FL)
Comentarios que se generan al momento de hacer la medicion de la contramuestra en la modelo, se registra si deben hacerse cambios, mejoras u otros asi como las fechas

- **EY - Medición fase 1:** fecha de la primera medicion con la modelo
- **EZ - Comentarios medición 1:** comentarios/observaciones que se hacen tras la primera medicion
- **FA - Medición fase 2:** fecha de la segunda medicion con la modelo
- **FB - Comentarios medición 2:** comentarios/observaciones que se hacen tras la segunda medicion
- **FC - Medición fase 3:** fecha de la tercera medicion con la modelo
- **FD - Comentarios medición 3:** comentarios/observaciones que se hacen tras la tercera medicion
- **FE - Medición fase 4:** fecha de la cuarta medicion con la modelo
- **FF - Comentarios medición 4:** comentarios/observaciones que se hacen tras la cuarta medicion
- **FG - Medición fase 5:** fecha de la quinta medicion con la modelo
- **FH - Comentarios medición 5:** comentarios/observaciones que se hacen tras la quinta medicion
- **FI - Foto contramuestra:** checkbox que indica si ya se le tomo foto a la contramuestra ya aprobada
- **FJ - Revisión:** *(Por definir)*
- **FK - Clasificación:** *(Por definir)*
- **FL - Fecha de entrega a Ficha:** Fecha en la que se entrega al area de ficha tecnica la molderia, la tabla de medidas y la prenda para que ellas procedan a realizar las especificaciones que requiera la prenda

### FICHAS TÉCNICAS PRODUCCIÓN (Columnas FM a FR)

- **FM - Especificadora:** Persona encargada de hacer la ficha técnica de producción
- **FN - Inicio de especificación:** Fecha de inicio de especificación
- **FO - Revisión de materiales (insumos SAP):** Checkbox de revisión de base de datos
- **FP - Entrega ficha de bordado:** Checkbox de entrega
- **FQ - Fecha Entrega ficha de bordado:** Fecha de entrega
- **FR - Fecha final de especificación:** Fecha de entrega de especificaciones

### STATUS CONTRAMUESTRA (Columnas FS a FW)

- **FS - Prioridad contramuestras:** Valor numérico de 1 a 10
- **FT - Fecha meta de entrega:** Fecha estimada de entrega
- **FU - Drops:** Asignación alfabética (A-Z) de grupos
- **FV - Status contramuestra:** Estado actual
- **FW:** *(Vacía)*

### ENTREGABLES (Columnas FX a FY)

- **FX - Fecha liberación diseño a ingeniería:** *(Por definir)*
- **FY - Fecha liberación ingeniería a producción:** *(Por definir)*

### CONTRAMUESTRAS (Columnas FZ a GJ)

- **FZ - Foto contramuestra:** *(Por definir)*
- **GA - Unidades cortadas:** *(Por definir)*
- **GB - Nombre contramuestra:** Al inicio del nombre de la referencia se le agregan las letras **OT** (Orden de Traslado), que indicará en el sistema que la referencia no hace parte de las unidades de producción sino que estará catalogada dentro de las contramuestras. Ejemplo: OT02801, OT02802
- **GC - Talla:** Talla en la que se hizo la contramuestra
- **GD - Descripción de color:** Color en la que se hizo la contramuestra. **Nota importante:** La contramuestra no necesariamente se hace en la misma tela o color de la muestra inicial, pero sí debe ser en la misma base textil registrada en la columna AC.
- **GE - Reprogramación de contramuestra:** Indica si la contramuestra fue reprogramada (SI/NO). Si es afirmativo, registrar la nueva fecha de entrega.
- **GF - Código OT:** Código que se asigna en SAP para identificar la contramuestra. Formato: OT + números secuenciales.
- **GG - Nota:** **(NOTA DE FABRICACIÓN)** Código en SAP que se asigna para **reservar/separar/asignar** las telas e insumos que requiere la referencia. Es un documento interno de SAP necesario antes del traslado a producción.
- **GH - Gestión de Nota:** Fecha de la creación de la Nota de Fabricación en SAP. Es el momento en que se genera el documento para reservar los materiales.
- **GI - Fecha traslado SAP:** Fecha de creación del documento que registra el **traslado interno** de la contramuestra al área de producción en SAP. Esta fecha puede ser diferente a la fecha de despacho físico.
- **GJ - Fecha despacho a ZF (Producción):** Fecha en la que la contramuestra es **enviada físicamente** al área de producción (ZF). Esta es la fecha real de despacho y puede diferir de la fecha de traslado SAP.

> **Nota importante:** Las fechas GI (traslado SAP) y GJ (despacho ZF) pueden ser diferentes. GI registra cuándo se creó el documento en el sistema, mientras que GJ registra cuándo efectivamente se envió la prenda físicamente.

### FEEDBACK DE PRODUCCIÓN (Columnas GK a HD)

#### ESCALADO (Columnas GK a GO)

- **GK - Liberación de ficha física:** *(Por definir)*
- **GL - Hallazgos de la reprogramación:** *(Por definir)*
- **GM - Clasificación de situaciones en producción:** *(Por definir)*
- **GN - Tipo de situación en producción:** *(Por definir)*
- **GO - Observaciones:** *(Por definir)*

#### FICHA DE ESPECIFICACIÓN (Columnas GP a GR)

- **GP - Clasificación de situaciones en producción:** *(Por definir)*
- **GQ - Variables:** *(Por definir)*
- **GR - Observaciones:** *(Por definir)*

#### BORDADO (Columnas GS a GU)

- **GS - Clasificación de situaciones en producción:** *(Por definir)*
- **GT - Variables:** *(Por definir)*
- **GU - Observaciones:** *(Por definir)*

#### CONSUMOS (Columnas GV a GX)

- **GV - Clasificación de situaciones en producción:** *(Por definir)*
- **GW - Variables:** *(Por definir)*
- **GX - Observaciones:** *(Por definir)*

#### COMPRAS, CALIDAD, MAQUILA, COSTEO (Columnas GY a HB)

- **GY - Clasificación de situaciones en producción:** *(Por definir)*
- **GZ - Variables:** *(Por definir)*
- **HA - Área encargada:** *(Por definir)*
- **HB - Observaciones:** *(Por definir)*

#### AUDACES (Columnas HC a HD)

- **HC - Corrección realizada:** *(Por definir)*
- **HD - Situaciones en corte:** *(Por definir)*

---



## Glosario

**SEMIELABORADO:** Pieza que hace parte de la prenda y que tiene procesos especiales como bordados que se integran posteriormente a la confección de la prenda principal.

**LABORATORIO:** Ensayo/prueba que hace el diseñador técnico o creativo. Consiste en el corte de algunas piezas para posteriormente confeccionar y analizar el comportamiento de la tela, la moldería y otros factores. No es la prenda completa, solo una parte de ella para probar cómo se vería cuando ya esté completa y así no generar reprocesos. Cuando se verifica que el laboratorio cumple con lo esperado, entonces se corta toda la prenda.

**AUDACES:** Software usado para la creación/edición de patrones/moldes de las prendas, así como para realizar trazos y calcular consumos. También se usa para la creación de fichas técnicas (PDF).

**SAP:** Software ERP que sirve de base de datos.

**MARQUILLA:** Etiqueta o sello distintivo para productos, especialmente en la industria textil (ropa, accesorios).

**MAQUILA:** Sistema de producción basado en un contrato donde una empresa (contratante) paga a otra (maquiladora) para que transforme materia prima o ensamble productos o preste un servicio.

**DESCOLAR:** Proceso de nivelación; quitar colas que puedan tener algunas piezas o la prenda en sí. Las colas se ocasionan por comportamiento de estiramiento de la tela al momento de cortar o confeccionar.

**MONTAJE EN MANIQUÍ:** Proceso que consiste en poner la prenda o alguna de las piezas de la prenda en un maniquí y empezar a hacer pliegues, prenses, drapeados, ubicaciones de insumos, ajuste de moños, puntadas especiales, posicionar boleros o descolar.

**REFERENTE:** Prenda que se parece a la referencia actual, se menciona con el fin de tener en cuenta la horma de esa referencia y las caracteristicas como escalado de sus tallas y demas detalles.
