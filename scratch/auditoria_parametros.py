"""
F1: Auditoría Comparativa de PARAMETROS entre los 3 archivos silo.

Compara:
  A = Copia de FO... APPAREL 2026 / PARAMETROS
  B = Copia de COLECCION WS27 / PARAMETROS
  C = Copia de CONTRAM WS27 / PARAMETROS

También extrae catálogos de los datos reales (MATRIZ/CSV) de cada archivo.

Output: dist/auditoria_parametros.md
"""

import sys, io, os
from pathlib import Path
from datetime import datetime
from collections import OrderedDict

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import pandas as pd

BASE = Path(r"C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0")
DOCS = BASE / "Documentos"
DIST = BASE / "dist"
DIST.mkdir(exist_ok=True)

nan = 'nan'

# ═══════════════════════════════════════════════════════════
# 1. CARGAR PARAMETROS DE LOS 3 ARCHIVOS
# ═══════════════════════════════════════════════════════════

def load_html_parametros(path, label):
    df = pd.read_html(str(path))[0]
    print(f"[{label}] Shape: {df.shape}")

    headers_row1 = {}
    for ci in range(1, len(df.columns)):
        v = str(df.iloc[1, ci]).strip() if pd.notna(df.iloc[1, ci]) else ''
        if v and v != nan:
            headers_row1[ci] = v

    data_rows = []
    for ri in range(2, len(df)):
        row_data = {}
        for ci, col_name in headers_row1.items():
            val = df.iloc[ri, ci]
            if pd.notna(val):
                row_data[col_name] = str(val).strip()
        if row_data:
            data_rows.append(row_data)

    print(f"[{label}] Headers: {list(headers_row1.values())}")
    print(f"[{label}] Data rows: {len(data_rows)}")
    return headers_row1, data_rows


print("=" * 60)
print("CARGANDO PARAMETROS DE LOS 3 ARCHIVOS")
print("=" * 60)

hA, dA = load_html_parametros(
    DOCS / "Copia de FO... APPAREL 2026" / "PARAMETROS.html", "A-APPAREL")

hC, dC = load_html_parametros(
    DOCS / "Copia de CONTRAM WS27" / "PARAMETROS.html", "C-CONTRAM")

hB, dB = load_html_parametros(
    DOCS / "Copia de COLECCION WS27" / "PARAMETROS.html", "B-COLECCION")

# ═══════════════════════════════════════════════════════════
# 2. COMPARAR PARAMETROS: A vs C (misma estructura base)
# ═══════════════════════════════════════════════════════════

def extract_column_set(data_rows, col_name):
    result = set()
    for row in data_rows:
        val = row.get(col_name, '')
        if val and val != nan and val not in ('', '#REF!', '#N/A'):
            result.add(val.strip())
    return result


def compare_columns(label_a, data_a, label_b, data_b, shared_cols):
    results = []
    for col in shared_cols:
        set_a = extract_column_set(data_a, col)
        set_b = extract_column_set(data_b, col)

        common = set_a & set_b
        only_a = set_a - set_b
        only_b = set_b - set_a

        results.append({
            'col': col,
            'count_a': len(set_a),
            'count_b': len(set_b),
            'common': len(common),
            'only_a': len(only_a),
            'only_b': len(only_b),
            'only_a_vals': sorted(only_a)[:10],
            'only_b_vals': sorted(only_b)[:10],
        })
    return results


shared_ac = set(hA.values()) & set(hC.values())
only_a_cols = set(hA.values()) - set(hC.values())
only_c_cols = set(hC.values()) - set(hA.values())

print(f"\nColumnas compartidas A-C: {sorted(shared_ac)}")
print(f"Columnas solo en A: {sorted(only_a_cols)}")
print(f"Columnas solo en C: {sorted(only_c_cols)}")

comp_ac = compare_columns("A", dA, "C", dC, shared_ac)

# ═══════════════════════════════════════════════════════════
# 3. COMPARAR PARAMETROS: B (estructura diferente)
# ═══════════════════════════════════════════════════════════

shared_ab = set(hA.values()) & set(hB.values())
shared_bc = set(hB.values()) & set(hC.values())
shared_abc = set(hA.values()) & set(hB.values()) & set(hC.values())
only_b_cols = set(hB.values()) - set(hA.values()) - set(hC.values())

