"""Debug script to inspect the HTML grid structure"""
import re
from pathlib import Path
from bs4 import BeautifulSoup

HTML_FILE = Path(r"D:\JO\ProjectJO-Antigravity\documentos\Copia de COLECCION WS27\1.VALIDACION DE TELAS.html")

with open(HTML_FILE, 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'lxml')
tbody = soup.select_one('tbody')
rows = tbody.select('tr')

print("=== RAW ROWS 0-8 (first 25 cells each) ===\n")
for i, tr in enumerate(rows[:10]):
    cells = tr.select('th, td')
    cell_summary = []
    for j, cell in enumerate(cells[:35]):
        text = cell.get_text(strip=True)[:40]
        rs = cell.get('rowspan', None)
        cs = cell.get('colspan', None)
        rs_str = f'rs={rs}' if rs else ''
        cs_str = f'cs={cs}' if cs else ''
        extras = f'{rs_str} {cs_str}'.strip()
        cell_summary.append(f'[{j}]{extras}:"{text}"')
    print(f'Row {i}:')
    for cs in cell_summary:
        print(f'  {cs}')
    print()
