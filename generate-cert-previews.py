# ═══════════════════════════════════════════════════════════
# CERTIFICATE PREVIEW GENERATOR
#
# Renders page 1 of every PDF in Certificates/ to a JPG in
# Certificates/previews/, which the website uses as the card
# thumbnail. Images (jpg/png/webp) in Certificates/ need no
# preview — the site shows them directly.
#
# After adding a new certificate:
#   1. Drop the PDF (or image) into Certificates/
#   2. Run:  & "$env:LOCALAPPDATA\SushrutaTTS\venv\Scripts\python" generate-cert-previews.py
#   3. Add one entry to the CERTIFICATES list in js/certificates.js
# ═══════════════════════════════════════════════════════════
import re
import sys
from pathlib import Path

import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parent
CERT_DIR = ROOT / "Certificates"
OUT_DIR = CERT_DIR / "previews"
RENDER_WIDTH = 1000  # px — sharp on retina phones, small file

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    pdfs = sorted(CERT_DIR.glob("*.pdf"))
    if not pdfs:
        print("No PDFs found in", CERT_DIR)
        return
    for pdf_path in pdfs:
        out = OUT_DIR / (slug(pdf_path.stem) + ".webp")
        doc = pdfium.PdfDocument(str(pdf_path))
        page = doc[0]
        scale = RENDER_WIDTH / page.get_width()
        image = page.render(scale=scale).to_pil()
        image.convert("RGB").save(str(out), "WEBP", quality=80)
        kb = out.stat().st_size // 1024
        print(f"  ✓ {out.relative_to(ROOT)}  ({kb} KB)")
    print("Done.")


if __name__ == "__main__":
    main()
