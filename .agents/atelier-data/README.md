# AtelierData Agent v2.0: Especialista en Análisis de Datos y Manufactura Textil

Bienvenido al espacio de conocimiento y configuración de **AtelierData**, un agente de Inteligencia Artificial altamente especializado en el análisis de datos de producción textil, segmentación de colecciones de moda y optimización de recursos.

## Propósito del Agente

Este agente ha sido diseñado como un "cerebro analítico" para integrarse en el entorno de desarrollo y colaborar en la toma de decisiones críticas de la colección, como:
- Control de calidad y consistencia de las bases de datos de colecciones (Matriz JO).
- Análisis profundo de curvas de ventas por tallas (XS-XL y 0-12).
- Medición de la eficiencia de consumo de telas entre los equipos de diseño y trazadores.
- Identificación de cuellos de botella y análisis de rechazos en la planta de confección.
- Validación automatizada de 25 reglas de negocio.
- Comparación de versiones de colección entre temporadas.

---

## Estructura de Documentación (Los 8 Pilares)

Este directorio contiene las bases cognitivas y de comportamiento del agente divididas en ocho pilares:

### Pilares Fundamentales

| # | Archivo | Contenido |
|---|---------|-----------|
| 1 | `1_identidad_rol.md` | Personalidad, tono, 5 modos de operación, protocolo de modificaciones Excel |
| 2 | `2_caja_herramientas.md` | Stack tecnológico completo: Pandas, DuckDB, Openpyxl, XlsxWriter, RapidFuzz, Logging |
| 3 | `3_contexto_negocio.md` | Glosario textil, mapeo completo A-HD con tipos de dato, 25 reglas de negocio |
| 4 | `4_metodologia_trabajo.md` | Workflow de 4 fases con sub-etapas, árbol de decisiones, checklist pre-reporte |

### Pilares Avanzados (Nuevos en v2.0)

| # | Archivo | Contenido |
|---|---------|-----------|
| 5 | `5_reglas_validacion.md` | Sistema de validación por 4 capas, scoring de salud de datos, detección de anomalías |
| 6 | `6_patrones_codigo.md` | Templates Python/DuckDB reutilizables para las 4 fases con manejo de errores |
| 7 | `7_integracion_sistema.md` | Conexión con ProjectJO (React), .antigravity, APIs, estructura de archivos |
| 8 | `8_gestion_sesiones.md` | Memoria entre sesiones, tracking de análisis, aprendizaje de patrones |

### Scripts Ejecutables

| Script | Fase | Comando |
|--------|------|---------|
| `scripts/auditoria_calidad.py` | FASE 1 | `python scripts/auditoria_calidad.py <archivo>` |
| `scripts/segmentacion_tallas.py` | FASE 2 | `python scripts/segmentacion_tallas.py <archivo>` |
| `scripts/eficiencia_textil.py` | FASE 3 | `python scripts/eficiencia_textil.py <archivo>` |
| `scripts/reporte_premium.py` | FASE 4 | `python scripts/reporte_premium.py <archivo>` |

---

## Capacidades Clave

### 5 Modos de Operación
| Modo | Activación | Descripción |
|------|-----------|-------------|
| **Auditor** | `audita`, `revisa calidad` | Solo Fase 1: perfilado y validación |
| **Analista** | `analiza`, `segmenta` | Fases 1-3: datos, segmentación, eficiencia |
| **Reportero** | `reporte completo`, `informe` | Fases 1-4: reporte ejecutivo premium |
| **Comparador** | `compara`, `diferencia` | Compara 2 archivos, detecta cambios |
| **Escritor** | `modifica celda`, `actualiza` | Escritura controlada en Excel con bitácora |

### 25 Reglas de Negocio Automatizadas
Cubriendo estados, transiciones, exclusividad, consumos de tela, fechas y catálogos.

### Sistema de Validación por 4 Capas
Estructural → Referencial → Reglas de Negocio → Anomalías Estadísticas

### Score de Salud de Datos (0-100)
Cuantifica la calidad de los datos para decidir si proceder con análisis profundo.

---

## Cómo Invocar a AtelierData

- *"AtelierData, audita la matriz de la colección WS27..."*
- *"Analiza la eficiencia textil de PROTOTIPO V.01.xlsx..."*
- *"Genera un reporte ejecutivo de la colección actual..."*
- *"Compara la versión actual de la matriz con la de la semana pasada..."*
- *"Modifica la celda D15 en MATRIZ para asignar el código PT-02815..."*

---

## Workflow de 4 Fases

```
[Datos Crudos] → FASE 1: Auditoría → FASE 2: Segmentación → FASE 3: Eficiencia Textil → FASE 4: Reporte Premium
```

Cada fase produce artefactos en `/dist/`:
- **FASE 1**: `auditoria_*.md` + score de salud
- **FASE 2**: `segmentacion_*.md` + curvas de tallas
- **FASE 3**: `eficiencia_textil_*.md` + proyecciones de ahorro
- **FASE 4**: `reporte_premium_*.md` + gráficos PNG en `/dist/graficos/`

---

## Dependencias

```
pandas>=2.0.0, numpy>=1.24.0, duckdb>=0.9.0, openpyxl>=3.1.0
matplotlib>=3.7.0, seaborn>=0.12.0, xlsxwriter>=3.1.0, rapidfuzz>=3.0.0
```
