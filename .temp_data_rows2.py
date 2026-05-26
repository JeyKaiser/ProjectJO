import re, sys

with open(r'C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de CONTRAM WS27\MATRIZ.html', 'r', encoding='utf-8') as f:
    html = f.read()

td_pattern = re.compile(r'<(td|th)\s[^>]*class="([^"]+)"[^>]*>(.*?)</(?:td|th)>', re.DOTALL | re.IGNORECASE)
td_matches = list(td_pattern.finditer(html))

tr_starts = [m.end() for m in re.finditer(r'<tr[^>]*>', html)]
tr_ends = [m.start() for m in re.finditer(r'</tr>', html)]

from collections import defaultdict
rows = defaultdict(list)
for match in td_matches:
    pos = match.start()
    row_idx = -1
    for i, (s, e) in enumerate(zip(tr_starts, tr_ends)):
        if s <= pos <= e:
            row_idx = i
            break
    tag_type = match.group(1)
    cls = match.group(2)
    inner_html = match.group(3)
    clean_text = re.sub(r'<[^>]+>', '', inner_html).strip()
    # Remove zero-width and other invisible chars
    clean_text = re.sub(r'[\u200b\u200c\u200d\u200e\u200f\ufeff\u00ad]', '', clean_text)
    clean_text = clean_text.replace('\u200b', '')
    rows[row_idx].append({
        'class': cls,
        'text': clean_text,
        'colspan': re.search(r'colspan="?(\d+)"?', match.group(0), re.IGNORECASE),
    })

# Write output to file
out_path = r'C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\.matrix_analysis.txt'
with open(out_path, 'w', encoding='utf-8') as out:
    out.write("=" * 80 + "\n")
    out.write("DATA ROWS (Rows 11-15) - First 5 data rows\n")
    out.write("=" * 80 + "\n\n")
    
    for row_idx in [11, 12, 13, 14, 15]:
        cells = rows[row_idx]
        out.write(f"\n--- Row {row_idx} ({len(cells)} cells) ---\n")
        for j, cell in enumerate(cells):
            text = cell['text'][:120] if cell['text'] else "(empty)"
            if text and text != "(empty)":
                out.write(f"  Col[{j}] .{cell['class']}: \"{text}\"\n")
        if len(cells) > 25:
            out.write(f"  ... ({len(cells) - 25} more cells in this row) ...\n")
    
    # Distinct status values
    out.write("\n\n" + "=" * 80 + "\n")
    out.write("DISTINCT STATUS VALUES (Col 12)\n")
    out.write("=" * 80 + "\n")
    statuses = set()
    for row_idx in range(11, 61):
        cells = rows.get(row_idx, [])
        if len(cells) > 12:
            t = cells[12]['text'].strip()
            if t and t not in ['(empty)', '']:
                statuses.add(t)
    out.write(f"Count: {len(statuses)}\n")
    for s in sorted(statuses):
        out.write(f"  - {s}\n")
    
    # Distinct designers
    out.write("\n\n" + "=" * 80 + "\n")
    out.write("DISTINCT DESIGNERS (Col 13)\n")
    out.write("=" * 80 + "\n")
    designers = set()
    for row_idx in range(11, 61):
        cells = rows.get(row_idx, [])
        if len(cells) > 13:
            t = cells[13]['text'].strip()
            if t and t not in ['(empty)', '']:
                designers.add(t)
    for d in sorted(designers):
        out.write(f"  - {d}\n")
    
    # Distinct lineas
    out.write("\n\n" + "=" * 80 + "\n")
    out.write("DISTINCT LINEAS (Col 17)\n")
    out.write("=" * 80 + "\n")
    lineas = set()
    for row_idx in range(11, 61):
        cells = rows.get(row_idx, [])
        if len(cells) > 17:
            t = cells[17]['text'].strip()
            if t and t not in ['(empty)', '']:
                lineas.add(t)
    for l in sorted(lineas):
        out.write(f"  - {l}\n")
    
    # CODIGO MD mapping
    out.write("\n\n" + "=" * 80 + "\n")
    out.write("ALL DATA ROWS - CODIGO MD, PT, REF, STATUS\n")
    out.write("=" * 80 + "\n")
    for row_idx in range(11, 61):
        cells = rows.get(row_idx, [])
        if len(cells) >= 6:
            md = cells[3]['text'].strip() if len(cells) > 3 else ""
            pt = cells[4]['text'].strip() if len(cells) > 4 else ""
            nombre = cells[5]['text'].strip() if len(cells) > 5 else ""
            status = cells[12]['text'].strip() if len(cells) > 12 else ""
            designer = cells[13]['text'].strip() if len(cells) > 13 else ""
            linea = cells[17]['text'].strip() if len(cells) > 17 else ""
            if md and md not in ['(empty)', '']:
                out.write(f"Row {row_idx}: MD={md} | PT={pt} | Status={status} | Designer={designer} | Linea={linea} | Nombre={nombre}\n")
    
    # Column count summary
    out.write("\n\n" + "=" * 80 + "\n")
    out.write("FINAL SUMMARY\n")
    out.write("=" * 80 + "\n")
    out.write(f"Total rows: {len(rows)} (0-indexed: rows 0-{max(rows.keys())})\n")
    max_cells_in_row = max(len(v) for v in rows.values())
    out.write(f"Max columns (cells) in any row: {max_cells_in_row}\n")
    
    # Count non-empty data rows
    non_empty = 0
    for row_idx in range(11, 61):
        cells = rows.get(row_idx, [])
        if len(cells) > 3:
            md = cells[3].get('text', '').strip()
            if md and md not in ['(empty)', '']:
                non_empty += 1
    out.write(f"Non-empty data rows (with MD code): {non_empty}\n")
    
    # Header rows summary
    out.write(f"Header rows: 0-10 ({11} rows)\n")
    out.write(f"Data rows: 11-{max(rows.keys())} ({max(rows.keys()) - 10} rows)\n")

print(f"Output written to: {out_path}")
print("Done.")
