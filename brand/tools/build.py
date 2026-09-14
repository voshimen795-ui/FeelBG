#!/usr/bin/env python3
"""Build the FeelBG print kit: QR badges, a cut-out sheet and the A5 flyer.

Everything is laid out in millimetres and printed through headless Chromium,
so the PDFs come out as real vector artwork at the exact trim size.
"""
import base64
import io
import os
import sys

import pypdfium2 as pdfium
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import qr  # noqa: E402
import render  # noqa: E402
import finish  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = "/home/user/FeelBG"
OUT = os.path.join(REPO, "brand", "print")
ASSETS = os.path.join(REPO, "assets", "images")

NAVY_DEEP = "#0a1128"
NAVY = "#1e3a8a"
GOLD = "#b8860b"
GOLD_LIGHT = "#daa520"
CREAM = "#f4efe2"
MUTED = "#b9c2de"

BLEED = 3      # mm, industry standard
TRIM_W, TRIM_H = 148, 210   # A5

FONTS = open(os.path.join(HERE, "fonts.css")).read()


def img_uri(path, max_width=None):
    """Base64 data URI, optionally downsampled — 2000px art at 30mm is
    ~1700dpi, which only bloats the PDF."""
    im = Image.open(path)
    if max_width and im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.convert("RGBA").save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


LOGO = img_uri(os.path.join(ASSETS, "logo/feelbg-high-resolution-logo-transparent.png"), 900)
PHOTOS = [
    (img_uri(os.path.join(REPO, "assets/atractions/kalis.jpg"), 700), "THE FORTRESS"),
    (img_uri(os.path.join(REPO, "assets/images/money-club.jpg"), 700), "NIGHTS OUT"),
    (img_uri(os.path.join(REPO, "assets/venues/przionica_d59b.jpg"), 700), "COFFEE CULTURE"),
]


def qr_markup(size_mm):
    frag, total = qr.build()
    return (f'<svg class="qr" width="{size_mm}mm" height="{size_mm}mm" '
            f'viewBox="0 0 {total} {total}" xmlns="http://www.w3.org/2000/svg" '
            f'shape-rendering="geometricPrecision">{frag}</svg>')


def page(css, body, w, h):
    return f"""<meta charset="utf-8">
<style>
{FONTS}
@page {{ size: {w / 25.4 * 72:.4f}pt {h / 25.4 * 72:.4f}pt; margin: 0; }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{ width: {w}mm; height: {h}mm; overflow: hidden; }}
body {{ -webkit-print-color-adjust: exact; print-color-adjust: exact;
        font-family: 'Poppins', 'Montserrat', sans-serif; text-rendering: geometricPrecision; }}
{css}
</style>
{body}"""


# ---------------------------------------------------------------- QR badge
BADGE_W, BADGE_H = 45, 60

BADGE_CSS = """
.badge { width: %(w)smm; height: %(h)smm; position: relative;
         display: flex; flex-direction: column; align-items: center;
         justify-content: center; gap: 2.4mm; padding: 4mm 3mm 3.6mm; }
.badge .frame { position: absolute; inset: 2.6mm; border: 0.35mm solid %(rule)s;
                border-radius: 2mm; }
.badge .frame::after { content: ''; position: absolute; inset: 0.7mm;
                border: 0.12mm solid %(rule_soft)s; border-radius: 1.4mm; }
.eyebrow { font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 5pt;
           letter-spacing: 0.34em; text-indent: 0.34em; color: %(eyebrow)s; }
.qr-wrap { background: #fff; border-radius: 1.4mm; padding: 0.6mm; }
.qr { display: block; }
.divider { width: 14mm; height: 0.3mm; background: %(rule)s; }
.name { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 13pt;
        letter-spacing: 0.1em; text-indent: 0.1em; color: %(name)s; line-height: 1; }
.url { font-family: 'Montserrat', sans-serif; font-weight: 500; font-size: 6.4pt;
       letter-spacing: 0.22em; text-indent: 0.22em; color: %(url)s; }
"""

BADGE_THEMES = {
    "light": dict(bg="#ffffff", rule=GOLD, rule_soft="rgba(184,134,11,.45)",
                  eyebrow="#8a93b4", name=NAVY_DEEP, url=GOLD),
    "navy": dict(bg=NAVY_DEEP, rule=GOLD, rule_soft="rgba(218,165,32,.4)",
                 eyebrow="rgba(244,239,226,.6)", name=CREAM, url=GOLD_LIGHT),
}


