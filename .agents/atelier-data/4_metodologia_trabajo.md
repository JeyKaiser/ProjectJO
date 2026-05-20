# Pilar 4: Metodología de Trabajo (Analytical Workflow)

Este documento detalla el procedimiento analítico de 4 fases que **AtelierData** sigue rigurosamente para procesar cualquier requerimiento de análisis de datos solicitado por el usuario.

---

## ⚙️ El Flujo de Trabajo en 4 Fases

```
[Datos Crudos] ──> FASE 1: Auditoría (Limpieza) ──> FASE 2: Segmentación ──> FASE 3: Eficiencia Textil ──> FASE 4: Reporte Premium
```

Cada fase tiene sub-etapas obligatorias y criterios de severidad para clasificar hallazgos.

---

## 🔍 FASE 1: Auditoría y Calidad de Datos (Data Profiling & Quality)

Antes de realizar sumatorias o promedios, el agente debe validar el estado de salud del archivo de datos.

### 1.1 Aislamiento de Filas Combinadas
- Detectar si la fila 8 o 9 (cabeceras) contienen combinaciones de celdas y mapearlas a un único índice de Pandas limpio.
- Si el archivo es Excel (`.xlsx`), usar `header=1` en `pd.read_excel()` y verificar que no haya filas vacías intercaladas antes de los datos.
- Si el archivo es CSV, inspeccionar las primeras 15 filas para identificar filas de metadatos y determinar el `skiprows` correcto.

### 1.2 Escaneo de Inconsistencias Estructurales
- Verificar si hay referencias aprobadas (`Status` = "APROBADO") que no tengan asignado un `Código PT`.
- Alertar si existen consumos de tela registrados como `0` o vacíos en prendas que ya se marcaron como costeadas o listas para confección.
- Detectar violaciones de la regla de exclusividad DT/DU (Pilar 3, R09).
- Validar que `TOTAL` (col DK) coincida con la suma de todas las columnas de tallas (R07).

### 1.3 Manejo Inteligente de Datos Faltantes (NaN)
- **Tallas de unidades de producción**: Convertir `NaN` → `0` (tipo `int`).
- **Observaciones y comentarios**: Convertir `NaN` → `""` (cadena vacía) o `"Sin Registro"`.
- **Fechas**: `NaN` se mantiene como `NaT`; no se imputan fechas sin confirmación.
- **Columnas numéricas críticas** (consumos, costos): `NaN` se reporta como alerta, no se imputa automáticamente.

### 1.4 Normalización de Tipos de Dato
- **Columnas SI/NO**: Convertir a booleano o mantener como string limpio (`SI`/`NO`), eliminando espacios y normalizando mayúsculas.
- **Columnas numéricas**: `pd.to_numeric(..., errors='coerce')` para detectar valores no numéricos infiltrados.
- **Columnas de fecha**: `pd.to_datetime(..., errors='coerce')` para unificar formatos.
- **Columnas de texto**: `.str.strip().str.upper()` para normalizar catálogos.

### 1.5 Reporte de Auditoría Inicial
Al finalizar la Fase 1, se emite un reporte con:
- Total de filas procesadas y filas con datos.
- Columnas con > 20% de valores nulos.
- Conteo de violaciones de reglas de negocio detectadas (por ID de regla).
- Lista de referencias problemáticas para revisión manual.

---

## 📊 FASE 2: Segmentación y Agrupación (Segmentation & Grouping)

El agente debe estructurar la información para que sea fácilmente digerible.

### 2.1 Segmentación por Curva de Tallas
Agrupar los totales de unidades de producción desglosados en dos categorías:

- **Tallaje Numérico**: Tallas `0`, `2`, `4`, `6`, `8`, `10`, `12`.
- **Tallaje Alfabético**: Tallas `XS`, `S`, `M`, `L`, `XL`.

Cálculo de porcentaje de participación:
$$\% \text{ Participación Talla } i = \left( \frac{\text{Unidades Talla } i}{\text{Total Unidades Vendidas}} \right) \times 100$$

**Sub-etapas:**
1. Separar referencias por tipo de tallaje (col S).
2. Para cada grupo, sumar unidades por talla.
3. Calcular porcentajes y detectar tallas con participación < 5% (posible baja demanda).
4. Identificar el tallaje predominante por línea y sublínea.

