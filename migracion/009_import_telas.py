"""
Lee telas.csv y genera un archivo SQL con INSERTs batching de 100 filas
para importar el catalogo maestro de telas a jo.fabrics en Supabase.

Uso: python migracion/009_import_telas.py
Salida: migracion/009_import_telas.sql
"""

import csv
import os

CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'telas.csv')
SQL_OUT = os.path.join(os.path.dirname(__file__), '009_import_telas.sql')
BATCH_SIZE = 100

rows = []

with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader, start=1):
        code = row.get('CODIGO TELA', '').strip().upper()
        description = row.get('DESCRIPCION TELA', '').strip()
        ancho_raw = row.get('ANCHO', '').strip()

        if not code:
            print(f'[WARN] linea {i}: codigo vacio, se omite')
            continue

        # Escapar single quotes para SQL
        description_sql = description.replace("'", "''")

        # Normalizar ancho
        if not ancho_raw:
            width_val = 'NULL'
        else:
            # Reemplazar coma decimal por punto
            ancho_clean = ancho_raw.replace(',', '.')
            try:
                w = float(ancho_clean)
                width_val = f'{w:.2f}'
            except ValueError:
                print(f'[WARN] linea {i}: ancho no numerico "{ancho_raw}" para {code}, se usa NULL')
                width_val = 'NULL'

        rows.append((code, description_sql, width_val))

total = len(rows)
batches = [rows[i:i + BATCH_SIZE] for i in range(0, total, BATCH_SIZE)]

with open(SQL_OUT, 'w', encoding='utf-8') as f:
    f.write('-- ===========================================================================\n')
    f.write('-- Importacion masiva de telas desde telas.csv\n')
    f.write(f'-- Total: {total} telas en {len(batches)} bloques de {BATCH_SIZE}\n')
    f.write('-- ===========================================================================\n')
    f.write('SET search_path = jo, public;\n\n')

    for bi, batch in enumerate(batches):
        f.write(f'-- Bloque {bi + 1}/{len(batches)}\n')
        f.write('INSERT INTO jo.fabrics (code, description, width_cm) VALUES\n')
        lines = []
        for code, desc, width in batch:
            if width == 'NULL':
                lines.append(f"('{code}', '{desc}', NULL)")
            else:
                lines.append(f"('{code}', '{desc}', {width})")
        f.write(',\n'.join(lines))
        f.write('\nON CONFLICT (code) DO NOTHING;\n\n')

print(f'Generado {SQL_OUT}')
print(f'{total} telas en {len(batches)} bloques')
print('Ejecuta este SQL en el Supabase SQL Editor.')
