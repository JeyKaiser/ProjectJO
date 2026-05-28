"""
ETL Script v2 — Migracion de CSVs a Supabase PostgreSQL
Optimized: pre-fetch references, batch inserts, ignore duplicates.
"""
import csv, os, sys, json, time
from collections import defaultdict
import requests

BASE = "https://tstxmyowfesgaczlgjxp.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzdHhteW93ZmVzZ2FjemxnanhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTg5Mzk1NiwiZXhwIjoyMDk1NDY5OTU2fQ.55DJaPF1Dgv4f7stEN6e_aOR9qmCqQ2jH_9y8uapLd0"

DOCS = r"C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos"
WS27_TELAS = os.path.join(DOCS, "Copia de COLECCION WS27 - 1.VALIDACION DE TELAS.csv")
FO_WS27 = os.path.join(DOCS, "Copia de FO... APPAREL 2026 - WS27.csv")
PARAM_TELAS = os.path.join(DOCS, "PARAMETROS POR TELA - BIK. BOTTOM.csv")

API = f"{BASE}/rest/v1"
HEADERS = {
    "apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Accept-Profile": "jo", "Content-Profile": "jo",
    "Prefer": "return=minimal,resolution=ignore-duplicates",
}

stats = {"inserted": 0, "errors": 0, "tables": defaultdict(int)}

def safe(val, default=''):
    if val is None or str(val).strip() in ('', '#N/A', 'N/A', '#REF!', '#REF'): return default
    s = str(val).strip()
    if s.upper() in ('N/A', '#N/A', '#REF!', '#REF', 'R/#REF!'): return default
    return s

def clean_consumo(val):
    if not val: return None
    s = str(val).strip().upper().replace('MTS','').replace('MT','').replace('CMS','').strip()
    s = s.replace(',', '.')
    try: return float(s)
    except: return None

def si_no(val):
    v = safe(val).upper()
    if v == 'SI': return True
    if v == 'NO': return False
    return None

def post(table, data):
    if isinstance(data, dict): data = [data]
    data = [d for d in data if d]
    if not data: return 0
    url = f"{API}/{table}"
    n = 0
    for i in range(0, len(data), 50):
        batch = data[i:i+50]
        r = requests.post(url, headers=HEADERS, json=batch, timeout=30)
        if r.status_code in (200, 201, 204): n += len(batch)
        else:
            stats["errors"] += len(batch)
            sys.stderr.write(f"  ERR {table}: {r.status_code} {r.text[:100]}\n")
        time.sleep(0.05)
    if n:
        stats["tables"][table] += n
        stats["inserted"] += n
    return n

def fetch(table, params={}, limit=10000):
    """Fetch all rows from a table."""
    rows = []
    offset = 0
    while True:
        p = {**params, "select": params.get("select", "*"), "limit": limit, "offset": offset}
        r = requests.get(f"{API}/{table}", headers=HEADERS, params=p, timeout=15)
        if r.status_code != 200: break
        batch = r.json()
        if not batch or len(batch) == 0: break
        rows.extend(batch)
        if len(batch) < limit: break
        offset += limit
    return rows

# ══════════════════════════════════════════════════════════════════════
# 1. MIGRAR PARAMETROS POR TELA -> fabrics
# ══════════════════════════════════════════════════════════════════════
def migrar_parametros_tela():
    print("\n=== CATALOGO DE TELAS ===")
    with open(PARAM_TELAS, 'r', encoding='utf-8-sig') as f:
        rows = list(csv.reader(f))

    header_idx = 3
    for i, row in enumerate(rows):
        if row and 'CODIGO' in str(row[0]).upper():
            header_idx = i; break

    fabrics, seen = [], set()
    for i in range(header_idx + 1, len(rows)):
        row = rows[i]
        code = safe(row[0]) if len(row) > 0 else ''
        desc = safe(row[2]) if len(row) > 2 else ''
        if not code or code in seen: continue
        seen.add(code)
        fabrics.append({"code": code, "description": desc[:200]})
    n = post("fabrics", fabrics)
    print(f"  fabrics: {n} insertados, {stats['errors']} errores")

