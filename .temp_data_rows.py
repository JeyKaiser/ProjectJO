import re, sys, json

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
    clean_text = clean_text.encode('utf-8', errors='replace').decode('utf-8', errors='replace')
    rows[row_idx].append({
        'class': cls,
        'text': clean_text,
        'colspan': re.search(r'colspan="?(\d+)"?', match.group(0), re.IGNORECASE),
    })

# Print data rows 11-15 (first data rows after header row 9)
print("=" * 80)
print("DATA ROWS (Rows 11-15)")
print("=" * 80)

for row_idx in [11, 12, 13, 14, 15]:
    cells = rows[row_idx]
    print(f"\n--- Row {row_idx} ({len(cells)} cells) ---")
    for j, cell in enumerate(cells[:50]):
        text = cell['text'][:90] if cell['text'] else "(empty)"
        if text and text != "(empty)":
            print(f"  Col[{j}]({j}): \"{text}\"")

# Print unique text values in column 12 (Status)
print("\n\n" + "=" * 80)
print("DISTINCT STATUS VALUES (Col 12)")
print("=" * 80)
statuses = set()
for row_idx in range(11, 61):
    cells = rows.get(row_idx, [])
    if len(cells) > 12:
        t = cells[12]['text'].strip()
        if t and t not in ['(empty)', '']:
            statuses.add(t)
print(f"Count: {len(statuses)}")
for s in sorted(statuses):
    print(f"  - {s}")

# Print unique designers (Col 13)
print("\n\n" + "=" * 80)
print("DISTINCT DESIGNERS (Col 13)")
print("=" * 80)
designers = set()
for row_idx in range(11, 61):
    cells = rows.get(row_idx, [])
    if len(cells) > 13:
        t = cells[13]['text'].strip()
        if t and t not in ['(empty)', '']:
            designers.add(t)
for d in sorted(designers):
    print(f"  - {d}")

# Print CODIGO MD values (Col 3)
print("\n\n" + "=" * 80)
print("CODIGO MD values (Col 3) - first 15 data rows")
print("=" * 80)
for row_idx in range(11, 26):
    cells = rows.get(row_idx, [])
    if len(cells) > 3:
        md = cells[3]['text'].strip()
        pt = cells[4]['text'].strip() if len(cells) > 4 else ""
        nombre = cells[5]['text'].strip() if len(cells) > 5 else ""
        print(f"  Row {row_idx}: MD={md}, PT={pt}, Nombre={nombre[:50] if nombre else '(empty)'}")

# Print summary
print("\n\n" + "=" * 80)
print("FINAL SUMMARY")
print("=" * 80)
data_rows = len([r for r in rows if r >= 11])
print(f"Data rows (Row 11+): {data_rows}")
row_indices = sorted(rows.keys())
print(f"Row range: {min(row_indices)} to {max(row_indices)}")
max_cells = max(len(v) for v in rows.values())
print(f"Max cells in any row: {max_cells}")

# Count non-empty data rows
non_empty = 0
for row_idx in range(11, 61):
    cells = rows.get(row_idx, [])
    if len(cells) > 3:
        md = cells[3].get('text', '').strip()
        if md and md not in ['(empty)', '']:
            non_empty += 1
print(f"Non-empty data rows (with MD code): {non_empty}")