print(f"\nColumnas compartidas A-B: {sorted(shared_ab)}")
print(f"Columnas compartidas B-C: {sorted(shared_bc)}")
print(f"Columnas compartidas A-B-C: {sorted(shared_abc)}")
print(f"Columnas solo en B: {sorted(only_b_cols)}")

# ═══════════════════════════════════════════════════════════
# 4. EXTRAER CATALOGOS DE DATOS REALES (CSV)
# ═══════════════════════════════════════════════════════════

def safe_val(v):
    if v is None or pd.isna(v):
        return ''
    s = str(v).strip()
    if s in ('', 'nan', '#N/A', '#REF!', '#REF! ', '0', '0.0'):
        return ''
    return s


def extract_csv_catalogs(csv_path, header_row_idx, catalog_cols, label):
    if not os.path.exists(csv_path):
        print(f"[{label}] CSV no encontrado: {csv_path}")
        return {}

    df = pd.read_csv(csv_path, encoding='utf-8-sig', low_memory=False, header=None)
    data = df.iloc[header_row_idx + 1:]

    catalogs = {}
    for name, col_idx in catalog_cols.items():
        if col_idx < len(data.columns):
            vals = data.iloc[:, col_idx].dropna().astype(str)
            vals = sorted(set(
                v.strip() for v in vals
                if v.strip() not in ('', 'nan', '#N/A', '#REF!', '0', '0.0')
            ))
            if vals:
                catalogs[name] = vals
                print(f"  [{label}] {name}: {len(vals)} valores")

    return catalogs


print("\n" + "=" * 60)
print("EXTRAYENDO CATALOGOS DE DATOS REALES")
print("=" * 60)

# B: VALIDACION DE TELAS
cats_B = extract_csv_catalogs(
    DOCS / "Copia de COLECCION WS27 - 1.VALIDACION DE TELAS.csv",
    3,
    {
        'STATUS': 3, 'MOD_ARTE': 4, 'UBI_TRAZO': 5, 'LARGO': 8,
        'USO_PRENDA': 9, 'DISENADOR_CREATIVO': 15, 'CAMBIO_MOLDERIA': 16,
        'DISENADOR_TECNICO': 21,
    },
    "B-COLECCION"
)

# A: FO APPAREL WS27
cats_A_ws27 = extract_csv_catalogs(
    DOCS / "Copia de FO... APPAREL 2026 - WS27.csv",
    2,
    {
        'STATUS': 10, 'DISENADOR_CREATIVO': 11, 'LINEA': 15, 'SUBLINEA': 16,
        'TIPO_REF': 17, 'TALLAJE': 18, 'LARGO': 19, 'CLOSURE': 20,
        'BASE_TEXTIL': 28, 'MOD_ARTE': 33, 'UBI_TRAZO': 34, 'ALL_OVER': 35,
        'STATUS_TALLER': 12, 'MODISTA': 13, 'LINNED': 21, 'INCLUDES': 22,
    },
    "A-WS27"
)

# A: FO APPAREL FW26
cats_A_fw26 = extract_csv_catalogs(
    DOCS / "Copia de FO... APPAREL 2026 - FW26.csv",
    3,
    {
        'STATUS': 10, 'DISENADOR_CREATIVO': 11, 'LINEA': 15, 'SUBLINEA': 16,
        'TIPO_REF': 17, 'TALLAJE': 18, 'LARGO': 19, 'CLOSURE': 20,
        'BASE_TEXTIL': 28, 'MOD_ARTE': 33, 'UBI_TRAZO': 34, 'ALL_OVER': 35,
        'STATUS_TALLER': 12, 'MODISTA': 13, 'LINNED': 21, 'INCLUDES': 22,
    },
    "A-FW26"
)

# ═══════════════════════════════════════════════════════════
# 5. FUSIONAR CATALOGOS Y DETECTAR CONFLICTOS
# ═══════════════════════════════════════════════════════════

