#!/usr/bin/env python3
"""Thin wrapper around headless Chromium for PDF / PNG output."""
import os
import subprocess
import tempfile

CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
if not os.path.exists(CHROME):
    for root, dirs, files in os.walk("/opt/pw-browsers"):
        if "chrome" in files:
            CHROME = os.path.join(root, "chrome")
            break

BASE = ["--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
        "--disable-lcd-text", "--font-render-hinting=none",
        "--run-all-compositor-stages-before-draw", "--virtual-time-budget=6000"]


def _run(args):
    res = subprocess.run([CHROME] + BASE + args, capture_output=True, timeout=180)
    if res.returncode != 0:
        raise RuntimeError(res.stderr.decode()[-2000:])


def to_pdf(html_path, pdf_path):
    _run([f"--print-to-pdf={pdf_path}", "--no-pdf-header-footer",
          "--print-to-pdf-no-header", f"file://{os.path.abspath(html_path)}"])
    return pdf_path


def to_png(html_path, png_path, width, height, scale=1.0):
    _run([f"--screenshot={png_path}", f"--window-size={int(width)},{int(height)}",
          f"--force-device-scale-factor={scale}", f"file://{os.path.abspath(html_path)}"])
    return png_path


def html_tmp(markup, directory="."):
    fd, path = tempfile.mkstemp(suffix=".html", dir=directory)
    with os.fdopen(fd, "w") as fh:
        fh.write(markup)
    return path
