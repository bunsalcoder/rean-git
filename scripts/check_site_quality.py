#!/usr/bin/env python3
"""Fail if locale keys, curriculum coverage, or internal site links drift."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
LOCALES = WEB / "locales"
CONTENT = WEB / "content"
LEARN_JS = WEB / "assets" / "js" / "learn.js"
SITE_ORIGIN = "https://bunsalcoder.github.io/rean-git"
PAGE_CANONICALS = {
    "index.html": f"{SITE_ORIGIN}/",
    "learn.html": f"{SITE_ORIGIN}/learn.html",
    "labs.html": f"{SITE_ORIGIN}/labs.html",
    "lab.html": f"{SITE_ORIGIN}/lab.html",
}

CHAPTER_IDS_RE = re.compile(
    r"const CHAPTER_IDS\s*=\s*\[(.*?)\];",
    re.S,
)
LAB_META_RE = re.compile(
    r"const LAB_META\s*=\s*\[(.*?)\];",
    re.S,
)
STRING_RE = re.compile(r'"([^"]+)"')
LAB_ID_RE = re.compile(r'id:\s*"([^"]+)"')
MD_LINK_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)|\[[^\]]*\]\(([^)]+)\)")
HTML_HREF_RE = re.compile(r"""(?:href|src)=["']([^"']+)["']""")
DATA_I18N_RE = re.compile(r'data-i18n="([^"]+)"')
JS_T_RE = re.compile(r"""(?:\bt\(|\.t\()\s*['"]([^'"]+)['"]""")
LAB_QUERY_RE = re.compile(r"(?:^\./)?lab\.html\?id=([a-z0-9-]+)$")


def flatten(obj: dict, prefix: str = "") -> dict[str, object]:
    out: dict[str, object] = {}
    for key, value in obj.items():
        path = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            out.update(flatten(value, path))
        else:
            out[path] = value
    return out


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def parse_learn_meta() -> tuple[list[str], list[str]]:
    text = LEARN_JS.read_text(encoding="utf-8")
    chapters_m = CHAPTER_IDS_RE.search(text)
    labs_m = LAB_META_RE.search(text)
    if not chapters_m or not labs_m:
        raise SystemExit("Could not parse CHAPTER_IDS / LAB_META from learn.js")
    chapters = STRING_RE.findall(chapters_m.group(1))
    labs = LAB_ID_RE.findall(labs_m.group(1))
    return chapters, labs


def fail(messages: list[str], label: str) -> int:
    if not messages:
        print(f"OK:    {label}")
        return 0
    print(f"FAIL:  {label}")
    for msg in messages:
        print(f"  - {msg}")
    return 1


def check_locale_parity() -> int:
    en = flatten(load_json(LOCALES / "en.json"))
    km = flatten(load_json(LOCALES / "km.json"))
    only_en = sorted(set(en) - set(km))
    only_km = sorted(set(km) - set(en))
    msgs = [f"only in en.json: {k}" for k in only_en]
    msgs += [f"only in km.json: {k}" for k in only_km]
    return fail(msgs, f"locale key parity ({len(en)} keys)")


def check_locale_vs_code(chapters: list[str], labs: list[str]) -> int:
    en = flatten(load_json(LOCALES / "en.json"))
    msgs: list[str] = []

    for chapter_id in chapters:
        key = f"chapters.{chapter_id}"
        if key not in en:
            msgs.append(f"missing locale key {key}")

    for lab_id in labs:
        for field in ("title", "teaser", "summary"):
            key = f"labs.{lab_id}.{field}"
            if key not in en:
                msgs.append(f"missing locale key {key}")

    html_keys: set[str] = set()
    for path in WEB.glob("*.html"):
        html_keys.update(DATA_I18N_RE.findall(path.read_text(encoding="utf-8")))
    for key in sorted(html_keys):
        if key not in en:
            msgs.append(f"HTML data-i18n missing in locales: {key}")

    js_keys: set[str] = set()
    for path in (WEB / "assets" / "js").glob("*.js"):
        js_keys.update(JS_T_RE.findall(path.read_text(encoding="utf-8")))
    for key in sorted(js_keys):
        if key not in en:
            msgs.append(f"JS t() missing in locales: {key}")

    return fail(msgs, "locale keys vs learn.js / HTML / JS")


def check_content_files(labs: list[str]) -> int:
    msgs: list[str] = []
    for locale in ("en", "km"):
        guide = CONTENT / locale / "guide.md"
        if not guide.is_file():
            msgs.append(f"missing {guide.relative_to(ROOT)}")
            continue
        text = guide.read_text(encoding="utf-8")
        for n in range(1, 28):
            if not re.search(rf"^## {n}\. ", text, re.M):
                msgs.append(f"{guide.relative_to(ROOT)} missing chapter heading ## {n}.")
        for lab_id in labs:
            lab_path = CONTENT / locale / "labs" / f"{lab_id}.md"
            if not lab_path.is_file():
                msgs.append(f"missing {lab_path.relative_to(ROOT)}")
    return fail(msgs, "handbook chapters + lab markdown files")


def is_external(url: str) -> bool:
    return bool(re.match(r"^(https?:|mailto:|tel:|#)", url, re.I))


def normalize_local_target(raw: str) -> str | None:
    url = raw.strip()
    if not url or is_external(url) or url.startswith("//"):
        return None
    url = url.split("#", 1)[0].split("?", 1)[0]
    if not url:
        return None
    return url


def check_markdown_links(labs: list[str]) -> int:
    msgs: list[str] = []
    known_labs = set(labs)
    for path in sorted(CONTENT.rglob("*.md")):
        text = path.read_text(encoding="utf-8")
        for match in MD_LINK_RE.finditer(text):
            target = match.group(1) or match.group(2)
            if target is None:
                continue
            lab_m = LAB_QUERY_RE.match(target.strip())
            if lab_m:
                lab_id = lab_m.group(1)
                if lab_id not in known_labs:
                    msgs.append(f"{path.relative_to(ROOT)}: unknown lab id {lab_id}")
                continue
            local = normalize_local_target(target)
            if local is None:
                continue
            # Site links like ./lab.html are checked via HTML asset pass;
            # markdown should not point at missing files under content/.
            if local.endswith(".html"):
                candidate = WEB / local.lstrip("./")
                if not candidate.is_file():
                    msgs.append(
                        f"{path.relative_to(ROOT)}: missing {local}"
                    )
                continue
            if local.startswith(("../", "./")):
                candidate = (path.parent / local).resolve()
                try:
                    candidate.relative_to(ROOT)
                except ValueError:
                    msgs.append(f"{path.relative_to(ROOT)}: link escapes repo: {local}")
                    continue
                if not candidate.exists():
                    msgs.append(f"{path.relative_to(ROOT)}: missing {local}")
    return fail(msgs, "markdown internal links")


def check_html_assets() -> int:
    msgs: list[str] = []
    known_labs = {
        m.group(1)
        for m in LAB_ID_RE.finditer(LEARN_JS.read_text(encoding="utf-8"))
    }
    for path in sorted(WEB.glob("*.html")):
        text = path.read_text(encoding="utf-8")
        for target in HTML_HREF_RE.findall(text):
            lab_m = re.search(r"lab\.html\?id=([a-z0-9-]+)", target)
            if lab_m and lab_m.group(1) not in known_labs:
                msgs.append(f"{path.name}: unknown lab id {lab_m.group(1)}")
            local = normalize_local_target(target)
            if local is None:
                continue
            candidate = (path.parent / local).resolve()
            try:
                candidate.relative_to(ROOT)
            except ValueError:
                msgs.append(f"{path.name}: link escapes repo: {local}")
                continue
            if not candidate.exists():
                msgs.append(f"{path.name}: missing {local}")
    return fail(msgs, "HTML href/src assets + lab ids")


def check_seo() -> int:
    msgs: list[str] = []
    robots = WEB / "robots.txt"
    sitemap = WEB / "sitemap.xml"
    og_image = WEB / "assets" / "img" / "og-image.png"

    if not robots.is_file():
        msgs.append("missing web/robots.txt")
    else:
        robots_text = robots.read_text(encoding="utf-8")
        if f"{SITE_ORIGIN}/sitemap.xml" not in robots_text:
            msgs.append("robots.txt missing Sitemap URL")

    if not sitemap.is_file():
        msgs.append("missing web/sitemap.xml")
    else:
        sitemap_text = sitemap.read_text(encoding="utf-8")
        for loc in PAGE_CANONICALS.values():
            if f"<loc>{loc}</loc>" not in sitemap_text:
                msgs.append(f"sitemap.xml missing {loc}")

    if not og_image.is_file():
        msgs.append("missing web/assets/img/og-image.png")

    og_image_url = f"{SITE_ORIGIN}/assets/img/og-image.png"
    for name, canonical in PAGE_CANONICALS.items():
        path = WEB / name
        if not path.is_file():
            msgs.append(f"missing {name}")
            continue
        text = path.read_text(encoding="utf-8")
        if f'rel="canonical" href="{canonical}"' not in text:
            msgs.append(f"{name}: missing or wrong canonical")
        if f'property="og:url" content="{canonical}"' not in text:
            msgs.append(f"{name}: missing or wrong og:url")
        if f'property="og:image" content="{og_image_url}"' not in text:
            msgs.append(f"{name}: missing or wrong og:image")
        if 'name="twitter:card" content="summary_large_image"' not in text:
            msgs.append(f"{name}: missing twitter:card")
        if 'property="og:title"' not in text:
            msgs.append(f"{name}: missing og:title")
        if 'property="og:description"' not in text:
            msgs.append(f"{name}: missing og:description")

    home = WEB / "index.html"
    if home.is_file() and 'type="application/ld+json"' not in home.read_text(
        encoding="utf-8"
    ):
        msgs.append("index.html: missing JSON-LD WebSite schema")

    return fail(msgs, "SEO meta, robots, sitemap, og-image")


MARKED_PIN = "cdn.jsdelivr.net/npm/marked@15.0.12/marked.min.js"
PURIFY_PIN = "cdn.jsdelivr.net/npm/dompurify@3.2.6/dist/purify.min.js"
MARKED_SRI = "sha384-948ahk4ZmxYVYOc+rxN1H2gM1EJ2Duhp7uHtZ4WSLkV4Vtx5MUqnV+l7u9B+jFv+"
PURIFY_SRI = "sha384-JEyTNhjM6R1ElGoJns4U2Ln4ofPcqzSsynQkmEc/KGy6336qAZl70tDLufbkla+3"


def check_markdown_hardening() -> int:
    msgs: list[str] = []
    learn_js = LEARN_JS.read_text(encoding="utf-8")
    site_js = (WEB / "assets" / "js" / "site.js").read_text(encoding="utf-8")

    if "sanitizeMarkdownHtml" not in learn_js or "DOMPurify.sanitize" not in learn_js:
        msgs.append("learn.js must sanitize marked HTML with DOMPurify")
    if "marked.parse(md)" in learn_js and "innerHTML = marked.parse" in learn_js:
        msgs.append("learn.js still assigns marked.parse output directly to innerHTML")

    if MARKED_PIN not in site_js or MARKED_SRI not in site_js:
        msgs.append("site.js missing pinned marked URL/SRI")
    if PURIFY_PIN not in site_js or PURIFY_SRI not in site_js:
        msgs.append("site.js missing pinned DOMPurify URL/SRI")
    if "PURIFY_INTEGRITY" not in site_js:
        msgs.append("site.js soft-nav should load DOMPurify with integrity")

    for name in ("learn.html", "lab.html"):
        text = (WEB / name).read_text(encoding="utf-8")
        if MARKED_PIN not in text or f'integrity="{MARKED_SRI}"' not in text:
            msgs.append(f"{name}: marked must be version-pinned with SRI")
        if PURIFY_PIN not in text or f'integrity="{PURIFY_SRI}"' not in text:
            msgs.append(f"{name}: DOMPurify must be version-pinned with SRI")
        if 'crossorigin="anonymous"' not in text:
            msgs.append(f"{name}: CDN scripts need crossorigin=anonymous for SRI")

    return fail(msgs, "Markdown CDN pin + DOMPurify hardening")


def main() -> int:
    chapters, labs = parse_learn_meta()
    print(f"Curriculum: {len(chapters)} chapters, {len(labs)} labs")
    print()
    failures = 0
    failures += check_locale_parity()
    print()
    failures += check_locale_vs_code(chapters, labs)
    print()
    failures += check_content_files(labs)
    print()
    failures += check_markdown_links(labs)
    print()
    failures += check_html_assets()
    print()
    failures += check_seo()
    print()
    failures += check_markdown_hardening()
    print()
    if failures:
        print("Site quality check failed.")
        return 1
    print("Site quality check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