def badge_body(theme, qr_mm=28.5):
    return (f'<div class="badge" style="background:{theme["bg"]}">'
            f'<div class="frame"></div>'
            f'<div class="eyebrow">SCAN ME</div>'
            f'<div class="qr-wrap">{qr_markup(qr_mm)}</div>'
            f'<div class="divider"></div>'
            f'<div class="name">FEELBG</div>'
            f'<div class="url">FEELBG.COM</div>'
            f'</div>')


def build_badge(name, theme_key):
    theme = BADGE_THEMES[theme_key]
    css = BADGE_CSS % dict(theme, w=BADGE_W, h=BADGE_H)
    html = page(css, badge_body(theme), BADGE_W, BADGE_H)
    path = os.path.join(HERE, f"_{name}.html")
    open(path, "w").write(html)
    render.to_pdf(path, os.path.join(OUT, f"{name}.pdf"))
    finish.finish(os.path.join(OUT, f"{name}.pdf"), BADGE_W, BADGE_H,
                  title="FeelBG QR badge")
    pdf_preview(name, dpi=300)
    return path


# ------------------------------------------------------------- badge sheet
def build_sheet(name):
    cols, rows = 4, 4
    gap = 0
    mx = (210 - cols * BADGE_W) / 2
    my = 22
    cells = "".join(badge_body(BADGE_THEMES["light"]) for _ in range(cols * rows))
    css = BADGE_CSS % dict(BADGE_THEMES["light"], w=BADGE_W, h=BADGE_H) + f"""
    .sheet {{ display: grid; grid-template-columns: repeat({cols}, {BADGE_W}mm);
              grid-template-rows: repeat({rows}, {BADGE_H}mm); gap: {gap}mm;
              margin: {my}mm {mx}mm; position: relative; }}
    .badge {{ outline: 0.1mm dashed #c9cedb; outline-offset: -0.05mm; }}
    .note {{ position: absolute; bottom: 4mm; left: 0; right: 0; text-align: center;
             font-family: 'Montserrat', sans-serif; font-size: 5.5pt; color: #9aa1b5;
             letter-spacing: 0.18em; }}
    """
    body = f'<div class="sheet">{cells}</div><div class="note">FEELBG — CUT ALONG THE DASHED LINES · 16 × 45 × 60 MM</div>'
    html = page(css, body, 210, 297)
    path = os.path.join(HERE, f"_{name}.html")
    open(path, "w").write(html)
    render.to_pdf(path, os.path.join(OUT, f"{name}.pdf"))
    finish.finish(os.path.join(OUT, f"{name}.pdf"), 210, 297,
                  title="FeelBG QR badges - A4 cut sheet")
    return path


