#!/usr/bin/env python3
"""Scan-test the printed QR the way a phone actually sees it.

The symbol is cropped out of the finished 600 dpi PDF render, then resampled
to the pixel sizes a phone camera resolves at normal reading distance, with
camera shake, sensor noise and a few degrees of tilt thrown in.
"""
import glob
import os

import cv2
import numpy as np
import pypdfium2 as pdfium

EXPECTED = "HTTPS://FEELBG.COM"
OUT = "/home/user/FeelBG/brand/print"
DPI = 600

# (file, QR centre x/y and size in mm on the page)
TARGETS = [
    ("feelbg-flyer-a5-navy.pdf", 12 + 5 + 14, 210 - 8 - 6 - 14 - 2.3, 30),
    ("feelbg-qr-badge-white-45x60mm.pdf", 22.5, 25.5, 32),
    ("feelbg-qr-40mm.pdf", 20, 20, 40),
]


def crop(path, cx_mm, cy_mm, size_mm):
    page = pdfium.PdfDocument(os.path.join(OUT, path))[0]
    img = np.array(page.render(scale=DPI / 72).to_pil().convert("RGB"))[:, :, ::-1]
    px = DPI / 25.4
    half = size_mm / 2 * px
    x, y = cx_mm * px, cy_mm * px
    x0, y0 = max(0, int(x - half)), max(0, int(y - half))
    return img[y0:int(y + half), x0:int(x + half)]


def simulate(sym, px, blur, angle, noise):
    img = cv2.resize(sym, (px, px), interpolation=cv2.INTER_AREA)
    pad = int(px * 0.18)
    img = cv2.copyMakeBorder(img, pad, pad, pad, pad, cv2.BORDER_REPLICATE)
    if angle:
        n = img.shape[0]
        m = cv2.getRotationMatrix2D((n / 2, n / 2), angle, 1.0)
        img = cv2.warpAffine(img, m, (n, n), flags=cv2.INTER_LINEAR,
                             borderMode=cv2.BORDER_REPLICATE)
    if blur:
        img = cv2.GaussianBlur(img, (blur, blur), 0)
    if noise:
        img = np.clip(img.astype(np.int16) +
                      np.random.RandomState(7).normal(0, noise, img.shape), 0, 255).astype(np.uint8)
    return img


def run():
    det = cv2.QRCodeDetector()
    total = hits = 0
    for name, cx, cy, size in TARGETS:
        sym = crop(name, cx, cy, size)
        if sym.size == 0:
            print(f"{name}: crop failed"); continue
        cv2.imwrite(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                 f"_crop_{name}.png"), sym)
        rows = []
        for px in (110, 140, 180, 240, 320, 480):
            ok = 0
            cases = [(0, 0, 0), (3, 0, 0), (3, 7, 4), (5, -12, 6), (0, 25, 3), (3, 45, 5)]
            for blur, angle, noise in cases:
                data, _, _ = det.detectAndDecode(simulate(sym, px, blur, angle, noise))
                ok += data == EXPECTED
            rows.append(f"{px}px:{ok}/{len(cases)}")
            total += len(cases); hits += ok
        print(f"{name:<38} " + "  ".join(rows))
    print(f"\ntotal {hits}/{total} decoded")


if __name__ == "__main__":
    run()
