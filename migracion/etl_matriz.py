"""
ETL MATRIZ — Lee archivo MATRIZ .xlsx y migra directamente a Supabase.
Columnas por posicion fija segun row 9 del Excel (A=1, B=2, ..., HD=214).

Uso:
  python migracion/etl_matriz.py
  python migracion/etl_matriz.py --file "Documentos/Copia de CONTRAM WS27.xlsx" --collection WS
  python migracion/etl_matriz.py --file "Documentos/FO APPAREL FW26.xlsx" --collection FW
"""
import sys, os, csv, json, time, re, argparse
from datetime import datetime
from collections import defaultdict
import requests
import openpyxl

# ═══════════════════════════════════════════════════════ CONFIG
BASE = "https://tstxmyowfesgaczlgjxp.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzdHhteW93ZmVzZ2FjemxnanhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTg5Mzk1NiwiZXhwIjoyMDk1NDY5OTU2fQ.55DJaPF1Dgv4f7stEN6e_aOR9qmCqQ2jH_9y8uapLd0"
API = f"{BASE}/rest/v1"

H = {
    "apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Accept-Profile": "jo", "Content-Profile": "jo",
    "Prefer": "return=minimal",
}

# ═══════════════════════════════════════════════════════ CLI ARGS
DEFAULT_FILE = r"C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de CONTRAM WS27.xlsx"
parser = argparse.ArgumentParser(description="ETL MATRIZ -> Supabase")
parser.add_argument("--file", default=DEFAULT_FILE, help="Archivo xlsx de entrada")
parser.add_argument("--collection", default="WS", help="Code de coleccion: WS, RS, SS, SV, PF, FW (default: WS)")
parser.add_argument("--year", type=int, default=2026, help="Anio de la coleccion (default: 2026)")
parser.add_argument("--dry-run", action="store_true", help="Solo parsear, no subir")
args_cli = parser.parse_args()
XLSX_FILE = args_cli.file
COLLECTION_CODE = args_cli.collection.upper()
COLLECTION_YEAR = args_cli.year
DRY_RUN = args_cli.dry_run

if not os.path.exists(XLSX_FILE):
    print(f"ERROR: No existe el archivo {XLSX_FILE}")
    print("Uso: python etl_matriz.py --file 'ruta/archivo.xlsx' --collection WS")
    sys.exit(1)

stats = {"inserted": 0, "errors": 0, "tables": defaultdict(int)}

# ═══════════════════════════════════════════════════════ HELPERS
def safe(val, default=""):
    if val is None: return default
    s = str(val).strip()
    if not s or s in ("#N/A", "N/A", "#REF!", "#REF", "0", "-"): return default
    return s

def safe_num(val):
    s = safe(val)
    try: return int(s)
    except: return None

def safe_float(val):
    s = safe(val).upper().replace("MTS", "").replace("MT", "").replace("CMS", "").strip()
    s = s.replace(",", ".")
    try: return float(s)
    except: return None

def si_no(val):
    v = safe(val).upper()
    if v == "SI": return True
    if v == "NO": return False
    return None

def is_ok(val):
    v = safe(val).upper()
    return v in ("OK", "X", "✓", "TRUE")

def parse_date(val):
    if not val: return None
    if isinstance(val, datetime):
        return val.strftime("%Y-%m-%d")
    s = str(val).strip()
    m = re.search(r"(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})", s)
    if m:
        y = m.group(3)
        if len(y) == 2: y = "20" + y
        return f"{y}-{m.group(2).zfill(2)}-{m.group(1).zfill(2)}"
    try:
        n = float(s)
        if 40000 < n < 60000:
            from datetime import datetime, timedelta
            return (datetime(1899, 12, 30) + timedelta(days=int(n))).strftime("%Y-%m-%d")
    except: pass
    return s if len(s) >= 8 else None

STATUS_MAP = {"APROBADO": 2, "EN PROCESO": 1, "EN_PROCESO": 1, "CANCELADO": 3,
    "CANCELADO CORTADO": 3, "CANCELADO SIN CORTAR": 3, "JUST FOR SHOW": 3,
    "PAQUETE COMPLETO": 4, "PENDIENTE": 6, "TERMINADO": 2, "RECHAZADO": 5}

