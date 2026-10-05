"""Genera la galería y los SVG/PNG a partir de los archivos Mermaid.

Requiere Python y Pillow. Ejecución: python docs/diagramas-roles/generar.py
Los artefactos resultantes se abren sin servidor ni conexión a Internet.
"""

import html
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
ROLES = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
FONT_PATH = Path("C:/Windows/Fonts/arial.ttf")
if not FONT_PATH.exists():
    FONT_PATH = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
FONTS = {size: ImageFont.truetype(str(FONT_PATH), size) for size in (13, 15, 16, 18, 24)}


def esc(value):
    return html.escape(str(value), quote=True)


def wrap(label, width, size=16):
    lines, current = [], ""
    for word in label.split():
        candidate = f"{current} {word}".strip()
        if current and FONTS[size].getlength(candidate) > width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def render(role, number):
    source = (ROOT / f"{role['slug']}.mmd").read_text(encoding="utf-8")
    participants = re.findall(r"^\s*participant (\w+)\s*$", source, re.MULTILINE)
    messages = re.findall(r"^\s*(\w+)(-->>|->>)(\w+): (.+)$", source, re.MULTILINE)
    if len(participants) != 3 or not messages:
        raise ValueError(f"Participantes o mensajes inválidos: {role['slug']}")
    positions = dict(zip(participants, (170, 620, 1070)))
    rows, next_y = [], 210
    for sender, arrow, receiver, label in messages:
        maximum = 285 if sender == receiver else abs(positions[sender] - positions[receiver]) - 32
        lines = wrap(label, maximum)
        rows.append((next_y, sender, arrow, receiver, lines))
        next_y += 66 + max(0, len(lines) - 1) * 20
    width, height = 1250, next_y + 85
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="diagramTitle diagramDesc">',
           f'<title id="diagramTitle">{esc(role["role"])}: {esc(role["flow"])}</title>',
           '<desc id="diagramDesc">Diagrama de secuencia. Precondición: sesión válida y cuenta habilitada.</desc>',
           '<rect width="100%" height="100%" fill="white"/>']

    def rect(x, y, w, h, fill, radius=0):
        svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}"/>')
        draw.rounded_rectangle((x, y, x+w, y+h), radius=radius, fill=fill)

    def text(x, baseline, value, size=16, fill="#17243b", anchor="middle"):
        svg.append(f'<text x="{x}" y="{baseline}" text-anchor="{anchor}" font-family="Arial, DejaVu Sans, sans-serif" font-size="{size}" fill="{fill}">{esc(value)}</text>')
        draw.text((x, baseline), value, font=FONTS[size], fill=fill, anchor={"middle": "ms", "start": "ls", "end": "rs"}[anchor])

    def line(x1, y1, x2, y2, color, dashed=False, weight=2):
        svg.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{weight}"' + (' stroke-dasharray="7 5"' if dashed else '') + '/>')
        if dashed:
            distance = ((x2-x1)**2 + (y2-y1)**2)**0.5
            if distance:
                for start in range(0, int(distance), 12):
                    finish = min(start+7, distance)
                    draw.line((x1+(x2-x1)*start/distance, y1+(y2-y1)*start/distance,
                               x1+(x2-x1)*finish/distance, y1+(y2-y1)*finish/distance), fill=color, width=weight)
        else:
            draw.line((x1, y1, x2, y2), fill=color, width=weight)

    def head(x, y, direction, color):
        points = [(x, y), (x-direction*11, y-5), (x-direction*11, y+5)]
        svg.append('<polygon points="' + ' '.join(f'{a},{b}' for a, b in points) + f'" fill="{color}"/>')
        draw.polygon(points, fill=color)

    rect(0, 0, width, 88, "#eef3fb")
    text(38, 36, f"{number:02d}. {role['role']}", 24, anchor="start")
    text(38, 66, role["flow"], 18, "#4d5c74", "start")
    names = [role["role"], "Aplicación React", "Supabase · esquema jo"]
    for participant, label in zip(participants, names):
        x = positions[participant]
        line(x, 155, x, next_y+4, "#b8c2d3", dashed=True, weight=1)
        rect(x-140, 108, 280, 47, "#17243b", 8)
        text(x, 138, label, 18, "white")

    for step, (y, sender, arrow, receiver, labels) in enumerate(rows, 1):
        x1, x2 = positions[sender], positions[receiver]
        color = "#32755a" if arrow == "-->>" else "#315bad"
        text(31, y+5, str(step), 13, "#63738b", "start")
        if sender == receiver:
            color = "#85519a"
            line(x1, y, x1+66, y, color)
            line(x1+66, y, x1+66, y+17, color)
            line(x1+66, y+17, x1, y+17, color)
            head(x1, y+17, -1, color)
            anchor = "end" if x1 > 900 else "start"
            label_x = x1+90 if anchor == "end" else x1+20
        else:
            line(x1, y, x2, y, color, arrow == "-->>")
            head(x2, y, 1 if x2 > x1 else -1, color)
            anchor, label_x = "middle", (x1+x2)/2
        for index, label in enumerate(labels):
            baseline = y - 10 - (len(labels)-index-1)*20
            text(label_x, baseline, label, anchor=anchor)

    rect(26, next_y+23, width-52, 40, "#f1f5f9", 7)
    text(42, next_y+49, "Sesión válida y cuenta habilitada · Continua: solicitud · Discontinua: respuesta", 15, "#4d5c74", "start")
    svg.append("</svg>")
    (ROOT / f"{role['slug']}.svg").write_text("\n".join(svg)+"\n", encoding="utf-8")
    image.save(ROOT / f"{role['slug']}.png")
    return len(messages)