### 2.2 Segmentación de Carga de Trabajo y Tiempos
- Agrupar las referencias por **Diseñador Técnico** y **Modistas** para identificar cuellos de botella.
- Cruzar la dificultad de confección (`BAJA`, `INTERMEDIA`, `ALTA`) con los tiempos de confección reales (col EU) registrados por Ingeniería de Métodos.
- Calcular:
  - **Carga por modista**: Número de referencias asignadas y tiempo total estimado.
  - **Eficiencia por diseñador**: Referencias completadas vs. pendientes.
  - **Tiempo promedio por nivel de dificultad**: Para detectar outliers.

### 2.3 Segmentación por Línea y Sublínea
- Agrupar por `Línea` (col P) y `Sublínea` (col Q).
- Calcular: total de referencias, unidades totales, consumo promedio de tela, tasa de aprobación.
- Identificar líneas con mayor tasa de rechazos o reprocesos.

### 2.4 Segmentación por Estado y Flujo
- Distribución de referencias por `Status` (col K) y `Status taller` (col M).
- Identificar cuellos de botella en el flujo: referencias estancadas en una etapa por más de X días.
- Calcular tiempo promedio por etapa del ciclo de vida.

---

## ✂️ FASE 3: Análisis de Eficiencia Textil (Fabric Efficiency)

Esta fase se enfoca en auditar el consumo físico de los materiales para maximizar la rentabilidad.

### 3.1 Desviación de Consumos (Creativo vs. Técnico vs. Trazador)
Calcular la brecha de optimización lograda por el trazador:

$$\text{Ahorro lineal de tela} = \text{Consumo Diseñador} - \text{Consumo Trazador}$$

$$\text{Porcentaje de ahorro} = \left( \frac{\text{Ahorro lineal}}{\text{Consumo Diseñador}} \right) \times 100$$

**Sub-etapas:**
1. Identificar el consumo de referencia del diseñador (el mayor entre creativo y técnico).
2. Comparar contra el consumo del trazador.
3. Calcular ahorro en metros lineales y porcentaje.
4. Proyectar ahorro total = ahorro lineal × unidades totales de producción.
5. Estimar ahorro en USD (usando costo promedio por metro si está disponible).

### 3.2 Impacto de Variables de Catálogo (All Over / Mod Arte / Ubi Trazo)
- Agrupar referencias por estas tres variables booleanas (columnas AD, AE, AF).
- Comparar consumo promedio de tela vs. referencias sólidas (las tres en NO) de la misma línea.
- Calcular el "sobrecosto textil" asociado a cada catálogo:
  - **Modificación de Arte**: ¿Cuánto consume de más vs. sólido?
  - **Ubicación en Trazo**: ¿Cuánto consume de más vs. sólido?
  - **All Over**: ¿Cuánto consume de más vs. sólido?

### 3.3 Análisis por Base Textil
- Agrupar por `Base Textil` (col AC).
- Calcular consumo promedio, ancho útil promedio y desperdicio estimado.
- Identificar bases textiles con mayor variabilidad en consumo (posible problema de trazado).

### 3.4 Auditoría de Anchos Útiles
- Verificar que el `Ancho tela` (col AB) sea consistente para una misma `Base Textil`.
- Detectar anchos atípicos que puedan indicar errores de registro.
- Relacionar ancho útil con consumo: a menor ancho, mayor consumo lineal.

---

## 📈 FASE 4: Visualización e Informes Premium

El reporte final presentado al usuario debe seguir las directrices estéticas más exigentes (Premium Layout).

### 4.1 Estructura del Reporte

1. **Resumen Ejecutivo**: 3-5 bullet points con los hallazgos de mayor impacto financiero o de producción.
2. **Alertas Estratégicas** (GitHub Markdown Alerts):
   - `> [!IMPORTANT]` → Cuellos de botella inminentes, violaciones de reglas críticas.
   - `> [!WARNING]` → Desviaciones significativas, anomalías detectadas.
   - `> [!TIP]` → Oportunidades de ahorro, optimizaciones sugeridas.
   - `> [!NOTE]` → Contexto adicional, estadísticas generales.
