#!/usr/bin/env python3
"""
Carga los CSVs exportados por extract_validacion_telas.py a Google Sheets
usando la Google Sheets API.

Requisitos previos:
1. Tener un proyecto en Google Cloud Console con Sheets API habilitada
2. Credenciales OAuth 2.0 (archivo credentials.json) o Service Account
3. Crear un Google Sheet vacio y compartirlo con el service account

Uso:
  python cargar_a_sheets.py --sheet-id <ID_DEL_SHEET>

El ID del sheet se obtiene de la URL:
  https://docs.google.com/spreadsheets/d/<ID>/edit
"""

import argparse
import json
import os
import pickle
from pathlib import Path

# Intentar importar google libraries
try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    HAS_GOOGLE = True
except ImportError:
    HAS_GOOGLE = False
    print("ADVERTENCIA: google-api-python-client no instalado.")
    print("  pip install google-api-python-client google-auth-oauthlib google-auth-httplib2")

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

OUTPUT_DIR = Path(__file__).parent / "output"
CREDENTIALS_FILE = Path(__file__).parent / "credentials.json"
TOKEN_FILE = Path(__file__).parent / "token.pickle"

SHEET_STRUCTURE = {
    "REFERENCIAS": "referencias.csv",
    "TELAS_X_REFERENCIA": "telas_x_referencia.csv",
    "CONSUMOS": None,  # Se unen multiples CSVs
    "CONSUMOS_CONTRAMUESTRA": "consumos_contramuestra.csv",
    "INSUMOS": "insumos.csv",
    "PARAMETROS": None,  # Se crea vacio, se llena manualmente
    "HISTORIAL": None,   # Se crea vacio
    "ALERTAS": None,     # Se crea vacio
    "RESUMEN": None,     # Se crea vacio
}

# Orden de los CSVs de consumos a concatenar
CONSUMOS_SOURCES = [
    ("consumos_costeocre.csv", "CREATIVO"),
    ("consumos_costeodt.csv", "TECNICO"),
    ("consumos_costeoet.csv", "TRAZO_Y_CORTE"),
]

PARAMETROS_DATA = [
    ["STATUS", "SI/NO", "AREAS", "TIPOS_TELA", "MOTIVOS_CAMBIO",
     "CODIGOS_TELA", "DESCRIPCION_TELA", "DISEÑADORES_CREATIVOS",
     "DISEÑADORES_TECNICOS", "ROLES"],
    ["APROBADO", "SI", "CREATIVO", "SOLIDO", "SIN_STOCK", "", "", "", "", "ADMIN"],
    ["CANCELADO", "NO", "TECNICO", "MOD_ARTE", "COSTO_ELEVADO", "", "", "", "", "CREATIVO"],
    ["EN_PROCESO", "", "TRAZO_Y_CORTE", "UBICACION_TRAZO", "CALIDAD", "", "", "", "", "TECNICO"],
    ["RECHAZADO", "", "", "", "OTRO", "", "", "", "", "TRAZO_Y_CORTE"],
    ["PENDIENTE", "", "", "", "", "", "", "", "", "CONSULTA"],
]

HISTORIAL_HEADER = [["FECHA", "USUARIO", "HOJA", "ID_REGISTRO", "CAMPO", "VALOR_ANTERIOR", "VALOR_NUEVO"]]

ALERTAS_HEADER = [["ID_ALERTA", "FECHA", "ID_REFERENCIA", "ID_TELA",
                    "CONSUMO_COSTEO", "CONSUMO_CONTRAMUESTRA",
                    "DIFERENCIA_PORCENTAJE", "ENVIADA", "FECHA_ENVIO"]]

RESUMEN_HEADER = [["DASHBOARD - Validacion de Telas", ""],
                  ["Actualizado: ", ""],
                  ["", ""],
                  ["METRICA", "VALOR"]]


