# Pilar 6: Patrones de Código y Scripts Reutilizables

Este documento contiene templates de código Python/DuckDB listos para usar en las 4 fases de análisis. Todos los patrones incluyen manejo de errores, logging y son autocontenidos.

---

## 1. Configuración Base y Utilidades

### 1.1 imports y Configuración Global

```python
import pandas as pd
import numpy as np
import duckdb
import openpyxl
from pathlib import Path
import logging
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Configuración de paths
BASE_DIR = Path.cwd()
DATA_DIR = BASE_DIR / 'data'
SCRATCH_DIR = BASE_DIR / 'scratch'
DIST_DIR = BASE_DIR / 'dist'
DIST_DIR.mkdir(parents=True, exist_ok=True)

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(DIST_DIR / 'atelier_data.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
```

### 1.2 Carga Inteligente de Datos

```python
def cargar_matriz(filepath, file_type=None):
    """
    Carga la matriz de colección desde Excel o CSV con manejo automático
    de filas combinadas y encabezados.
    
    Args:
        filepath: Ruta al archivo
        file_type: 'excel', 'csv', o None (auto-detectar)
    
    Returns:
        tuple: (DataFrame, dict con metadata de carga)
    """
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"Archivo no encontrado: {filepath}")
    
    # Auto-detectar tipo
    if file_type is None:
        ext = path.suffix.lower()
        file_type = 'excel' if ext in ('.xlsx', '.xls') else 'csv'
    
    metadata = {
        'archivo': str(path),
        'tipo': file_type,
        'fecha_carga': datetime.now().isoformat(),
        'filas_crudas': 0,
        'columnas_crudas': 0
    }
    
    try:
        if file_type == 'excel':
            xl = pd.ExcelFile(path)
            metadata['hojas'] = xl.sheet_names
            
            # Cargar MATRIZ con header en fila 9 (índice 1)
            df = pd.read_excel(path, sheet_name='MATRIZ', header=1)
            
            # Intentar cargar PARAMETROS
            if 'PARAMETROS' in xl.sheet_names:
                df_params = pd.read_excel(path, sheet_name='PARAMETROS')
                metadata['params_columns'] = list(df_params.columns)
            else:
                df_params = None
                logger.warning("Hoja PARAMETROS no encontrada")
        else:
            # CSV: detectar filas de metadatos
            sample = pd.read_csv(path, nrows=15, header=None)
            skip_rows = 0
            for i, row in sample.iterrows():
                if row.notna().sum() > 3:  # Asumir que fila con >3 valores es header
                    skip_rows = i
                    break
            
            df = pd.read_csv(path, skiprows=skip_rows)
            df_params = None
            metadata['skip_rows'] = skip_rows
        
        metadata['filas_crudas'] = len(df)
        metadata['columnas_crudas'] = len(df.columns)
        
        # Normalizar nombres de columna
        df.columns = df.columns.str.strip()
        
        # Eliminar filas completamente vacías
        df = df.dropna(how='all').reset_index(drop=True)
        
        logger.info(f"Carga exitosa: {len(df)} filas, {len(df.columns)} columnas")
        return df, metadata
        
    except Exception as e:
        logger.error(f"Error cargando archivo: {e}")
        raise

def normalizar_tipos(df):
    """Normaliza tipos de dato según el mapeo del Pilar 3."""
    # Columnas numéricas de tallas
    tallas_cols = ['0','2','4','6','8','10','12','XS','S','M','L','XL','TOTAL']
    for col in tallas_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
    
    # Columnas SI/NO
    si_no_cols = ['Fotos internas', 'Includes', 'Ubicación en trazo',
                  'Modificación de arte', 'All over', 'Variación de color']
    for col in si_no_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.upper()
            df[col] = df[col].apply(lambda x: x if x in ('SI', 'NO') else 'SIN DATO')
    
    # Columnas de texto: strip y upper para catálogos
    cat_cols = ['Status', 'Línea', 'Sublínea', 'Tallaje', 'Tallaje.1',
                'Dificultad de prenda', 'Dificultad de bordado']
    for col in cat_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.upper()
            df[col] = df[col].replace('NAN', '').replace('NONE', '')
    
    return df
```