def merge_catalogs(cats_dict):
    all_keys = set()
    for cats in cats_dict.values():
        all_keys.update(cats.keys())

    merged = {}
    for key in sorted(all_keys):
        sources = {}
        for src, cats in cats_dict.items():
            if key in cats:
                sources[src] = set(cats[key])

        all_vals = set()
        for vals in sources.values():
            all_vals.update(vals)

        source_labels = {k: sorted(v) for k, v in sources.items()}
        merged[key] = {
            'total_unique': len(all_vals),
            'sources': source_labels,
            'merged': sorted(all_vals),
        }

    return merged


all_cats = OrderedDict()
all_cats['B-COLECCION'] = cats_B
all_cats['A-WS27'] = cats_A_ws27
all_cats['A-FW26'] = cats_A_fw26

merged = merge_catalogs(all_cats)

# ═══════════════════════════════════════════════════════════
# 6. DETECTAR INCONSISTENCIAS EN PARAMETROS (COLORES/TELAS)
# ═══════════════════════════════════════════════════════════

def compare_ac_data(col_name):
    set_a = extract_column_set(dA, col_name)
    set_c = extract_column_set(dC, col_name)
    return {
        'a_count': len(set_a),
        'c_count': len(set_c),
        'common': len(set_a & set_c),
        'only_a': sorted(set_a - set_c)[:15],
        'only_c': sorted(set_c - set_c)[:15],
    }


ac_comparison = {}
for col in sorted(shared_ac):
    ac_comparison[col] = compare_ac_data(col)

# ═══════════════════════════════════════════════════════════
# 7. GENERAR REPORTE MARKDOWN
# ═══════════════════════════════════════════════════════════

