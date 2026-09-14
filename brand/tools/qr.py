#!/usr/bin/env python3
"""FeelBG branded QR code -> SVG fragment.

Royal Blue modules, Bronze Gold eyes, gold "F" monogram knocked out of the
centre. The payload is encoded uppercase on purpose: the URL scheme and host
are case-insensitive, and uppercase keeps the symbol in alphanumeric mode,
which is one version smaller (25x25 instead of 29x29) and therefore readable
at a much smaller printed size.
"""
import base64
import os

import segno

REPO = "/home/user/FeelBG"
MONOGRAM = os.path.join(REPO, "assets/images/logo/feelbg-monogram-f.png")

NAVY = "#1e3a8a"
GOLD = "#b8860b"
GOLD_DEEP = "#8a6508"

PAYLOAD = "HTTPS://FEELBG.COM"
QUIET = 4          # quiet zone, in modules (spec minimum)
# Monogram size is not a free choice: measured against a plain reference
# symbol, anything past ~6 modules of knockout starts costing decodes even at
# error correction H, because the lost modules are contiguous.
LOGO = 5.6         # diameter of the centre monogram, in modules
CLEAR = 3.0        # radius of the module knockout around it, in modules


def _monogram_uri():
    with open(MONOGRAM, "rb") as fh:
        return "data:image/png;base64," + base64.b64encode(fh.read()).decode()


def _rounded(x, y, w, h, r, fill):
    return (f'<rect x="{x:.4f}" y="{y:.4f}" width="{w:.4f}" height="{h:.4f}" '
            f'rx="{r:.4f}" ry="{r:.4f}" fill="{fill}"/>')


def _in_finder(r, c, n):
    return ((r < 7 and c < 7) or (r < 7 and c >= n - 7) or (r >= n - 7 and c < 7))


def _in_logo(r, c, n, clear=CLEAR):
    mid = n / 2
    return ((r + 0.5 - mid) ** 2 + (c + 0.5 - mid) ** 2) ** 0.5 < clear


def build(monogram=True, dark=NAVY, eye=GOLD, quiet=QUIET, radius=0.26,
          logo=LOGO, clear=CLEAR):
    """Return (svg_fragment, viewbox_size_in_modules)."""
    qr = segno.make(PAYLOAD, error="h")
    matrix = [list(row) for row in qr.matrix]
    n = len(matrix)
    total = n + 2 * quiet
    out = []

    # --- data modules: rounded squares, drawn full size so the printed
    # symbol keeps the contrast a scanner expects at small sizes.
    for r in range(n):
        for c in range(n):
            if not matrix[r][c] or _in_finder(r, c, n):
                continue
            if monogram and _in_logo(r, c, n, clear):
                continue
            out.append(_rounded(quiet + c, quiet + r, 1, 1, radius, dark))

    # --- finder patterns: navy ring, gold pupil.
    # The corner radii are deliberately conservative: round the 7x7 ring any
    # harder and its corner modules stop reading as dark, which is exactly
    # what makes "designer" QR codes fail to scan.
    ro, ri = 1.2, 0.85
    for (fr, fc) in ((0, 0), (0, n - 7), (n - 7, 0)):
        x, y = quiet + fc, quiet + fr
        out.append(
            f'<path d="M{x + ro:.4f} {y:.4f} h{7 - 2 * ro:.4f} '
            f'a{ro} {ro} 0 0 1 {ro} {ro} v{7 - 2 * ro:.4f} '
            f'a{ro} {ro} 0 0 1 -{ro} {ro} h-{7 - 2 * ro:.4f} '
            f'a{ro} {ro} 0 0 1 -{ro} -{ro} v-{7 - 2 * ro:.4f} '
            f'a{ro} {ro} 0 0 1 {ro} -{ro} z '
            f'M{x + 1 + ri:.4f} {y + 1:.4f} h{5 - 2 * ri:.4f} '
            f'a{ri} {ri} 0 0 1 {ri} {ri} v{5 - 2 * ri:.4f} '
            f'a{ri} {ri} 0 0 1 -{ri} {ri} h-{5 - 2 * ri:.4f} '
            f'a{ri} {ri} 0 0 1 -{ri} -{ri} v-{5 - 2 * ri:.4f} '
            f'a{ri} {ri} 0 0 1 {ri} -{ri} z" fill="{dark}" fill-rule="evenodd"/>')
        out.append(_rounded(x + 2, y + 2, 3, 3, 0.75, eye))

    # --- centre: the FeelBG "F" monogram, on a white keep-out disc so the
    # surrounding modules stay separated from it.
    if monogram:
        mid = quiet + n / 2
        out.append(f'<circle cx="{mid:.4f}" cy="{mid:.4f}" r="{clear - 0.05:.4f}" fill="#ffffff"/>')
        out.append(f'<image x="{mid - logo / 2:.4f}" y="{mid - logo / 2:.4f}" '
                   f'width="{logo:.4f}" height="{logo:.4f}" href="{_monogram_uri()}"/>')

    return "\n".join(out), total


def svg_document(monogram=True, size_px=1024, background="#ffffff", **kw):
    frag, total = build(monogram=monogram, **kw)
    bg = f'<rect width="{total}" height="{total}" fill="{background}"/>' if background else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size_px}" height="{size_px}" '
            f'viewBox="0 0 {total} {total}" shape-rendering="geometricPrecision">\n'
            f'<title>FeelBG - feelbg.com</title>\n{bg}\n{frag}\n</svg>\n')


if __name__ == "__main__":
    qr = segno.make(PAYLOAD, error="h")
    print(f"payload={PAYLOAD} version={qr.version} ecc={qr.error} "
          f"mode={qr.mode} modules={qr.symbol_size(border=0)[0]}")