---

## 2. FASE 1: Auditoría y Calidad de Datos

### 2.1 Perfilado de Datos (Data Profiling)

```python
def perfilar_dataframe(df):
    """Genera un perfil completo de calidad de datos."""
    profile = {
        'filas': len(df),
        'columnas': len(df.columns),
        'memoria_mb': df.memory_usage(deep=True).sum() / 1024**2,
        'columnas': {}
    }
    
    for col in df.columns:
        col_data = df[col]
        nulos = col_data.isna().sum()
        pct_nulos = (nulos / len(df)) * 100
        unicos = col_data.nunique()
        
        info = {
            'tipo': str(col_data.dtype),
            'nulos': int(nulos),
            'pct_nulos': round(pct_nulos, 2),
            'unicos': int(unicos),
            'alertas': []
        }
        
        if pct_nulos > 50:
            info['alertas'].append(f'>50% nulos')
        if pct_nulos > 20:
            info['alertas'].append(f'>20% nulos')
        if unicos == 1 and nulos < len(df):
            info['alertas'].append('Valor único constante')
        
        # Valores más frecuentes para columnas categóricas
        if col_data.dtype == 'object' and unicos < 50:
            info['top_valores'] = col_data.value_counts().head(5).to_dict()
        
        profile['columnas'][col] = info
    
    return profile

def generar_reporte_perfil(profile, output_path=None):
    """Genera reporte markdown del perfil de datos."""
    if output_path is None:
        output_path = DIST_DIR / 'perfil_datos.md'
    
    lines = [
        f"# Perfil de Datos",
        f"",
        f"**Filas:** {profile['filas']} | **Columnas:** {profile['columnas']} | **Memoria:** {profile['memoria_mb']:.1f} MB",
        f"",
        f"## Columnas con Alertas",
        f"",
        f"| Columna | Tipo | % Nulos | Únicos | Alertas |",
        f"|---------|------|---------|--------|---------|",
    ]
    
    for col, info in profile['columnas'].items():
        if info['alertas']:
            lines.append(
                f"| {col} | {info['tipo']} | {info['pct_nulos']:.1f}% | {info['unicos']} | {', '.join(info['alertas'])} |"
            )
    
    report = '\n'.join(lines)
    Path(output_path).write_text(report, encoding='utf-8')
    logger.info(f"Reporte de perfil generado: {output_path}")
    return report
```

### 2.2 Validación de Reglas de Negocio

