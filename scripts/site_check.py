from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import posixpath
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE_BASE = "https://charlesatugonza077-hue.github.io/augusta-uganda/"
ERRORS = []


class PageAudit(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []
        self.meta = {"description": 0, "canonical": 0, "og:type": 0, "twitter:card": 0}
        self.lang = False
        self.skip_link = False
        self.main_landmark = False
        self.refresh_redirect = False
        self.noindex = False
        self.images_missing_alt = 0
        self.ids = set()
        self.duplicate_ids = set()
        self.labels = set()
        self.form_controls = []
        self._title_depth = 0
        self.title_text = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.lang = bool(attrs.get("lang", "").strip())
        if tag == "title":
            self._title_depth += 1
        if tag == "meta":
            name = (attrs.get("name") or "").lower()
            prop = (attrs.get("property") or "").lower()
            if name == "description":
                self.meta["description"] += 1
            if name == "twitter:card":
                self.meta["twitter:card"] += 1
            if prop == "og:type":
                self.meta["og:type"] += 1
            if name == "robots" and "noindex" in (attrs.get("content") or "").lower():
                self.noindex = True
            if attrs.get("http-equiv", "").lower() == "refresh":
                self.refresh_redirect = True
        if tag == "link" and "canonical" in (attrs.get("rel") or "").lower().split():
            self.meta["canonical"] += 1
        if tag == "a" and "skip" in (attrs.get("class") or "").split() and (attrs.get("href") or "").startswith("#"):
            self.skip_link = True
        if tag == "main" and attrs.get("id") == "main":
            self.main_landmark = True
        if tag == "img" and "alt" not in attrs:
            self.images_missing_alt += 1
        if "id" in attrs:
            value = attrs["id"]
            if value in self.ids:
                self.duplicate_ids.add(value)
            self.ids.add(value)
        if tag == "label" and attrs.get("for"):
            self.labels.add(attrs["for"])
        if tag in ("input", "select", "textarea") and attrs.get("type", "").lower() not in ("hidden", "submit", "button", "reset"):
            self.form_controls.append((attrs.get("id"), attrs.get("type", tag)))
        for key in ("href", "src", "poster", "action"):
            value = attrs.get(key)
            if value:
                self.refs.append(value.strip())

    def handle_endtag(self, tag):
        if tag == "title" and self._title_depth:
            self._title_depth -= 1

    def handle_data(self, data):
        if self._title_depth:
            self.title_text += data


def fail(message):
    ERRORS.append(message)


pages = sorted(p for p in ROOT.rglob("*.html") if not p.name.startswith("google"))
if not pages:
    fail("No HTML pages found.")

for page in pages:
    source = page.read_text(encoding="utf-8")
    rel = page.relative_to(ROOT).as_posix()
    if len(re.findall(r"<!doctype\s+html\s*>", source, flags=re.I)) != 1:
        fail(f"{rel}: expected exactly one HTML doctype.")

    audit = PageAudit()
    audit.feed(source)
    if not audit.lang:
        fail(f"{rel}: missing html lang attribute.")
    if not audit.title_text.strip():
        fail(f"{rel}: missing or empty page title.")
    if audit.duplicate_ids:
        fail(f"{rel}: duplicate id(s): {', '.join(sorted(audit.duplicate_ids))}")
    if audit.images_missing_alt:
        fail(f"{rel}: {audit.images_missing_alt} image(s) missing alt attribute.")

    is_redirect = audit.refresh_redirect
    if not is_redirect:
        if not audit.skip_link:
            fail(f"{rel}: missing skip-navigation link.")
        if not audit.main_landmark:
            fail(f"{rel}: missing main#main landmark.")
        for key, count in audit.meta.items():
            if count != 1 and not audit.noindex:
                fail(f"{rel}: expected one {key} declaration, found {count}.")
        for control_id, control_type in audit.form_controls:
            if control_id and control_id not in audit.labels:
                fail(f"{rel}: form control #{control_id} ({control_type}) has no matching label.")

    for raw in audit.refs:
        parsed = urlsplit(raw)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        path = unquote(parsed.path)
        if path.startswith("/"):
            path = path.lstrip("/")
            if path.startswith("augusta-uganda/"):
                path = path[len("augusta-uganda/"):]
        else:
            path = posixpath.join(rel.rpartition("/")[0], path)
        path = posixpath.normpath(path)
        if path in ("", "."):
            path = "index.html"
        target = (ROOT / path).resolve()
        if ROOT not in target.parents and target != ROOT:
            fail(f"{rel}: local reference escapes repository: {raw}")
        elif target.is_dir():
            target = target / "index.html"
            if not target.is_file():
                fail(f"{rel}: local directory reference has no index.html: {raw}")
        elif not target.is_file():
            fail(f"{rel}: missing local reference: {raw}")

sitemap = ROOT / "sitemap.xml"
if not sitemap.is_file():
    fail("sitemap.xml is missing.")
else:
    try:
        root = ET.parse(sitemap).getroot()
        locs = [node.text.strip() for node in root.findall(".//{*}loc") if node.text and node.text.strip()]
        if not locs:
            fail("sitemap.xml contains no URL entries.")
        if len(locs) != len(set(locs)):
            fail("sitemap.xml contains duplicate URL entries.")
        for loc in locs:
            if not loc.startswith(SITE_BASE):
                fail(f"sitemap.xml: URL is outside the configured GitHub Pages base: {loc}")
                continue
            rel = unquote(urlsplit(loc).path[len(urlsplit(SITE_BASE).path):]).lstrip("/")
            target = ROOT / (rel or "index.html")
            if target.is_dir():
                target = target / "index.html"
            if not target.is_file():
                fail(f"sitemap.xml: URL does not map to a repository file: {loc}")
    except ET.ParseError as exc:
        fail(f"sitemap.xml: invalid XML: {exc}")

if ERRORS:
    print("\n".join(ERRORS))
    sys.exit(1)

print(f"Site checks passed for {len(pages)} HTML pages, local references, accessibility structure and sitemap.xml.")
