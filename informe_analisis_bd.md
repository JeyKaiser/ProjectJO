# Análisis y Propuesta de Base de Datos: Gestión de Colecciones JO

## 1. Fases Macro del Ciclo de Vida (Enfoque de Servicios)
Las fases actúan como "Áreas que ofrecen un servicio". Cada servicio tiene fechas de recepción, finalización y responsables, permitiendo trazar el tiempo de vida (event sourcing) de la prenda. Cabe destacar que desde el nacimiento de la referencia se le asignan simultáneamente los códigos **MD (Muestra Diseño)** y **PT (Producto Terminado)**.

**FASE 1: Creación y Diseño (Área Creativa)**
* 1.1 Perfilamiento: Creación de Ficha, asignación simultánea de códigos MD/PT y definición de complejidad.
* 1.2 Consumo Base: Estimación visual de tela por el creativo.
* 1.3 Moldería Base: Primer patrón digital/papel.

**FASE 2: Laboratorio y Prototipado (Módulo Taller)**
* 2.1 Alistamiento: Separación de insumos (Posibles Novedades de calidad pausarán el flujo).
* 2.2 Corte de Muestra: Procesamiento de tela base.
* 2.3 Confección de Muestra: Ensamblaje físico por modista.
* 2.4 Procesos Especiales: Lavandería, bordado, drapeado.

**FASE 3: Validación Técnica (Área de Ingeniería)**
* 3.1 Medición y Tallaje: Veredicto de Directora Creativa.
* 3.2 Ajustes de Moldería: Corrección de encogimientos u observaciones.
* 3.3 Escalado y Consumo Técnico: Cálculo en diferentes tallas.
* 3.4 Trazos de Producción: Consumo exacto por Sólido/Mod Arte.

**FASE 4: Industrialización (Área de Producción)**
* 4.1 Cierre Ficha Final: Marquillas y Cuidados definitivos.
* 4.2 Explosión Contramuestra: Verificación contra Trazador.
* 4.3 Nota de Fabricación SAP: Disparador para masificación en planta/maquila.

## 2. Normalización de Datos (Hacia un modelo relacional)
El archivo actual es una "sábana" plana que presenta redundancia y anomalías de actualización. Para estructurar una base de datos óptima, aplicamos normalización:

- **1FN (Primera Forma Normal):** Se deben eliminar los grupos repetidos por fila. En el excel, una referencia tiene repetidas "Telas" (lucir 1, lucir 2, forro, etc.) y "Mediciones" (fase 1 a 5) en múltiples columnas. Esto se independiza en tablas separadas, de forma que una referencia se relacione con múltiples registros de tela y mediciones.
- **2FN (Segunda Forma Normal):** Los atributos que no dependen completamente de la clave principal (Referencia) se separan. Por ejemplo, los detalles de la tela (Descripción, Ancho, Base Textil) no dependen de la prenda, sino del Código de la Tela. De igual forma, la información de Diseñadores y Proveedores.
- **3FN (Tercera Forma Normal):** Se eliminan dependencias transitivas creando catálogos maestros o tablas paramétricas (ej: `LINEA`, `SUBLINEA`, `TIPO_EMPAQUE`, `CATEGORIA_HALLAZGOS`).

## 3. Entidades (Tablas) y sus Atributos Principales

