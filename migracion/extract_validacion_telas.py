#!/usr/bin/env python3
"""
v3 - Extracción con tracking de rowspan/colspan para posiciones correctas.
Cada fila tiene diferente número de celdas visibles según rowspan de filas anteriores.
"""

import re
import csv
import json
from pathlib import Path
from bs4 import BeautifulSoup
from datetime import datetime

HTML_FILE = Path(r"D:\JO\ProjectJO-Antigravity\documentos\Copia de COLECCION WS27\1.VALIDACION DE TELAS.html")
OUTPUT_DIR = Path(__file__).parent / "output"

# ── Column definitions (0-indexed from A) ──
COL = {
    "REF": 0, "FOTO": 1, "REFERENCIA": 2, "STATUS": 3,
    "MOD_ARTE": 4, "UBI_TRAZO": 5, "VAR_COLOR_1": 6, "VAR_COLOR_2": 7,
    "LARGO": 8, "USO_PRENDA": 9, "CODIGO_TELA": 10, "DESC_TELA": 11,
    "ANCHO": 12, "TELA_FOTO": 13, "CONSUMO_BASE": 14,
    # col 15 = freezebar
    "CREATIVO_DISENADOR": 16, "CREATIVO_CAMBIO_MOLD": 17,
    "CREATIVO_C1": 18, "CREATIVO_C2": 19, "CREATIVO_C3": 20, "CREATIVO_OBS": 21,
    "TECNICO_DISENADOR": 22, "TECNICO_SOL_TALLA": 23, "TECNICO_SOL_UND": 24,
    "TECNICO_SOL_C1": 25, "TECNICO_SOL_C2": 26, "TECNICO_SOL_C3": 27,
    "TECNICO_MA_TALLA": 28, "TECNICO_MA_UND": 29,
    "TECNICO_MA_C1": 30, "TECNICO_MA_C2": 31, "TECNICO_MA_C3": 32,
    "TECNICO_UT_TALLA": 33, "TECNICO_UT_UND": 34,
    "TECNICO_UT_C1": 35, "TECNICO_UT_C2": 36, "TECNICO_UT_C3": 37,
    "TECNICO_OBS": 38,
    "TRAZO_SOL_TALLA": 39, "TRAZO_SOL_UND": 40,
    "TRAZO_SOL_C1": 41, "TRAZO_SOL_C2": 42, "TRAZO_SOL_C3": 43, "TRAZO_SOL_C4": 44,
    "TRAZO_MA_TALLA": 45, "TRAZO_MA_UND": 46,
    "TRAZO_MA_C1": 47, "TRAZO_MA_C2": 48, "TRAZO_MA_C3": 49, "TRAZO_MA_C4": 50,
    "TRAZO_UT_TALLA": 51, "TRAZO_UT_UND": 52,
    "TRAZO_UT_C1": 53, "TRAZO_UT_OBS": 54,
    "CONTRA_SOL_TALLA": 55, "CONTRA_SOL_UND": 56, "CONTRA_SOL_C1": 57,
    "CONTRA_MA_TALLA": 58, "CONTRA_MA_UND": 59, "CONTRA_MA_C1": 60,
    "CONTRA_UT_TALLA": 61, "CONTRA_UT_UND": 62, "CONTRA_UT_C1": 63,
    "CONTRA_OBS": 64,
}
NUM_COLS = max(COL.values()) + 1  # 65 columns (A-BM)

# ── Helpers ─────────────────────────────────────────────────────────────────

def limpiar(t):
    if t is None: return ""
    t = t.strip().replace('\u200b','').replace('\xa0',' ').replace('\u00a0',' ')
    if t in ('#N/A', '#!REF!', 'N/A', '�?<', '-'): return ""
    return t

def parse_consumo(t):
    t = limpiar(t)
    if not t: return None
    t = t.replace(',', '.').replace('CMS','').replace('MTS','').replace('Mts','').strip()
    try: return float(t)
    except ValueError: return None

def extract_img(cell_html):
    m = re.search(r'src="([^"]+)"', str(cell_html))
    return m.group(1) if m else ""


# ── Rowspan-aware grid builder ──────────────────────────────────────────────

