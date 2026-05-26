import re
from html.parser import HTMLParser
from collections import defaultdict

with open(r'C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de CONTRAM WS27\MATRIZ.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ===== STEP 1: Extract ALL CSS class definitions =====
print("=" * 80)
print("CSS CLASS DEFINITIONS (color-coded section styles)")
print("=" * 80)

css_blocks = re.findall(r'\.ritz \.waffle \.(s\d+)\{([^}]+)\}', html)
css_map = {}
for cls_name, css_body in css_blocks:
    css_map[cls_name] = css_body.strip()
    bg_match = re.search(r'background-color:(#[a-fA-F0-9]+)', css_body)
    font_match = re.search(r'font-size:(\d+pt)', css_body)
    bold = 'font-weight:bold' in css_body
    border_bottom = re.search(r'border-bottom:(\d+px \w+ #\w+)', css_body)
    border_right = re.search(r'border-right:(\d+px \w+ #\w+)', css_body)
    color_match = re.search(r'(?<!background-)color:(#[a-fA-F0-9]+)', css_body)
    
    info_parts = []
    if bg_match: info_parts.append(f"BG={bg_match.group(1)}")
    if font_match: info_parts.append(f"Font={font_match.group(1)}")
    if bold: info_parts.append("BOLD")
    if border_bottom: info_parts.append(f"BB={border_bottom.group(1)}")
    if border_right: info_parts.append(f"BR={border_right.group(1)}")
    if color_match: info_parts.append(f"Color={color_match.group(1)}")
    
    print(f"  .{cls_name}: {', '.join(info_parts)}")

print(f"\nTotal CSS classes: {len(css_map)}")

# ===== STEP 2: Extract all td/th elements =====
print("\n\n" + "=" * 80)
print("TABLE STRUCTURE")
print("=" * 80)

td_pattern = re.compile(r'<(td|th)\s[^>]*class="([^"]+)"[^>]*>(.*?)</(?:td|th)>', re.DOTALL | re.IGNORECASE)
td_matches = list(td_pattern.finditer(html))
print(f"Total td/th cells: {len(td_matches)}")

# ===== STEP 3: Find table/tr boundaries =====
tr_starts = [m.end() for m in re.finditer(r'<tr[^>]*>', html)]
tr_ends = [m.start() for m in re.finditer(r'</tr>', html)]
print(f"Total <tr> tags: {len(tr_starts)}")
print(f"Total </tr> tags: {len(tr_ends)}")

# ===== STEP 4: Group cells by row =====
# Assign each td to a row by checking which tr range it falls in
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
    # Get clean text
    clean_text = re.sub(r'<[^>]+>', '', inner_html).strip()
    rows[row_idx].append({
        'tag': tag_type,
        'class': cls,
        'text': clean_text,
        'colspan': re.search(r'colspan="?(\d+)"?', match.group(0), re.IGNORECASE),
        'rowspan': re.search(r'rowspan="?(\d+)"?', match.group(0), re.IGNORECASE),
    })

print(f"Number of rows with data: {len(rows)}")
print(f"Row indices: {sorted(rows.keys())}")

# ===== STEP 5: Print header rows (rows 0-12) =====
print("\n\n" + "=" * 80)
print("HEADER ROWS (0-14)")
print("=" * 80)

for row_idx in sorted(rows.keys())[:15]:
    cells = rows[row_idx]
    print(f"\n--- Row {row_idx} ({len(cells)} cells) ---")
    for j, cell in enumerate(cells):
        cs = f" colspan={cell['colspan'].group(1)}" if cell['colspan'] else ""
        rs = f" rowspan={cell['rowspan'].group(1)}" if cell['rowspan'] else ""
        text_preview = cell['text'][:120] if cell['text'] else "(empty)"
        if len(cell['text']) > 120:
            text_preview += "..."
        print(f"  Col[{j}] |{cell['tag']}| .{cell['class']}{cs}{rs}: \"{text_preview}\"")

# ===== STEP 6: Print last rows and first data rows (after headers) =====
print("\n\n" + "=" * 80)
print("DATA ROWS (15-24) - First 10 after headers")
print("=" * 80)

row_indices = sorted(rows.keys())
for row_idx in row_indices[15:25]:
    cells = rows[row_idx]
    print(f"\n--- Row {row_idx} ({len(cells)} cells) ---")
    for j, cell in enumerate(cells[:15]):  # First 15 cells only
        cs = f" colspan={cell['colspan'].group(1)}" if cell['colspan'] else ""
        text_preview = cell['text'][:80] if cell['text'] else "(empty)"
        print(f"  Col[{j}] .{cell['class']}{cs}: \"{text_preview}\"")

# ===== STEP 7: Summary =====
print("\n\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
max_cols = max(len(v) for v in rows.values())
print(f"Max columns in any row: {max_cols}")
print(f"Total rows: {len(rows)}")
print(f"Data rows (after headers): {len(rows) - 15}")

# ===== STEP 8: Detect merged cell patterns =====
print("\n\n" + "=" * 80)
print("MERGED CELL PATTERNS")
print("=" * 80)
merged_count = 0
for row_idx in sorted(rows.keys()):
    for cell in rows[row_idx]:
        if cell['colspan'] or cell['rowspan']:
            merged_count += 1
            if merged_count <= 20:
                t = f"colspan={cell['colspan'].group(1)}" if cell['colspan'] else ""
                t += f" rowspan={cell['rowspan'].group(1)}" if cell['rowspan'] else ""
                print(f"  Row {row_idx}: .{cell['class']} {t}: \"{cell['text'][:80]}\"")
print(f"Total merged cells: {merged_count}")

# ===== STEP 9: Column count per row =====
print("\n\n" + "=" * 80)
print("COLUMNS PER ROW (FIRST 30 ROWS)")
print("=" * 80)
for row_idx in sorted(rows.keys())[:30]:
    effective_cols = sum(
        int(c['colspan'].group(1)) if c['colspan'] else 1 
        for c in rows[row_idx]
    )
    print(f"  Row {row_idx}: {len(rows[row_idx])} cells, {effective_cols} effective columns")
