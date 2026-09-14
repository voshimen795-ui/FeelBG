#!/usr/bin/env python3
"""Fetch Google Fonts (latin + latin-ext only) and inline them as base64 @font-face rules."""
import base64
import re
import subprocess

FAMILIES = [
    "Playfair+Display:wght@400;500;700;900",
    "Montserrat:wght@300;400;500;600;700",
    "Poppins:wght@300;400;500;600",
]
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")


def get(url, binary=False):
    out = subprocess.run(["curl", "-sS", "-m", "60", "-A", UA, url],
                         capture_output=True, check=True)
    return out.stdout if binary else out.stdout.decode()


blocks = []
for fam in FAMILIES:
    css = get(f"https://fonts.googleapis.com/css2?family={fam}&display=swap")
    # each @font-face is preceded by a /* subset */ comment
    for subset, face in re.findall(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{[^}]*\})", css):
        if subset not in ("latin", "latin-ext"):
            continue
        url = re.search(r"url\((https://[^)]+)\)", face).group(1)
        data = base64.b64encode(get(url, binary=True)).decode()
        face = face.replace(url, f"data:font/woff2;base64,{data}")
        blocks.append(face)

with open("fonts.css", "w") as fh:
    fh.write("\n".join(blocks))
print(f"{len(blocks)} faces inlined")
