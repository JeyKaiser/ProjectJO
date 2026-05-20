"""
SCRIPT: eficiencia_textil.py
FASE 3 - Eficiencia Textil
Uso: python eficiencia_textil.py <archivo.csv|xlsx> [--output dist/]
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sys
import json
from datetime import datetime

DIST_DIR = Path('dist')
DIST_DIR.mkdir(exist_ok=True)

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

def encontrar_columna(df, keywords):
    """Busca una columna que contenga todas las keywords."""
    for col in df.columns:
        cu = col.upper()
        if all(kw.upper() in cu for kw in keywords):
            return col
    return None

def calcular_eficiencia(df):
    resultados = []

    col_ref = df.columns[0]  # Asumir primera columna es Ref
    col_total = encontrar_columna(df, ['TOTAL'])

    for idx, row in df.iterrows():
        ref = row.get(col_ref, idx)

        # Consumo diseñador: buscar máximo entre consumos disponibles
        consumo_disenador = 0
        for kw in [['CONSUMO'], ['CREATIVO'], ['TECNICO'], ['SOLIDO'], ['MOD ARTE'], ['UBI TRAZO']]:
            col = encontrar_columna(df, kw)
            if col:
                val = pd.to_numeric(row[col], errors='coerce')
                if pd.notna(val) and val > consumo_disenador:
                    consumo_disenador = val

        # Consumo trazador
        consumo_trazador = 0
        for kw in [['TRAZADOR'], ['TRAZO', 'CONSUMO']]:
            col = encontrar_columna(df, kw)
            if col:
                val = pd.to_numeric(row[col], errors='coerce')
                if pd.notna(val) and val > consumo_trazador:
                    consumo_trazador = val

        if consumo_disenador > 0 and consumo_trazador > 0:
            ahorro = consumo_disenador - consumo_trazador
            pct_ahorro = (ahorro / consumo_disenador) * 100
            total_unidades = pd.to_numeric(row.get(col_total, 0), errors='coerce') or 0

            resultados.append({
                'ref': str(ref),
                'consumo_disenador': round(consumo_disenador, 2),
                'consumo_trazador': round(consumo_trazador, 2),
                'ahorro_lineal_m': round(ahorro, 2),
                'pct_ahorro': round(pct_ahorro, 1),
                'unidades': int(total_unidades),
                'ahorro_total_proyectado_m': round(ahorro * total_unidades, 2)
            })

    return sorted(resultados, key=lambda x: x['pct_ahorro'], reverse=True)

def generar_reporte(eficiencia, output_dir=DIST_DIR):
    output = output_dir / f'eficiencia_textil_{datetime.now().strftime("%Y%m%d_%H%M")}.md'

    if not eficiencia:
        md = "# Eficiencia Textil\n\nNo se encontraron datos suficientes para calcular eficiencia.\n"
        output.write_text(md, encoding='utf-8')
        return

    total_ahorro = sum(e['ahorro_total_proyectado_m'] for e in eficiencia)
    pct_promedio = sum(e['pct_ahorro'] for e in eficiencia) / len(eficiencia)
    referencias_con_ahorro = sum(1 for e in eficiencia if e['ahorro_lineal_m'] > 0)

    md = f"""# Análisis de Eficiencia Textil

**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M')}

## Resumen

- **Referencias analizadas:** {len(eficiencia)}
- **Referencias con ahorro positivo:** {referencias_con_ahorro}
- **Ahorro promedio:** {pct_promedio:.1f}%
- **Ahorro total proyectado:** {total_ahorro:.2f} m lineales

## Top 10 Referencias con Mayor Ahorro

| Ref | Consumo Diseñador | Consumo Trazador | Ahorro (m) | % Ahorro | Unidades | Ahorro Total (m) |
|-----|-------------------|------------------|------------|----------|----------|-------------------|
"""
    for e in eficiencia[:10]:
        md += f"| {e['ref']} | {e['consumo_disenador']:.2f} | {e['consumo_trazador']:.2f} | {e['ahorro_lineal_m']:.2f} | {e['pct_ahorro']}% | {e['unidades']:,} | {e['ahorro_total_proyectado_m']:.2f} |\n"

    # Alertas
    negativos = [e for e in eficiencia if e['ahorro_lineal_m'] < 0]
    if negativos:
        md += f"\n> [!WARNING]\n> **{len(negativos)} referencias** tienen consumo del trazador mayor que el del diseñador (ahorro negativo). Revisar.\n"

    output.write_text(md, encoding='utf-8')
    print(f"Reporte generado: {output}")
    print(json.dumps({'total_referencias': len(eficiencia), 'ahorro_total_m': round(total_ahorro, 2),
                      'pct_promedio': round(pct_promedio, 1)}, indent=2))

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python eficiencia_textil.py <archivo.xlsx|csv>")
        sys.exit(1)

    df = cargar_archivo(sys.argv[1])
    eficiencia = calcular_eficiencia(df)
    generar_reporte(eficiencia)