- **COLECCION:** `(id_coleccion PK, nombre_coleccion, temporada, anio)`.
- **REFERENCIA:** `(id_referencia PK, id_coleccion FK, numero_ref, codigo_MD, codigo_PT, nombre_referencia, color, codigo_color, linea, sublinea, tipo_ref, tallaje, largo, closure, status, url_imagen_principal, prioridad_first_buy, comentarios_ingenieria, comentarios_costeo, complejidad_maquila_corte, complejidad_maquila_confeccion, enviar_a_maquila [Booleano], drop_entrega [A-Z], tiene_bordado_prenda [Booleano], tiene_semielaborado [Booleano], montaje_maniqui [Drapeado, Descole], tiras_continuas [Booleano], includes, tipo_empaque)`.
- **DISEÑADOR:** `(id_disenador PK, nombre, rol [creativo, tecnico, especificador])`.
- **TELA:** `(id_tela PK, codigo_tela, descripcion, ancho, base_textil, url_imagen_tela)`.
- **CONSUMO_MATERIAL:** `(id_consumo PK, id_referencia FK, codigo_material, uso_en_prenda [ej. Tela Lucir, Forro, Sesgos], unidad_medida)`. Reemplaza y unifica consumos textiles y no textiles.
- **ESTIMACION_CONSUMO:** `(id_estimacion PK, id_consumo_material FK, rol_evaluador [Creativo, Tecnico, Trazador, Contramuestra], talla, consumo_solido, consumo_mod_arte, consumo_ubic_trazo, observaciones)`. Permite el versionamiento de un mismo material en distintas fases del flujo de trabajo.
- **MEDICION:** `(id_medicion PK, id_referencia FK, fase_numero, fecha_medicion, comentarios)`.
- **HISTORIAL_FASES_WORKFLOW:** `(id_historial PK, id_referencia FK, fase [Corte, Confección, Diseño Técnico, etc.], id_empleado_encargado FK, fecha_ingreso, fecha_salida, estado [En Proceso, Terminado, Pausado], comentarios)`.
- **COMPOSICION_MARQUILLA:** `(id_composicion PK, id_referencia FK, tipo [muestra/produccion], desc_USA_UK, fiber_composition, woven_knitted, inside, include, observaciones)`.
- **CUIDADOS_PRENDA:** `(id_cuidado PK, id_referencia FK, categoria_cuidado [Lavado, Desmanche, Secado, Planchado], instruccion_texto, url_icono)`.
- **CONTRAMUESTRA:** `(id_contramuestra PK, id_referencia FK, codigo_OT, nota_fabricacion_SAP, talla, color_contramuestra, fecha_traslado_SAP, fecha_despacho_ZF)`.
- **PROCESO_EXTERNO:** `(id_proceso PK, id_referencia FK, id_proveedor FK, descripcion_proceso, costo)`.
- **UNIDADES_PRODUCCION:** `(id_produccion PK, id_referencia FK, talla, cantidad_vendida)`.
- **NOVEDADES_CALIDAD:** `(id_novedad PK, id_referencia FK, fase_detectada, area_afectada, clasificacion_hallazgo, descripcion_problema, accion_correctiva)`.
- **INSUMO_NO_TEXTIL:** `(id_insumo PK, codigo_insumo, descripcion, unidad_medida [Unidad, Par, Set])`.
- **CONSUMO_INSUMO:** `(id_consumo_insumo PK, id_referencia FK, id_insumo FK, cantidad_usada)`.

## 4. Identificación de Relaciones
- Una **COLECCION** puede tener múltiples **REFERENCIAS** (1:N).
- Una **REFERENCIA** involucra a varios **DISEÑADORES** a través de diferentes roles (Creativo, Técnico).
- Una **REFERENCIA** consume muchas **TELAS** (y una tela se usa en muchas referencias). Se gestiona con la tabla intermedia **CONSUMO_TELA** (N:M).
- Una **REFERENCIA** pasa por varias fases de **MEDICION** (1:N).
- Una **REFERENCIA** requiere registros de **COMPOSICION_MARQUILLA** y **CUIDADOS_PRENDA** para sus etiquetas (1:N).
- Una **REFERENCIA** puede dividirse en múltiples **CONTRAMUESTRAS** (identificadas con OTs) (1:N).
- Una **REFERENCIA** puede ser enviada a diferentes **PROCESOS_EXTERNOS** (bordados, lavados, etc.) (1:N).
- Una **REFERENCIA** puede presentar múltiples **NOVEDADES_CALIDAD** durante su producción (1:N).
- Una **REFERENCIA** agrupa diferentes cantidades de **UNIDADES_PRODUCCION** segregadas por talla (1:N).
- Una **REFERENCIA** consume varios **INSUMOS_NO_TEXTILES** gestionados por la tabla **CONSUMO_INSUMO** (N:M).

## 5. Manejo Adecuado de Imágenes (Archivos Multimedia)
En la hoja de cálculo, las fotos se pegan en celdas. En la nueva aplicación web, el manejo debe ser radicalmente distinto para asegurar rendimiento:

1. **Almacenamiento en la Nube (Object Storage):** Los archivos físicos de las fotos de prendas y telas no deben almacenarse dentro de la base de datos relacional (BLOB), ya que la ralentizarían. Se sugiere integrar servicios como AWS S3, Google Cloud Storage o Firebase Storage.
2. **Registro de Rutas (URLs):** En las tablas de la base de datos (por ejemplo en `REFERENCIA` y `TELA`), solo se almacenará la ruta o URL pública/firmada de la imagen alojada en el Storage (`url_imagen_principal`).
3. **Estandarización y Compresión:** Al momento de que el usuario cargue la foto de la prenda o la tela desde la aplicación web, el backend debe comprimirla automáticamente (ej. a formato WebP o JPEG de calidad web) y redimensionarla (ej. max 800x800px) para que las vistas de catálogo en la app carguen rápido.
4. **Galería por Referencia:** En el futuro, se recomienda crear una tabla `IMAGEN_REFERENCIA (id_imagen, id_referencia, url, tipo [frontal, posterior, detalle, bordado, contramuestra])` en lugar de una sola columna. Esto permite adjuntar múltiples fotos que capturen el detalle de la alta costura sin afectar el modelo de datos.

---
## 6. Diagrama Entidad-Relación (ER)
Se generó el siguiente diagrama para representar la arquitectura estructurada de la información.

![Diagrama ER Base de Datos Colecciones](file:///C:/Users/jchacon/.gemini/antigravity/brain/86c3da5f-18ff-43fb-be2e-4e89f5152179/er_diagram_collections_1776970601615.png)