# ------------------------------------------------------------------ flyer
FLYER_CSS = """
.sheet { width: %(pw)smm; height: %(ph)smm; background: %(bg)s; position: relative;
         overflow: hidden; }
.bleedbox { position: absolute; inset: %(bleed)smm; display: flex; flex-direction: column; }
.glow { position: absolute; inset: 0; background: %(glow)s; }
.frame { position: absolute; inset: 6mm; border: 0.3mm solid %(frame)s; }
.frame::after { content: ''; position: absolute; inset: 1.1mm;
                border: 0.12mm solid %(frame_soft)s; }

.inner { position: relative; height: 100%%; padding: 10mm 12mm 8mm;
         display: flex; flex-direction: column; align-items: center; text-align: center; }
.logo { width: 24mm; display: block; }
.eyebrow { font-family: 'Montserrat', sans-serif; font-weight: 600; font-size: 6.6pt;
           letter-spacing: 0.42em; text-indent: 0.42em; color: %(gold)s; margin-top: 4.5mm; }
h1 { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 23pt;
     line-height: 1.14; color: %(head)s; margin-top: 3mm; }
h1 span { color: %(gold_bright)s; }
.lead { font-family: 'Poppins', sans-serif; font-weight: 300; font-size: 9pt;
        line-height: 1.55; color: %(body)s; margin-top: 3.4mm; max-width: 104mm; }
.rule { width: 26mm; height: 0.3mm; background: %(gold)s; margin: 4.5mm 0; }

.strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.6mm;
         width: 100%%; margin-top: auto; padding-top: 6mm; }
.shot { position: relative; aspect-ratio: 3 / 2; border-radius: 1.6mm; overflow: hidden;
        box-shadow: 0 0 0 0.18mm %(shot_edge)s; }
.shot img { width: 100%%; height: 100%%; object-fit: cover; display: block; }
.shot .cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 3.4mm 1mm 1.5mm;
             background: linear-gradient(to top, rgba(10,17,40,.88), rgba(10,17,40,0));
             font-family: 'Montserrat', sans-serif; font-weight: 600; font-size: 5.4pt;
             letter-spacing: 0.2em; text-indent: 0.2em; color: %(shot_cap)s; text-align: center; }

.list { width: 100%%; display: flex; flex-direction: column; gap: 3.1mm; text-align: left; }
.row { display: flex; align-items: baseline; gap: 3.4mm; }
.row .tag { font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 7pt;
            letter-spacing: 0.16em; color: %(gold_bright)s; width: 26mm; flex: none; }
.row .txt { font-family: 'Poppins', sans-serif; font-weight: 300; font-size: 8.4pt;
            line-height: 1.35; color: %(body)s; }
.row .txt b { font-weight: 500; color: %(head)s; }

.cta { margin-top: 5mm; display: flex; align-items: center; gap: 5mm;
       background: %(card)s; border: %(card_border)s; border-radius: 2.4mm;
       padding: 4.2mm 5mm; width: 100%%; }
.cta .qr-wrap { background: #fff; border-radius: 1.2mm; line-height: 0; }
.cta .copy { text-align: left; }
.cta .scan { font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 7pt;
             letter-spacing: 0.3em; color: %(scan)s; }
.cta .site { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 16pt;
             color: %(site)s; line-height: 1.1; margin-top: 1.6mm; }
.cta .sub { font-family: 'Poppins', sans-serif; font-weight: 300; font-size: 7.6pt;
            color: %(card_body)s; margin-top: 1.4mm; line-height: 1.4; }
.foot { margin-top: 5mm; font-family: 'Montserrat', sans-serif; font-weight: 500;
        font-size: 6.4pt; letter-spacing: 0.24em; text-indent: 0.24em; color: %(foot)s; }
"""

FLYER_THEMES = {
    "dark": dict(
        bg=NAVY_DEEP,
        glow="radial-gradient(90% 55% at 50% 0%, rgba(184,134,11,.20) 0%, rgba(10,17,40,0) 62%)",
        frame="rgba(184,134,11,.55)", frame_soft="rgba(184,134,11,.25)",
        gold=GOLD, gold_bright=GOLD_LIGHT, head=CREAM, body=MUTED,
        card="#ffffff", card_border="none", card_body="#5b6480",
        scan=GOLD, site=NAVY_DEEP, foot="rgba(185,194,222,.75)",
        shot_edge="rgba(184,134,11,.55)", shot_cap="#f4efe2"),
    "light": dict(
        bg="#fbf8f1",
        glow="radial-gradient(85% 50% at 50% 0%, rgba(184,134,11,.13) 0%, rgba(251,248,241,0) 60%)",
        frame="rgba(30,58,138,.35)", frame_soft="rgba(184,134,11,.4)",
        gold="#9a6f09", gold_bright="#8a6508", head=NAVY_DEEP, body="#4a5375",
        card=NAVY_DEEP, card_border="none", card_body="rgba(244,239,226,.75)",
        scan=GOLD_LIGHT, site=CREAM, foot="#7c8399",
        shot_edge="rgba(30,58,138,.3)", shot_cap="#f4efe2"),
}

ROWS = [
    ("EAT", "Restaurants, grills and old-school <b>kafanas</b> locals actually go to"),
    ("COFFEE", "Specialty cafés, brunch spots and terraces with a river view"),
    ("NIGHTLIFE", "Clubs, bars and the floating river clubs — <b>splavovi</b>"),
    ("SEE & DO", "The fortress, museums, churches, parks and viewpoints"),
    ("WHAT'S ON", "Concerts, festivals and live events happening this week"),
]


def flyer_body(theme, dark):
    rows = "".join(f'<div class="row"><div class="tag">{t}</div>'
                   f'<div class="txt">{x}</div></div>' for t, x in ROWS)
    shots = "".join(f'<div class="shot"><img src="{src}" alt=""><div class="cap">{cap}</div></div>'
                    for src, cap in PHOTOS)
    logo = (f'<img class="logo" src="{LOGO}" alt="FeelBG">' if dark else
            f'<img class="logo" src="{LOGO}" alt="FeelBG" '
            f'style="filter:brightness(.42) saturate(1.5)">')
    return f"""
<div class="inner">
  {logo}
  <div class="eyebrow">BELGRADE CITY GUIDE</div>
  <h1>Feel Belgrade<br><span>like a local.</span></h1>
  <p class="lead">One free guide to the places that make this city worth the trip —
     hand-picked, written in English, no app to install.</p>
  <div class="rule"></div>
  <div class="list">{rows}</div>
  <div class="strip">{shots}</div>
  <div class="cta">
    <div class="qr-wrap">{qr_markup(28)}</div>
    <div class="copy">
      <div class="scan">SCAN ME</div>
      <div class="site">feelbg.com</div>
      <div class="sub">Point your phone camera at the code —<br>the guide opens in your browser.</div>
    </div>
  </div>
  <div class="foot">FREE · IN ENGLISH · BELGRADE, SERBIA</div>
</div>"""


