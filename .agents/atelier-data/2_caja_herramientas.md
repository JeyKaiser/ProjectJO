# Pilar 2: Caja de Herramientas (Tools & Tech Stack)

Este documento detalla el equipamiento técnico e instrumental completo de **AtelierData** para procesar, estructurar, transformar, validar y visualizar grandes volúmenes de datos contenidos en archivos CSV y hojas de cálculo de Excel.

---

## 🛠️ 1. El Stack Tecnológico Completo

Para lograr un rendimiento óptimo y evitar fallos de memoria o caídas al manipular bases de datos extensas, el agente utiliza las siguientes herramientas especializadas:

### A. Procesamiento de Datos (Python & Pandas)
- **Librería Core**: `pandas` y `numpy` para manipulación matricial.
- **Caso de uso**: Cargar el archivo de colecciones completas, realizar filtros por estado, e indexar las referencias por código PT.
- **Optimización**: Se prefiere el uso de operaciones vectorizadas sobre los métodos `.apply()` o bucles `for` tradicionales para mantener una ejecución rápida en archivos con más de 100 columnas.
- **Tipos de dato**: Usar `dtype` adecuados al cargar (`category` para catálogos, `Int64` para tallas con nulos).

### B. Consultas Estructuradas Ultra-Rápidas (DuckDB)
- **Librería**: `duckdb`.
- **Caso de uso**: Ejecutar consultas SQL complejas (JOINs, agrupaciones pesadas, filtros multicriterio) directamente sobre archivos `.csv` o DataFrames sin necesidad de configurar un motor de base de datos relacional.
- **Ventaja**: Hasta 10x más rápido que pandas para agrupaciones en archivos grandes.
- **Ejemplo de consulta en Python**:
  ```python
  import duckdb
  query = """
  SELECT Diseñador, COUNT(*) as Total_Refs, SUM(TOTAL) as Unidades_Totales 
  FROM 'Copia de COLECCION WS27 - 1.VALIDACION DE TELAS.csv'
  GROUP BY Diseñador
  ORDER BY Unidades_Totales DESC
  """
  df_summary = duckdb.query(query).to_df()
  ```

### C. Automatización e Integración en Excel (Openpyxl + XlsxWriter)
- **`openpyxl`**: Modificar celdas específicas o insertar reportes en hojas existentes de `PROTOTIPO V.01.xlsx`, respetando formatos, colores de celda, bordes y fórmulas existentes.
- **`xlsxwriter`**: Crear nuevos archivos Excel desde cero con formatos profesionales, tablas dinámicas, gráficos embebidos y validación de datos en celdas.
- **Regla de uso**:
  - **Modificar archivo existente** → `openpyxl` (preserva formato existente).
  - **Crear archivo nuevo** → `xlsxwriter` (más rápido y más opciones de formato).
  - **Nunca mezclar**: No abrir el mismo archivo con ambas librerías simultáneamente.

### D. Visualización de Insights (Matplotlib & Seaborn)
- **Librerías**: `matplotlib.pyplot` y `seaborn`.
- **Caso de uso**: Generar histogramas de la curva de tallas, diagramas de dispersión para comparar consumos base contra consumos reales, gráficos de barras de rechazos de taller, y mapas de calor de carga de trabajo.
- **Directorio de salida**: Las imágenes resultantes deben guardarse en formato PNG de alta resolución (150 DPI mínimo) en la carpeta `/dist/graficos/`.

### E. Validación y Calidad de Datos (Great Expectations - Opcional)
- **Librería**: `great_expectations` (si está disponible en el entorno).
- **Caso de uso**: Definir suites de expectativas formales para validación automatizada de la matriz.
- **Alternativa nativa**: Si `great_expectations` no está instalada, usar las funciones de validación del Pilar 6 que implementan las mismas reglas con pandas puro.

### F. Búsqueda Fuzzy y Corrección de Texto (RapidFuzz)
- **Librería**: `rapidfuzz`.
- **Caso de uso**: Comparar nombres de diseñadores, modistas o bases textiles contra los catálogos de PARAMETROS cuando hay errores de tipeo.
- **Ejemplo**:
  ```python
  from rapidfuzz import process, fuzz
  # Encontrar el nombre del catálogo más cercano a un valor con typo
  match = process.extractOne("Juna Pérez", catalogo_disenadores, scorer=fuzz.WRatio)
  # → ("Juan Pérez", 95.0, 3)
  ```

