"""Extract the supplied text-layer PDF; no OCR or external dictionary source."""
import hashlib
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / ".dictionary-tools"))
import fitz

source = Path(__file__).resolve().parents[1] / "data/dictionaries/russian-lezgin.pdf"
if not source.is_file():
    raise SystemExit(f"Missing source PDF: {source}")
document = fitz.open(source)
pages = []
for number, page in enumerate(document, 1):
    lines = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            spans = line["spans"]
            text = "".join(span["text"] for span in spans).strip()
            first = next((span for span in spans if span["text"].strip()), None)
            if text:
                lines.append({"text": text, "bold": bool(first and "Bold" in first["font"]),
                              "bbox": line["bbox"],
                              "spans": [{k: s[k] for k in ("text", "font", "size", "color", "flags", "bbox", "origin")} for s in spans]})
    pages.append({"page": number, "lines": lines})
result = {"version": 2, "sha256": hashlib.sha256(source.read_bytes()).hexdigest(), "pages": pages}
target = source.with_suffix(".extracted.json")
target.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
print(json.dumps({"pages": len(pages), "output": str(target), "sha256": result["sha256"]}))