def get_google_service():
    """Autentica y retorna el servicio de Google Sheets."""
    if not HAS_GOOGLE:
        raise ImportError("Instala google-api-python-client primero")

    creds = None
    if TOKEN_FILE.exists():
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDENTIALS_FILE.exists():
                raise FileNotFoundError(
                    f"No se encontro {CREDENTIALS_FILE}.\n"
                    "1. Ve a https://console.cloud.google.com/apis/credentials\n"
                    "2. Crea un OAuth 2.0 Client ID (Desktop app)\n"
                    "3. Descarga el JSON como 'credentials.json' en la carpeta migracion/"
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)

        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)

    return build('sheets', 'v4', credentials=creds)


def read_csv_rows(filename):
    """Lee un CSV y retorna lista de listas (sin encoding BOM)."""
    import csv
    filepath = OUTPUT_DIR / filename
    if not filepath.exists():
        print(f"  [SKIP] {filename} no existe")
        return None
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        return list(reader)


def crear_hoja(service, sheet_id, nombre):
    """Crea una hoja nueva en el spreadsheet."""
    try:
        request = {
            'addSheet': {
                'properties': {
                    'title': nombre,
                    'gridProperties': {'rowCount': 1000, 'columnCount': 20}
                }
            }
        }
        service.spreadsheets().batchUpdate(
            spreadsheetId=sheet_id,
            body={'requests': [request]}
        ).execute()
        print(f"  Hoja '{nombre}' creada.")
        return True
    except Exception as e:
        if 'already exists' in str(e).lower():
            print(f"  Hoja '{nombre}' ya existe, limpiando...")
            limpiar_hoja(service, sheet_id, nombre)
            return True
        raise


def limpiar_hoja(service, sheet_id, nombre):
    """Limpia el contenido de una hoja."""
    service.spreadsheets().values().clear(
        spreadsheetId=sheet_id,
        range=f"'{nombre}'!A:ZZ"
    ).execute()


def cargar_datos(service, sheet_id, nombre, datos):
    """Carga datos a una hoja."""
    if not datos or len(datos) == 0:
        print(f"  '{nombre}': sin datos para cargar")
        return

    range_name = f"'{nombre}'!A1"
    body = {'values': datos}
    service.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range=range_name,
        valueInputOption='RAW',
        body=body
    ).execute()
    print(f"  '{nombre}': {len(datos)} filas cargadas")


def formatear_headers(service, sheet_id, nombre, num_cols, num_rows):
    """Aplica formato a los headers."""
    requests = [
        {
            'repeatCell': {
                'range': {
                    'sheetId': get_sheet_id(service, sheet_id, nombre),
                    'startRowIndex': 0,
                    'endRowIndex': 1,
                    'startColumnIndex': 0,
                    'endColumnIndex': num_cols
                },
                'cell': {
                    'userEnteredFormat': {
                        'backgroundColor': {'red': 0.27, 'green': 0.74, 'blue': 0.78},
                        'textFormat': {'bold': True, 'foregroundColor': {'red': 1, 'green': 1, 'blue': 1}},
                        'horizontalAlignment': 'CENTER'
                    }
                },
                'fields': 'backgroundColor,textFormat,horizontalAlignment'
            }
        },
        {
            'updateSheetProperties': {
                'properties': {
                    'sheetId': get_sheet_id(service, sheet_id, nombre),
                    'gridProperties': {
                        'frozenRowCount': 1
                    }
                },
                'fields': 'gridProperties.frozenRowCount'
            }
        }
    ]
    service.spreadsheets().batchUpdate(
        spreadsheetId=sheet_id,
        body={'requests': requests}
    ).execute()


def get_sheet_id(service, sheet_id, nombre):
    """Obtiene el sheetId numerico de una hoja por nombre."""
    sheet_metadata = service.spreadsheets().get(spreadsheetId=sheet_id).execute()
    for s in sheet_metadata.get('sheets', []):
        if s['properties']['title'] == nombre:
            return s['properties']['sheetId']
    return 0


