#!/usr/bin/env python3
"""Normalise a Chromium-printed PDF for a print shop.

Chromium rounds the page box to whole CSS pixels, which leaves an A5 page
0.17 mm off. Here the content is scaled back to the exact trim size, the
page boxes are set explicitly, and TrimBox/BleedBox are written so the
printer knows where to cut.
"""
import pikepdf

MM = 72 / 25.4


def finish(path, width_mm, height_mm, bleed_mm=0, title=""):
    w, h = width_mm * MM, height_mm * MM
    with pikepdf.open(path, allow_overwriting_input=True) as pdf:
        for page in pdf.pages:
            box = [float(v) for v in page.mediabox]
            cur_w, cur_h = box[2] - box[0], box[3] - box[1]
            sx, sy = w / cur_w, h / cur_h
            if abs(sx - 1) > 1e-9 or abs(sy - 1) > 1e-9:
                page.contents_add(pikepdf.Stream(pdf, f"q {sx:.9f} 0 0 {sy:.9f} 0 0 cm\n".encode()),
                                  prepend=True)
                page.contents_add(pikepdf.Stream(pdf, b"\nQ"))
            page.mediabox = [0, 0, w, h]
            b = bleed_mm * MM
            page.trimbox = [b, b, w - b, h - b]
            page.bleedbox = [0, 0, w, h]
            page.cropbox = [0, 0, w, h]
        with pdf.open_metadata() as meta:
            meta["dc:title"] = title or "FeelBG"
            meta["dc:creator"] = ["FeelBG"]
            meta["pdf:Producer"] = "FeelBG print kit"
        pdf.save(path, linearize=True)
    return path