# ══════════════════════════════════════════════════════════════════════
# 2. EXTRAER DATOS DEL CSV VALIDACION DE TELAS
# ══════════════════════════════════════════════════════════════════════
def extract_validacion_telas():
    """Lee el CSV y devuelve: refs_data, telas_data (por referencia), consumos_data"""
    with open(WS27_TELAS, 'r', encoding='utf-8-sig') as f:
        rows = list(csv.reader(f))

    header_idx = None
    for i, row in enumerate(rows):
        if row and row[0].strip() == 'REF' and 'FOTO' in str(row):
            header_idx = i; break
    if header_idx is None: header_idx = 3

    C = {
        'REF':0, 'FOTO':1, 'REFERENCIA':2, 'STATUS':3, 'MOD_ARTE':4, 'UBI_TRAZO':5,
        'VARIACION_COLOR':6, 'LARGO':8, 'USO_PRENDA':9, 'CODIGO_TELA':10,
        'DESCRIPCION_TELA':11, 'ANCHO':12, 'TELA_FOTO':13, 'CONSUMO_BASE':14,
        'DISENADOR_CREATIVO':15, 'CAMBIO_MOLDERIA':16,
        'CONSUMO1':17, 'CONSUMO2':18, 'CONSUMO3':19, 'OBS_CREATIVO':20,
        'DISENADOR_TECNICO':21,
        'TALLA_SOLIDO':22, 'UND_SOLIDO':23, 'CONSUMO1_SOLIDO':24, 'CONSUMO2_SOLIDO':25, 'CONSUMO3_SOLIDO':26,
        'TALLA_MOD':27, 'UND_MOD':28, 'CONSUMO1_MOD':29, 'CONSUMO2_MOD':30, 'CONSUMO3_MOD':31,
        'TALLA_UBI':32, 'UND_UBI':33, 'CONSUMO1_UBI':34, 'CONSUMO2_UBI':35, 'CONSUMO3_UBI':36,
        'OBS_TECNICO':37,
        'TRAZO_TALLA_SOLIDO':39, 'TRAZO_UND_SOLIDO':40,
        'TRAZO_CONS1':41, 'TRAZO_CONS2':42, 'TRAZO_CONS3':43, 'TRAZO_CONS4':44,
        'TRAZO_TALLA_MOD':45, 'TRAZO_UND_MOD':46,
        'TRAZO_CONS_MOD1':47, 'TRAZO_CONS_MOD2':48, 'TRAZO_CONS_MOD3':49,
        'TRAZO_TALLA_UBI':50, 'TRAZO_UND_UBI':51,
        'TRAZO_CONS_UBI1':52, 'TRAZO_CONS_UBI2':53,
        'TEC':64, 'TRAZADOR':65, 'TERMINADO_TALLER':66,
    }

    def g(row, key):
        idx = C.get(key, -1)
        return safe(row[idx]) if idx >= 0 and idx < len(row) else ''

    refs = {}          # ref_num -> {name, status, ...}
    telas_data = []    # list of {ref_num, codigo_tela, uso, ancho, consumo_base}
    consumos_data = [] # list of {ref_num, role, tipo_tela, version, talla, ...}
    current_ref = None
    ref_level_data = {} # cache reference-level fields

    data_start = header_idx + 1
    for i in range(data_start, len(rows)):
        row = rows[i]
        ref_val = safe(row[0]) if len(row) > 0 else ''
        uso = g(row, 'USO_PRENDA')
        cod_tela = g(row, 'CODIGO_TELA')

        if not ref_val.isdigit() and current_ref and (uso or cod_tela):
            ref_val = current_ref
        if not ref_val or not ref_val.isdigit():
            continue

        if safe(row[0]) and safe(row[0]).isdigit():
            current_ref = ref_val
        ref_num = int(ref_val)

        # Store reference-level data on first encounter
        if ref_num not in refs:
            refs[ref_num] = {
                "collection_id": 1,  # WS27
                "reference_number": str(ref_num),
                "name": safe(row[C['REFERENCIA']]) or f"REF-{ref_num}",
                "main_image_url": safe(row[C['FOTO']]),
                "status_id": 1,  # EN_PROCESO by default
                "has_art_modification": si_no(g(row, 'MOD_ARTE')) or False,
                "has_trace_location": si_no(g(row, 'UBI_TRAZO')) or False,
                "length_description": g(row, 'LARGO'),
            }

        # Tela data
        if cod_tela:
            ancho_str = g(row, 'ANCHO').replace(',', '.')
            ancho = float(ancho_str) if ancho_str and ancho_str.replace('.','').isdigit() else None
            telas_data.append({
                "ref_num": ref_num,
                "codigo_tela": cod_tela,
                "descripcion_tela": g(row, 'DESCRIPCION_TELA'),
                "uso": uso,
                "ancho": ancho,
                "consumo_base": clean_consumo(g(row, 'CONSUMO_BASE')),
            })

        # Consumos creativo
        for ver in [1, 2, 3]:
            cval = clean_consumo(g(row, f'CONSUMO{ver}'))
            if cval and cval > 0:
                consumos_data.append({
                    "ref_num": ref_num, "role": "CREATIVO", "version": ver,
                    "consumo_valor": cval, "observaciones": g(row, 'OBS_CREATIVO'),
                    "cambio_molderia": si_no(g(row, 'CAMBIO_MOLDERIA')),
                })

        # Consumos tecnico - solido
        for ver in range(1, 4):
            cval = clean_consumo(g(row, f'CONSUMO{ver}_SOLIDO'))
            if cval and cval > 0:
                consumos_data.append({
                    "ref_num": ref_num, "role": "TECNICO", "tipo_tela": "SOLIDO", "version": ver,
                    "talla": g(row, 'TALLA_SOLIDO') or None,
                    "unidades": int(safe(row[C['UND_SOLIDO']])) if safe(row[C['UND_SOLIDO']]).isdigit() else None,
                    "consumo_valor": cval, "observaciones": g(row, 'OBS_TECNICO'),
                })

        # Consumos trazador - solido
        for ver in range(1, 5):
            cval = clean_consumo(g(row, f'TRAZO_CONS{ver}'))
            if cval and cval > 0:
                consumos_data.append({
                    "ref_num": ref_num, "role": "TRAZADOR", "tipo_tela": "SOLIDO", "version": ver,
                    "talla": g(row, 'TRAZO_TALLA_SOLIDO') or None,
                    "unidades": int(safe(row[C['TRAZO_UND_SOLIDO']])) if safe(row[C['TRAZO_UND_SOLIDO']]).isdigit() else None,
                    "consumo_valor": cval,
                })

    return refs, telas_data, consumos_data