### G. Manejo de Archivos y Sistema (Pathlib + Logging)
- **`pathlib`**: Todas las rutas de archivo deben usar `Path` en lugar de strings crudos. Garantiza compatibilidad Windows/Mac/Linux.
  ```python
  from pathlib import Path
  DATA_DIR = Path('data')
  archivo = DATA_DIR / 'PROTOTIPO V.01.xlsx'
  ```
- **`logging`**: Todo script debe incluir logging estructurado con niveles (DEBUG, INFO, WARNING, ERROR). Los logs se escriben a `/dist/atelier_data.log`.
  ```python
  import logging
  logging.basicConfig(
      level=logging.INFO,
      format='%(asctime)s [%(levelname)s] %(message)s',
      handlers=[
          logging.FileHandler('dist/atelier_data.log', encoding='utf-8'),
          logging.StreamHandler()
      ]
  )
  ```

---

## ⚙️ 2. Flujo de Ejecución de Scripts

Cuando **AtelierData** necesite realizar un análisis masivo que requiera procesamiento matemático, implementará el siguiente flujo estructurado:

```
[Datos CSV/Excel] ──> [Script de Python Temporal (/scratch)] ──> [Motor DuckDB/Pandas] ──> [Reporte y Gráficos (/dist)]
```

1. **Creación del Script**: El agente crea un script temporal en la carpeta `/scratch` (ej: `/scratch/analizar_tallas.py`) o copia un template de `.agents/atelier-data/scripts/`.
2. **Ejecución**: El agente invoca el script a través de la terminal integrada con `python scratch/script.py`.
3. **Persistencia de Resultados**: El script escribe un reporte en formato Markdown en `/dist/` y genera gráficos en `/dist/graficos/`.
4. **Presentación**: AtelierData lee el reporte final y lo presenta con formato premium al usuario.

---

## 🔄 3. Patrones de Caché y Optimización

### 3.1 Caché de DataFrames

Para evitar recargar el mismo archivo múltiples veces en una sesión:

```python
# Cache en memoria durante la sesión
_cache = {}

def cargar_con_cache(filepath, force_reload=False):
    key = str(Path(filepath).resolve())
    if key not in _cache or force_reload:
        df, meta = cargar_matriz(filepath)
        _cache[key] = {'df': df, 'meta': meta, 'timestamp': datetime.now()}
    return _cache[key]['df'], _cache[key]['meta']
```

### 3.2 Optimización de Tipos de Dato

Al cargar DataFrames grandes, reducir uso de memoria:

```python
def optimizar_tipos(df):
    """Reduce el uso de memoria de un DataFrame optimizando dtypes."""
    for col in df.columns:
        if df[col].dtype == 'int64':
            df[col] = pd.to_numeric(df[col], downcast='integer')
        elif df[col].dtype == 'float64':
            df[col] = pd.to_numeric(df[col], downcast='float')
        elif df[col].dtype == 'object':
            if df[col].nunique() / len(df) < 0.5:
                df[col] = df[col].astype('category')
    return df
```

### 3.3 DuckDB para Operaciones Pesadas

Siempre que una operación involucre GROUP BY sobre más de 10,000 filas, preferir DuckDB sobre pandas:

```python
def groupby_optimizado(df, group_col, agg_col, agg_func='SUM'):
    """GroupBy inteligente: usa DuckDB para datasets grandes."""
    if len(df) > 10000:
        import duckdb
        query = f"SELECT {group_col}, {agg_func}({agg_col}) as resultado FROM df GROUP BY {group_col} ORDER BY resultado DESC"
        return duckdb.query(query).to_df()
    else:
        return df.groupby(group_col)[agg_col].sum().sort_values(ascending=False)
```

---

## 📦 4. Checklist de Disponibilidad de Librerías

Al iniciar una sesión, AtelierData verifica qué librerías están disponibles:

```python
LIBRERIAS_REQUERIDAS = {
    'pandas': 'Core',
    'numpy': 'Core',
    'openpyxl': 'Excel lectura/escritura',
    'duckdb': 'Consultas SQL rápidas',
}

LIBRERIAS_OPCIONALES = {
    'xlsxwriter': 'Creación de Excel nuevos con formato',
    'matplotlib': 'Visualización de gráficos',
    'seaborn': 'Gráficos estadísticos avanzados',
    'rapidfuzz': 'Corrección de texto por similitud',
    'great_expectations': 'Validación formal de datos',
}
```

Si una librería requerida no está disponible, AtelierData lo reporta y ofrece alternativas (ej: si `duckdb` no está, usar pandas para todo).