def build_row_data(rows):
    """
    Builds a list of rows, where each row is a dict mapping col_index -> cell_info.
    Properly handles rowspan propagation.
    """
    n_rows = len(rows)
    # occupancy[r][c] = True if cell is already filled by rowspan from above
    occupancy = [[False] * NUM_COLS for _ in range(n_rows)]
    result = [{} for _ in range(n_rows)]

    for r_idx, tr in enumerate(rows):
        cells = tr.select('th, td')
        # Skip cell[0] which is the row-number <th>
        data_cells = cells[1:]
        c_idx = 0

        for cell in data_cells:
            # Skip already-occupied columns
            while c_idx < NUM_COLS and occupancy[r_idx][c_idx]:
                c_idx += 1
            if c_idx >= NUM_COLS:
                break

            rowspan = int(cell.get('rowspan', 1))
            colspan = int(cell.get('colspan', 1))
            text = cell.get_text(strip=True)
            html = str(cell)

            # Mark occupancy for this cell's span
            for dr in range(rowspan):
                rr = r_idx + dr
                if rr >= n_rows: break
                for dc in range(colspan):
                    cc = c_idx + dc
                    if cc < NUM_COLS:
                        occupancy[rr][cc] = True

            # Store cell data at its primary position
            result[r_idx][c_idx] = {'text': text, 'html': html, 'colspan': colspan}

            c_idx += colspan

    return result


def get_cell(row_data, col_idx):
    """Get clean text from a specific column in a row."""
    info = row_data.get(col_idx)
    if info:
        return limpiar(info['text'])
    return ""

def get_cell_html(row_data, col_idx):
    info = row_data.get(col_idx)
    return info['html'] if info else ""


# ── Main extraction ─────────────────────────────────────────────────────────