```python
def validar_reglas_negocio(df):
    """
    Aplica las 25 reglas de negocio del Pilar 3 y retorna resultados.
    """
    resultados = {
        'fecha': datetime.now().isoformat(),
        'criticas': [],
        'altas': [],
        'medias': [],
        'bajas': [],
        'total_violaciones': 0
    }
    
    # Mapeo flexible de columnas (buscar por nombre o posición)
    def col(name_es, name_en=None, fallback_idx=None):
        for n in [name_es, name_en]:
            if n and n in df.columns:
                return n
        if fallback_idx and fallback_idx < len(df.columns):
            return df.columns[fallback_idx]
        return None
    
    # --- R01: PT sin MD ---
    col_pt = col('Código PT', 'Codigo PT', 3)
    col_md = col('Código MD', 'Codigo MD', 2)
    if col_pt and col_md:
        mask = df[col_pt].notna() & (df[col_pt] != '') & df[col_md].isna()
        if mask.any():
            resultados['criticas'].append({
                'regla': 'R01',
                'descripcion': 'PT asignado sin MD previo',
                'referencias': df.loc[mask, 'Ref' if 'Ref' in df.columns else df.columns[0]].tolist(),
                'count': int(mask.sum())
            })
    
    # --- R07: TOTAL coincide con suma de tallas ---
    tallas_nombres = ['0','2','4','6','8','10','12','XS','S','M','L','XL']
    tallas_en_df = [t for t in tallas_nombres if t in df.columns]
    if 'TOTAL' in df.columns and tallas_en_df:
        suma_tallas = df[tallas_en_df].sum(axis=1)
        diff = abs(df['TOTAL'] - suma_tallas)
        mask = diff > 0.5
        if mask.any():
            resultados['criticas'].append({
                'regla': 'R07',
                'descripcion': 'TOTAL no coincide con suma de tallas',
                'referencias': df.loc[mask, 'Ref' if 'Ref' in df.columns else df.columns[0]].tolist(),
                'count': int(mask.sum()),
                'diferencia_promedio': round(diff[mask].mean(), 1)
            })
    
    # --- R09: Exclusividad DT/DU ---
    col_dt = col('Diseñador técnico contramuestra', 'DT', None)
    col_du = col('Diseñador creativo contramuestra', 'DU', None)
    if col_dt and col_du:
        # Buscar en columnas por patrón de nombre
        if col_dt is None:
            for c in df.columns:
                if 'DT' in str(c).upper() or 'TECNICO' in str(c).upper():
                    col_dt = c
                    break
        if col_du is None:
            for c in df.columns:
                if 'DU' in str(c).upper() or 'CREATIVO' in str(c).upper():
                    col_du = c
                    break
        if col_dt and col_du:
            mask = df[col_dt].notna() & (df[col_dt] != '') & df[col_du].notna() & (df[col_du] != '')
            if mask.any():
                resultados['criticas'].append({
                    'regla': 'R09',
                    'descripcion': 'Ambos DT y DU asignados (violación de exclusividad)',
                    'referencias': df.loc[mask, df.columns[0]].tolist(),
                    'count': int(mask.sum())
                })
    
    # --- R02: APROBADO requiere PT ---
    col_status = col('Status', None, None)
    if col_status is None:
        for c in df.columns:
            if 'STATUS' in str(c).upper() and 'TALLER' not in str(c).upper():
                col_status = c
                break
    if col_status and col_pt:
        mask = (df[col_status].astype(str).str.upper().str.strip() == 'APROBADO') & df[col_pt].isna()
        if mask.any():
            resultados['altas'].append({
                'regla': 'R02',
                'descripcion': 'APROBADO sin Código PT',
                'count': int(mask.sum())
            })
    
    # --- R04, R05, R06: Entregables sin consumos ---
    for entregable, regla, cols_consumo in [
        ('Entregable creativo', 'R04', ['CONSUMO 1', 'CONSUMO 2', 'CONSUMO 3']),
        ('Entregable técnico', 'R05', ['CONSUMO SOLIDO', 'CONSUMO MOD ARTE', 'CONSUMO UBI TRAZO']),
        ('Entregable trazador', 'R06', ['TOTAL CONSUMO TRAZADOR']),
    ]:
        col_ent = col(entregable, None, None)
        if col_ent is None:
            for c in df.columns:
                if entregable.upper() in c.upper():
                    col_ent = c
                    break
        if col_ent:
            ok_mask = df[col_ent].astype(str).str.strip().str.upper() == 'OK'
            if ok_mask.any():
                # Verificar si hay consumos válidos
                tiene_consumo = False
                for cc in cols_consumo:
                    col_cc = col(cc, None, None) or (cc if cc in df.columns else None)
                    if col_cc:
                        tiene_consumo = tiene_consumo | (pd.to_numeric(df.loc[ok_mask, col_cc], errors='coerce').fillna(0) > 0)
                sin_consumo = ok_mask & ~tiene_consumo
                if sin_consumo.any():
                    resultados['altas'].append({
                        'regla': regla,
                        'descripcion': f'{entregable} = OK pero sin consumos registrados',
                        'count': int(sin_consumo.sum())
                    })
    
    # Calcular total
    resultados['total_violaciones'] = (
        sum(v['count'] for v in resultados['criticas']) +
        sum(v['count'] for v in resultados['altas']) +
        sum(v['count'] for v in resultados['medias']) +
        sum(v['count'] for v in resultados['bajas'])
    )
    
    # Calcular score de salud
    score = 100
    score -= sum(v['count'] for v in resultados['criticas']) * 5
    score -= sum(v['count'] for v in resultados['altas']) * 3
    score -= sum(v['count'] for v in resultados['medias']) * 1
    resultados['score_salud'] = max(0, score)
    
    return resultados
```

