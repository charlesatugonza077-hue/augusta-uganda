from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
errors = []
pages = sorted(ROOT.rglob("*.html"))

if not pages:
    errors.append("No HTML pages found.")

for page in pages:
    source = page.read_text(encoding="utf-8")
    rel = page.relative_to(ROOT)
    # Google verification files must remain exact plain-text tokens.
    if source.strip().startswith("google-site-verification:"):
        continue
    if len(re.findall(r"<!doctype html>", source, flags=re.I)) != 1:
        errors.append(f"{rel}: expected exactly one HTML doctype.")
    if not re.search(r"<html\b[^>]*\blang=", source, flags=re.I):
        errors.append(f"{rel}: missing html lang attribute.")
    if not re.search(r"<title>\s*.+?\s*</title>", source, flags=re.I | re.S):
        errors.append(f"{rel}: missing page title.")
    for attr in ("href", "src"):
        for value in re.findall(rf"{attr}=[\"']([^\"']+)[\"']", source, flags=re.I):
            value = value.strip()
            if not value or value.startswith(("#", "http://", "https://", "mailto:", "tel:", "javascript:", "data:")):
                continue
            target = value.split("#", 1)[0].split("?", 1)[0]
            if not target:
                continue
            candidate = (page.parent / target).resolve()
            try:
                candidate.relative_to(ROOT.resolve())
            except ValueError:
                errors.append(f"{rel}: local reference escapes repository: {value}")
                continue
            if not candidate.exists() and not (candidate / "index.html").exists():
                errors.append(f"{rel}: missing local reference: {value}")

sitemap = ROOT / "sitemap.xml"
if sitemap.exists():
    try:
        ET.parse(sitemap)
    except ET.ParseError as exc:
        errors.append(f"sitemap.xml: invalid XML: {exc}")
else:
    errors.append("sitemap.xml is missing.")

if errors:
    print("\n".join(errors))
    sys.exit(1)

print(f"Site checks passed for {len(pages)} HTML pages and sitemap.xml.")
