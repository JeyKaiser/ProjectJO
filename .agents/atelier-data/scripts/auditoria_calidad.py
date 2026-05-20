"""
SCRIPT: auditoria_calidad.py
FASE 1 - Auditoría y Calidad de Datos
Uso: python auditoria_calidad.py <archivo.csv|xlsx> [--output dist/]
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sys
import json
from datetime import datetime

DIST_DIR = Path('dist')
DIST_DIR.mkdir(exist_ok=True)

COLUMNAS_TALLAS = ['0','2','4','6','8','10','12','XS','S','M','L','XL']

def cargar_archivo(filepath):
    path = Path(filepath)
    if path.suffix.lower() in ('.xlsx', '.xls'):
        df = pd.read_excel(path, sheet_name=0, header=1)
    else:
        sample = pd.read_csv(path, nrows=20, header=None)
        skip = 0
        for i, row in sample.iterrows():
            if row.notna().sum() > 4:
                skip = i
                break
        df = pd.read_csv(path, skiprows=skip)
    df.columns = df.columns.str.strip()
    df = df.dropna(how='all').reset_index(drop=True)
    return df

def normalizar(df):
    for col in COLUMNAS_TALLAS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
    if 'TOTAL' in df.columns:
        df['TOTAL'] = pd.to_numeric(df['TOTAL'], errors='coerce').fillna(0).astype(int)
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].astype(str).str.strip()
    return df

def auditar(df, archivo_origen):
    reporte = {
        'archivo': archivo_origen,
        'fecha': datetime.now().isoformat(),
        'filas': len(df),
        'columnas': len(df.columns),
        'violaciones': {'criticas': [], 'altas': [], 'medias': []},
        'columnas_problematicas': [],
        'score_salud': 100
    }

    # Nulos por columna
    for col in df.columns:
        pct_nulos = (df[col].isna().sum() / len(df)) * 100
        if pct_nulos > 50:
            reporte['columnas_problematicas'].append({
                'columna': col, 'pct_nulos': round(pct_nulos, 1), 'severidad': 'ALTA'
            })
        elif pct_nulos > 20:
            reporte['columnas_problematicas'].append({
                'columna': col, 'pct_nulos': round(pct_nulos, 1), 'severidad': 'MEDIA'
            })

    # R07: TOTAL vs suma de tallas
    tallas_en_df = [t for t in COLUMNAS_TALLAS if t in df.columns]
    if 'TOTAL' in df.columns and tallas_en_df:
        suma = df[tallas_en_df].sum(axis=1)
        diffs = abs(df['TOTAL'] - suma)
        violaciones = diffs > 0.5
        if violaciones.any():
            reporte['violaciones']['criticas'].append({
                'regla': 'R07',
                'descripcion': 'TOTAL != suma de tallas',
                'casos': int(violaciones.sum()),
                'diferencia_max': float(diffs.max())
            })
            reporte['score_salud'] -= int(violaciones.sum()) * 5

    # R02: APROBADO sin PT
    col_status = None
    for c in df.columns:
        if c.upper() == 'STATUS' or 'STATUS' in c.upper():
            col_status = c
            break
    col_pt = None
    for c in df.columns:
        if 'PT' in c.upper() and 'CODIGO' in c.upper():
            col_pt = c
            break
    if col_status and col_pt:
        aprobado_sin_pt = (df[col_status].str.upper() == 'APROBADO') & (df[col_pt].isna() | (df[col_pt] == ''))
        if aprobado_sin_pt.any():
            reporte['violaciones']['altas'].append({
                'regla': 'R02',
                'descripcion': 'APROBADO sin Código PT',
                'casos': int(aprobado_sin_pt.sum())
            })
            reporte['score_salud'] -= int(aprobado_sin_pt.sum()) * 3

    # R09: Exclusividad DT/DU
    col_dt = col_du = None
    for c in df.columns:
        cu = c.upper()
        if ('DT' in cu or 'TECNICO' in cu) and 'CONTRAM' in cu:
            col_dt = c
        if ('DU' in cu or 'CREATIVO' in cu) and 'CONTRAM' in cu:
            col_du = c
    if col_dt and col_du:
        ambos = df[col_dt].notna() & (df[col_dt] != '') & df[col_du].notna() & (df[col_du] != '')
        if ambos.any():
            reporte['violaciones']['criticas'].append({
                'regla': 'R09',
                'descripcion': 'DT y DU ambos asignados',
                'casos': int(ambos.sum())
            })
            reporte['score_salud'] -= int(ambos.sum()) * 5

    reporte['score_salud'] = max(0, reporte['score_salud'])
    return reporte

def generar_reporte(reporte, output_dir=DIST_DIR):
    output = output_dir / f'auditoria_{datetime.now().strftime("%Y%m%d_%H%M")}.md'
    r = reporte
    md = f"""# Auditoría de Calidad de Datos

**Archivo:** {r['archivo']}
**Fecha:** {r['fecha'][:19]}
**Score de Salud:** {r['score_salud']}/100

## Resumen
- {r['filas']} filas, {r['columnas']} columnas

## Violaciones Detectadas
"""
    for severidad, emoji, alerta in [
        ('criticas', '🔴', 'CRÍTICAS'),
        ('altas', '🟠', 'ALTAS'),
        ('medias', '🟡', 'MEDIAS')
    ]:
        if r['violaciones'][severidad]:
            md += f"\n### {emoji} {alerta}\n"
            for v in r['violaciones'][severidad]:
                md += f"- **{v['regla']}**: {v['descripcion']} → {v['casos']} casos\n"

    if r['columnas_problematicas']:
        md += "\n## Columnas con Alto Nivel de Nulos\n"
        for c in r['columnas_problematicas']:
            md += f"- `{c['columna']}`: {c['pct_nulos']}% nulos [{c['severidad']}]\n"

    output.write_text(md, encoding='utf-8')
    print(f"Reporte generado: {output}")
    print(json.dumps(r, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python auditoria_calidad.py <archivo.xlsx|csv>")
        sys.exit(1)

    archivo = sys.argv[1]
    df = cargar_archivo(archivo)
    df = normalizar(df)
    reporte = auditar(df, archivo)
    generar_reporte(reporte)
