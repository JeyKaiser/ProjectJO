"""Debug: inspect cell positions in the tbody rows"""
import re
from pathlib import Path
from bs4 import BeautifulSoup

HTML = Path(r"D:\JO\ProjectJO-Antigravity\documentos\Copia de COLECCION WS27\1.VALIDACION DE TELAS.html")
with open(HTML, 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

soup = BeautifulSoup(html, 'lxml')
tbody = soup.select_one('tbody')
rows = tbody.select('tr')

# Show rows 5-24 (first data block, 19 rows) with non-empty cell contents
for i in range(5, 25):
    tr = rows[i]
    cells = tr.select('th, td')
    print(f'--- Row {i} ---')
    for j, cell in enumerate(cells):
        raw = cell.get_text(strip=True).replace('\u200b','').replace('\xa0',' ')
        if raw and raw not in (' ', ''):
            rp = cell.get('rowspan','')
            cp = cell.get('colspan','')
            extras = f' rp={rp}' if rp else ''
            extras += f' cp={cp}' if cp else ''
            # Truncate long text
            display = raw[:60] if len(raw) > 60 else raw
            print(f'  [{j}]{extras}: {display}')
    print()