DIFICULTAD_MAP = {"BAJA": 1, "BAJO": 1, "MEDIA": 2, "MEDIO": 2,
    "INTERMEDIA": 2, "INTERMEDIO": 2, "ALTA": 3, "ALTO": 3, "CRITICO": 3, "CRITICA": 3,
    "MENOR": 1, "MAYOR": 3, "MUY ALTA": 3}

# ═══════════════════════════════════════════════════════ API
def post(table, data):
    if not data: return 0
    url = f"{API}/{table}"
    n = 0
    for i in range(0, len(data), 50):
        batch = data[i:i+50]
        r = requests.post(url, headers=H, json=batch, timeout=30)
        if r.status_code in (200, 201, 204): n += len(batch)
        else:
            stats["errors"] += len(batch)
            if r.status_code not in (409,):
                sys.stderr.write(f"  ERR {table}: {r.status_code} {r.text[:100]}\n")
        time.sleep(0.05)
    if n:
        stats["tables"][table] += n
        stats["inserted"] += n
    return n

def upsert(table, data, on_conflict=""):
    """Upsert with Prefer header for conflict resolution."""
    if not data: return 0
    url = f"{API}/{table}"
    h = {**H, "Prefer": "return=minimal,resolution=ignore-duplicates"}
    n = 0
    for i in range(0, len(data), 50):
        batch = data[i:i+50]
        params = {}
        if on_conflict:
            params["on_conflict"] = on_conflict
        r = requests.post(url, headers=h, json=batch, params=params, timeout=30)
        if r.status_code in (200, 201, 204): n += len(batch)
        else:
            stats["errors"] += len(batch)
            if r.status_code not in (409,):
                sys.stderr.write(f"  ERR {table}: {r.status_code} {r.text[:100]}\n")
        time.sleep(0.05)
    if n:
        stats["tables"][table] += n
        stats["inserted"] += n
    return n

def fetch_ids(table, key_field="code"):
    ids = {}
    r = requests.get(f"{API}/{table}", headers=H, params={"select": f"id,{key_field}"}, timeout=15)
    if r.status_code == 200:
        for row in r.json():
            v = str(row.get(key_field, ""))
            if v: ids[v] = row["id"]
    return ids

