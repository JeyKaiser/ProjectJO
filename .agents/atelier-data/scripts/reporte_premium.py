"""
SCRIPT: reporte_premium.py
FASE 4 - Reporte Premium Consolidado
Uso: python reporte_premium.py <archivo.csv|xlsx> [--output dist/]

Genera un reporte ejecutivo completo combinando las 4 fases de análisis.
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sys
from datetime import datetime

DIST_DIR = Path('dist')
DIST_DIR.mkdir(exist_ok=True)

COLUMNAS_TALLAS = ['0','2','4','6','8','10','12','XS','S','M','L','XL']
TALLAS_NUM = ['0','2','4','6','8','10','12']
TALLAS_ALFA = ['XS','S','M','L','XL']

def cargar_y_normalizar(filepath):
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

def auditoria_rapida(df):
    violaciones = {'criticas': 0, 'altas': 0, 'medias': 0}
    alertas = []

    # TOTAL vs tallas
    tallas_en_df = [t for t in COLUMNAS_TALLAS if t in df.columns]
    if 'TOTAL' in df.columns and tallas_en_df:
        suma = df[tallas_en_df].sum(axis=1)
        n = (abs(df['TOTAL'] - suma) > 0.5).sum()
        if n > 0:
            violaciones['criticas'] += n
            alertas.append(f"🔴 {n} referencias con TOTAL que no coincide con suma de tallas (R07)")

    # Columnas con muchos nulos
    for col in df.columns:
        pct = (df[col].isna().sum() / len(df)) * 100
        if pct > 50:
            violaciones['altas'] += 1
            alertas.append(f"🟠 Columna `{col}` con {pct:.0f}% de valores nulos")

    return violaciones, alertas

def generar_reporte(df, violaciones, alertas, archivo_origen, output_dir=DIST_DIR):
    output = output_dir / f'reporte_premium_{datetime.now().strftime("%Y%m%d_%H%M")}.md'
    total_refs = len(df)

    # Curva de tallas
    tallas_en = [t for t in COLUMNAS_TALLAS if t in df.columns]
    total_unidades = int(df[tallas_en].sum().sum()) if tallas_en else 0

    # Distribución por status
    col_status = None
    for c in df.columns:
        if 'STATUS' in c.upper() and 'TALLER' not in c.upper():
            col_status = c
            break
    status_dist = df[col_status].value_counts().to_dict() if col_status else {}

    # Consumos
    col_consumo_d = None
    for c in df.columns:
        cu = c.upper()
        if 'CONSUMO' in cu and ('SOLIDO' in cu or 'MOD' in cu or 'UBI' in cu):
            col_consumo_d = c
            break

    col_consumo_t = None
    for c in df.columns:
        cu = c.upper()
        if 'CONSUMO' in cu and 'TRAZADOR' in cu:
            col_consumo_t = c
            break

    ahorro_msg = ""
    if col_consumo_d and col_consumo_t:
        df[col_consumo_d] = pd.to_numeric(df[col_consumo_d], errors='coerce')
        df[col_consumo_t] = pd.to_numeric(df[col_consumo_t], errors='coerce')
        mask = df[col_consumo_d] > 0
        if mask.any():
            ahorro_prom = ((df.loc[mask, col_consumo_d] - df.loc[mask, col_consumo_t]) / df.loc[mask, col_consumo_d] * 100).mean()
            ahorro_msg = f"\n- **Eficiencia Textil**: Ahorro promedio del {ahorro_prom:.1f}% por referencia gracias al trazador."

    md = f"""# 📊 Reporte Premium - Colección JO

**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Archivo:** {archivo_origen}

---

## 📋 Resumen Ejecutivo

- **Total Referencias:** {total_refs}
- **Unidades Totales:** {total_unidades:,}{ahorro_msg}

"""

    # Alertas
    if alertas:
        for a in alertas:
            if '🔴' in a:
                md += f"\n> [!IMPORTANT]\n> {a}\n"
            elif '🟠' in a:
                md += f"\n> [!WARNING]\n> {a}\n"

    # Distribución por Status
    if status_dist:
        md += "\n## 📌 Distribución por Estado\n\n"
        md += "| Estado | Referencias | % |\n|--------|------------|---|\n"
        for status, count in status_dist.items():
            md += f"| {status} | {count} | {round(count/total_refs*100, 1)}% |\n"

    # Top tallas
    if tallas_en:
        sums = df[tallas_en].sum().sort_values(ascending=False)
        md += "\n## 👗 Curva de Tallas\n\n"
        md += "| Talla | Unidades | % |\n|-------|----------|---|\n"
        total = sums.sum()
        for t, v in sums.items():
            if v > 0:
                md += f"| {t} | {int(v):,} | {round(v/total*100, 1)}% |\n" if total > 0 else f"| {t} | 0 | 0% |\n"

    md += f"\n---\n*Generado por AtelierData Agent | Score de Salud: {max(0, 100 - violaciones['criticas']*5 - violaciones['altas']*3)}/100*\n"

    output.write_text(md, encoding='utf-8')
    print(f"Reporte Premium generado: {output}")
    return str(output)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python reporte_premium.py <archivo.xlsx|csv> [--output dist/]")
        sys.exit(1)

    archivo = sys.argv[1]
    df = cargar_y_normalizar(archivo)
    violaciones, alertas = auditoria_rapida(df)
    generar_reporte(df, violaciones, alertas, archivo)