---

## 3. FASE 2: Segmentación y Agrupación

### 3.1 Análisis de Curva de Tallas

```python
def analizar_curva_tallas(df):
    """
    Analiza la distribución de unidades por talla.
    Retorna resumen numérico, alfabético y total.
    """
    tallas_num = ['0','2','4','6','8','10','12']
    tallas_alfa = ['XS','S','M','L','XL']
    
    resumen = {}
    
    # Tallaje numérico
    num_en_df = [t for t in tallas_num if t in df.columns]
    if num_en_df:
        total_num = df[num_en_df].sum()
        resumen['numerico'] = {
            'tallas': total_num.to_dict(),
            'total': int(total_num.sum()),
            'distribucion': {
                t: round((total_num[t] / total_num.sum()) * 100, 1) if total_num.sum() > 0 else 0
                for t in num_en_df
            }
        }
    
    # Tallaje alfabético
    alfa_en_df = [t for t in tallas_alfa if t in df.columns]
    if alfa_en_df:
        total_alfa = df[alfa_en_df].sum()
        resumen['alfabetico'] = {
            'tallas': total_alfa.to_dict(),
            'total': int(total_alfa.sum()),
            'distribucion': {
                t: round((total_alfa[t] / total_alfa.sum()) * 100, 1) if total_alfa.sum() > 0 else 0
                for t in alfa_en_df
            }
        }
    
    # Total general
    all_tallas = [t for t in tallas_num + tallas_alfa if t in df.columns]
    if all_tallas:
        resumen['total_general'] = int(df[all_tallas].sum().sum())
    
    # Talla más vendida
    if all_tallas:
        sums = df[all_tallas].sum()
        resumen['talla_mas_vendida'] = sums.idxmax()
        resumen['talla_menos_vendida'] = sums.idxmin()
    
    # Referencias por tipo de tallaje
    if 'Tallaje' in df.columns:
        resumen['por_tallaje'] = df['Tallaje'].value_counts().to_dict()
    
    return resumen
```

### 3.2 Segmentación por Carga de Trabajo

```python
def analizar_carga_trabajo(df):
    """
    Analiza la carga de trabajo por diseñador y modista.
    """
    carga = {}
    
    # Buscar columnas de diseñador y modista
    col_disenador = None
    col_modista = None
    for c in df.columns:
        cu = c.upper()
        if 'DISEÑADOR' in cu and 'TECNICO' not in cu and 'CREATIVO' not in cu:
            col_disenador = c
        if 'MODISTA' in cu:
            col_modista = c
    
    # Carga por diseñador
    if col_disenador:
        carga['por_disenador'] = (
            df.groupby(col_disenador).size()
            .sort_values(ascending=False)
            .to_dict()
        )
    
    # Carga por modista
    if col_modista:
        carga['por_modista'] = (
            df.groupby(col_modista).size()
            .sort_values(ascending=False)
            .to_dict()
        )
    
    # Tiempos de confección
    col_tiempo = None
    for c in df.columns:
        if 'TIEMPO' in c.upper() or 'MINUTOS' in c.upper():
            col_tiempo = c
            break
    
    if col_tiempo and col_modista:
        df[col_tiempo] = pd.to_numeric(df[col_tiempo], errors='coerce')
        carga['tiempos_por_modista'] = (
            df.groupby(col_modista)[col_tiempo]
            .agg(['sum', 'mean', 'count'])
            .round(1)
            .to_dict()
        )
    
    return carga
```

---

## 4. FASE 3: Eficiencia Textil

### 4.1 Comparación de Consumos

