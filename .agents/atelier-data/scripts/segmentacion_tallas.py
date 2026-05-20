"""
SCRIPT: segmentacion_tallas.py
FASE 2 - Segmentación y Agrupación
Uso: python segmentacion_tallas.py <archivo.csv|xlsx> [--output dist/]
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
    for col in COLUMNAS_TALLAS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
    if 'TOTAL' in df.columns:
        df['TOTAL'] = pd.to_numeric(df['TOTAL'], errors='coerce').fillna(0).astype(int)
    return df

def analizar_curva_tallas(df):
    resumen = {}
    tallas_num = [t for t in ['0','2','4','6','8','10','12'] if t in df.columns]
    tallas_alfa = [t for t in ['XS','S','M','L','XL'] if t in df.columns]

    if tallas_num:
        total_num = df[tallas_num].sum()
        total = total_num.sum()
        resumen['numerico'] = {
            'distribucion': {t: int(total_num[t]) for t in tallas_num},
            'porcentajes': {t: round((total_num[t]/total)*100, 1) if total > 0 else 0 for t in tallas_num},
            'total': int(total)
        }

    if tallas_alfa:
        total_alfa = df[tallas_alfa].sum()
        total = total_alfa.sum()
        resumen['alfabetico'] = {
            'distribucion': {t: int(total_alfa[t]) for t in tallas_alfa},
            'porcentajes': {t: round((total_alfa[t]/total)*100, 1) if total > 0 else 0 for t in tallas_alfa},
            'total': int(total)
        }

    all_tallas = tallas_num + tallas_alfa
    if all_tallas:
        sums = df[all_tallas].sum()
        resumen['talla_mas_vendida'] = str(sums.idxmax())
        resumen['talla_menos_vendida'] = str(sums.idxmin())
        resumen['total_general'] = int(sums.sum())

    return resumen

def segmentar_por_linea(df):
    col_linea = None
    for c in df.columns:
        if c.upper() in ('LINEA', 'LÍNEA', 'LINEA PRENDA'):
            col_linea = c
            break

    if not col_linea:
        return None

    segmentacion = {}
    for linea in df[col_linea].dropna().unique():
        sub = df[df[col_linea] == linea]
        total = 0
        tallas_en = [t for t in COLUMNAS_TALLAS if t in sub.columns]
        if tallas_en:
            total = int(sub[tallas_en].sum().sum())
        elif 'TOTAL' in sub.columns:
            total = int(sub['TOTAL'].sum())

        segmentacion[str(linea)] = {
            'referencias': len(sub),
            'unidades_totales': total,
            'pct_del_total': 0
        }

    total_general = sum(s['unidades_totales'] for s in segmentacion.values())
    for k in segmentacion:
        if total_general > 0:
            segmentacion[k]['pct_del_total'] = round(
                (segmentacion[k]['unidades_totales'] / total_general) * 100, 1
            )

    return dict(sorted(segmentacion.items(), key=lambda x: x[1]['unidades_totales'], reverse=True))

def generar_reporte(curva, por_linea, output_dir=DIST_DIR):
    output = output_dir / f'segmentacion_{datetime.now().strftime("%Y%m%d_%H%M")}.md'
    md = f"# Segmentación de Colección\n**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"

    if 'numerico' in curva:
        md += "## Curva de Tallas - Numérico\n\n"
        md += f"**Total:** {curva['numerico']['total']:,} unidades\n\n"
        md += "| Talla | Unidades | % |\n|-------|----------|---|\n"
        for t in ['0','2','4','6','8','10','12']:
            if t in curva['numerico']['distribucion']:
                md += f"| {t} | {curva['numerico']['distribucion'][t]:,} | {curva['numerico']['porcentajes'].get(t, 0)}% |\n"

    if 'alfabetico' in curva:
        md += "\n## Curva de Tallas - Alfabético\n\n"
        md += f"**Total:** {curva['alfabetico']['total']:,} unidades\n\n"
        md += "| Talla | Unidades | % |\n|-------|----------|---|\n"
        for t in ['XS','S','M','L','XL']:
            if t in curva['alfabetico']['distribucion']:
                md += f"| {t} | {curva['alfabetico']['distribucion'][t]:,} | {curva['alfabetico']['porcentajes'].get(t, 0)}% |\n"

    if 'total_general' in curva:
        md += f"\n**Total General:** {curva['total_general']:,} unidades\n"
    if 'talla_mas_vendida' in curva:
        md += f"**Talla más vendida:** {curva['talla_mas_vendida']}\n"

    if por_linea:
        md += "\n## Segmentación por Línea\n\n"
        md += "| Línea | Referencias | Unidades | % Total |\n|-------|------------|----------|--------|\n"
        for linea, datos in por_linea.items():
            md += f"| {linea} | {datos['referencias']} | {datos['unidades_totales']:,} | {datos['pct_del_total']}% |\n"

    output.write_text(md, encoding='utf-8')
    print(f"Reporte generado: {output}")
    print(json.dumps({'curva': curva, 'por_linea': por_linea}, indent=2, ensure_ascii=False, default=str))

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python segmentacion_tallas.py <archivo.xlsx|csv>")
        sys.exit(1)

    df = cargar_archivo(sys.argv[1])
    curva = analizar_curva_tallas(df)
    por_linea = segmentar_por_linea(df)
    generar_reporte(curva, por_linea)