3. **Tablas de Datos Limpias**: Alineadas, ordenadas de mayor a menor, con separadores de miles y porcentajes formateados (1 decimal).
4. **Sección de Gráficos**: Referencias a imágenes PNG generadas en `/dist/`.
5. **Anexo Metodológico**: Archivo de origen, rango de filas/columnas, reglas aplicadas, fecha del análisis.

### 4.2 Árbol de Decisiones para Clasificación de Hallazgos

```
Hallazgo detectado
├── ¿Viola regla de severidad CRÍTICA (R01, R02, R07, R09)?
│   └── Sí → > [!IMPORTANT] + acción inmediata requerida
├── ¿Viola regla de severidad ALTA (R03-R06, R11, R15, R20-R22)?
│   └── Sí → > [!WARNING] + revisión prioritaria
├── ¿Viola regla de severidad MEDIA (R08, R10, R12-R13, R16-R19, R23-R24)?
│   └── Sí → > [!NOTE] + incluido en tabla de hallazgos
├── ¿Oportunidad de ahorro > 5% del costo proyectado?
│   └── Sí → > [!TIP] + proyección financiera
└── ¿Anomalía estadística sin regla asociada?
    └── Sí → > [!NOTE] + hipótesis y sugerencia de investigación
```

### 4.3 Checklist Pre-Reporte

Antes de emitir cualquier reporte, el agente debe verificar:

- [ ] Se ejecutó la Fase 1 completa (auditoría de calidad).
- [ ] Se aplicaron todas las reglas de negocio del Pilar 3 que apliquen al análisis.
- [ ] Los totales y sumatorias fueron verificados (no hay errores aritméticos).
- [ ] Las unidades de medida son consistentes (metros para tela, minutos para tiempos, unidades para tallas).
- [ ] Los porcentajes suman 100% donde aplique.
- [ ] No se incluyen datos sensibles no autorizados (costos específicos de proveedores, fórmulas propietarias) sin confirmación.
- [ ] El reporte incluye la trazabilidad requerida (archivo origen, rango de datos, fecha).
- [ ] Se revisó que no haya filtraciones de información entre colecciones distintas sin autorización.

### 4.4 Ejemplo de Formateo de Reporte Ejecutivo

> [!NOTE]
> **Resumen Ejecutivo - Auditoría Colección WS27**
> - **Precisión en Moldería**: Se detectaron 3 referencias donde el Diseñador Técnico y Diseñador Creativo fueron asignados simultáneamente al rol de contramuestra, violando la regla de negocio de exclusividad (R09).
> - **Cuello de Botella**: La modista *Elena Rojas* concentra el 45% de la confección de contramuestras pendientes, con un tiempo promedio estimado en planta de 120 minutos por prenda.
> - **Oportunidad de Ahorro**: La optimización de trazo en la línea de *Vestidos Maxidress* generó un ahorro promedio de 0.18 metros de tela por unidad, lo que equivale a un ahorro proyectado de $4,500 USD para el volumen total de la colección.

### 4.5 Modos de Escritura Controlada en Excel

Cuando el usuario solicite modificar el archivo `PROTOTIPO V.01.xlsx`:

1. **Validación previa**: Leer la celda objetivo y mostrar valor actual + valor propuesto.
2. **Confirmación explícita**: El usuario debe aprobar el cambio antes de escribir.
3. **Bitácora de cambios**: Registrar en `/dist/bitacora_modificaciones.md`:
   - Fecha y hora.
   - Celda(s) modificada(s) (hoja, columna, fila).
   - Valor anterior → Valor nuevo.
   - Motivo del cambio.
4. **Preservación de formato**: Usar `openpyxl` respetando colores, bordes, fuentes y fórmulas existentes.
5. **No aplicar cambios masivos**: Si son más de 10 celdas, solicitar confirmación adicional.

### 4.6 Flujo de Modificación de Excel

```
[Usuario solicita cambio] → [AtelierData lee celda objetivo] → [Muestra valor actual + propuesto]
→ [Usuario confirma] → [AtelierData aplica cambio con openpyxl] → [Registra en bitácora]
→ [Verifica que el cambio no rompió fórmulas adyacentes] → [Confirma éxito]
```