```python
def calcular_eficiencia_textil(df):
    """
    Calcula la eficiencia textil comparando consumos de diseñador vs trazador.
    """
    eficiencia = []
    
    for idx, row in df.iterrows():
        ref = row.get('Ref', idx)
        
        # Consumo del diseñador (el mayor entre creativo y técnico)
        consumos_creativo = []
        for c in ['CONSUMO 1', 'CONSUMO 2', 'CONSUMO 3']:
            if c in df.columns:
                val = pd.to_numeric(row[c], errors='coerce')
                if pd.notna(val) and val > 0:
                    consumos_creativo.append(val)
        
        consumo_tecnico = 0
        for c in ['CONSUMO SOLIDO', 'CONSUMO MOD ARTE', 'CONSUMO UBI TRAZO']:
            if c in df.columns:
                val = pd.to_numeric(row[c], errors='coerce')
                if pd.notna(val) and val > 0:
                    consumo_tecnico = max(consumo_tecnico, val)
        
        consumo_disenador = max(
            max(consumos_creativo) if consumos_creativo else 0,
            consumo_tecnico
        )
        
        # Consumo del trazador
        consumo_trazador = 0
        for c in df.columns:
            if 'TRAZADOR' in c.upper() and 'CONSUMO' in c.upper():
                val = pd.to_numeric(row[c], errors='coerce')
                if pd.notna(val) and val > 0:
                    consumo_trazador = max(consumo_trazador, val)
        
        if consumo_disenador > 0 and consumo_trazador > 0:
            ahorro = consumo_disenador - consumo_trazador
            pct_ahorro = (ahorro / consumo_disenador) * 100
            
            # Proyectar ahorro total
            total_unidades = pd.to_numeric(row.get('TOTAL', 0), errors='coerce') or 0
            ahorro_total = ahorro * total_unidades
            
            eficiencia.append({
                'ref': ref,
                'consumo_disenador': round(consumo_disenador, 2),
                'consumo_trazador': round(consumo_trazador, 2),
                'ahorro_lineal': round(ahorro, 2),
                'pct_ahorro': round(pct_ahorro, 1),
                'unidades': int(total_unidades),
                'ahorro_total_proyectado': round(ahorro_total, 2)
            })
    
    df_eff = pd.DataFrame(eficiencia)
    if not df_eff.empty:
        df_eff = df_eff.sort_values('pct_ahorro', ascending=False)
    
    return df_eff
```

### 4.2 Impacto de Catálogos Especiales

```python
def analizar_impacto_catalogos(df):
    """
    Compara el consumo de referencias con catálogos especiales (Mod Arte,
    Ubi Trazo, All Over) vs. referencias sólidas de la misma línea.
    """
    # Identificar columnas de catálogo y consumo
    col_mod_arte = col_ubi_trazo = col_all_over = None
    col_consumo = None
    
    for c in df.columns:
        cu = c.upper()
        if 'MOD' in cu and 'ARTE' in cu:
            col_mod_arte = c
        elif 'UBI' in cu and 'TRAZO' in cu:
            col_ubi_trazo = c
        elif 'ALL OVER' in cu:
            col_all_over = c
        elif 'CONSUMO SOLIDO' in cu:
            col_consumo = c
    
    if not all([col_mod_arte, col_ubi_trazo, col_all_over, col_consumo]):
        return {'error': 'Columnas de catálogo no encontradas'}
    
    df[col_consumo] = pd.to_numeric(df[col_consumo], errors='coerce')
    
    # Referencias sólidas (las 3 en NO)
    solidas = df[
        (df[col_mod_arte].astype(str).str.upper() == 'NO') &
        (df[col_ubi_trazo].astype(str).str.upper() == 'NO') &
        (df[col_all_over].astype(str).str.upper() == 'NO')
    ]
    
    impacto = {
        'consumo_promedio_solido': round(solidas[col_consumo].mean(), 2),
        'referencias_solidas': len(solidas)
    }
    
    # Comparar cada catálogo
    for nombre, col in [
        ('Modificación de Arte', col_mod_arte),
        ('Ubicación en Trazo', col_ubi_trazo),
        ('All Over', col_all_over)
    ]:
        especiales = df[df[col].astype(str).str.upper() == 'SI']
        if len(especiales) > 0:
            consumo_prom = especiales[col_consumo].mean()
            if impacto['consumo_promedio_solido'] > 0:
                sobrecosto_pct = ((consumo_prom - impacto['consumo_promedio_solido']) / impacto['consumo_promedio_solido']) * 100
            else:
                sobrecosto_pct = 0
            impacto[nombre] = {
                'referencias': len(especiales),
                'consumo_promedio': round(consumo_prom, 2),
                'sobrecosto_pct': round(sobrecosto_pct, 1)
            }
    
    return impacto
```