# ═══════════════════════════════════════════════════════ COLUMN MAP
# Row 9 = headers, col 1-based. Data from row 10+
C = {
    # 0-based indices used in code
    "ref": 0, "imagen": 1, "cod_md": 2, "cod_pt": 3, "nombre": 4,
    "color": 5, "cod_color": 6, "foto_ref": 7, "pt_ref": 8, "basado_en": 9,
    "status": 10, "disenador": 11, "status_taller": 12, "modista": 13, "fotos_int": 14,
    "linea": 15, "sublinea": 16, "tipo_ref": 17, "tallaje": 18, "largo": 19,
    "closure": 20, "linned": 21, "includes": 22, "includes_paq": 23,
    "cod_tela_lucir": 24, "foto_tela": 25, "desc_tela": 26, "ancho_tela": 27, "base_textil": 28,
    "cod_tela_forro": 29, "desc_forro": 30, "ancho_forro": 31,
    "mod_arte": 32, "ubi_trazo": 33, "all_over": 34, "sugerencia_mod": 35,
    "var_color": 36, "ref_var": 37, "tipo_empaque": 38,
    "bordado_aplica": 39, "bordado_desc": 40,
    "semielab_aplica": 42, "semielab_desc": 43,
    "prov_ext": 44, "proc_ext": 45, "costo_ext": 46,
    "ent_creativo": 47, "ent_tecnico_proc": 48, "ent_tecnico_comp": 49,
    "ent_trazador": 50, "envio_mod": 51,
    "especif_conf": 52, "escalado_mold": 53, "tiras_cont": 54,
    "dific_prenda": 55, "dific_bordado": 56, "tira_cont_com": 57,
    "bordado_tipo": 59, "grupo": 60,
    "com_ing": 61, "com_trazo": 62, "com_costeo": 63, "requiere_muestra": 65,
    "fecha_hallazgo": 69, "area_afect": 70, "clasif_hallazgo": 71, "mp": 72,
    "sap_muestra": 75, "desc_usa_m": 76, "fiber_m": 77, "woven_m": 78,
    "inside_m": 79, "include_m": 80, "obs_m": 81,
    "sap_prod": 82, "desc_usa_p": 83, "fiber_p": 84, "woven_p": 85,
    "inside_p": 86, "include_p": 87, "obs_p": 88,
    "proceso_cuid": 90, "lavado": 91, "desmanche": 93, "secado": 95, "planchado": 97,
    "t0": 100, "t2": 101, "t4": 102, "t6": 103, "t8": 104,
    "t10": 105, "t12": 106, "txs": 107, "ts": 108, "tm": 109, "tl": 110, "txl": 111,
    "tipo_tejido": 113, "compl_corte": 114, "envio_corte": 115,
    "compl_conf": 116, "envio_conf": 117,
    "montaje_tipo": 118, "montaje_proy": 120,
    "dis_tec": 121, "dis_cre": 122,
    "mold_ini": 123, "mold_fin": 124, "mold_com": 125,
    "proc_ext2_tipo": 126, "proc_ext2_rec": 127, "proc_ext2_ent": 128,
    "corte_f1": 130, "corte_t1": 131, "corte_f2": 132, "corte_t2": 133,
    "corte_f3": 134, "corte_t3": 135, "corte_f4": 136, "corte_t4": 137,
    "corte_obs": 138, "corte_piezas": 139, "corte_muestras": 140,
    "conf_modista": 141, "conf_ini": 142, "conf_ent": 143, "conf_estado": 144,
    "conf_obs": 145, "conf_tiempo": 148,
    "conf_est_planta": 149, "conf_rechazo": 150, "conf_feedback": 151,
    "med_f1": 152, "med_c1": 153, "med_f2": 154, "med_c2": 155,
    "med_f3": 156, "med_c3": 157, "med_f4": 158, "med_c4": 159,
    "med_f5": 160, "med_c5": 161,
    "prioridad": 172, "fecha_meta": 173, "drops": 174, "status_cm": 175,
    "cont_nombre": 182, "cont_talla": 183, "cont_color": 184,
    "cont_ot": 185, "cont_nota": 186, "cont_gestion": 187,
    "cont_traslado": 188, "cont_despacho": 189,
}

TALLA_NAMES = ["0","2","4","6","8","10","12","XS","S","M","L","XL"]
TALLA_KEYS = ["t0","t2","t4","t6","t8","t10","t12","txs","ts","tm","tl","txl"]

