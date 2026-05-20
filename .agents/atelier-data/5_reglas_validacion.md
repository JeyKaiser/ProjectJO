# Pilar 5: Reglas de Validación y Detección de Anomalías

Este documento define las reglas formales de validación de datos, integridad referencial, restricciones de negocio y patrones de detección de anomalías que **AtelierData** aplica automáticamente durante la Fase 1 de Auditoría.

---

## 1. Sistema de Validación por Capas

Las validaciones se organizan en 4 capas progresivas:

```
Capa 1: Integridad Estructural → Capa 2: Integridad Referencial → Capa 3: Reglas de Negocio → Capa 4: Anomalías Estadísticas
```

| Capa | Descripción | Ejemplo |
|------|-------------|---------|
| **C1 - Estructural** | Formato, tipos de dato, rangos, nulos | Una columna numérica contiene texto |
| **C2 - Referencial** | Claves foráneas, catálogos, exclusividad | Un diseñador no existe en PARAMETROS |
| **C3 - Negocio** | Reglas del Pilar 3 (R01-R25) | PT sin MD, TOTAL != suma de tallas |
| **C4 - Estadística** | Outliers, distribuciones atípicas, clustering | Un consumo de tela 3x mayor que la media de su línea |

---

## 2. Capa 1: Validaciones de Integridad Estructural

### 2.1 Tipos de Dato por Columna

Cada columna debe cumplir con el tipo esperado. Las validaciones se ejecutan al cargar el archivo:

```python
COLUMN_TYPES = {
    'A': 'int',        # Ref
    'C': 'str',        # Código MD
    'D': 'str',        # Código PT
    'K': 'category',   # Status
    'P': 'category',   # Línea
    'Q': 'category',   # Sublínea
    'S': 'category',   # Tallaje
    'BH': 'category',  # Dificultad (BAJA/INTERMEDIA/ALTA)
    'AB': 'float',     # Ancho tela
    'AP': 'float',     # Costo externo
    'CY':'DJ': 'int',  # Todas las tallas
    'DK': 'int',       # TOTAL
    'EU': 'float',     # Tiempo confección
}
```

### 2.2 Validaciones Automáticas de Tipo

| ID | Validación | Acción |
|----|-----------|--------|
| **C1-01** | Columna numérica contiene strings no convertibles | Marcar fila, reportar valor crudo |
| **C1-02** | Columna SI/NO contiene valores distintos a `SI` o `NO` | Normalizar o reportar |
| **C1-03** | Columna de fecha con formato inválido | Intentar `pd.to_datetime` con `coerce`, reportar NaT |
| **C1-04** | Columna `TOTAL` (DK) no es numérica | Crítico: no se puede validar la curva de tallas |
| **C1-05** | Filas completamente vacías en medio de los datos | Reportar y excluir del análisis |
| **C1-06** | Filas duplicadas (misma Ref + mismo Código MD) | Reportar, mantener la primera ocurrencia |

### 2.3 Validaciones de Rango

| ID | Columna | Rango Válido | Severidad |
|----|---------|-------------|-----------|
| **C1-07** | Ancho tela (AB) | 0.5 - 3.0 metros | 🟡 MEDIA |
| **C1-08** | Tiempo confección (EU) | 5 - 600 minutos | 🟡 MEDIA |
| **C1-09** | Costo externo (AP) | >= 0 | 🟠 ALTA |
| **C1-10** | Prioridad contramuestras (FS) | 1 - 10 | 🟢 BAJA |
| **C1-11** | Unidades por talla (CY-DJ) | >= 0 | 🟠 ALTA |
| **C1-12** | TOTAL (DK) | >= 0 y = suma(CY:DJ) | 🔴 CRÍTICA |

---

## 3. Capa 2: Validaciones de Integridad Referencial

### 3.1 Catálogos Maestros (PARAMETROS)

Los siguientes valores en MATRIZ deben existir en la hoja PARAMETROS:

| Columna MATRIZ | Catálogo en PARAMETROS | Validación |
|---------------|----------------------|------------|
| L (Diseñador) | Diseñadores | `df['L'].isin(catalogo_disenadores)` |
| N (Modista) | Modistas | `df['N'].isin(catalogo_modistas)` |
| EN (Modista confección) | Modistas | `df['EN'].isin(catalogo_modistas)` |
| AC (Base Textil) | Bases Textiles | `df['AC'].isin(catalogo_bases)` |
| P (Línea) | Líneas | `df['P'].isin(catalogo_lineas)` |
| Q (Sublínea) | Sublíneas | `df['Q'].isin(catalogo_sublíneas)` |
| K (Status) | Estados | `df['K'].isin(catalogo_estados)` |

### 3.2 Validaciones de Exclusividad

| ID | Regla | Query de Validación |
|----|-------|-------------------|
| **C2-01** | DT y DU no pueden ambos tener valor (R09) | `df['DT'].notna() & df['DU'].notna()` |
| **C2-02** | Cada Ref debe ser única por colección | `df['A'].duplicated().any()` |
| **C2-03** | Un Código PT no puede aparecer en dos referencias distintas | `df['D'].duplicated().any()` excluyendo nulos |

### 3.3 Validaciones de Consistencia entre Columnas

| ID | Condición | Validación |
|----|-----------|-----------|
| **C2-04** | `AD=SI` o `AE=SI` o `AF=SI` y Status=CANCELADO | Alerta: referencia cancelada con catálogo especial |
| **C2-05** | `BR=SI` (requiere muestra) y `I` (PT referente) no vacío | Inconsistencia: es nueva pero tiene referente |
| **C2-06** | `AG=SI` (variación color) pero `AH` (refs) vacío o solo una ref | Alerta: variación sin referencias asociadas |
| **C2-07** | `AJ=SI` (bordado aplica) y `BL` (tipo bordado) = NINGUNO | Inconsistencia |
| **C2-08** | `AL=SI` (semielaborado aplica) y `BL` no contiene SEMIELABORADO | Inconsistencia |

---

## 4. Capa 3: Reglas de Negocio Automatizadas

Implementación de las reglas R01-R25 definidas en el Pilar 3.

### 4.1 Estados y Transiciones (R01-R08)

```python
# R01: PT no puede existir sin MD
violaciones_r01 = df['D'].notna() & df['C'].isna()

# R02: APROBADO requiere PT
violaciones_r02 = (df['K'] == 'APROBADO') & df['D'].isna()

# R03: CANCELADO no debería tener PT
violaciones_r03 = (df['K'] == 'CANCELADO') & df['D'].notna()

# R07: TOTAL debe coincidir con suma de tallas
tallas_cols = ['CY','CZ','DA','DB','DC','DD','DE','DF','DG','DH','DI','DJ']
suma_tallas = df[tallas_cols].sum(axis=1)
violaciones_r07 = abs(df['DK'] - suma_tallas) > 0.5
```

### 4.2 Consumos de Tela (R15-R20)

```python
# R15: Consumos no pueden ser 0 para referencias activas
activas = df['K'] != 'CANCELADO'
# Verificar columnas de consumo creativo y técnico

# R19: Trazador no debe consumir más que el diseñador
violaciones_r19 = df['consumo_trazador'] > df['consumo_disenador']
```

### 4.3 Fechas (R21-R25)

```python
# R21: Fin moldería no anterior a inicio
violaciones_r21 = df['DW'] < df['DV']

# R22: Entrega confección no anterior a inicio
violaciones_r22 = df['EP'] < df['EO']

# R23: Despacho ZF >= Traslado SAP
violaciones_r23 = df['GJ'] < df['GI']
```

---

## 5. Capa 4: Detección de Anomalías Estadísticas

### 5.1 Outliers en Consumos de Tela

Para cada grupo (Línea + Base Textil):