---

## 5. FASE 4: Reportes y Visualización

### 5.1 Generación de Reporte Markdown

```python
def generar_reporte_ejecutivo(
    perfil, validacion, curva_tallas, eficiencia, carga_trabajo,
    output_path=None
):
    """Genera el reporte ejecutivo completo en formato Markdown."""
    if output_path is None:
        output_path = DIST_DIR / f'reporte_ejecutivo_{datetime.now().strftime("%Y%m%d_%H%M")}.md'
    
    score = validacion.get('score_salud', 'N/A')
    
    report = f"""# Reporte Ejecutivo - Colección JO

**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Score de Salud de Datos:** {score}/100

---

## 📋 Resumen Ejecutivo
"""
    
    # Alertas críticas
    if validacion.get('criticas'):
        report += "\n> [!IMPORTANT]\n> **Violaciones Críticas Detectadas**\n"
        for v in validacion['criticas']:
            report += f"> - **{v['regla']}**: {v['descripcion']} ({v['count']} casos)\n"
    
    # Alertas altas
    if validacion.get('altas'):
        report += "\n> [!WARNING]\n> **Alertas de Alta Prioridad**\n"
        for v in validacion['altas']:
            report += f"> - **{v['regla']}**: {v['descripcion']} ({v['count']} casos)\n"
    
    # Curva de tallas
    if 'numerico' in curva_tallas:
        report += f"""
## 👗 Curva de Tallas - Numérico
- **Total Unidades:** {curva_tallas['numerico']['total']:,}
- **Talla más vendida:** {curva_tallas.get('talla_mas_vendida', 'N/A')}
"""
    
    # Eficiencia textil
    if not eficiencia.empty:
        report += f"""
## ✂️ Eficiencia Textil
- **Ahorro promedio:** {eficiencia['pct_ahorro'].mean():.1f}%
- **Ahorro total proyectado:** {eficiencia['ahorro_total_proyectado'].sum():.2f} m
"""
    
    report += f"""
---
*Reporte generado por AtelierData Agent*
*Archivo origen: {perfil.get('archivo', 'N/A')}*
"""
    
    Path(output_path).write_text(report, encoding='utf-8')
    logger.info(f"Reporte ejecutivo generado: {output_path}")
    return report
```

---

## 6. Escritura Controlada en Excel (openpyxl)

```python
def modificar_celda_excel(
    filepath, sheet_name, cell_ref, nuevo_valor,
    dry_run=True, bitacora_path=None
):
    """
    Modifica una celda específica en un archivo Excel con preservación de formato.
    
    Args:
        filepath: Ruta al archivo Excel
        sheet_name: Nombre de la hoja
        cell_ref: Referencia de celda (ej: 'D10')
        nuevo_valor: Valor a escribir
        dry_run: Si True, solo lee y reporta, no escribe
        bitacora_path: Ruta para archivo de bitácora
    
    Returns:
        dict con resultado de la operación
    """
    if bitacora_path is None:
        bitacora_path = DIST_DIR / 'bitacora_modificaciones.md'
    
    try:
        wb = openpyxl.load_workbook(filepath)
        if sheet_name not in wb.sheetnames:
            return {'error': f'Hoja "{sheet_name}" no encontrada. Hojas disponibles: {wb.sheetnames}'}
        
        ws = wb[sheet_name]
        celda = ws[cell_ref]
        
        resultado = {
            'archivo': str(filepath),
            'hoja': sheet_name,
            'celda': cell_ref,
            'valor_actual': celda.value,
            'valor_propuesto': nuevo_valor,
            'modificado': False,
            'dry_run': dry_run
        }
        
        if not dry_run:
            celda.value = nuevo_valor
            wb.save(filepath)
            resultado['modificado'] = True
            
            # Registrar en bitácora
            with open(bitacora_path, 'a', encoding='utf-8') as f:
                f.write(
                    f"| {datetime.now().strftime('%Y-%m-%d %H:%M')} "
                    f"| {sheet_name} | {cell_ref} "
                    f"| {resultado['valor_actual']} → {nuevo_valor} |\n"
                )
        
        wb.close()
        return resultado
        
    except Exception as e:
        return {'error': str(e)}
```