# ══════════════════════════════════════════════════════════════════════
# 3. MIGRAR A SUPABASE
# ══════════════════════════════════════════════════════════════════════
def migrar():
    print("="*60)
    print("ETL Supabase v2 — Migracion Colecciones JO")
    print("="*60)

    # ---- Catalogo de telas ----
    migrar_parametros_tela()

    # ---- Extraer datos del CSV WS27 ----
    print("\n=== EXTRACCION VALIDACION DE TELAS WS27 ===")
    refs, telas_data, consumos_data = extract_validacion_telas()
    print(f"  Referencias a migrar: {len(refs)}")
    print(f"  Telas por referencia: {len(telas_data)}")
    print(f"  Consumos: {len(consumos_data)}")

    # ---- Insertar referencias ----
    print("\n=== INSERTANDO REFERENCIAS ===")
    refs_list = [r for r in refs.values()]
    n = post("references", refs_list)
    print(f"  references: {n} nuevos")

    # ---- Fetch all reference IDs ----
    print("\n=== CARGANDO MAPA DE IDs ===")
    all_refs = fetch("references", {"select": "id,reference_number"})
    ref_map = {str(r["reference_number"]): r["id"] for r in all_refs}
    all_fabs = fetch("fabrics", {"select": "id,code"})
    fab_map = {r["code"]: r["id"] for r in all_fabs}
    print(f"  Referencias: {len(ref_map)} | Telas: {len(fab_map)}")

    # ---- Insertar referencia_fabrics ----
    print("\n=== INSERTANDO REFERENCE_FABRICS ===")
    rf_list = []
    new_fabrics = set()
    for t in telas_data:
        ref_id = ref_map.get(str(t["ref_num"]))
        if not ref_id: continue
        code = t["codigo_tela"]
        fab_id = fab_map.get(code)
        if not fab_id and code not in new_fabrics:
            new_fabrics.add(code)
        if not fab_id: continue
        rf_list.append({
            "reference_id": ref_id, "fabric_id": fab_id,
            "usage": t["uso"], "width_cm": t["ancho"],
            "consumo_base": t["consumo_base"],
        })

    # Insert new fabrics first
    if new_fabrics:
        post("fabrics", [{"code": c} for c in new_fabrics])
        all_fabs = fetch("fabrics", {"select": "id,code"})
        fab_map = {r["code"]: r["id"] for r in all_fabs}
        # Rebuild rf_list with new fabric IDs
        rf_list = []
        for t in telas_data:
            ref_id = ref_map.get(str(t["ref_num"]))
            fab_id = fab_map.get(t["codigo_tela"])
            if not ref_id or not fab_id: continue
            rf_list.append({
                "reference_id": ref_id, "fabric_id": fab_id,
                "usage": t["uso"], "width_cm": t["ancho"],
                "consumo_base": t["consumo_base"],
            })

    n = post("reference_fabrics", rf_list)
    print(f"  reference_fabrics: {n} insertados ({len(new_fabrics)} telas nuevas)")

    # ---- Insertar consumos ----
    print("\n=== INSERTANDO CONSUMOS ===")
    cons_list = []
    for c in consumos_data:
        ref_id = ref_map.get(str(c["ref_num"]))
        if not ref_id: continue
        entry = {
            "reference_id": ref_id, "role": c["role"], "version": c["version"],
            "consumo_valor": c["consumo_valor"],
        }
        if c.get("tipo_tela"): entry["tipo_tela"] = c["tipo_tela"]
        if c.get("talla"): entry["talla"] = c["talla"]
        if c.get("unidades"): entry["unidades"] = c["unidades"]
        if c.get("observaciones"): entry["observaciones"] = c["observaciones"]
        if c.get("cambio_molderia") is not None: entry["cambio_molderia"] = c["cambio_molderia"]
        cons_list.append(c["key"] if "key" in c else entry)

    # Group by key signature for PGRST compliance
    groups = defaultdict(list)
    for entry in cons_list:
        ks = tuple(sorted(entry.keys()))
        groups[ks].append(entry)
    for ks, group in groups.items():
        post("consumos", group)
    print(f"  consumos: {len(cons_list)} registros procesados")

    # ---- Resumen final ----
    print("\n" + "="*60)
    print(f"RESUMEN FINAL: {stats['inserted']} registros insertados, {stats['errors']} errores")
    for t, c in sorted(stats["tables"].items()):
        print(f"  jo.{t}: {c}")
    print("="*60)

if __name__ == "__main__":
    migrar()