```python
def detectar_outliers_consumo(df, columna_consumo, grupo_cols=['P', 'AC']):
    """Detecta consumos que se desvían más de 2 desviaciones estándar de la media del grupo."""
    stats = df.groupby(grupo_cols)[columna_consumo].agg(['mean', 'std']).reset_index()
    df = df.merge(stats, on=grupo_cols, how='left')
    df['z_score'] = (df[columna_consumo] - df['mean']) / df['std'].replace(0, 1)
    outliers = df[abs(df['z_score']) > 2]
    return outliers
```

### 5.2 Outliers en Tiempos de Confección

- Agrupar por dificultad (BH) y tipo de tejido (DL).
- Detectar tiempos que excedan el Q3 + 1.5 × IQR del grupo.
- Marcar referencias con tiempos anormalmente altos para investigación.

### 5.3 Anomalías en Curva de Tallas

- **Talla dominante atípica**: Si una talla representa > 60% del total para una referencia, verificar.
- **Distribución plana**: Si todas las tallas tienen exactamente las mismas unidades (posible placeholder).
- **Tallas inconsistentes con Tallaje**: Si `Tallaje = 0-12` pero hay unidades en XS-XL, o viceversa.

### 5.4 Detección de Patrones de Error Comunes

| Patrón | Descripción | Detección |
|--------|-------------|-----------|
| **Copia-Pega** | Varias referencias con exactamente los mismos consumos y unidades | `df[cols].duplicated(keep=False)` |
| **Valores Placeholder** | Consumos = 1.0, TOTAL = 1, o fechas = 1900-01-01 | Comparación con valores centinela |
| **Inversión de columnas** | Consumo trazador > consumo diseñador en más del 30% de los casos | Conteo y porcentaje |
| **Fecha futura** | Fechas de entrega posteriores a la fecha actual + 1 año | `df['fecha'] > pd.Timestamp.now() + pd.DateOffset(years=1)` |

### 5.5 Scoring de Salud de Datos

Al finalizar la auditoría, se asigna un puntaje de salud:

```python
def calcular_salud_datos(resultados_validacion):
    """
    scoring:
    - 100: Sin violaciones
    - -5 por cada violación CRÍTICA
    - -3 por cada violación ALTA
    - -1 por cada violación MEDIA
    - -5 por cada 10% de valores nulos en columnas críticas
    """
    score = 100
    score -= resultados_validacion['criticas'] * 5
    score -= resultados_validacion['altas'] * 3
    score -= resultados_validacion['medias'] * 1
    score -= resultados_validacion['pct_nulos_criticos'] * 0.5
    return max(0, score)
```

| Rango de Salud | Interpretación |
|---------------|----------------|
| 90-100 | ✅ Excelente: Datos listos para análisis profundo |
| 70-89 | ⚠️ Aceptable: Se recomiendan correcciones menores |
| 50-69 | 🔶 Degradado: Varias reglas violadas, análisis limitado |
| 0-49 | 🔴 Crítico: Requiere limpieza mayor antes de cualquier análisis |

---

## 6. Reporte de Validación

El resultado de las 4 capas se consolida en un reporte estructurado:

```
VALIDACIÓN COMPLETA - [NOMBRE ARCHIVO]
Fecha: [FECHA]
Score de Salud: [0-100]

CAPA 1 - ESTRUCTURAL
├── Filas totales: [N]
├── Filas con datos: [N]
├── Columnas con >20% nulos: [lista]
└── Violaciones de tipo/rango: [N]

CAPA 2 - REFERENCIAL
├── Diseñadores no encontrados en catálogo: [N]
├── Modistas no encontradas en catálogo: [N]
├── Violaciones de exclusividad DT/DU: [N]
└── Otras violaciones: [N]

CAPA 3 - REGLAS DE NEGOCIO
├── Violaciones CRÍTICAS: [N] → [lista de IDs]
├── Violaciones ALTAS: [N] → [lista de IDs]
├── Violaciones MEDIAS: [N] → [lista de IDs]
└── Violaciones BAJAS: [N] → [lista de IDs]

CAPA 4 - ANOMALÍAS
├── Outliers de consumo: [N]
├── Outliers de tiempo: [N]
├── Patrones de error detectados: [lista]
└── Recomendaciones: [lista]
```
