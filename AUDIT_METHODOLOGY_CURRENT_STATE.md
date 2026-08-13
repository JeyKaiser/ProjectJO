# Estado actual de la metodología de evaluación técnica del proyecto

> **Fecha del informe:** 2026-08-13
> **Alcance:** Inventario estructurado de TODO lo que el proyecto contempla hoy
> como metodología de evaluación/auditoría técnica. No se añaden criterios nuevos,
> no se recomiendan cambios, no se aplican mejoras. Solo se documenta lo que existe.

---

## Tabla de contenidos

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Inventario de fuentes analizadas](#2-inventario-de-fuentes-analizadas)
3. [Metodología actual reconstruida](#3-metodología-actual-reconstruida)
4. [Frentes contemplados](#4-frentes-contemplados)
5. [Análisis detallado por frente](#5-análisis-detallado-por-frente)
6. [Matriz de cobertura](#6-matriz-de-cobertura)
7. [Criterios explícitamente contemplados](#7-criterios-explícitamente-contemplados)
8. [Criterios mencionados pero no verificables](#8-criterios-mencionados-pero-no-verificables)
9. [Dependencias externas](#9-dependencias-externas)
10. [Vacíos de cobertura](#10-vacios-de-cobertura)
11. [Duplicidades y solapamientos](#11-duplicidades-y-solapamientos)
12. [Limitaciones metodológicas](#12-limitaciones-metodologicas)
13. [Fortalezas actuales](#13-fortalezas-actuales)
14. [Conclusión](#14-conclusion)
15. [Inventario estructurado para comparación futura](#15-inventario-estructurado-para-comparacion-futura)

---

# 1. Resumen ejecutivo

El proyecto contiene **dos sistemas analíticos diferenciales** que no conforman
una metodología unificada de evaluación técnica:

1. **AtelierData** (`.opencode/agent/atelier-data.md` + `.agents/atelier-data/`):
   agente opencode especializado en **análisis de datos textileriales de
   colecciones de moda** sobre archivos CSV/Excel (Matriz JO). Opera mediante un
   workflow de 4 fases (Auditoría → Segmentación → Eficiencia Textil → Reporte
   Premium) con 25 reglas de negocio, 4 capas de validación y un score de salud
   de datos (0-100).

2. **.antigravity** (`.antigravity/`): sistema pedagógico de aprendizaje
   frontend (React/Vite) con plantillas de auditoría **frontend** (arquitectura,
   performance, mantenibilidad, estructura), análisis de dependencias, render,
   CSS y evaluación de seniority. NO es un agente opencode; es un sistema de
   mentoría técnica.

**Amplitud:** La metodología es **estrecha y especializada**. Cubre con
profundidad el dominio textil (datos) y el dominio frontend (código React), pero
**no contempla** _backend, base de datos, seguridad, autenticación, APIs,
CI/CD, infraestructura, observabilidad, resiliencia, backup, continuidad,
licenciamiento, cumplimiento, ERP/SAP/integraciones corporativas, IoT/OT ni
gobernanza técnica_.

**Fortalezas:** Profundidad alta en calidad de datos textiler (25 reglas con
código de verificación), trazabilidad de origen de datos, score cuantitativo de
salud, scripts ejecutables reproducibles, y un catálogo de frentes frontend con
plantillas de auditoría estructuradas.

**Vacíos principales:** No existe metodología para auditar la aplicación como
sistema software corporativo completo. No hay evaluación de seguridad, bases de
datos, infraestructura, CI/CD, disponibilidad, ni integraciones reales con
SAP/ERP. La metodología asume operación 100% offline sin dependencias externas.

**Confiabilidad para auditoría corporativa/industrial:** **Baja**. La metodología
actual es adecuada para auditar la calidad de los datos de colecciones textlines y
para evaluar el código frontend desde una perspectiva pedagógica, pero **no
constituye una metodología de auditoría técnica empresarial completa**.

---

# 2. Inventario de fuentes analizadas

| Fuente | Ubicación | Tipo | Propósito | Relevancia |
|---|---|---|---|---|
| Definición del agente atelier-data | `.opencode/agent/atelier-data.md` | Config de agente opencode | Definir identidad, triggers, workflow 4 fases, reglas, modos | **Alta** |
| Pilar 1: Identidad y rol | `.agents/atelier-data/1_identidad_rol.md` | Documento de agente | Personalidad, 5 modos, protocolo Excel, escalamiento | **Alta** |
| Pilar 2: Caja de herramientas | `.agents/atelier-data/2_caja_herramientas.md` | Documento de agente | Stack Python (pandas, DuckDB, openpyxl, etc.) | **Media** |
| Pilar 3: Contexto de negocio | `.agents/atelier-data/3_contexto_negocio.md` | Documento de agente | Glosario textil, mapeo columnas A-HD, 25 reglas R01-R25 | **Crítica** |
| Pilar 4: Metodología de trabajo | `.agents/atelier-data/4_metodologia_trabajo.md` | Documento de agente | Workflow 4 fases con sub-etapas, checklist, árbol de decisiones | **Crítica** |
| Pilar 5: Reglas de validación | `.agents/atelier-data/5_reglas_validacion.md` | Documento de agente | 4 capas de validación (C1-C4), scoring, anomalías estadísticas | **Crítica** |
| Pilar 6: Patrones de código | `.agents/atelier-data/6_patrones_codigo.md` | Documento de agente | Templates Python/DuckDB reutilizables para las 4 fases | **Alta** |
| Pilar 7: Integración sistema | `.agents/atelier-data/7_integracion_sistema.md` | Documento de agente | Conexión con ProjectJO, .antigravity, formatos de archivo | **Media** |
| Pilar 8: Gestión sesiones | `.agents/atelier-data/8_gestion_sesiones.md` | Documento de agente | Memoria entre sesiones, análisis comparativo, patrones históricos | **Media** |
| Script auditoria_calidad.py | `.agents/atelier-data/scripts/auditoria_calidad.py` | Script Python | Implementa FASE 1: R07, R02, R09, nulos, score | **Alta** |
| Script segmentacion_tallas.py | `.agents/atelier-data/scripts/segmentacion_tallas.py` | Script Python | Implementa FASE 2: curva tallas, segmentación por línea | **Alta** |
| Script eficiencia_textil.py | `.agents/atelier-data/scripts/eficiencia_textil.py` | Script Python | Implementa FASE 3: ahorro diseñador vs trazador | **Alta** |
| Script reporte_premium.py | `.agents/atelier-data/scripts/reporte_premium.py` | Script Python | Implementa FASE 4: reporte consolidado | **Alta** |
| README atelier-data | `.agents/atelier-data/README.md` | Documento | Resumen del agente, estructura, dependencias | **Baja** |
| AGENTS.md raíz | `AGENTS.md` | Índice | Inventario de agentes/skills/sistemas | **Baja** |
| README .antigravity | `.antigravity/README.md` | Documento | Sistema de aprendizaje frontend, estructura, reglas | **Alta** |
| Agente learning architect | `.antigravity/agents/projectjo-learning-architect.md` | Definición de agente | Mentor frontend, 6 modos, reglas fundamentales | **Alta** |
| Architecture map | `.antigravity/context/architecture-map.md` | Contexto | Mapa del repositorio, problemas identificados | **Media** |
| Stack analysis | `.antigravity/context/stack-analysis.md` | Contexto | Stack React 19/Vite, riesgos técnicos | **Media** |
| Business domain | `.antigravity/context/business-domain.md` | Contexto | Dominio de temperaturas, entidades conceptuales | **Media** |
| Project risks | `.antigravity/context/project-risks.md` | Contexto | 5 riesgos identificados con prioridades | **Alta** |
| Frontend audit template | `.antigravity/reports/technical-audits/frontend-audit-template.md` | Plantilla de auditoría | Criterios de auditoría frontend | **Alta** |
| Architecture audit template | `.antigravity/reports/technical-audits/architecture-audit-template.md` | Plantilla de auditoría | Criterios de auditoría arquitectónica | **Alta** |
| Performance audit template | `.antigravity/reports/technical-audits/performance-audit-template.md` | Plantilla de auditoría | Criterios de auditoría de rendimiento frontend | **Alta** |
| Maintainability audit template | `.antigravity/reports/technical-audits/maintainability-audit-template.md` | Plantilla de auditoría | Criterios de mantenibilidad | **Alta** |
| Structure analysis | `.antigravity/analysis/repo-analysis/structure-analysis.md` | Criterio de análisis | Criterios para analizar estructura del repo | **Media** |
| Render analysis | `.antigravity/analysis/performance-analysis/render-analysis.md` | Criterio de análisis | Detectar renders innecesarios, memoización | **Media** |
| Circular risk analysis | `.antigravity/analysis/dependency-analysis/circular-risk-analysis.md` | Criterio de análisis | Detectar dependencias circulares | **Media** |
| Weakness detection | `.antigravity/engines/weakness-engine/weakness-detection.md` | Motor de detección | Categorías de debilidades técnicas | **Media** |
| Scoring system | `.antigravity/engines/scoring-engine/scoring-system.md` | Motor de scoring | Categorías y escala de evaluación (0-100) | **Media** |
| Frontend seniority assessment | `.antigravity/evaluations/assessments/frontend-seniority-assessment.md` | Evaluación | Niveles de seniority frontend | **Baja** |
| Config opencode.json | `.config/opencode/opencode.json` | Configuración | Plugin, MCP supabase, skills paths | **Baja** |
| Plan de mejoramiento | `plans/PLAN_MEJORAMIENTO_GESTION_COLECCIONES_JO.md` | Planificación | Análisis de estructura actual de Excel, propuesta de normalización | **Media** |
| eslint.config.js | `eslint.config.js` | Configuración | Reglas ESLint (react-hooks, react-refresh, js recommended) | **Media** |
| Tests state-machine | `src/state-machine/__tests__/transitions.test.js` | Test | Tests de transiciones de estado con vitest | **Media** |
| Supabase function | `supabase/functions/google-sheets/index.ts` | Edge function | Integración Google Sheets vía JWT | **Baja** |
| package.json | `package.json` | Configuración | Scripts: dev, build, lint, preview. No test script | **Baja** |

---

# 3. Metodología actual reconstruida

La metodología actual se divide en **dos flujos independientes**:

## Flujo A: Análisis de datos textileriales (AtelierData)

```
[Archivo CSV/Excel] → FASE 1: Auditoría → FASE 2: Segmentación → FASE 3: Eficiencia Textil → FASE 4: Reporte Premium
```

**Paso 1:** Cargar archivo CSV/Excel con detección automática de encabezados
(`header=1` para Excel, `skiprows` para CSV).

**Paso 2:** Normalizar tipos de dato (tallas a int, SI/NO a upper, catálogos a
strip+upper, fechas a datetime).

**Paso 3 (FASE 1 - Auditoría):**
- Capa C1 Estructural: verificar tipos de dato, rangos, nulos, filas duplicadas
  (validaciones C1-01 a C1-12).
- Capa C2 Referencial: validar catálogos contra PARAMETROS, exclusividad DT/DU,
  duplicidad de PT (C2-01 a C2-08).
- Capa C3 Negocio: aplicar las 25 reglas R01-R25 (estados, consumos, fechas,
  exclusividad).
- Capa C4 Estadística: detectar outliers (z-score > 2), patrones de error
  (copia-pega, placeholders, fechas futuras).
- Calcular score de salud (0-100): -5 por crítica, -3 por alta, -1 por media.
- Si score < 50: detener y reportar.

**Paso 4 (FASE 2 - Segmentación):**
- Curva de tallas (numérico 0-12 y alfabético XS-XL), porcentajes.
- Carga de trabajo por diseñador/modista, detección de sobrecarga > 15
  referencias.
- Segmentación por línea/sublínea: total refs, unidades, tasa de aprobación.
- Distribución por estado, referencias estancadas.

**Paso 5 (FASE 3 - Eficiencia Textil):**
- Ahorro = Consumo Diseñador - Consumo Trazador.
- % ahorro y proyección total (ahorro × unidades).
- Impacto de catálogos especiales (Mod Arte, Ubi Trazo, All Over) vs sólidos.
- Análisis por base textil, auditoría de anchos útiles.

**Paso 6 (FASE 4 - Reporte Premium):**
- Resumen ejecutivo 3-5 bullets.
- Alertas GitHub: `[!IMPORTANT]`, `[!WARNING]`, `[!TIP]`, `[!NOTE]`.
- Tablas con separadores de miles.
- Trazabilidad: archivo origen, rango, fecha.
- Checklist pre-reporte: 8 verificaciones.

## Flujo B: Evaluación de código frontend (.antigravity)

```
[Repositorio React] → Contexto → Análisis → Evaluación → Reporte de auditoría
```

**Paso 1:** Leer contexto (architecture-map, stack-analysis, business-domain,
project-risks).

**Paso 2:** Seleccionar tipo de auditoría:
- **Frontend Audit**: estructura, calidad implementación, arquitectura, UX
  técnica, riesgos.
- **Architecture Audit**: separación responsabilidades, escalabilidad, god
  components, estado.
- **Performance Audit**: renders innecesarios, memoización, bundle, context
  providers.
- **Maintainability Audit**: legibilidad, tamaño archivos, repetición lógica,
  separación UI/dominio.

**Paso 3:** Aplicar preguntas guía del template seleccionado. Señales positivas
vs riesgos.

**Paso 4:** Generar reporte: diagnóstico, hallazgos (críticos/medios/menores),
plan de acción.

**Paso 5 (opcional):** Evaluar seniority: Junior/Mid/Senior según criterio
técnico.

## Flujo C: Calidad de código (ESLint)

```
[Código JS/JSX] → eslint . → hallazgos de linting
```

Configuración: `@eslint/js` recommended + `react-hooks` + `react-refresh`. No hay
`test` script en `package.json`.

---

# 4. Frentes contemplados

| ID | Frente | Estado | Descripción | Evidencia esperada | Método de verificación |
|---|---|---|---|---|---|
| F01 | Calidad de datos textileriales (Matriz JO) | **CONTEMPLADO Y VERIFICABLE** | 25 reglas de negocio, 4 capas de validación, score de salud | Archivos CSV/Excel de colecciones | Scripts Python (auditoria_calidad.py), DuckDB, pandas |
| F02 | Segmentación de colecciones | **CONTEMPLADO Y VERIFICABLE** | Curva de tallas, carga de trabajo, por línea/sublínea | Datos agregados por categoría | Scripts Python (segmentacion_tallas.py) |
| F03 | Eficiencia textileria | **CONTEMPLADO Y VERIFICABLE** | Ahorro consumos diseñador vs trazador, impacto catálogos | Métricas de consumo en metros | Scripts Python (eficiencia_textil.py) |
| F04 | Reportes ejecutivos premium | **CONTEMPLADO Y VERIFICABLE** | Resumen ejecutivo, alertas, tablas, graficación | Archivos Markdown en /dist/ | Scripts Python (reporte_premium.py) |
| F05 | Análisis comparativo entre colecciones | **CONTEMPLADO PARCIALMENTE** | Comparar dos versiones, detectar cambios | Dos archivos de colección | Protocolo descrito en Pilar 8, sin script implementado |
| F06 | Arquitectura frontend | **CONTEMPLADO PARCIALMENTE** | Separación de responsabilidades, god components, escalabilidad | Código React (src/) | Plantillas de auditoría (.antigravity), sin script automatizado |
| F07 | Estructura del repositorio | **CONTEMPLADO PARCIALMENTE** | Organización de carpetas, naming consistency, profundidad | Estructura de directorios | Criterios en structure-analysis.md, sin automatización |
| F08 | Performance frontend | **MENCIONADO PERO NO VERIFICABLE** | Renders innecesarios, memoización, bundle size | Métricas de render, bundle analysis | Criterios descritos en templates, sin herramientas de profiling |
| F09 | Mantenibilidad frontend | **CONTEMPLADO PARCIALMENTE** | Legibilidad, tamaño archivos, repetición lógica | Código fuente, tamaño de componentes | Template de auditoría, sin métricas automatizadas |
| F10 | Calidad de código JS/JSX | **CONTEMPLADO Y VERIFICABLE** | Linting con eslint-plugin-react-hooks, react-refresh | Output de ESLint | Comando `npm run lint` |
| F11 | Testing de state machine | **CONTEMPLADO PARCIALMENTE** | Tests de transiciones de estado con vitest | Resultados de tests vitest | 2 archivos de test existen, pero no hay `npm test` script |
| F12 | CSS y estilos | **MENCIONADO PERO NO VERIFICABLE** | CSS monolítico, design tokens, responsividad | Análisis del archivo index.css | Criterios descritos en analysis, sin automatización |
| F13 | Dependencias circulares | **MENCIONADO PERO NO VERIFICABLE** | Imports cruzados, módulos mutuamente dependientes | Grafo de dependencias | Criterio descrito, sin herramienta de análisis |
| F14 | Riesgos del proyecto | **CONTEMPLADO PARCIALMENTE** | 5 riesgos: monolíticos, CSS, lógica en UI, prop drilling, separación de capas | Documento de riesgos | Enumerados en project-risks.md, no se verifica automáticamente |
| F15 | Integración con Supabase | **MENCIONADO PERO NO VERIFICABLE** | MCP supabase config en opencode.json, edge function Google Sheets | Conexión activa, datos en Supabase | Configurada pero no se audita |
| F16 | Seguridad y autenticación | **NO CONTEMPLADO** | — | — | — |
| F17 | Base de datos | **NO CONTEMPLADO** | — | — | — |
| F18 | Backend / APIs | **NO CONTEMPLADO** | — | — | — |
| F19 | CI/CD | **NO CONTEMPLADO** | — | — | — |
| F20 | Infraestructura | **NO CONTEMPLADO** | — | — | — |
| F21 | Observabilidad / Monitoreo | **NO CONTEMPLADO** | — | — | — |
| F22 | Disponibilidad / Resiliencia | **NO CONTEMPLADO** | — | — | — |
| F23 | Backup / Recuperación | **NO CONTEMPLADO** | — | — | — |
| F24 | Continuidad de negocio | **NO CONTEMPLADO** | — | — | — |
| F25 | Licenciamiento | **NO CONTEMPLADO** | — | — | — |
| F26 | Cumplimiento normativo | **NO CONTEMPLADO** | — | — | — |
| F27 | Integración SAP/ERP | **NO CONTEMPLADO** | — | — | — |
| F28 | IoT / OT industrial | **NO CONTEMPLADO** | — | — | — |
| F29 | Gobernanza técnica | **NO CONTEMPLADO** | — | — | — |
| F30 | Concurrencia / consistencia datos | **NO CONTEMPLADO** | — | — | — |

---

# 5. Análisis detallado por frente

## F01 — Calidad de datos textileriales (Matriz JO)

### Qué contempla

- 25 reglas de negocio (R01-R25): estados y transiciones (R01-R03, R07-R08),
  exclusividad y asignación (R09-R14), consumos de tela (R15-R20), fechas
  (R21-R25).
- 4 capas de validación: C1 Estructural (tipos, rangos, nulos, duplicados — 12
  validaciones C1-01 a C1-12), C2 Referencial (catálogos PARAMETROS,
  exclusividad, duplicidad — 8 validaciones C2-01 a C2-08), C3 Negocio
  (implementación R01-R25), C4 Estadística (outliers z-score > 2, patrones de
  error: copia-pega, placeholders, fechas futuras).
- Score de salud de datos (0-100): -5 por crítica, -3 por alta, -1 por media,
  -0.5 por cada 10% de nulos en columnas críticas.
- Mapeo completo de columnas A-HD (211 columnas) con tipos de dato y valores
  válidos.
- Manejo inteligente de NaN por tipo de columna.

### Qué evidencia busca

- Archivos CSV/Excel de colecciones (`PROTOTIPO V.01.xlsx`, exportaciones de
  Google Sheets).
- Hoja PARAMETROS con catálogos maestros (diseñadores, modistas, bases
  textinizadas, líneas, sublíneas, estados).
- Valores de columnas específicas (Status, Código PT, Código MD, tallas,
  consumos, fechas).

### Cómo lo verifica

- Scripts Python ejecutables (`auditoria_calidad.py`) que cargan el archivo,
  normalizan tipos, aplican reglas R02/R07/R09 e imprimen reporte.
- Funciones Python en Pilar 6 (`validar_reglas_negocio()`,
  `perfilar_dataframe()`, `detectar_outliers_consumo()`) con código completo.
- Consultas DuckDB predefinidas (5 queries en Pilar 6 sección 7).
- Protocolo de 4 capas progresivas descrito en Pilar 5.

### Nivel de profundidad

**Alto** — 25 reglas formales con código de implementación, 4 capas de
validación, scoring cuantitativo, mapeo de 211 columnas.

### Limitaciones

- Solo aplica a datos textileriales de la Matriz JO. No audita la calidad del
  código de la aplicación.
- Las reglas R03, R04, R05, R06, R08, R10-R14, R15-R20, R21-R25 están definidas
  en el Pilar 3 y Pilar 5 pero **solo R02, R07 y R09 están implementadas en el
  script `auditoria_calidad.py`**. El Pilar 6 contiene código para R01, R02, R04,
  R05, R06, R07, R09 pero no todas están en el script ejecutable.
- No valida integridad entre colecciones distintas (solo intracolección).
- No detecta errores de encoding en CSV automáticamente más allá de intentar
  UTF-8/Latin-1.

### Riesgos de la metodología

- Falsos negativos: reglas definidas pero no implementadas en scripts ejecutables
  (R03, R10-R14, R15-R20 excepto R19 parcial, R21-R25).
- Falsos positivos: mapeo flexible de columnas puede asociar incorrectamente
  columnas con nombres similares.
- No detecta errores de contenido semántico (ej: un consumo de 999 m que pasa
  validación de rango si es < 3.0).

---

## F02 — Segmentación de colecciones

### Qué contempla

- Curva de tallas: numérico (0-12) y alfabético (XS-XL), porcentajes de
  participación.
- Detección de tallas con < 5% (baja demanda).
- Carga de trabajo por diseñador/modista: referencias asignadas y tiempo total
  estimado.
- Detección de sobrecarga > 15 referencias por persona.
- Segmentación por línea/sublínea: total referencias, unidades, consumo promedio,
  tasa de aprobación.
- Distribución por estado y tiempo promedio por etapa.

### Qué evidencia busca

- Columnas de tallas (CY-DJ), TOTAL (DK), Diseñador (L), Modista (N, EN), Línea
  (P), Sublinea (Q), Status (K), Tiempo confección (EU), Dificultad (BH, BI).

### Cómo lo verifica

- Script `segmentacion_tallas.py` (implementa curva de tallas y segmentación por
  línea).
- Funciones Python en Pilar 6: `analizar_curva_tallas()`,
  `analizar_carga_trabajo()`.

### Nivel de profundidad

**Medio** — el script ejecutable solo implementa curva de tallas y por línea.
Carga de trabajo, tiempos por dificultad y detección de cuellos de botella están
descritos pero no implementados en el script.

### Limitaciones

- No detecta referencias estancadas en una etapa por más de X días (mencionado en
  Pilar 4 pero sin implementación).
- No calcula tasa de aprobación por línea (mencionado pero no implementado).
- No detecta talla dominante atípica (> 60% del total) en el script ejecutable.

### Riesgos

- Falsos negativos en cuellos de botella: el análisis de tiempos está descrito
  pero no automatizado.

---

## F03 — Eficiencia textileria

### Qué contempla

- Ahorro lineal = Consumo Diseñador - Consumo Trazador.
- % de ahorro y proyección total (ahorro × unidades TOTAL).
- Impacto de catálogos especiales (Mod Arte, Ubi Trazo, All Over) vs sólidos.
- Análisis por base textil: consumo promedio, ancho útil, desperdicio.
- Auditoría de anchos útiles: consistencia por base textil, anchos atípicos.
- Estimación de ahorro en USD (si costo por metro disponible).

### Qué evidencia busca

- Columnas de consumo (creativo 1/2/3, técnico sólido/Mod Arte/Ubi Trazo,
  trazador), TOTAL unidades, catálogos booleanos (AD, AE, AF), Base Textil (AC),
  Ancho tela (AB).

### Cómo lo verifica

- Script `eficiencia_textil.py` (implementa cálculo de ahorro y top 10).
- Funciones Python en Pilar 6: `calcular_eficiencia_textil()`,
  `analizar_impacto_catalogos()`.

### Nivel de profundidad

**Medio-Alto** — el script implementa comparación de consumos y ranking. El
análisis de catálogos especiales está implementado en Pilar 6 pero no en el
script ejecutable.

### Limitaciones

- No calcula ahorro en USD (requiere costo por metro, no disponible en el
  archivo).
- No analiza por base textil en el script ejecutable.
- No audita anchos útiles en el script ejecutable.

### Riesgos

- El cálculo del consumo del diseñador usa heurística (máximo entre todos los
  consumos disponibles), puede sobreestimar.
- Falsos positivos si el consumo del trazador no está en una columna
  identificable.

---

## F04 — Reportes ejecutivos premium

### Qué contempla

- Resumen ejecutivo 3-5 bullets con hallazgos de mayor impacto.
- Alertas GitHub: `[!IMPORTANT]`, `[!WARNING]`, `[!TIP]`, `[!NOTE]`.
- Árbol de decisiones para clasificar hallazgos por severidad.
- Tablas con separadores de miles y porcentajes formateados.
- Trazabilidad: archivo origen, rango de datos, fecha del análisis.
- Checklist pre-reporte: 8 verificaciones obligatorias.
- Anexo metodológico.

### Qué evidencia busca

- Resultados de FASE 1-3.

### Cómo lo verifica

- Script `reporte_premium.py` (genera reporte Markdown consolidado).
- Función `generar_reporte_ejecutivo()` en Pilar 6.

### Nivel de profundidad

**Alto** — estructura de reporte formal, alertas categorizadas, checklist de
calidad.

### Limitaciones

- El script ejecutable es simplificado respecto a la especificación del Pilar 4
  (no incluye árbol de decisiones completo).
- No genera gráficos PNG (mencionado en Pilar 2 pero no implementado en scripts).

### Riesgos

- Reporte puede omitir hallazgos que requieren el árbol de decisiones completo.

---

## F05 — Análisis comparativo entre colecciones

### Qué contempla

- Comparar dos versiones de una misma colección.
- Detectar referencias nuevas, eliminadas y modificadas.
- Comparar scores de salud entre versiones.
- Alertar sobre nuevas violaciones introducidas y violaciones corregidas.
- Detección de tendencias entre colecciones (score salud, ahorro textil, tasa de
  rechazo, carga modista).
- Comparación de consumos históricos de referencias recurrentes.

### Qué evidencia busca

- Dos archivos de colección (versión anterior y actual).
- Historial de sesiones en `.atelier_sessions.json`.

### Cómo lo verifica

- Protocolo descrito en Pilar 8, sección 5 (5 pasos).
- No existe script ejecutable para comparación.

### Nivel de profundidad

**Bajo** — solo descrito conceptualmente, sin implementación.

### Limitaciones

- No hay script automatizado.
- Requiere que el archivo de sesiones previas exista y esté actualizado.

### Riesgos

- No se puede ejecutar reproduciblemente sin implementación.

---

## F06 — Arquitectura frontend

### Qué contempla

- Separación de responsabilidades (UI vs lógica vs datos).
- Detección de god components.
- Acoplamiento entre capas.
- Modularidad y reutilización.
- Escalabilidad de la estructura.
- Routing y state management.
- Provider sizing.

### Qué evidencia busca

- Código fuente React (`src/`), estructura de carpetas, composición de
  componentes.

### Cómo lo verifica

- Plantilla `architecture-audit-template.md` con preguntas guía.
- Plantilla `frontend-audit-template.md` con criterios de arquitectura.
- Mapa arquitectónico en `architecture-map.md`.
- Riesgos identificados en `project-risks.md`.

### Nivel de profundidad

**Bajo-Medio** — plantillas con criterios cualitativos, sin automatización ni
métricas cuantitativas.

### Limitaciones

- No usa herramientas de análisis estático de arquitectura (dependency cruiser,
  madge, etc.).
- No mide complejidad ciclomática ni tamaño de componentes cuantitativamente.
- No hay script que automatice la auditoría.

### Riesgos

- Evaluación subjetiva dependiente del evaluador.
- Puede pasar desapercibido acoplamiento sutil entre módulos.

---

## F07 — Estructura del repositorio

### Qué contempla

- Claridad de carpetas.
- Separación de responsabilidades.
- Profundidad de jerarquías.
- Naming consistency.
- Escalabilidad estructural.
- Archivos gigantes.
- Crecimiento desordenado.

### Qué evidencia busca

- Estructura de directorios, nombres de archivos/carpetas.

### Cómo lo verifica

- Criterios en `structure-analysis.md`.
- Mapa arquitectónico en `architecture-map.md`.

### Nivel de profundidad

**Bajo** — criterios cualitativos, sin automatización.

### Limitaciones

- No mide profundidad de jerarquía numéricamente.
- No detecta archivos gigantes automáticamente.

### Riesgos

- Evaluación subjetiva.

---

## F08 — Performance frontend

### Qué contempla

- Renders innecesarios.
- Props recreadas, callbacks recreados.
- Memoización (React.memo, useMemo, useCallback).
- Listas grandes.
- Carga de rutas, bundle size.
- Context providers sobredimensionados.
- Cálculos costosos dentro del render.

### Qué evidencia busca

- Código de componentes, uso de hooks de optimización, tamaño del bundle.

### Cómo lo verifica

- Plantilla `performance-audit-template.md` con preguntas guía.
- Criterios en `render-analysis.md`.

### Nivel de profundidad

**Bajo** — solo menciones cualitativas, sin profiling ni métricas de rendimiento.

### Limitaciones

- No ejecuta la aplicación para medir renders reales.
- No mide bundle size automáticamente.
- No usa React DevTools Profiler.
- No mide Core Web Vitals.

### Riesgos

- No puede detectar problemas de performance que solo se manifiestan en runtime.
- Falsos negativos en memoización: puede recomendar memo donde no es necesario.

---

## F09 — Mantenibilidad frontend

### Qué contempla

- Legibilidad, tamaño de archivos.
- Composición, repetición de lógica.
- Consistencia de patrones.
- Claridad de nombres.
- Separación UI/dominio.
- Componentes gigantes, estilos globales frágiles.

### Qué evidencia busca

- Código fuente, tamaño de componentes, estructura CSS.

### Cómo lo verifica

- Plantilla `maintainability-audit-template.md`.
- Criterios en structure-analysis y dependency-analysis.

### Nivel de profundidad

**Bajo** — criterios cualitativos.

### Limitaciones

- No mide deuda técnica cuantitativamente.
- No cuenta líneas de código por componente automáticamente.
- No detecta duplicación de código automáticamente.

### Riesgos

- Evaluación subjetiva.

---

## F10 — Calidad de código JS/JSX

### Qué contempla

- Reglas ESLint: `@eslint/js` recommended (mejores prácticas JS).
- `eslint-plugin-react-hooks` (reglas de hooks de React).
- `eslint-plugin-react-refresh` (HMR para Vite).

### Qué evidencia busca

- Archivos `.js` y `.jsx`.

### Cómo lo verifica

- Comando `npm run lint` → ESLint.

### Nivel de profundidad

**Medio** — configuración ESLint activa con plugins de React.

### Limitaciones

- No hay `test` script en package.json.
- No hay typecheck (el proyecto usa JavaScript, no TypeScript).
- No hay Prettier configurado.
- No hay reglas de accesibilidad (eslint-plugin-jsx-a11y).

### Riesgos

- Falsos negativos en accesibilidad y buenas prácticas no cubiertas por ESLint.

---

## F11 — Testing de state machine

### Qué contempla

- Tests de transiciones de estado con vitest.
- Mock de servicios de Supabase.
- Validación de `transition()`, `isValidTransition()`, `getAvailableEvents()`.

### Qué evidencia busca

- Archivos en `src/state-machine/__tests__/`.

### Cómo lo verifica

- Existen 2 archivos de test: `transitions.test.js` (326 líneas),
  `alertService.test.js`.
- No hay `npm test` script en package.json.

### Nivel de profundidad

**Bajo** — tests existen pero no están integrados en el workflow de desarrollo.

### Limitaciones

- No hay script de test en package.json → no se ejecutan en CI.
- No hay cobertura de tests para componentes, páginas, hooks o contextos.
- No hay tests de integración ni e2e.

### Riesgos

- Tests pueden estar desactualizados o fallando sin que nadie lo sepa.

---

## F12 — CSS y estilos

### Qué contempla

- CSS monolítico (`index.css`).
- Design tokens, consistencia visual.
- Responsividad.
- Estilos frágiles (selectores globales, `!important`).

### Qué evidencia busca

- Archivo `src/index.css`, archivos de estilos.

### Cómo lo verifica

- Criterios descritos en `.antigravity` (css-monolith-analysis, project-risks,
  maintainability-audit-template).
- Sin automatización ni métricas.

### Nivel de profundidad

**Bajo** — solo menciones cualitativas.

### Limitaciones

- No mide tamaño del CSS ni duplicación de reglas.
- No verifica responsividad con herramientas (viewport testing, lighthouse).

### Riesgos

- Riesgos de CSS global frágil documentados pero no verificados.

---

## F13 — Dependencias circulares

### Qué contempla

- Imports cruzados.
- Módulos mutuamente dependientes.
- Capas que se importan entre sí.

### Qué evidencia busca

- Grafo de dependencias de módulos JS.

### Cómo lo verifica

- Criterio descrito en `circular-risk-analysis.md`.
- Sin herramienta de análisis (madge, dependency-cruiser, sonar).

### Nivel de profundidad

**Bajo** — solo descrito conceptualmente.

### Limitaciones

- No hay herramienta que detecte ciclos automáticamente.

### Riesgos

- Ciclos pueden existir sin ser detectados.

---

## F14 — Riesgos del proyecto

### Qué contempla

- 5 riesgos identificados: componentes monolíticos, CSS global frágil, lógica de
  dominio en UI, prop drilling excesivo, falta de separación de capas.

### Qué evidencia busca

- Documento `project-risks.md`.

### Cómo lo verifica

- Enumerados con prioridades en `project-risks.md`.
- No se verifica automáticamente contra el código.

### Nivel de profundidad

**Bajo** — catálogo estático, sin verificación.

### Limitaciones

- No se actualiza automáticamente con el estado del código.
- No hay validación de que los riesgos persisten o se mitigaron.

### Riesgos

- Riesgos pueden estar desactualizados.

---

## F15 — Integración con Supabase

### Qué contempla

- MCP supabase configurado en `opencode.json`.
- Edge function `google-sheets` para integración con Google Sheets vía JWT.

### Qué evidencia busca

- Configuración MCP, edge function en `supabase/functions/`.

### Cómo lo verifica

- No se audita su funcionamiento.
- No hay pruebas de conexión ni de los datos.

### Nivel de profundidad

**Bajo** — solo configuración, sin auditoría.

### Limitaciones

- Requiere credenciales y conexión a Supabase.

### Riesgos

- Integración puede estar rota o no desplegada.

---

# 6. Matriz de cobertura

| Área | Contemplada | Profundidad | Evidencia | Verificación real | Dependencias externas | Observaciones |
|---|---|---|---|---|---|---|
| Calidad de datos textiler | Sí | Alto | CSV/Excel | Scripts Python ejecutables | Archivos de colección | Solo Matriz JO, no audita código |
| Segmentación de colecciones | Sí | Medio | Datos agregados | Script parcial | Archivos de colección | Cuellos de botella no automatizados |
| Eficiencia textil | Sí | Medio-Alto | Métricas de consumo | Script ejecutable | Archivos de colección | Análisis de catálogos no en script |
| Reportes ejecutivos | Sí | Alto | Markdown en /dist/ | Script ejecutable | — | Gráficos PNG no implementados |
| Análisis comparativo | Parcial | Bajo | Conceptual | Sin script | Archivos de sesiones previas | No reproducible |
| Arquitectura frontend | Parcial | Bajo-Medio | Plantillas | Manual, sin automatización | — | Subjetivo |
| Estructura de repositorio | Parcial | Bajo | Criterios | Manual | — | Subjetivo |
| Performance frontend | Mencionado | Bajo | Conceptual | Sin profiling | Requiere runtime | No medible estáticamente |
| Mantenibilidad frontend | Parcial | Bajo | Plantillas | Manual | — | Sin automatización |
| Calidad código JS/JSX | Sí | Medio | ESLint | `npm run lint` | — | Sin typecheck ni Prettier |
| Testing state machine | Parcial | Bajo | vitest | Tests existen, no integrados | — | Sin `npm test` |
| CSS y estilos | Mencionado | Bajo | Conceptual | Manual | — | Sin automatización |
| Dependencias circulares | Mencionado | Bajo | Conceptual | Sin herramienta | — | Sin madge/dependency-cruiser |
| Riesgos del proyecto | Parcial | Bajo | Documento | Enumerado, no verificado | — | No automatizado |
| Negocio y procesos | Parcial | Medio | Glosario, reglas | Reglas de negocio R01-R25 | — | Solo textiler, no de la app |
| Requerimientos | No | — | — | — | — | No se evalúa cumplimiento de requisitos |
| Backend / APIs | No | — | — | — | — | No existe backend |
| Base de datos | No | — | — | — | Supabase configurado pero no auditado | Sin metodología de auditoría DB |
| Seguridad | No | — | — | — | — | No contemplado |
| Autenticación | No | — | — | — | AuthContext existe, no se audita | NO CONTEMPLADO |
| Autorización | No | — | — | — | — | NO CONTEMPLADO |
| Integraciones | No | — | — | — | Google Sheets, SAP mencionados pero no auditados | NO CONTEMPLADO |
| Rendimiento (app completa) | No | — | — | — | Requiere ejecución | NO CONTEMPLADO |
| Escalabilidad | Mencionado | Bajo | Conceptual | — | — | Solo como concepto en .antigravity |
| CI/CD | No | — | — | — | — | NO CONTEMPLADO |
| DevOps | No | — | — | — | — | NO CONTEMPLADO |
| Infraestructura | No | — | — | — | — | NO CONTEMPLADO |
| Observabilidad | No | — | — | — | — | NO CONTEMPLADO |
| Logging | Mencionado | Bajo | Config de logging en scripts | Python logging en /dist/ | — | Solo para scripts Python, no para la app |
| Monitoreo | No | — | — | — | — | NO CONTEMPLADO |
| Disponibilidad | No | — | — | — | — | NO CONTEMPLADO |
| Resiliencia | No | — | — | — | — | NO CONTEMPLADO |
| Backup | No | — | — | — | — | NO CONTEMPLADO |
| Recuperación | No | — | — | — | — | NO CONTEMPLADO |
| Continuidad | No | — | — | — | — | NO CONTEMPLADO |
| Documentación | Parcial | Bajo | README, AGENTS.md, docs/ | Existe pero no se audita calidad | — | NO CONTEMPLADO como frente de evaluación |
| Dependencias (npm) | No | — | — | — | — | NO CONTEMPLADO |
| Licenciamiento | No | — | — | — | — | NO CONTEMPLADO |
| Cumplimiento | No | — | — | — | — | NO CONTEMPLADO |
| Auditoría (trazabilidad) | Sí | Medio | Bitácora, sesión JSON | Registro de cambios Excel | — | Solo para modificaciones en Excel |
| Trazabilidad | Sí | Medio | Origen de datos en reportes | Reporte incluye archivo origen | — | Solo en reportes textilers |
| Calidad de datos (general) | Sí | Alto | Score de salud | Scripts Python | — | Solo textiler, no datos de la app |
| ERP / SAP | No | — | — | — | SAP mencionado en glosario pero no auditado | NO CONTEMPLADO |
| IoT / OT | No | — | — | — | — | NO CONTEMPLADO |
| Gestión de errores | Parcial | Bajo | Validaciones detectan errores de datos | Scripts Python | — | Solo en datos textiler, no en código |
| Concurrencia | No | — | — | — | — | NO CONTEMPLADO |
| Consistencia de datos | Sí | Alto | Reglas R01-R25, validación 4 capas | Scripts Python | — | Solo textiler |
| Gobernanza técnica | No | — | — | — | — | NO CONTEMPLADO |

---

# 7. Criterios explícitamente contemplados

| ID/Nombre | Frente | Qué se verifica | Evidencia | Método | Profundidad |
|---|---|---|---|---|---|
| R01 | Calidad datos textil | PT no existe sin MD | Columnas C, D | Script `auditoria_calidad.py` + Pilar 6 | Alto |
| R02 | Calidad datos textil | APROBADO requiere PT | Columnas K, D | Script `auditoria_calidad.py` + Pilar 6 | Alto |
| R03 | Calidad datos textil | CANCELADO no debería tener PT | Columnas K, D | Pilar 3/5 (definido, implementado en Pilar 6) | Medio |
| R04 | Calidad datos textil | Entregable creativo OK → consumos > 0 | Columnas AS, consumos | Pilar 6 (implementado) | Medio |
| R05 | Calidad datos textil | Entregable técnico OK → consumos > 0 | Columnas AT, consumos | Pilar 6 (implementado) | Medio |
| R06 | Calidad datos textil | Entregable trazador OK → consumos > 0 | Columnas AU, consumos | Pilar 6 (implementado) | Medio |
| R07 | Calidad datos textil | TOTAL = suma de tallas | Columnas CY-DJ, DK | Script `auditoria_calidad.py` | Alto |
| R08 | Calidad datos textil | Unidades por talla corresponden a Tallaje declarado | Columnas S, CY-DJ | Pilar 3/5 (definido, no en script) | Bajo |
| R09 | Calidad datos textil | Exclusividad DT/DU | Columnas DT, DU | Script `auditoria_calidad.py` | Alto |
| R10 | Calidad datos textil | Variación color → ref variación no vacía | Columnas AG, AH | Pilar 3/5 (definido, no en script) | Bajo |
| R11 | Calidad datos textil | Mod Arte SI → Envío MOD arte OK | Columnas AE, AV | Pilar 3/5 (definido, no en script) | Bajo |
| R12 | Calidad datos textil | Bordado SI → descripción no vacía | Columnas AJ, AK | Pilar 3/5 (definido, no en script) | Bajo |
| R13 | Calidad datos textil | Semielaborado SI → descripción no vacía | Columnas AL, AM | Pilar 3/5 (definido, no en script) | Bajo |
| R14 | Calidad datos textil | Requiere muestra SI → es nueva | Columnas BR, I | Pilar 3/5 (definido, no en script) | Bajo |
| R15 | Calidad datos textil | Consumos no 0 para referencias activas | Columnas de consumo, K | Pilar 3/5 (definido, no en script) | Bajo |
| R16 | Calidad datos textil | Mod Arte SI + Ubi Trazo NO → consumo en col correcta | Columnas AE, AD, consumos | Pilar 3/5 (definido, no en script) | Bajo |
| R17 | Calidad datos textil | Mod Arte NO + Ubi Trazo SI → consumo en col correcta | Columnas AE, AD, consumos | Pilar 3/5 (definido, no en script) | Bajo |
| R18 | Calidad datos textil | Ambos NO → consumo en col CONSUMO SOLIDO | Columnas AE, AD, consumos | Pilar 3/5 (definido, no en script) | Bajo |
| R19 | Calidad datos textil | Consumo trazador ≤ diseñador | Columnas de consumo | Pilar 3/5 (definido, parcial en Pilar 6) | Bajo |
| R20 | Calidad datos textil | Ancho tela > 0 si código tela asignado | Columnas AB, Y | Pilar 3/5 (definido, no en script) | Bajo |
| R21 | Calidad datos textil | Fin moldería no anterior a inicio | Columnas DV, DW | Pilar 3/5 (definido, no en script) | Bajo |
| R22 | Calidad datos textil | Entrega confección no anterior a inicio | Columnas EO, EP | Pilar 3/5 (definido, no en script) | Bajo |
| R23 | Calidad datos textil | Despacho ZF ≥ Traslado SAP | Columnas GI, GJ | Pilar 3/5 (definido, no en script) | Bajo |
| R24 | Calidad datos textil | APROBADA no debe tener tipo de rechazo | Columnas EV, EW | Pilar 3/5 (definido, no en script) | Bajo |
| R25 | Calidad datos textil | Fecha recibido pieza posterior a fecha entrega | Columnas DZ, EA | Pilar 3/5 (definido, no en script) | Bajo |
| C1-01 a C1-12 | Calidad datos textil | Tipos de dato, rangos, nulos, duplicados | Columnas específicas | Pilar 5 (definido, parcial en script) | Medio |
| C2-01 a C2-08 | Calidad datos textil | Integridad referencial, exclusividad, consistencia | Columnas vs PARAMETROS | Pilar 5 (definido, no en script) | Medio |
| Score de salud | Calidad datos textil | Score 0-100 cuantitativo | Resultados de validación | Script + Pilar 5/6 | Alto |
| Eficiencia textil | Eficiencia textil | Ahorro consumos diseñador vs trazador | Columnas de consumo, TOTAL | Script `eficiencia_textil.py` | Medio-Alto |
| Impacto catálogos | Eficiencia textil | Sobrecosto de Mod Arte / Ubi Trazo / All Over vs sólidos | Columnas AD, AE, AF, consumo | Pilar 6 (`analizar_impacto_catalogos()`) | Medio |
| ESLint | Calidad código | Reglas de hooks, refresh, JS recommended | Archivos .js/.jsx | `npm run lint` | Medio |
| Checklist pre-reporte | Reportes | 8 verificaciones pre-emisión | Resultados de fases | Manual (Pilar 4) | Medio |
| Riesgos proyecto (5) | Arquitectura frontend | Monolíticos, CSS global, lógica en UI, prop drilling, separación capas | Documento | Manual (project-risks.md) | Bajo |
| Seniority assessment | Evaluación | Criterio técnico: Junior/Mid/Senior | Respuestas del usuario | Manual (frontend-seniority-assessment.md) | Bajo |

---

# 8. Criterios mencionados pero no verificables

| Criterio | Frente | Dónde se menciona | Por qué no es verificable |
|---|---|---|---|
| R03, R08, R10-R14, R15-R20, R21-R25 | Calidad datos textil | Pilar 3, Pilar 5 | Definidos con severidad y lógica pero **no implementados en scripts ejecutables** |
| Detección de cuellos de botella por tiempo | Segmentación | Pilar 4, sección 2.4 | Mencionado pero sin implementación ni umbral definido |
| Tasa de aprobación por línea | Segmentación | Pilar 4, sección 2.3 | Mencionado pero no en script ejecutable |
| Sobrecarga > 15 referencias por persona | Segmentación | Pilar 4, sección 2.2 | Umbral definido pero no en script ejecutable |
| Ahorro en USD | Eficiencia textil | Pilar 4, sección 3.1 | Requiere costo por metro no disponible en el archivo |
| Ahorro total proyectado | Eficiencia textil | Pilar 4, sección 3.1 | Implementado pero depende de que TOTAL exista y sea correcto |
| Análisis por base textil | Eficiencia textil | Pilar 4, sección 3.3 | Mencionado pero no en script ejecutable |
| Auditoría de anchos útiles | Eficiencia textil | Pilar 4, sección 3.4 | Mencionado pero no en script ejecutable |
| Gráficos PNG en /dist/graficos/ | Reportes | Pilar 2, Pilar 4 | Mencionado pero no implementado en scripts |
| Generación de Excel con xlsxwriter | Herramientas | Pilar 2 | Mencionado pero no hay script que lo use |
| Great Expectations para validación formal | Herramientas | Pilar 2, sección E | Marcado como opcional, no se verifica disponibilidad |
| Renders innecesarios | Performance frontend | render-analysis.md, performance-audit-template.md | Sin profiling ni herramientas de medición |
| Bundle size | Performance frontend | performance-audit-template.md | Sin medición de tamaño de bundle |
| Memoización con criterio | Performance frontend | render-analysis.md | Sin análisis estático de uso de memo |
| Dependencias circulares | Dependencias | circular-risk-analysis.md | Sin herramienta (madge, dependency-cruiser) |
| CSS monolítico | CSS | css-monolith-analysis.md, project-risks.md | Sin métrica de tamaño ni automatización |
| God components | Arquitectura | architecture-map.md, project-risks.md | Sin métrica de líneas ni herramienta |
| Prop drilling | Arquitectura | project-risks.md | Sin análisis de profundidad de props |
| Análisis comparativo entre colecciones | Comparación | Pilar 8, sección 5 | Protocolo descrito, sin script |
| Tendencias entre colecciones | Comparación | Pilar 8, sección 3.1 | Tabla de ejemplo, sin implementación |
| Patrones de error por diseñador/modista | Sesiones | Pilar 8, sección 3.3 | Función `analizar_historico_errores()` con `pass` en el cuerpo |
| Supabase MCP | Integración | opencode.json | Configurado pero no se audita su funcionamiento |
| Google Sheets integration | Integración | supabase/functions/ | Edge function existe pero no se audita |

---

# 9. Dependencias externas

| Dependencia | Para qué se necesita | Por qué limita la metodología |
|---|---|---|
| Archivos de colección (CSV/Excel) | Input para análisis textil | Sin archivos no hay análisis posible |
| Hoja PARAMETROS en Excel | Validación referencial (C2) | Si no está presente, las validaciones referenciales se omiten |
| Costo por metro de tela | Estimación de ahorro en USD | No está en la Matriz JO, es externo |
| Python + librerías (pandas, duckdb, openpyxl, etc.) | Ejecución de scripts | El entorno debe tener Python configurado |
| Supabase project (project_ref) | MCP para consultas DB | Requiere credenciales y conexión a internet |
| Google Sheets API (service account) | Edge function de sincronización | Requiere private key JWT y service account de Google |
| SAP | Referenciado en glosario textil (Nota de Fabricación, Código PT) | No hay conexión real ni auditoría; solo se menciona como contexto |
| Datos reales de producción | Auditar consistencia vs lo que dice la Matriz | No se accede a datos de planta real |
| Usuarios reales del sistema | Evaluar UX real de ProjectJO | No hay users de prueba ni escenarios de UX |
| Entorno de ejecución de React | Medir performance real | No se ejecuta Vite dev server para profiling |
| Vitest runtime | Ejecutar tests | No hay `npm test` script; tests no se ejecutan |

---

# 10. Vacíos de cobertura

| Vacío | Clasificación | Justificación |
|---|---|---|
| Seguridad de la aplicación | **Crítico** | No se evalúa XSS, CSRF, inyección, exposición de secretos, validación de input. La app maneja AuthContext y Supabase. |
| Base de datos (Supabase/Postgres) | **Crítico** | Hay MCP Supabase configurado y la skill `supabase-postgres-best-practices` instalada, pero no existe metodología para auditar esquema, RLS, índices, migraciones ni performance de queries. |
| Autenticación y autorización | **Crítico** | AuthContext existe en la app pero no se audita robustez, manejo de tokens, expiración, roles ni control de acceso. |
| CI/CD | **Alto** | No existe pipeline de integración/despliegue continuo. No se evalúa. |
| Testing (cobertura, e2e, integración) | **Alto** | Solo 2 archivos de test aislados, sin script `npm test`. No hay cobertura, e2e, ni tests de componentes. |
| Infraestructura y despliegue | **Alto** | No se evalúa configuración de servidores, variables de entorno, dominio, SSL, etc. |
| Observabilidad y monitoreo | **Alto** | No hay logging de aplicación, ni Sentry, ni métricas de runtime. |
| Disponibilidad y resiliencia | **Alto** | No se evalúa tiempo de inactividad, manejo de fallos, fallback, circuit breakers. |
| Backup y recuperación | **Alto** | No se evalúa estrategia de respaldo de datos (localStorage o Supabase). |
| Dependencias npm | **Medio** | No se auditan vulnerabilidades (`npm audit`), ni licencias, ni versiones desactualizadas. |
| Accesibilidad | **Medio** | No hay evaluación WCAG, axe-core, ni eslint-plugin-jsx-a11y. |
| Gestión de errores de la aplicación | **Medio** | No se evalúa manejo de errores en runtime, error boundaries, feedback al usuario. |
| Documentación técnica | **Medio** | Existe docs/ pero no se evalúa su completitud, actualización ni calidad. |
| Cumplimiento normativo | **Medio** | No se evalúa RGPD, LOPD, normativas de moda textil interna. |
| Integración con SAP/ERP | **Medio** | SAP se menciona en el glosario pero no se audita la integración real. |
| Continuidad de negocio | **Bajo** | No se evalúa plan de contingencia, BCP, DRP. |
| Gobernanza técnica | **Bajo** | No existe evaluación de estándares, code review process, ownership. |
| IoT / OT industrial | **Bajo** | No aplica al contexto actual pero sería relevante para una auditoría industrial textil. |

---

# 11. Duplicidades y solapamientos

| Duplicidad | Ubicaciones | Descripción |
|---|---|---|
| Regla R07 (TOTAL = suma tallas) | Pilar 3 (R07), Pilar 5 (C1-12), Pilar 6 (código), auditoria_calidad.py, reporte_premium.py | Definida en 5 sitios; implementada correctamente pero redundante |
| Regla R02 (APROBADO requiere PT) | Pilar 3 (R02), Pilar 5 (implícita en C3), Pilar 6 (código), auditoria_calidad.py | Definida en 4 sitios |
| Regla R09 (exclusividad DT/DU) | Pilar 3 (R09), Pilar 5 (C2-01), Pilar 6 (código), auditoria_calidad.py | Definida en 4 sitios |
| Score de salud | Pilar 5 (sección 5.5), Pilar 6 (función `validar_reglas_negocio()`), auditoria_calidad.py, reporte_premium.py | Calculado en 4 sitios con lógica simplificada en scripts vs completa en Pilar 5 |
| Carga de archivo CSV/Excel | Pilar 6 (`cargar_matriz()`), auditoria_calidad.py (`cargar_archivo()`), segmentacion_tallas.py (`cargar_archivo()`), eficiencia_textil.py (`cargar_archivo()`), reporte_premium.py (`cargar_y_normalizar()`) | La misma función está duplicada en 5 sitios con variaciones menores |
| Concepto de "god components" | architecture-map.md, project-risks.md, architecture-audit-template.md, frontend-audit-template.md, maintainability-audit-template.md | Mencionado en 5 documentos de .antigravity sin definición cuantitativa |
| Concepto "CSS monolítico" | project-risks.md, css-monolith-analysis.md, stack-analysis.md, maintainability-audit-template.md | Mencionado en 4 documentos |
| Análisis comparativo | Pilar 4 (implícito en Modo Comparador), Pilar 8 (sección 5 explícita) | Definido en 2 lugares del mismo sistema |

---

# 12. Limitaciones metodológicas

| Dimensión | Limitación |
|---|---|
| **Confiabilidad** | Las reglas definidas en documentación (R03-R25) NO están todas implementadas en scripts ejecutables. Solo R02, R07, R09 funcionan automáticamente. Existe brecha entre la metodología descrita y la ejecutable. |
| **Trazabilidad** | Alta en reportes textiler (archivo origen, fecha, reglas aplicadas). Baja en evaluación frontend (no hay registro de qué se evaluó ni conclusiones). |
| **Reproducibilidad** | Los scripts Python son reproducibles (mismo archivo → mismo resultado). La evaluación frontend NO es reproducible (subjetiva, sin automatización). |
| **Evidencia** | En datos textiler: cuantitativa (conteos, scores, porcentajes). En frontend: cualitativa (criterios descriptivos, sin métricas). |
| **Profundidad** | Alta en datos de colecciones (25 reglas, 4 capas, 211 columnas mapeadas). Baja en código (sin complejidad ciclomática, sin coverage, sin análisis dinámico). |
| **Cobertura** | Cubre datos textiler + código frontend React. No cubre backend, DB, seguridad, infraestructura, integraciones, CI/CD, testing, observabilidad ni operaciones. |
| **Falsos positivos** | En validación de datos: el mapeo flexible de columnas (por keywords) puede asociar columnas incorrectamente. En frontend: evaluación subjetiva puede señalar "riesgos" que no lo son. |
| **Falsos negativos** | En datos: 17 reglas de 25 no están implementadas en scripts ejecutables. En frontend: sin profiling real, problemas de performance runtime pasan desapercibidos. |
| **Dependencia del contexto** | La metodología textiler solo aplica a la Matriz JO (formato A-HD). No es generalizable a otros formatos. La frontend solo aplica a React/Vite. |
| **Capacidad de comparación** | En datos: score de salud permite comparar entre colecciones (parcialmente). En frontend: no hay scoring comparable entre versiones o proyectos. |

---

# 13. Fortalezas actuales

1. **Profundidad en el dominio textil**: 25 reglas de negocio con identificación
   formal (R01-R25), severidad clasificada, y mapeo completo de 211 columnas con
   tipos de dato.
2. **Automatización real**: 4 scripts Python ejecutables que implementan las
   fases del workflow.
3. **Scoring cuantitativo de salud de datos**: score 0-100 reproducible que
   permite priorizar acciones.
4. **Sistema de 4 capas de validación**: progresivo (estructural → referencial →
   negocio → estadística).
5. **Trazabilidad**: cada reporte incluye archivo de origen, rango de datos, y
   fecha de análisis.
6. **Protocolo de escritura controlada en Excel**: bitácora de modificaciones,
   confirmación explícita, preservación de formato.
7. **Plantillas de auditoría frontend estructuradas**: 4 templates (frontend,
   architecture, performance, maintainability) con criterios, preguntas guía y
   formato de salida.
8. **Identificación proactiva de riesgos**: 5 riesgos arquitectónicos
   documentados con prioridades de mitigación.
9. **Sistema de memoria entre sesiones**: persistencia de hallazgos, patrones
   aprendidos y correcciones del usuario.
10. **Configuración MCP Supabase**: acceso a base de datos Postgres vía MCP
    (aunque no se audita).

---

# 14. Conclusión

## 1. ¿Qué tan completa es la metodología actual?

**Incompleta para una auditoría corporativa/industrial.** La metodología cubre
con profundidad la calidad de los **datos textileriales** de la Matriz JO y tiene
evaluación cualitativa **limitada** del código frontend React. Constituye
aproximadamente un **15-20% de los frentes** que una auditoría técnica
empresarial completa debería cubrir.

## 2. ¿Qué frentes importantes ya cubre?

- Calidad de datos texteriles (con 25 reglas, 4 capas, score cuantitativo)
- Segmentación y eficiencia de producción textil interna
- Generación de reportes ejecutivos premium trazable
- Calidad de código JS/JSX vía ESLint (react-hooks, react-refresh)
- Criterios cualitativos de auditoría frontend (estructura, arquitectura,
  performance, mantenibilidad)
- Identificación de riesgos arquitectónicos del proyecto

## 3. ¿Qué frentes importantes faltan?

- Seguridad de la aplicación
- Base de datos (Supabase/Postgres)
- Autenticación y autorización
- Testing (cobertura, e2e, integración)
- CI/CD y DevOps
- Infraestructura y despliegue
- Observabilidad y monitoreo
- Disponibilidad, resiliencia, backup, recuperación
- Dependencias y vulnerabilidades
- Accesibilidad
- Cumplimiento normativo
- Integración real con SAP/ERP

## 4. ¿Dónde tiene mayor profundidad?

En **calidad de datos textiler de la Matriz JO**: mapeo de 211 columnas, 25
reglas de negocio, 4 capas de validación, scoring cuantitativo, scripts
ejecutables, y árbol de decisiones para clasificación de hallazgos.

## 5. ¿Dónde tiene mayor debilidad?

En **casi todo lo que no sea datos de la Matriz JO**: la aplicación como sistema
de software no se audita con metodología formal. No hay evaluación de seguridad,
base de datos, infraestructura, testing, ni integraciones. La evaluación frontend
es cualitativa y no automatizada.

## 6. ¿Qué aspectos requieren herramientas o pruebas externas?

- Performance de la aplicación (requiere ejecutar Vite dev y React Profiler)
- Tests (requiere vitest runner configurado)
- Auditoría de dependencias (requiere `npm audit`)
- Accesibilidad (requiere axe-core o lighthouse)
- Base de datos (requiere acceso a Supabase con credenciales)
- Google Sheets API (requiere service account JWT)
- SAP (requiere conexión y credenciales ERP)

## 7. ¿Qué tan adecuada sería para una auditoría de una aplicación corporativa e industrial?

**Inadecuada en su estado actual.** La metodología actual es un sistema operativo
de análisis textil especializado y un sistema pedagógico de aprendizaje frontend.
No constituye una metodología de auditoría técnica empresarial porque:

- No cubre los frentes críticos de seguridad, infraestructura, disponibilidad y
  operaciones.
- La evaluación de código es cualitativa y no automatizada (excepto ESLint
  básico).
- No hay pruebas de integración ni e2e que verifiquen que el sistema funciona
  end-to-end.
- No se evalúan integraciones reales con sistemas corporativos (SAP, Google
  Sheets, Supabase).
- La aplicación (ProjectJO) no se evalúa como un sistema en producción, solo como
  código fuente y datos de entrada.

Para ser adecuada, requeriría expandirse a los frentes de seguridad, base de
datos, infraestructura, testing, CI/CD, observabilidad y operaciones — los cuales
NO se contemplan actualmente.

---

# 15. Inventario estructurado para comparación futura

| Frente | Cobertura | Profundidad | Verificable desde repositorio | Requiere ejecución | Requiere infraestructura externa | Observación |
|---|---|---|---|---|---|---|
| Calidad de datos textiler | Sí | Alta | Sí (scripts Python) | Sí (Python) | No | 17 de 25 reglas no en scripts ejecutables |
| Segmentación de colecciones | Sí | Media | Sí (script parcial) | Sí (Python) | No | Cuellos de botella no automatizado |
| Eficiencia textil | Sí | Media-Alta | Sí (script) | Sí (Python) | No | Catálogos especiales solo en Pilar 6 |
| Reportes ejecutivos | Sí | Alta | Sí (script) | Sí (Python) | No | Gráficos PNG no implementados |
| Análisis comparativo | Parcial | Baja | Conceptual | No | No | Sin script, no reproducible |
| Arquitectura frontend | Parcial | Baja-Media | Sí (código estático) | No | No | Subjetivo, sin automatización |
| Estructura repo | Parcial | Baja | Sí (estático) | No | No | Manual |
| Performance frontend | Mencionado | Baja | No (requiere runtime) | Sí | No | No medible estáticamente |
| Mantenibilidad frontend | Parcial | Baja | Sí (código estático) | No | No | Sin automatización |
| Calidad código JS/JSX | Sí | Media | Sí (ESLint) | Sí (`npm run lint`) | No | Sin typecheck ni Prettier |
| Testing state machine | Parcial | Baja | Sí (vitest) | Sí (vitest) | No | Sin `npm test` script |
| CSS y estilos | Mencionado | Baja | Sí (estático) | No | No | Sin automatización |
| Dependencias circulares | Mencionado | Baja | Sí (estático) | No | No | Sin herramienta |
| Riesgos del proyecto | Parcial | Baja | Sí (documento) | No | No | No verificado automáticamente |
| Negocio y procesos textiler | Sí | Media | Sí (glosario + reglas) | No | No | Solo dominio textilerial |
| Seguridad | No | — | — | — | — | NO CONTEMPLADO |
| Autenticación | No | — | — | — | — | NO CONTEMPLADO |
| Base de datos | No | — | — | — | Supabase configurado | NO CONTEMPLADO |
| Backend / APIs | No | — | — | — | — | NO CONTEMPLADO |
| Integraciones | No | — | — | — | Google Sheets, SAP | NO CONTEMPLADO |
| CI/CD | No | — | — | — | — | NO CONTEMPLADO |
| Infraestructura | No | — | — | — | — | NO CONTEMPLADO |
| Observabilidad | No | — | — | — | — | NO CONTEMPLADO |
| Disponibilidad | No | — | — | — | — | NO CONTEMPLADO |
| Resiliencia | No | — | — | — | — | NO CONTEMPLADO |
| Backup | No | — | — | — | — | NO CONTEMPLADO |
| Continuidad | No | — | — | — | — | NO CONTEMPLADO |
| Dependencias npm | No | — | Sí (`npm audit`) | Sí | No | NO CONTEMPLADO |
| Licenciamiento | No | — | — | — | — | NO CONTEMPLADO |
| Cumplimiento | No | — | — | — | — | NO CONTEMPLADO |
| ERP / SAP | No | — | — | — | Requiere SAP | NO CONTEMPLADO |
| IoT / OT | No | — | — | — | — | NO CONTEMPLADO |
| Gobernanza técnica | No | — | — | — | — | NO CONTEMPLADO |
| Concurrencia | No | — | — | — | — | NO CONTEMPLADO |
| Accesibilidad | No | — | Sí (lighthouse/axe) | Sí | No | NO CONTEMPLADO |