counts = [render(role, index) for index, role in enumerate(ROLES, 1)]
navigation = "\n".join(f'<a href="#{role["slug"]}"><span>{index:02d}</span>{esc(role["role"])}</a>' for index, role in enumerate(ROLES, 1))
cards = []
for index, role in enumerate(ROLES, 1):
    cases = "".join(f'<li><strong>{esc(case_id)} · {esc(name)}</strong><p>{esc(result)}</p></li>' for case_id, name, result in role["cases"])
    cards.append(f'''<article id="{role['slug']}">
      <header><p class="eyebrow">ROL {index:02d} DE 11</p><h2>{esc(role['role'])}</h2><p>{esc(role['description'])}</p></header>
      <p class="flow"><strong>Secuencia:</strong> {esc(role['flow'])}</p>
      <img src="{role['slug']}.svg" alt="Diagrama de secuencia de {esc(role['role'])}: {esc(role['flow'])}" width="1250" loading="lazy"/>
      <div class="downloads"><a href="{role['slug']}.svg" download>Descargar SVG</a><a href="{role['slug']}.png" download>Descargar PNG</a><a href="{role['slug']}.mmd" download>Mermaid editable</a></div>
      <details><summary>Casos de uso ({len(role['cases'])}) y alcance</summary><p><strong>Pantallas:</strong> {esc(role['routes'])}</p><ol>{cases}</ol><p class="scope">{esc(role['conditions'])}</p></details>
    </article>''')
page = '''<!doctype html>
<html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>AtelierData · Roles y secuencias</title>
<style>
*{box-sizing:border-box}html{scroll-padding-top:24px}body{margin:0;background:#f2f5fa;color:#17243b;font:16px/1.6 Arial,sans-serif}a{color:#2655a5}a:focus-visible,summary:focus-visible{outline:3px solid #658be0;outline-offset:4px}aside{position:fixed;inset:0 auto 0 0;width:270px;background:#17243b;color:#fff;padding:28px 18px;overflow:auto}aside h1{font-size:24px;margin:0 0 8px}aside p{color:#bbc9e1;margin:0 0 20px;font-size:14px}nav a{display:flex;gap:12px;color:#e0e8f8;text-decoration:none;padding:9px 10px;border-radius:6px;font-size:14px}nav a:hover{background:#2e4163}nav span{color:#98afda;font-size:12px;padding-top:2px}main{margin-left:270px;padding:32px;max-width:1660px}.intro{margin-bottom:32px}.intro h2{font-size:34px;line-height:1.2;margin:10px 0 16px}.intro p{max-width:850px}.eyebrow{font-size:12px;font-weight:bold;letter-spacing:1.8px;color:#557098;margin:0}article{padding:28px;margin-bottom:32px;border:1px solid #d9e2f0;border-radius:14px;background:white;scroll-margin-top:24px}article h2{margin:8px 0;font-size:28px}article header>p:last-child{margin:8px 0;color:#55657c}.flow{margin:20px 0 8px}article img{display:block;width:100%;height:auto;margin:12px 0}.downloads{display:flex;flex-wrap:wrap;gap:12px;margin:20px 0}.downloads a{display:inline-block;border:1px solid #c7d5ec;border-radius:6px;padding:7px 12px;text-decoration:none;font-size:14px}details{border-top:1px solid #dde5f1;padding-top:14px}summary{cursor:pointer;font-weight:bold}ol{padding-left:24px}li{margin:14px 0}li p{margin:4px 0;color:#55657c}.scope{background:#f2f5fa;border-radius:6px;padding:14px;font-size:14px}button{background:#2655a5;color:#fff;border:0;border-radius:6px;padding:10px 16px;font-size:14px;cursor:pointer}@media(max-width:850px){aside{position:relative;width:100%;padding:20px}nav{display:flex;flex-wrap:wrap}nav a{font-size:13px}main{margin-left:0;padding:16px}article{padding:16px}.intro h2{font-size:27px}}@media print{body{background:#fff}aside,.downloads,.print-button{display:none}main{margin:0;padding:0;max-width:none}.intro{break-after:page}article{border:0;border-radius:0;padding:0;margin:0;break-after:page}article img{max-height:225mm;object-fit:contain}details{display:none}a{color:inherit;text-decoration:none}}
</style></head><body><aside><h1>AtelierData</h1><p>Roles y diagramas de secuencia</p><nav aria-label="Seleccionar rol">NAVIGATION</nav></aside><main><section class="intro"><p class="eyebrow">ANÁLISIS DEL REPOSITORIO · 2 OCT 2026</p><h2>11 roles, 11 secuencias</h2><p>Los 11 roles comparten inicio de sesión, Dashboard, exploración de colecciones, consulta del detalle y cierre de sesión. Cada diagrama muestra un caso representativo; abre la sección de casos de uso para ver el alcance completo del rol.</p><p>La revisión corresponde al código y sus migraciones. Las políticas de la base de datos requieren las migraciones aplicadas. Una persona del catálogo requiere una cuenta de acceso habilitada para entrar.</p><p><a href="../roles-casos-de-uso-secuencias.md">Documento completo con 63 casos específicos y 5 comunes</a></p><button class="print-button" type="button" onclick="window.print()">Imprimir diagramas</button></section>CARDS</main></body></html>
'''.replace("NAVIGATION", navigation).replace("CARDS", "\n".join(cards))
(ROOT / "index.html").write_text(page, encoding="utf-8")
print(json.dumps({"roles": len(ROLES), "casos_especificos": sum(len(role["cases"]) for role in ROLES), "mensajes_por_diagrama": counts, "archivos_svg": len(ROLES), "archivos_png": len(ROLES)}, ensure_ascii=False))