# ═══════════════════════════════════════════════════════ MAIN
def main():
    print("=" * 60)
    print("ETL MATRIZ -> Supabase")
    print(f"File: {XLSX_FILE}")
    print(f"Collection: {COLLECTION_CODE}, Year: {COLLECTION_YEAR}")
    if DRY_RUN: print("MODO DRY-RUN (sin subir)")
    print("=" * 60)

    # ── 1. Read xlsx ──
    size_mb = os.path.getsize(XLSX_FILE) / (1024 * 1024)
    print(f"\nLeyendo archivo xlsx ({size_mb:.0f} MB)...")
    wb = openpyxl.load_workbook(XLSX_FILE, read_only=True, data_only=True)
    ws = wb["MATRIZ"]

    # Con read_only=True no hay max_row/max_column. Leemos fila a fila.
    all_rows = list(ws.iter_rows(min_row=1, values_only=True))
    max_row = len(all_rows)
    max_col = len(all_rows[0]) if all_rows else 0
    print(f"  Hoja MATRIZ: {max_row} filas, {max_col} columnas")

    # ── 2. Get collection ID ──
    col_id = None
    r = requests.get(f"{API}/collections", headers=H, params={"code": f"eq.{COLLECTION_CODE}", "select": "id"}, timeout=10)
    if r.status_code == 200 and r.json():
        col_id = r.json()[0]["id"]
    if not col_id:
        print("ERROR: No se encontro la coleccion WS")
        return

    # ── 3. Pre-fetch catalogs ──
    print("\nCargando catalogos...")
    line_ids = fetch_ids("lines", "name")
    fab_ids = fetch_ids("fabrics", "code")
    print(f"  Lineas: {len(line_ids)}, Telas: {len(fab_ids)}")

    # ── 4. Parse rows ──
    print("\nParseando datos...")
    refs = {}        # ref_num -> dict
    telas_all = []   # list of dicts
    bordados = []
    semielab = []
    procesos_ext = []
    entregables = []
    composiciones = []
    cuidados = []
    prod_units = []
    montajes = []
    molderia = []
    cortes = []
    confecciones = []
    medidas = []
    contramuestras = []
    calidad = []
    referentes = []
    codes_md_pt = []

    row_count = 0
    for r_idx in range(9, max_row):  # row 10 = index 9 (0-based)
        row = all_rows[r_idx]
        ref = safe(str(row[C["ref"]]) if C["ref"] < len(row) else "") if row else ""
        if not ref or not ref.isdigit():
            continue
        rn = int(ref)
        row_count += 1
        if row_count % 25 == 0:
            print(f"  Procesando fila {r_idx+1}... ({row_count} refs)")

        def g(k):
            idx = C.get(k, -1)
            return safe(row[idx]) if 0 <= idx < len(row) else ""
        def gd(k):
            idx = C.get(k, -1)
            return parse_date(row[idx]) if 0 <= idx < len(row) else None
        def gn(k):
            idx = C.get(k, -1)
            return safe_num(row[idx]) if 0 <= idx < len(row) else None
        def gf(k):
            idx = C.get(k, -1)
            return safe_float(row[idx]) if 0 <= idx < len(row) else None

        # Reference core
        if rn not in refs:
            status_val = g("status").upper()
            status_id = 1
            for k, v in STATUS_MAP.items():
                if k in status_val: status_id = v; break

            ref_obj = {
                "reference_number": str(rn),
                "name": g("nombre") or f"REF-{rn}",
                "color": g("color") or None,
                "color_code": g("cod_color") or None,
                "status_id": status_id,
                "length_description": g("largo") or None,
                "has_art_modification": si_no(g("mod_arte")) or False,
                "has_trace_location": si_no(g("ubi_trazo")) or False,
                "has_all_over": si_no(g("all_over")) or False,
                "has_embroidery": si_no(g("bordado_aplica")) or False,
                "has_semielaborated": si_no(g("semielab_aplica")) or False,
                "especificacion_confeccion": g("especif_conf") or None,
                "escalado_molderia_notes": g("escalado_mold") or None,
                "tiras_continuas": g("tiras_cont") or None,
                "sugerencia_mod_ubc": g("sugerencia_mod") or None,
                "requiere_muestra": si_no(g("requiere_muestra")),
                "grupo_estilo": g("grupo") or None,
                "header_notes": g("com_ing") or None,
                "trace_notes": g("com_trazo") or None,
                "costing_notes": g("com_costeo") or None,
                "envio_corte_maquila": si_no(g("envio_corte")),
                "envio_confeccion_maquila": si_no(g("envio_conf")),
                "collection_id": col_id,
            }
            # Tallaje
            tallaje = g("tallaje")
            if tallaje:
                # Find tallaje_group_id
                pass  # will resolve after insert
            refs[rn] = ref_obj

            # MD / PT codes
            md = g("cod_md")
            pt = g("cod_pt")
            if md and md not in ("-", "0"): codes_md_pt.append({"ref_num": rn, "type": "MD", "code": md})
            if pt and pt not in ("-", "0"): codes_md_pt.append({"ref_num": rn, "type": "PT", "code": pt})

        # Telas
        cod_lucir = g("cod_tela_lucir")
        if cod_lucir:
            telas_all.append({"ref_num": rn, "uso": "TELA LUCIR", "codigo": cod_lucir,
                "desc": g("desc_tela"), "ancho": gf("ancho_tela"), "base": g("base_textil")})
        cod_forro = g("cod_tela_forro")
        if cod_forro and cod_forro != "-":
            telas_all.append({"ref_num": rn, "uso": "TELA FORRO", "codigo": cod_forro,
                "desc": g("desc_forro"), "ancho": gf("ancho_forro")})

        # Bordado
        if g("bordado_desc") or si_no(g("bordado_aplica")):
            bordados.append({"ref_num": rn, "desc": g("bordado_desc"), "tipo": g("bordado_tipo")})

        # Semielaborado
        if g("semielab_desc"):
            semielab.append({"ref_num": rn, "desc": g("semielab_desc")})

        # Proceso externo
        if g("prov_ext"):
            procesos_ext.append({"ref_num": rn, "prov": g("prov_ext"), "proc": g("proc_ext"), "costo": gf("costo_ext")})

        # Entregables
        for e_type, e_key in [("CREATIVO", "ent_creativo"), ("TECNICO_PROC", "ent_tecnico_proc"),
                               ("TECNICO_COMP", "ent_tecnico_comp"), ("TRAZADOR", "ent_trazador"),
                               ("ENVIO_MOD_ARTE", "envio_mod")]:
            v = g(e_key)
            if v:
                entregables.append({"ref_num": rn, "tipo": e_type, "completado": is_ok(v), "obs": v})

        # Composiciones
        if g("fiber_m"):
            composiciones.append({"ref_num": rn, "scope": "MUESTRA", "sap": is_ok(g("sap_muestra")),
                "desc_usa": g("desc_usa_m"), "fiber": g("fiber_m"), "woven": g("woven_m"),
                "inside": g("inside_m"), "include": g("include_m"), "obs": g("obs_m")})
        if g("fiber_p"):
            composiciones.append({"ref_num": rn, "scope": "PRODUCCION", "sap": is_ok(g("sap_prod")),
                "desc_usa": g("desc_usa_p"), "fiber": g("fiber_p"), "woven": g("woven_p"),
                "inside": g("inside_p"), "include": g("include_p"), "obs": g("obs_p")})

        # Cuidados
        for ct, ck in [("LAVADO", "lavado"), ("DESMANCHE", "desmanche"), ("SECADO", "secado"),
                        ("PLANCHADO", "planchado"), ("PROCESO", "proceso_cuid")]:
            inst = g(ck)
            if inst:
                ct_id = {"LAVADO": 1, "SECADO": 2, "PLANCHADO": 3, "DESMANCHE": 4, "PROCESO": 5}.get(ct, 5)
                cuidados.append({"ref_num": rn, "care_type_id": ct_id, "instruction": inst})

        # Unidades
        for tname, tkey in zip(TALLA_NAMES, TALLA_KEYS):
            qty = gn(tkey)
            if qty and qty > 0:
                prod_units.append({"ref_num": rn, "size": tname, "quantity": qty})

        # Montaje
        if g("montaje_tipo"):
            montajes.append({"ref_num": rn, "tipo": g("montaje_tipo"), "proy": g("montaje_proy")})

        # Molderia
        mi, mf, mc = gd("mold_ini"), gd("mold_fin"), g("mold_com")
        if mi or mf or mc:
            molderia.append({"ref_num": rn, "inicio": mi, "fin": mf, "comentarios": mc})

        # Cortes
        for n in range(1, 5):
            fk = f"corte_f{n}"; tk = f"corte_t{n}"
            fecha, tipo = gd(fk), g(tk)
            if fecha or tipo:
                cortes.append({"ref_num": rn, "numero": n, "fecha": fecha, "tipo": tipo,
                    "obs": g("corte_obs"), "piezas": gn("corte_piezas"), "muestras": gn("corte_muestras")})

        # Confeccion
        if g("conf_modista") or gd("conf_ini"):
            confecciones.append({"ref_num": rn, "modista": g("conf_modista"),
                "ini": gd("conf_ini"), "ent": gd("conf_ent"), "estado": g("conf_estado"),
                "obs": g("conf_obs"), "tiempo": gn("conf_tiempo"),
                "est_planta": g("conf_est_planta"), "rechazo": g("conf_rechazo"),
                "feedback": g("conf_feedback")})

        # Mediciones
        for n in range(1, 6):
            fk = f"med_f{n}"; ck = f"med_c{n}"
            fecha, com = gd(fk), g(ck)
            if fecha or com:
                medidas.append({"ref_num": rn, "fase": n, "fecha": fecha, "comentario": com})

        # Contramuestra
        if g("cont_ot") or g("cont_nombre"):
            contramuestras.append({"ref_num": rn, "ot": g("cont_ot"), "nombre": g("cont_nombre"),
                "talla": g("cont_talla"), "color": g("cont_color"),
                "nota": g("cont_nota"), "gestion": gd("cont_gestion"),
                "traslado": gd("cont_traslado"), "despacho": gd("cont_despacho"),
                "prioridad": gn("prioridad"), "fecha_meta": gd("fecha_meta"),
                "drops": g("drops"), "status_cm": g("status_cm")})

        # Calidad
        if gd("fecha_hallazgo") or g("area_afect"):
            calidad.append({"ref_num": rn, "fecha": gd("fecha_hallazgo"), "area": g("area_afect"),
                "clasif": g("clasif_hallazgo"), "mp": g("mp")})

        # Referentes
        pt_r = g("pt_ref")
        if pt_r and pt_r != "N/A":
            referentes.append({"ref_num": rn, "pt": pt_r, "nombre": g("basado_en")})

    wb.close()
    print(f"  Total referencias: {len(refs)}")
    print(f"  Telas: {len(telas_all)} | Bordados: {len(bordados)} | Medidas: {len(medidas)}")
    print(f"  Cortes: {len(cortes)} | Confecciones: {len(confecciones)} | Contramuestras: {len(contramuestras)}")
    print(f"  Composiciones: {len(composiciones)} | Cuidados: {len(cuidados)} | Unidades: {len(prod_units)}")

    # ══════════════════════════════════════════════════ UPLOAD
    if DRY_RUN:
        print(f"\nMODO DRY-RUN: {len(refs)} referencias parseadas, no se subio nada.")
        print(f"Telas: {len(telas_all)}, Bordados: {len(bordados)}, Medidas: {len(medidas)}")
        print(f"Cortes: {len(cortes)}, Confecciones: {len(confecciones)}")
        print(f"Composiciones: {len(composiciones)}, Cuidados: {len(cuidados)}")
        return

    print("\n" + "=" * 60)
    print("SUBIENDO A SUPABASE...")
    print("=" * 60)

    # 1. References
    print("\n[1/15] Referencias...")
    ref_list = list(refs.values())
    n = upsert("references", ref_list)
    print(f"  {n} referencias")

    # Fetch ref IDs
    ref_map = {}
    r = requests.get(f"{API}/references", headers=H,
                     params={"collection_id": f"eq.{col_id}", "select": "id,reference_number"}, timeout=15)
    if r.status_code == 200:
        for row in r.json():
            ref_map[str(row["reference_number"])] = row["id"]
    print(f"  IDs obtenidos: {len(ref_map)}")

    # 2. Reference codes (MD/PT)
    print("\n[2/15] Codigos MD/PT...")
    codes = []
    for c in codes_md_pt:
        rid = ref_map.get(str(c["ref_num"]))
        if rid:
            codes.append({"reference_id": rid, "code_type": c["type"], "code": c["code"]})
    upsert("reference_codes", codes)
    print(f"  {len(codes)} codigos")

    # 3. Fabrics (collect unique codes)
    print("\n[3/15] Catalogo de telas...")
    new_fabs = []
    seen = set(fab_ids.keys())
    for t in telas_all:
        if t["codigo"] and t["codigo"] not in seen:
            seen.add(t["codigo"])
            new_fabs.append({"code": t["codigo"], "description": t["desc"][:200] if t["desc"] else t["codigo"]})
    if new_fabs:
        upsert("fabrics", new_fabs)
        fab_ids = fetch_ids("fabrics", "code")
    print(f"  {len(new_fabs)} telas nuevas, total: {len(fab_ids)}")

    # 4. Reference fabrics
    print("\n[4/15] Telas por referencia...")
    rf_list = []
    for t in telas_all:
        rid = ref_map.get(str(t["ref_num"]))
        fid = fab_ids.get(t["codigo"])
        if rid and fid:
            rf_list.append({"reference_id": rid, "fabric_id": fid, "usage": t["uso"],
                           "width_cm": t["ancho"], "notes": t["base"] if t.get("base") else None})
    upsert("reference_fabrics", rf_list)
    print(f"  {len(rf_list)} registros")

    # 5. Bordados
    print("\n[5/15] Bordados...")
    b_list = []
    for b in bordados:
        rid = ref_map.get(str(b["ref_num"]))
        if rid:
            b_list.append({"reference_id": rid, "bordado_type": "EN_PRENDA", "description": b["desc"]})
    upsert("reference_embroidery", b_list)
    print(f"  {len(b_list)}")

    # 6. Semielaborados
    print("\n[6/15] Semielaborados...")
    s_list = [{"reference_id": ref_map.get(str(s["ref_num"])), "semi_elaborated_type": "BORDADO", "description": s["desc"]}
              for s in semielab if ref_map.get(str(s["ref_num"]))]
    s_list = [x for x in s_list if x["reference_id"]]
    upsert("reference_semielaborated", s_list)
    print(f"  {len(s_list)}")

    # 7. Procesos externos
    print("\n[7/15] Procesos externos...")
    p_list = [{"reference_id": ref_map.get(str(p["ref_num"])), "provider": p["prov"],
               "description": p["proc"], "cost": p["costo"]}
              for p in procesos_ext if ref_map.get(str(p["ref_num"]))]
    p_list = [x for x in p_list if x["reference_id"]]
    upsert("external_processes", p_list)
    print(f"  {len(p_list)}")

    # 8. Entregables
    print("\n[8/15] Entregables...")
    e_list = [{"reference_id": ref_map.get(str(e["ref_num"])), "tipo": e["tipo"],
               "completado": e["completado"], "observaciones": e["obs"]}
              for e in entregables if ref_map.get(str(e["ref_num"]))]
    e_list = [x for x in e_list if x["reference_id"]]
    upsert("entregables", e_list)
    print(f"  {len(e_list)}")

    # 9. Composiciones
    print("\n[9/15] Composiciones...")
    c_list = [{"reference_id": ref_map.get(str(c["ref_num"])), "scope": c["scope"],
               "sap_registered": c["sap"], "description_usauk": c["desc_usa"],
               "fiber_composition": c["fiber"], "woven_knitted": c["woven"],
               "inside_composition": c["inside"], "include_description": c["include"],
               "notes": c["obs"]}
              for c in composiciones if ref_map.get(str(c["ref_num"]))]
    c_list = [x for x in c_list if x["reference_id"]]
    upsert("compositions", c_list)
    print(f"  {len(c_list)}")

    # 10. Cuidados
    print("\n[10/15] Cuidados...")
    cu_list = [{"reference_id": ref_map.get(str(cu["ref_num"])),
                "care_type_id": cu["care_type_id"], "instruction": cu["instruction"]}
               for cu in cuidados if ref_map.get(str(cu["ref_num"]))]
    cu_list = [x for x in cu_list if x["reference_id"]]
    upsert("care_instructions", cu_list)
    print(f"  {len(cu_list)}")

    # 11. Unidades
    print("\n[11/15] Unidades de produccion...")
    u_list = [{"reference_id": ref_map.get(str(u["ref_num"])), "size": u["size"], "quantity": u["quantity"]}
              for u in prod_units if ref_map.get(str(u["ref_num"]))]
    u_list = [x for x in u_list if x["reference_id"]]
    upsert("production_units", u_list)
    print(f"  {len(u_list)}")

    # 12. Molderia
    print("\n[12/15] Molderia...")
    m_list = [{"reference_id": ref_map.get(str(m["ref_num"])), "fecha_inicio": m["inicio"],
               "fecha_fin": m["fin"], "comentarios": m["comentarios"]}
              for m in molderia if ref_map.get(str(m["ref_num"]))]
    m_list = [x for x in m_list if x["reference_id"]]
    upsert("molderia", m_list)
    print(f"  {len(m_list)}")

    # 13. Cortes
    print("\n[13/15] Cortes...")
    ct_list = [{"reference_id": ref_map.get(str(ct["ref_num"])), "cut_number": ct["numero"],
                "cut_date": ct["fecha"], "cut_type": ct["tipo"],
                "observations": ct["obs"], "units_piece": ct["piezas"], "units_sample": ct["muestras"]}
               for ct in cortes if ref_map.get(str(ct["ref_num"]))]
    ct_list = [x for x in ct_list if x["reference_id"]]
    upsert("cuts", ct_list)
    print(f"  {len(ct_list)}")

    # 14. Confecciones
    print("\n[14/15] Confecciones...")
    sw_list = [{"reference_id": ref_map.get(str(s["ref_num"])),
                "start_date": s["ini"], "end_date": s["ent"], "status": s["estado"],
                "notes": s["obs"], "engineering_time_minutes": s["tiempo"],
                "plant_status": s["est_planta"], "plant_rejection_type": s["rechazo"],
                "plant_feedback": s["feedback"]}
               for s in confecciones if ref_map.get(str(s["ref_num"]))]
    sw_list = [x for x in sw_list if x["reference_id"]]
    upsert("sewings", sw_list)
    print(f"  {len(sw_list)}")

    # 15. Mediciones
    print("\n[15/15] Mediciones...")
    med_list = [{"reference_id": ref_map.get(str(m["ref_num"])), "phase": m["fase"],
                 "measure_date": m["fecha"], "comments": m["comentario"]}
                for m in medidas if ref_map.get(str(m["ref_num"]))]
    med_list = [x for x in med_list if x["reference_id"]]
    upsert("measures", med_list)
    print(f"  {len(med_list)}")

    # Extras: Contramuestras, Calidad, Montaje, Referentes
    print("\n[Extra] Contramuestras...")
    cm_list = [{"reference_id": ref_map.get(str(c["ref_num"])), "codigo_ot": c["ot"],
                "nombre": c["nombre"], "talla": c["talla"], "descripcion_color": c["color"],
                "prioridad": c["prioridad"], "fecha_meta_entrega": c["fecha_meta"],
                "drop_entrega": c["drops"], "status": c["status_cm"]}
               for c in contramuestras if ref_map.get(str(c["ref_num"]))]
    cm_list = [x for x in cm_list if x["reference_id"]]
    upsert("contramuestras", cm_list)
    print(f"  {len(cm_list)}")

    print("\n[Extra] Calidad...")
    q_list = [{"reference_id": ref_map.get(str(q["ref_num"])), "detected_at": q["fecha"],
               "area": q["area"], "classification": q["clasif"], "material": q["mp"]}
              for q in calidad if ref_map.get(str(q["ref_num"]))]
    q_list = [x for x in q_list if x["reference_id"]]
    upsert("quality_issues", q_list)
    print(f"  {len(q_list)}")

    print("\n[Extra] Montaje...")
    mt_list = [{"reference_id": ref_map.get(str(m["ref_num"])), "montage_type": m["tipo"],
                "related_reference": m["proy"]}
               for m in montajes if ref_map.get(str(m["ref_num"]))]
    mt_list = [x for x in mt_list if x["reference_id"]]
    upsert("montage_mannequin", mt_list)
    print(f"  {len(mt_list)}")

    print("\n[Extra] Referentes...")
    refe_list = []
    for r in referentes:
        rid = ref_map.get(str(r["ref_num"]))
        rrid = None
        if r["pt"]:
            ptn = r["pt"].replace("PT", "").strip()
            rrid = ref_map.get(ptn)
        if rid and rrid:
            refe_list.append({"reference_id": rid, "referent_reference_id": rrid, "notes": r["nombre"]})
    upsert("references_referents", refe_list)
    print(f"  {len(refe_list)}")

    # ══════════════════════════════════════════════════ RESUME
    print("\n" + "=" * 60)
    print("RESUMEN FINAL")
    print(f"  Referencias: {len(refs)}")
    print(f"  Registros insertados: {stats['inserted']}")
    print(f"  Errores: {stats['errors']}")
    for t, c in sorted(stats["tables"].items()):
        print(f"    jo.{t}: {c}")
    print("=" * 60)

if __name__ == "__main__":
    main()