def extraer_referencias():
    with open(HTML_FILE, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()
    soup = BeautifulSoup(html, 'lxml')
    tbody = soup.select_one('tbody')
    all_rows = tbody.select('tr')

    # Build rowspan-aware data
    print("Construyendo grid con tracking de rowspan...")
    rows_data = build_row_data(all_rows)
    print(f"Grid: {len(rows_data)} filas x {NUM_COLS} columnas")

    referencias = []
    ref_id = 1
    idx = 5  # primera fila de datos

    while idx < len(rows_data):
        cell_val = get_cell(rows_data[idx], COL["REF"])
        if cell_val.isdigit():
            print(f"  Ref {cell_val}...")
            ref = extraer_bloque(rows_data, idx, ref_id)
            if ref:
                referencias.append(ref)
                ref_id += 1
            idx += 19
        else:
            idx += 1

    print(f"\nTotal referencias extraidas: {len(referencias)}")
    return referencias


def extraer_bloque(rows_data, start, ref_id):
    """Extrae datos de un bloque de 19 filas."""
    end = start + 19
    if end > len(rows_data):
        return None

    # ── Generales (fila 0 del bloque) ──
    r0 = rows_data[start]
    ref_num = get_cell(r0, COL["REF"])
    status = get_cell(r0, COL["STATUS"])

    ref_info = {
        "id_referencia": ref_id,
        "ref": ref_num,
        "foto_url": extract_img(get_cell_html(r0, COL["FOTO"])),
        "nombre_sistema": get_cell(r0, COL["REFERENCIA"]),
        "status": status,
        "mod_arte": get_cell(r0, COL["MOD_ARTE"]),
        "ubi_trazo": get_cell(r0, COL["UBI_TRAZO"]),
        "var_color_1": get_cell(r0, COL["VAR_COLOR_1"]),
        "var_color_2": get_cell(r0, COL["VAR_COLOR_2"]),
        "largo": get_cell(r0, COL["LARGO"]),
        "oculto": "TRUE" if status.upper() == "CANCELADO" else "FALSE",
    }

    creativo_dis = get_cell(r0, COL["CREATIVO_DISENADOR"])
    creativo_mold = get_cell(r0, COL["CREATIVO_CAMBIO_MOLD"])
    tecnico_dis = get_cell(r0, COL["TECNICO_DISENADOR"])

    # ── Telas (filas 0-12 del bloque) ──
    telas = []
    for local_idx in range(13):
        rd = rows_data[start + local_idx]
        uso = get_cell(rd, COL["USO_PRENDA"])
        cod = get_cell(rd, COL["CODIGO_TELA"])
        if not uso and not cod:
            continue
        telas.append({
            "id_tela": len(telas) + 1,
            "uso_en_prenda": uso,
            "codigo_tela": cod,
            "descripcion_tela": get_cell(rd, COL["DESC_TELA"]),
            "ancho": get_cell(rd, COL["ANCHO"]),
            "tela_foto_url": extract_img(get_cell_html(rd, COL["TELA_FOTO"])),
            "consumo_base": get_cell(rd, COL["CONSUMO_BASE"]),
            "activo": "TRUE",
            "orden": len(telas) + 1,
        })

    # ── Consumos creativo (filas 0-12) ──
    consumos_creativo = []
    for local_idx in range(13):
        rd = rows_data[start + local_idx]
        if local_idx >= len(telas):
            continue
        tela_id = telas[local_idx]["id_tela"]
        for vnum, colkey in [("1", "CREATIVO_C1"), ("2", "CREATIVO_C2"), ("3", "CREATIVO_C3")]:
            val = parse_consumo(get_cell(rd, COL[colkey]))
            if val is not None:
                consumos_creativo.append({
                    "tela_id": tela_id, "area": "CREATIVO", "tipo_tela": "SOLIDO",
                    "version": vnum, "talla": "", "und": "",
                    "consumo_valor": val, "disenador": creativo_dis,
                    "cambio_molderia": creativo_mold,
                    "observaciones": get_cell(rd, COL["CREATIVO_OBS"]) if vnum == "1" else "",
                })

    # ── Consumos tecnico (filas 0-12) ──
    consumos_tecnico = []
    for local_idx in range(13):
        rd = rows_data[start + local_idx]
        if local_idx >= len(telas):
            continue
        tela_id = telas[local_idx]["id_tela"]
        obs = get_cell(rd, COL["TECNICO_OBS"])

        for tipo, keys in [
            ("SOLIDO", [("TECNICO_SOL_C1","1"),("TECNICO_SOL_C2","2"),("TECNICO_SOL_C3","3")]),
            ("MOD_ARTE", [("TECNICO_MA_C1","1"),("TECNICO_MA_C2","2"),("TECNICO_MA_C3","3")]),
            ("UBICACION_TRAZO", [("TECNICO_UT_C1","1"),("TECNICO_UT_C2","2"),("TECNICO_UT_C3","3")]),
        ]:
            for colkey, vnum in keys:
                val = parse_consumo(get_cell(rd, COL[colkey]))
                if val is not None:
                    consumos_tecnico.append({
                        "tela_id": tela_id, "area": "TECNICO", "tipo_tela": tipo,
                        "version": vnum, "talla": "", "und": "",
                        "consumo_valor": val, "disenador": tecnico_dis,
                        "observaciones": obs,
                    })

    # ── Consumos trazo (filas 0-12) ──
    consumos_trazo = []
    for local_idx in range(13):
        rd = rows_data[start + local_idx]
        if local_idx >= len(telas):
            continue
        tela_id = telas[local_idx]["id_tela"]
        obs = get_cell(rd, COL["TRAZO_UT_OBS"])

        for tipo, keys in [
            ("SOLIDO", ["TRAZO_SOL_C1","TRAZO_SOL_C2","TRAZO_SOL_C3","TRAZO_SOL_C4"]),
            ("MOD_ARTE", ["TRAZO_MA_C1","TRAZO_MA_C2","TRAZO_MA_C3","TRAZO_MA_C4"]),
            ("UBICACION_TRAZO", ["TRAZO_UT_C1"]),
        ]:
            for vnum, colkey in enumerate(keys, 1):
                val = parse_consumo(get_cell(rd, COL[colkey]))
                if val is not None:
                    consumos_trazo.append({
                        "tela_id": tela_id, "area": "TRAZO_Y_CORTE", "tipo_tela": tipo,
                        "version": str(vnum), "talla": "", "und": "",
                        "consumo_valor": val, "observaciones": obs,
                    })

    # ── Consumos contramuestra (filas 0-12) ──
    consumos_contra = []
    for local_idx in range(13):
        rd = rows_data[start + local_idx]
        if local_idx >= len(telas):
            continue
        tela_id = telas[local_idx]["id_tela"]
        obs = get_cell(rd, COL["CONTRA_OBS"])
        for tipo, colkey in [("SOLIDO","CONTRA_SOL_C1"),("MOD_ARTE","CONTRA_MA_C1"),("UBICACION_TRAZO","CONTRA_UT_C1")]:
            val = parse_consumo(get_cell(rd, COL[colkey]))
            if val is not None:
                consumos_contra.append({
                    "tela_id": tela_id, "tipo_tela": tipo, "version": "1",
                    "talla": "", "und": "", "consumo_valor": val,
                    "observaciones": obs,
                })

    # ── Insumos (filas 14-18 del bloque) ──
    insumos = []
    for local_idx in range(14, 19):
        rd = rows_data[start + local_idx]
        nombre = get_cell(rd, COL["USO_PRENDA"])
        if not nombre or "INSUMOS" in nombre.upper():
            continue
        insumos.append({
            "nombre": nombre,
            "consumo_creativo": parse_consumo(get_cell(rd, COL["CREATIVO_C1"])),
            "consumo_tecnico": parse_consumo(get_cell(rd, COL["TECNICO_SOL_C1"])),
            "consumo_trazo": parse_consumo(get_cell(rd, COL["TRAZO_SOL_C1"])),
            "consumo_contra": parse_consumo(get_cell(rd, COL["CONTRA_SOL_C1"])),
        })

    return {
        "referencia": ref_info,
        "telas": telas,
        "consumos_creativo": consumos_creativo,
        "consumos_tecnico": consumos_tecnico,
        "consumos_trazo": consumos_trazo,
        "consumos_contramuestra": consumos_contra,
        "insumos": insumos,
    }


# ── CSV Export ──────────────────────────────────────────────────────────────

def exportar_csvs(referencias):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    now = datetime.now().strftime("%Y-%m-%d")

    # referencias.csv
    with open(OUTPUT_DIR / "referencias.csv", 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f)
        w.writerow(["ID_REFERENCIA","REF","FOTO_URL","NOMBRE_SISTEMA","STATUS",
                     "MOD_ARTE","UBI_TRAZO","VARIACION_COLOR_1","VARIACION_COLOR_2",
                     "LARGO","OCULTO","FECHA_COSTEO","FECHA_CREACION","ULTIMA_MODIFICACION",
                     "USUARIO_MODIFICACION"])
        for r in referencias:
            ref = r["referencia"]
            w.writerow([ref["id_referencia"],ref["ref"],ref["foto_url"],
                        ref["nombre_sistema"],ref["status"],ref["mod_arte"],
                        ref["ubi_trazo"],ref["var_color_1"],ref["var_color_2"],
                        ref["largo"],ref["oculto"],"",now,now,"migracion"])

    # telas_x_referencia.csv
    tela_global_id = 1
    id_map = {}
    with open(OUTPUT_DIR / "telas_x_referencia.csv", 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f)
        w.writerow(["ID_TELA","ID_REFERENCIA","USO_EN_PRENDA","CODIGO_TELA",
                     "DESCRIPCION_TELA","ANCHO","TELA_FOTO_URL","CONSUMO_BASE",
                     "ACTIVO","FECHA_CAMBIO","MOTIVO_CAMBIO","TELA_REEMPLAZO_ID","ORDEN"])
        for r in referencias:
            for t in r["telas"]:
                gid = tela_global_id
                id_map[(r["referencia"]["id_referencia"], t["id_tela"])] = gid
                w.writerow([gid,r["referencia"]["id_referencia"],t["uso_en_prenda"],
                            t["codigo_tela"],t["descripcion_tela"],t["ancho"],
                            t["tela_foto_url"],t["consumo_base"],t["activo"],
                            "","","",t["orden"]])
                t["global_id"] = gid
                tela_global_id += 1

    # Helper to write consumo CSVs
    cid = 1
    def wc(fname, header, rows_fn):
        nonlocal cid
        with open(OUTPUT_DIR / fname, 'w', newline='', encoding='utf-8-sig') as f:
            w = csv.writer(f)
            w.writerow(header)
            for r in referencias:
                for item in rows_fn(r):
                    gid = id_map.get((r["referencia"]["id_referencia"], item["tela_id"]), "")
                    row = [cid, gid, r["referencia"]["id_referencia"]] + item["extra"]
                    w.writerow(row)
                    cid += 1

    wc("consumos_costeocre.csv",
       ["ID_CONSUMO","ID_TELA","ID_REFERENCIA","AREA","TIPO_TELA",
        "VERSION","TALLA","UND","CONSUMO_VALOR","OBSERVACIONES",
        "DISEÑADOR","CAMBIO_MOLDERIA","ES_FINAL","FECHA_REGISTRO","USUARIO_REGISTRO"],
       lambda r: [{
           "tela_id": c["tela_id"],
           "extra": [c["area"],c["tipo_tela"],c["version"],c["talla"],c["und"],
                     c["consumo_valor"],c["observaciones"],c["disenador"],
                     c["cambio_molderia"],"FALSE",now,"migracion"]
       } for c in r["consumos_creativo"]])

    wc("consumos_costeodt.csv",
       ["ID_CONSUMO","ID_TELA","ID_REFERENCIA","AREA","TIPO_TELA",
        "VERSION","TALLA","UND","CONSUMO_VALOR","OBSERVACIONES",
        "DISEÑADOR","ES_FINAL","FECHA_REGISTRO","USUARIO_REGISTRO"],
       lambda r: [{
           "tela_id": c["tela_id"],
           "extra": [c["area"],c["tipo_tela"],c["version"],c["talla"],c["und"],
                     c["consumo_valor"],c["observaciones"],c["disenador"],
                     "FALSE",now,"migracion"]
       } for c in r["consumos_tecnico"]])

    wc("consumos_costeoet.csv",
       ["ID_CONSUMO","ID_TELA","ID_REFERENCIA","AREA","TIPO_TELA",
        "VERSION","TALLA","UND","CONSUMO_VALOR","OBSERVACIONES",
        "ES_FINAL","FECHA_REGISTRO","USUARIO_REGISTRO"],
       lambda r: [{
           "tela_id": c["tela_id"],
           "extra": [c["area"],c["tipo_tela"],c["version"],c["talla"],c["und"],
                     c["consumo_valor"],c["observaciones"],"TRUE",now,"migracion"]
       } for c in r["consumos_trazo"]])

    wc("consumos_contramuestra.csv",
       ["ID_CONSUMO","ID_TELA","ID_REFERENCIA","TIPO_TELA",
        "VERSION","TALLA","UND","CONSUMO_VALOR","OBSERVACIONES",
        "FECHA_REGISTRO","USUARIO_REGISTRO"],
       lambda r: [{
           "tela_id": c["tela_id"],
           "extra": [c["tipo_tela"],c["version"],c["talla"],c["und"],
                     c["consumo_valor"],c["observaciones"],now,"migracion"]
       } for c in r["consumos_contramuestra"]])

    # insumos.csv
    iid = 1
    with open(OUTPUT_DIR / "insumos.csv", 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f)
        w.writerow(["ID_INSUMO","ID_REFERENCIA","NOMBRE_INSUMO",
                     "CONSUMO_CREATIVO","CONSUMO_TECNICO","CONSUMO_TRAZO",
                     "CONSUMO_CONTRAMUESTRA","OBSERVACIONES"])
        for r in referencias:
            for ins in r["insumos"]:
                w.writerow([iid,r["referencia"]["id_referencia"],ins["nombre"],
                            ins["consumo_creativo"] or "",ins["consumo_tecnico"] or "",
                            ins["consumo_trazo"] or "",ins["consumo_contra"] or "",""])
                iid += 1

    # resumen
    resumen = {
        "fecha_extraccion": datetime.now().isoformat(),
        "total_referencias": len(referencias),
        "total_telas": tela_global_id - 1,
        "total_consumos_creativo": sum(len(r["consumos_creativo"]) for r in referencias),
        "total_consumos_tecnico": sum(len(r["consumos_tecnico"]) for r in referencias),
        "total_consumos_trazo": sum(len(r["consumos_trazo"]) for r in referencias),
        "total_consumos_contramuestra": sum(len(r["consumos_contramuestra"]) for r in referencias),
        "total_insumos": iid - 1,
    }
    with open(OUTPUT_DIR / "resumen.json", 'w', encoding='utf-8') as f:
        json.dump(resumen, f, indent=2, ensure_ascii=False)

    print(f"\n--- CSV exportados en {OUTPUT_DIR} ---")
    for k, v in resumen.items():
        if k.startswith("total_"):
            print(f"  {k}: {v}")


if __name__ == "__main__":
    refs = extraer_referencias()
    exportar_csvs(refs)
    print("\nCompletado!")