def main():
    parser = argparse.ArgumentParser(description='Cargar CSVs a Google Sheets')
    parser.add_argument('--sheet-id', required=True, help='ID del Google Sheet')
    args = parser.parse_args()

    sheet_id = args.sheet_id

    print("=" * 60)
    print("AtelierData - Carga de Estructura a Google Sheets")
    print("=" * 60)

    print("\n[1] Autenticando con Google...")
    service = get_google_service()
    print("    Autenticado!")

    print("\n[2] Creando hojas...")

    for sheet_name in SHEET_STRUCTURE:
        crear_hoja(service, sheet_id, sheet_name)

    print("\n[3] Cargando datos...")

    # REFERENCIAS
    datos_ref = read_csv_rows(SHEET_STRUCTURE["REFERENCIAS"])
    if datos_ref:
        cargar_datos(service, sheet_id, "REFERENCIAS", datos_ref)
        formatear_headers(service, sheet_id, "REFERENCIAS", len(datos_ref[0]), len(datos_ref))

    # TELAS_X_REFERENCIA
    datos_telas = read_csv_rows(SHEET_STRUCTURE["TELAS_X_REFERENCIA"])
    if datos_telas:
        cargar_datos(service, sheet_id, "TELAS_X_REFERENCIA", datos_telas)
        formatear_headers(service, sheet_id, "TELAS_X_REFERENCIA", len(datos_telas[0]), len(datos_telas))

    # CONSUMOS (merge de creativo + tecnico + trazo)
    consumos_all = []
    header_written = False
    for csv_file, area in CONSUMOS_SOURCES:
        datos = read_csv_rows(csv_file)
        if datos:
            if not header_written:
                consumos_all.extend(datos)
                header_written = True
            else:
                consumos_all.extend(datos[1:])  # Sin header duplicado
    if consumos_all:
        cargar_datos(service, sheet_id, "CONSUMOS", consumos_all)
        formatear_headers(service, sheet_id, "CONSUMOS", len(consumos_all[0]), len(consumos_all))

    # CONSUMOS_CONTRAMUESTRA
    datos_contra = read_csv_rows(SHEET_STRUCTURE["CONSUMOS_CONTRAMUESTRA"])
    if datos_contra:
        cargar_datos(service, sheet_id, "CONSUMOS_CONTRAMUESTRA", datos_contra)
        formatear_headers(service, sheet_id, "CONSUMOS_CONTRAMUESTRA", len(datos_contra[0]), len(datos_contra))

    # INSUMOS
    datos_insumos = read_csv_rows(SHEET_STRUCTURE["INSUMOS"])
    if datos_insumos:
        cargar_datos(service, sheet_id, "INSUMOS", datos_insumos)
        formatear_headers(service, sheet_id, "INSUMOS", len(datos_insumos[0]), len(datos_insumos))

    # PARAMETROS (datos precargados)
    cargar_datos(service, sheet_id, "PARAMETROS", PARAMETROS_DATA)

    # HISTORIAL (header)
    cargar_datos(service, sheet_id, "HISTORIAL", HISTORIAL_HEADER)

    # ALERTAS (header)
    cargar_datos(service, sheet_id, "ALERTAS", ALERTAS_HEADER)

    # RESUMEN (header)
    cargar_datos(service, sheet_id, "RESUMEN", RESUMEN_HEADER)

    print(f"\n[4] Carga completada!")
    print(f"    URL: https://docs.google.com/spreadsheets/d/{sheet_id}/edit")
    print(f"\n[5] Proximos pasos:")
    print(f"    1. Abre el sheet y ve a Extensiones > Apps Script")
    print(f"    2. Pega el contenido de apps_script/Code.gs")
    print(f"    3. Ejecuta onOpen() para ver el menu AtelierData")
    print(f"    4. Configura los emails en CONFIG.ROLES y CONFIG.ALERT_EMAIL")
    print(f"    5. Ejecuta instalarTriggers() para activar tareas automaticas")


if __name__ == "__main__":
    main()