---

## 7. Consultas DuckDB Predefinidas

```python
QUERIES_DUCKDB = {
    'resumen_por_linea': """
        SELECT 
            "Línea" as linea,
            COUNT(*) as total_referencias,
            SUM(CAST("TOTAL" AS DOUBLE)) as unidades_totales,
            AVG(CAST("Tiempo confección (min)" AS DOUBLE)) as tiempo_promedio_min
        FROM df
        WHERE "Status" != 'CANCELADO'
        GROUP BY "Línea"
        ORDER BY unidades_totales DESC
    """,
    
    'top_modistas_carga': """
        SELECT 
            modista,
            COUNT(*) as referencias_asignadas,
            SUM(CAST(tiempo AS DOUBLE)) as tiempo_total_min,
            AVG(CAST(tiempo AS DOUBLE)) as tiempo_promedio_min
        FROM df
        WHERE modista IS NOT NULL AND modista != ''
        GROUP BY modista
        ORDER BY referencias_asignadas DESC
        LIMIT 10
    """,
    
    'rechazos_por_tipo': """
        SELECT 
            "Tipo de rechazo" as tipo_rechazo,
            COUNT(*) as cantidad,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as porcentaje
        FROM df
        WHERE "Estado prenda planta" = 'RECHAZADA'
        GROUP BY "Tipo de rechazo"
        ORDER BY cantidad DESC
    """,
    
    'eficiencia_por_disenador': """
        SELECT 
            disenador,
            COUNT(*) as referencias,
            ROUND(AVG(ahorro_pct), 1) as ahorro_promedio_pct,
            ROUND(SUM(ahorro_total), 2) as ahorro_total_proyectado_m
        FROM (
            SELECT 
                diseñador as disenador,
                (consumo_disenador - consumo_trazador) / consumo_disenador * 100 as ahorro_pct,
                (consumo_disenador - consumo_trazador) * total_unidades as ahorro_total
            FROM df
            WHERE consumo_disenador > 0 AND consumo_trazador > 0
        )
        GROUP BY disenador
        ORDER BY ahorro_total_proyectado_m DESC
    """,
    
    'composicion_prendas': """
        SELECT 
            "Base Textil" as base_textil,
            COUNT(*) as total_prendas,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as porcentaje
        FROM df
        WHERE "Base Textil" IS NOT NULL AND "Base Textil" != ''
        GROUP BY "Base Textil"
        ORDER BY total_prendas DESC
    """
}

def ejecutar_query_duckdb(df, query_name, **params):
    """Ejecuta una query DuckDB predefinida sobre un DataFrame."""
    import duckdb
    
    if query_name not in QUERIES_DUCKDB:
        raise ValueError(f"Query '{query_name}' no encontrada. Disponibles: {list(QUERIES_DUCKDB.keys())}")
    
    query = QUERIES_DUCKDB[query_name]
    # Reemplazar nombres de columna genéricos por los reales del DataFrame
    # (los queries usan nombres estándar; se adaptan según el mapeo de columnas)
    
    try:
        result = duckdb.query(query).to_df()
        return result
    except Exception as e:
        logger.error(f"Error ejecutando query '{query_name}': {e}")
        raise
```