report = []
report.append("# AUDITORIA COMPARATIVA DE PARAMETROS")
report.append("")
report.append(f"**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
report.append(f"**Archivos analizados:** 3 silos (A, B, C)")
report.append("")
report.append("---")
report.append("")

# ── Resumen Ejecutivo ──
report.append("## 1. RESUMEN EJECUTIVO")
report.append("")
report.append("| Aspecto | Archivo A (APPAREL) | Archivo B (COLECCION) | Archivo C (CONTRAM) |")
report.append("|---------|--------------------|-----------------------|--------------------|")
report.append(f"| Pestañas PARAMETROS | 1 hoja | 1 hoja | 1 hoja |")
report.append(f"| Columnas en PARAMETROS | {len(hA)} | {len(hB)} | {len(hC)} |")
report.append(f"| Filas de datos | {len(dA)} | {len(dB)} | {len(dC)} |")
report.append(f"| Columnas compartidas con A | - | {len(shared_ab)} | {len(shared_ac)} |")
report.append(f"| Columnas exclusivas | {len(only_a_cols)} | {len(only_b_cols)} | {len(only_c_cols)} |")
report.append("")

# ── Estructura PARAMETROS ──
report.append("## 2. ESTRUCTURA DE PARAMETROS POR ARCHIVO")
report.append("")

report.append("### 2.1 Archivo A - FO APPAREL 2026")
report.append("")
report.append("| # | Columna | Valores únicos |")
report.append("|---|---------|---------------|")
for i, (ci, name) in enumerate(sorted(hA.items()), 1):
    count = len(extract_column_set(dA, name))
    report.append(f"| {i} | {name} | {count} |")
report.append("")

report.append("### 2.2 Archivo B - COLECCION WS27")
report.append("")
report.append("| # | Columna | Valores únicos |")
report.append("|---|---------|---------------|")
for i, (ci, name) in enumerate(sorted(hB.items()), 1):
    count = len(extract_column_set(dB, name))
    report.append(f"| {i} | {name} | {count} |")
report.append("")
report.append("> **Nota:** El Archivo B tiene estructura completamente diferente. Sus columnas REF, FOTO y #REF! contienen datos de variación de color por referencia, NO catálogos desplegables.")
report.append("")

report.append("### 2.3 Archivo C - CONTRAM WS27")
report.append("")
report.append("| # | Columna | Valores únicos |")
report.append("|---|---------|---------------|")
for i, (ci, name) in enumerate(sorted(hC.items()), 1):
    count = len(extract_column_set(dC, name))
    report.append(f"| {i} | {name} | {count} |")
report.append("")

# ── Redundancia y Divergencia A vs C ──
report.append("## 3. REDUNDANCIA Y DIVERGENCIA: A vs C")
report.append("")
report.append("Los archivos A y C comparten la misma estructura base de PARAMETROS (COLORES + TELAS).")
report.append("")

report.append("### 3.1 Columnas compartidas")
report.append("")
report.append("| Columna | Valores en A | Valores en C | Comunes | Solo en A | Solo en C |")
report.append("|---------|-------------|-------------|---------|-----------|-----------|")
for r in comp_ac:
    report.append(
        f"| {r['col']} | {r['count_a']} | {r['count_b']} | {r['common']} "
        f"| {r['only_a']} | {r['only_b']} |"
    )
report.append("")

report.append("### 3.2 Columnas exclusivas de A")
report.append("")
for col in sorted(only_a_cols):
    count = len(extract_column_set(dA, col))
    report.append(f"- **{col}**: {count} valores")
report.append("")

report.append("### 3.3 Columnas exclusivas de C")
report.append("")
for col in sorted(only_c_cols):
    count = len(extract_column_set(dC, col))
    report.append(f"- **{col}**: {count} valores")
    if col.startswith('#') or col.startswith('PEGAR') or col.startswith('LINK'):
        vals = extract_column_set(dC, col)
        if vals:
            report.append(f"  - Muestra: `{sorted(vals)[:3]}`")
report.append("")

# ── Estructura B ──
report.append("## 4. ARCHIVO B: ESTRUCTURA INDEPENDIENTE")
report.append("")
report.append("El PARAMETROS del Archivo B (COLECCION WS27) tiene una estructura **completamente diferente** a A y C:")
report.append("")
report.append("- **Sección principal:** 'variacion de color' — contiene datos de referencias con sus fotos y códigos PT")
report.append("- **NO contiene catálogos desplegables** (no hay listas de diseñadores, modistas, estados, etc.)")
report.append("- **Columnas #REF!:** La mayoría de headers son fórmulas rotas (`#REF!`), lo que indica que la hoja PARAMETROS original referenciaba datos que ya no existen o se movieron")
report.append("- **Col 18 (FOTO TELA):** Referencia a fotos de telas")
report.append("- **Col 20-22:** Datos de referencias cruzadas (nombre de referencia, código PT)")
report.append("")
report.append("### Columnas con datos identificables en B")
report.append("")
report.append("| Columna | Contenido | Valores únicos |")
report.append("|---------|-----------|---------------|")
for ci, name in sorted(hB.items()):
    vals = extract_column_set(dB, name)
    if len(vals) > 0 and name not in ('#REF!', '#\u00bfREF!', 'REF'):
        sample = sorted(vals)[:3]
        report.append(f"| {name} | - | {len(vals)} | `{sample}` |")
report.append("")

# ── Catálogos de datos reales ──
report.append("## 5. CATALOGOS EXTRAIDOS DE DATOS REALES (MATRICES)")
report.append("")
report.append("Los catálogos desplegables (DISEÑADORES, MODISTAS, ESTADOS, etc.) **NO existen como secciones nombradas** en ninguna hoja PARAMETROS de los 3 archivos. Se extrajeron de los datos reales de las matrices/CSV.")
report.append("")

for cat_name, cat_data in merged.items():
    report.append(f"### 5.{list(merged.keys()).index(cat_name)+1} {cat_name}")
    report.append("")
    report.append(f"**Total valores únicos (fusionados):** {cat_data['total_unique']}")
    report.append("")

    sources = cat_data['sources']
    if len(sources) > 1:
        all_source_vals = set()
        for src, vals in sources.items():
            all_source_vals.update(vals)

        conflicts = []
        for val in sorted(all_source_vals):
            present_in = [src for src, vals in sources.items() if val in vals]
            if len(present_in) < len(sources):
                missing = [src for src in sources if src not in present_in]
                conflicts.append((val, present_in, missing))

        if conflicts:
            report.append("> **Divergencia entre fuentes detectada:**")
            report.append("")
            report.append("| Valor | Presente en | Ausente en |")
            report.append("|-------|------------|-----------|")
            for val, present, missing in conflicts[:20]:
                report.append(f"| `{val}` | {', '.join(present)} | {', '.join(missing)} |")
            if len(conflicts) > 20:
                report.append(f"| ... | *{len(conflicts)-20} más* | |")
            report.append("")

    report.append("| Fuente | Cantidad | Valores |")
    report.append("|--------|----------|---------|")
    for src, vals in sources.items():
        report.append(f"| {src} | {len(vals)} | `{', '.join(vals[:8])}{'...' if len(vals)>8 else ''}` |")
    report.append("")
    report.append("<details>")
    report.append(f"<summary>Valores fusionados completos ({cat_data['total_unique']})</summary>")
    report.append("")
    report.append(", ".join(f"`{v}`" for v in cat_data['merged']))
    report.append("")
    report.append("</details>")
    report.append("")

# ── Conclusiones y Recomendaciones ──
report.append("## 6. CONCLUSIONES Y HALLAZGOS CRITICOS")
report.append("")

report.append("### 6.1 Redundancia Confirmada")
report.append("")
report.append("- Los archivos A y C tienen **PARAMETROS casi idénticos** en las columnas base (CODIGO, DESCRIPCION, CODIGO TELA, DESCRIPCION TELA, ANCHO, FOTO TELA, OBSERVACIONES, BASADO EN, FOTO BASADO EN, PT BASADO EN)")
report.append(f"- Existen **{len(shared_ac)} columnas duplicadas** entre A y C")
report.append("- Los datos de colores/telas se mantienen manualmente en ambos archivos sin mecanismo de sincronización")
report.append("")

report.append("### 6.2 PARAMETROS sin catálogos nombrados")
report.append("")
report.append("- **Ninguno** de los 3 archivos tiene catálogos explícitos (DISEÑADORES, MODISTAS, LINEAS, etc.) en su hoja PARAMETROS")
report.append("- Los menús desplegables de las matrices se alimentan de rangos que no están documentados como secciones nombradas")
report.append("- El script `completar_parametros.py` ya definió 32 catálogos, pero nunca se integraron en los archivos Sheets reales")
report.append("")

report.append("### 6.3 Estructura B completamente diferente")
report.append("")
report.append("- El PARAMETROS de B no sirve como fuente de catálogos desplegables")
report.append("- Contiene datos de variación de color por referencia (no parámetros del sistema)")
report.append("- La mayoría de headers son `#REF!` (fórmulas rotas), indicando que la estructura original se corrompió")
report.append("")

report.append("### 6.4 Fotos sin gestión centralizada")
report.append("")
report.append("- Las fotos están incrustadas en celdas, referenciadas por BUSCARV contra PARAMETROS")
report.append("- El archivo C tiene 6 grupos de columnas para links de fotos por colección (FW25, WS26, RS26, SS26, SV26, PF26) que A no tiene")
report.append("- No existe un repositorio único de fotos; cada archivo gestiona las suyas independientemente")
report.append("")

report.append("### 6.5 Problemas de Encoding")
report.append("")
report.append("- Se detectaron caracteres corruptos (ej: 'CAFÉ' aparece como 'CAFÃ‰') en los datos de C")
report.append("- Esto causará discrepancias al comparar y fusionar datos entre archivos")
report.append("")

report.append("### 6.6 Recomendaciones para el Maestro de Parámetros")
report.append("")
report.append("1. **Fuente única de COLORES/TELAS:** Fusionar A y C, deduplicar por CODIGO, resolver encoding")
report.append("2. **Catálogos nombrados:** Crear explícitamente las secciones DISEÑADORES, MODISTAS, LINEAS, etc. en el Maestro (extrayendo de datos reales)")
report.append("3. **Descartar PARAMETROS de B:** No fusionar; la estructura es incompatible y los datos son de otro tipo")
report.append("4. **Links de fotos (solo C):** Migrar los 6 grupos de links de colecciones al Maestro bajo la pestaña FOTOS_MAESTRO")
report.append("5. **Resolver #REF!:** Eliminar fórmulas rotas antes de la migración")
report.append("6. **Normalizar encoding:** Aplicar UTF-8 consistente antes de comparar strings")
report.append("")

# Write report
output_path = DIST / "auditoria_parametros.md"
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(report))

print(f"\n{'='*60}")
print(f"REPORTE GENERADO: {output_path}")
print(f"Total lineas: {len(report)}")
print(f"Secciones: 6")
print(f"Catálogos fusionados: {len(merged)}")
print(f"='*60")