def build_flyer(name, theme_key, bleed):
    theme = FLYER_THEMES[theme_key]
    pw, ph = TRIM_W + 2 * bleed, TRIM_H + 2 * bleed
    css = FLYER_CSS % dict(theme, pw=pw, ph=ph, bleed=bleed)
    body = (f'<div class="sheet"><div class="glow"></div>'
            f'<div class="bleedbox">'
            f'<div class="frame"></div>'
            f'{flyer_body(theme, theme_key == "dark")}</div></div>')
    html = page(css, body, pw, ph)
    path = os.path.join(HERE, f"_{name}.html")
    open(path, "w").write(html)
    render.to_pdf(path, os.path.join(OUT, f"{name}.pdf"))
    finish.finish(os.path.join(OUT, f"{name}.pdf"), pw, ph, bleed_mm=bleed,
                  title="FeelBG flyer A5")
    return path


def pdf_preview(name, dpi=170):
    """Rasterise a finished PDF so the preview is literally the print file."""
    doc = pdfium.PdfDocument(os.path.join(OUT, f"{name}.pdf"))
    doc[0].render(scale=dpi / 72).to_pil().convert("RGB").save(
        os.path.join(OUT, f"{name}.png"), optimize=True)


# ------------------------------------------------------------ plain exports
def build_plain_qr():
    """The bare symbol, for stickers, menus, social posts and anything else."""
    with open(os.path.join(OUT, "feelbg-qr.svg"), "w") as fh:
        fh.write(qr.svg_document(size_px=1000))
    with open(os.path.join(OUT, "feelbg-qr-transparent.svg"), "w") as fh:
        fh.write(qr.svg_document(size_px=1000, background=None))
    px = 2000
    raster = ('<meta charset="utf-8"><style>*{margin:0;padding:0}'
              f'body{{width:{px}px;height:{px}px}}</style>' + qr.svg_document(size_px=px))
    p = os.path.join(HERE, "_qr_raster.html")
    open(p, "w").write(raster)
    render.to_png(p, os.path.join(OUT, "feelbg-qr.png"), px, px, 1.0)
    os.unlink(p)
    # vector PDF of the bare symbol at 40 mm
    css = ".only{width:40mm;height:40mm}"
    html = page(css, f'<div class="only">{qr_markup(40)}</div>', 40, 40)
    p = os.path.join(HERE, "_qr_pdf.html")
    open(p, "w").write(html)
    render.to_pdf(p, os.path.join(OUT, "feelbg-qr-40mm.pdf"))
    finish.finish(os.path.join(OUT, "feelbg-qr-40mm.pdf"), 40, 40, title="FeelBG QR code")
    os.unlink(p)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    tmp = []
    tmp.append(build_badge("feelbg-qr-badge-white-45x60mm", "light"))
    tmp.append(build_badge("feelbg-qr-badge-navy-45x60mm", "navy"))
    tmp.append(build_sheet("feelbg-qr-badges-a4-sheet-16up"))
    tmp.append(build_flyer("feelbg-flyer-a5-navy-PRINT-bleed", "dark", BLEED))
    tmp.append(build_flyer("feelbg-flyer-a5-navy", "dark", 0))
    tmp.append(build_flyer("feelbg-flyer-a5-cream-PRINT-bleed", "light", BLEED))
    tmp.append(build_flyer("feelbg-flyer-a5-cream", "light", 0))
    pdf_preview("feelbg-flyer-a5-navy")
    pdf_preview("feelbg-flyer-a5-cream")
    pdf_preview("feelbg-qr-badges-a4-sheet-16up", dpi=120)
    build_plain_qr()
    for p in tmp:
        os.path.exists(p) and os.unlink(p)
    for f in sorted(os.listdir(OUT)):
        print(f"  {f:<46} {os.path.getsize(os.path.join(OUT, f)) // 1024:>5} KB")
