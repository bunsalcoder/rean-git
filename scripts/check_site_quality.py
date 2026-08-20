#!/usr/bin/env python3
"""Fail if locale keys, curriculum coverage, or internal site links drift."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
LOCALES = WEB / "locales"
CONTENT = WEB / "content"
LEARN_JS = WEB / "assets" / "js" / "learn.js"
LABS_JSON = WEB / "data" / "labs.json"
GUIDE_EN = CONTENT / "en" / "guide.md"
NUMBERED_H2_RE = re.compile(r"^## (\d+)\.\s+")
H2_RE = re.compile(r"^## .+$", re.M)
HOW_TO_FALLBACK_RE = re.compile(r"^## How to use this guide$")
KM_LINE_RATIO = 0.85
VALID_LAB_LEVELS = {"beginner", "intermediate", "advanced"}
SITE_ORIGIN = "https://bunsalcoder.github.io/rean-git"
PAGE_CANONICALS = {
    "index.html": f"{SITE_ORIGIN}/",
    "learn.html": f"{SITE_ORIGIN}/learn.html",
    "labs.html": f"{SITE_ORIGIN}/labs.html",
    "lab.html": f"{SITE_ORIGIN}/lab.html",
}

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


def heading_pattern(raw: object, fallback: re.Pattern[str]) -> re.Pattern[str]:
    if isinstance(raw, str) and raw.strip():
        try:
            return re.compile(raw)
        except re.error:
            return fallback
    return fallback


def how_to_pattern(locale: str) -> re.Pattern[str]:
    match = load_json(LOCALES / f"{locale}.json").get("chapterMatch", {})
    return heading_pattern(match.get("howToUse"), HOW_TO_FALLBACK_RE)


def parse_guide_chapter_ids(text: str, locale: str = "en") -> list[str]:
    how_to = how_to_pattern(locale)
    ids: list[str] = []
    seen: set[str] = set()
    for line in text.splitlines():
        chapter_id = None
        if how_to.search(line) or HOW_TO_FALLBACK_RE.fullmatch(line):
            chapter_id = "how-to-use"
        else:
            numbered = NUMBERED_H2_RE.match(line)
            if numbered:
                chapter_id = numbered.group(1)
        if not chapter_id or chapter_id in seen:
            continue
        seen.add(chapter_id)
        ids.append(chapter_id)
    return ids


def parse_curriculum() -> tuple[list[str], list[str]]:
    learn_js = LEARN_JS.read_text(encoding="utf-8")
    if re.search(r"\bCHAPTER_IDS\b", learn_js):
        raise SystemExit(
            "learn.js still defines CHAPTER_IDS; parse handbook headings instead"
        )
    if re.search(r"\bLAB_META\b", learn_js):
        raise SystemExit("learn.js still defines LAB_META; labs belong in web/data/labs.json")
    if "chapterIdFromHeading" not in learn_js:
        raise SystemExit("learn.js must derive chapters from handbook headings")

    if not GUIDE_EN.is_file():
        raise SystemExit("missing web/content/en/guide.md")
    chapters = parse_guide_chapter_ids(GUIDE_EN.read_text(encoding="utf-8"), "en")
    if not chapters:
        raise SystemExit("web/content/en/guide.md has no chapter headings")
    numbered = [int(cid) for cid in chapters if cid.isdigit()]
    if numbered != list(range(1, len(numbered) + 1)):
        raise SystemExit(f"numbered chapters are not consecutive: {numbered}")

    if not LABS_JSON.is_file():
        raise SystemExit("missing web/data/labs.json")
    payload = load_json(LABS_JSON)
    raw = payload.get("labs")
    if not isinstance(raw, list) or not raw:
        raise SystemExit("web/data/labs.json must have a non-empty labs array")

    labs: list[str] = []
    seen: set[str] = set()
    for index, lab in enumerate(raw):
        if not isinstance(lab, dict):
            raise SystemExit(f"labs.json entry {index} is not an object")
        lab_id = lab.get("id")
        level = lab.get("level")
        if not isinstance(lab_id, str) or not re.fullmatch(r"[a-z0-9-]+", lab_id):
            raise SystemExit(f"labs.json entry {index} has an invalid id")
        if level not in VALID_LAB_LEVELS:
            raise SystemExit(f"labs.json {lab_id} has invalid level {level!r}")
        if lab_id in seen:
            raise SystemExit(f"labs.json duplicate id {lab_id}")
        seen.add(lab_id)
        labs.append(lab_id)
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

    locale_chapters = sorted(
        key.split(".", 1)[1] for key in en if key.startswith("chapters.")
    )
    if locale_chapters != sorted(chapters):
        msgs.append(
            f"locale chapters {locale_chapters} do not match handbook {sorted(chapters)}"
        )

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

    return fail(msgs, "locale keys vs handbook / HTML / JS")


def check_content_files(chapters: list[str], labs: list[str]) -> int:
    msgs: list[str] = []
    for locale in ("en", "km"):
        guide = CONTENT / locale / "guide.md"
        if not guide.is_file():
            msgs.append(f"missing {guide.relative_to(ROOT)}")
            continue
        text = guide.read_text(encoding="utf-8")
        found = parse_guide_chapter_ids(text, locale)
        if found != chapters:
            msgs.append(
                f"{guide.relative_to(ROOT)} chapters {found} do not match English {chapters}"
            )
        for lab_id in labs:
            lab_path = CONTENT / locale / "labs" / f"{lab_id}.md"
            if not lab_path.is_file():
                msgs.append(f"missing {lab_path.relative_to(ROOT)}")

    lab_root = ROOT / "labs"
    if lab_root.is_dir():
        folders = sorted(p.name for p in lab_root.iterdir() if p.is_dir())
        if folders != sorted(labs):
            msgs.append(f"labs/ folders {folders} do not match catalog {labs}")
        for lab_id in labs:
            readme = lab_root / lab_id / "README.md"
            if not readme.is_file():
                msgs.append(f"missing {readme.relative_to(ROOT)}")
    return fail(msgs, "handbook chapters + lab markdown files")


def nonempty_line_count(text: str) -> int:
    return sum(1 for line in text.splitlines() if line.strip())


def check_km_content(chapters: list[str], labs: list[str]) -> int:
    msgs: list[str] = []
    en_guide = CONTENT / "en" / "guide.md"
    km_guide = CONTENT / "km" / "guide.md"
    if en_guide.is_file() and km_guide.is_file():
        en_text = en_guide.read_text(encoding="utf-8")
        km_text = km_guide.read_text(encoding="utf-8")
        en_lines = nonempty_line_count(en_text)
        km_lines = nonempty_line_count(km_text)
        minimum = max(1, int(en_lines * KM_LINE_RATIO))
        if km_lines < minimum:
            msgs.append(
                f"km/guide.md is too short ({km_lines} nonempty lines; "
                f"need at least {minimum} to match {en_lines} in English)"
            )
        km_ids = parse_guide_chapter_ids(km_text, "km")
        if km_ids != chapters:
            msgs.append(f"km/guide.md chapter order {km_ids} != {chapters}")

    for lab_id in labs:
        en_lab = CONTENT / "en" / "labs" / f"{lab_id}.md"
        km_lab = CONTENT / "km" / "labs" / f"{lab_id}.md"
        if not en_lab.is_file() or not km_lab.is_file():
            continue
        en_h2 = H2_RE.findall(en_lab.read_text(encoding="utf-8"))
        km_h2 = H2_RE.findall(km_lab.read_text(encoding="utf-8"))
        if len(en_h2) != len(km_h2):
            msgs.append(
                f"km/labs/{lab_id}.md has {len(km_h2)} ## headings; "
                f"English has {len(en_h2)}"
            )

    return fail(msgs, "Khmer handbook + lab structure")


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


def check_html_assets(labs: list[str]) -> int:
    msgs: list[str] = []
    known_labs = set(labs)
    catalog_js = WEB / "assets" / "js" / "catalog.js"
    if not catalog_js.is_file():
        msgs.append("missing web/assets/js/catalog.js")
    elif "data/labs.json" not in catalog_js.read_text(encoding="utf-8"):
        msgs.append("catalog.js must load web/data/labs.json")

    util_js = WEB / "assets" / "js" / "util.js"
    if not util_js.is_file():
        msgs.append("missing web/assets/js/util.js")
    elif "ReanGitUtil" not in util_js.read_text(encoding="utf-8"):
        msgs.append("util.js must define ReanGitUtil")

    for name, marker in (
        ("index.html", "data-lab-track"),
        ("labs.html", "data-lab-grid"),
    ):
        text = (WEB / name).read_text(encoding="utf-8")
        if marker not in text:
            msgs.append(f"{name}: missing {marker} catalog mount point")
        if "catalog.js" not in text:
            msgs.append(f"{name}: missing catalog.js")

    for name in ("learn.html", "lab.html"):
        text = (WEB / name).read_text(encoding="utf-8")
        if "catalog.js" not in text:
            msgs.append(f"{name}: missing catalog.js")

    for path in sorted(WEB.glob("*.html")):
        text = path.read_text(encoding="utf-8")
        if "util.js" not in text:
            msgs.append(f"{path.name}: missing util.js")
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


def build_sitemap(chapters: list[str], labs: list[str]) -> str:
    entries: list[tuple[str, str, str]] = [
        (f"{SITE_ORIGIN}/", "weekly", "1.0"),
        (f"{SITE_ORIGIN}/learn.html", "weekly", "0.9"),
        (f"{SITE_ORIGIN}/labs.html", "weekly", "0.9"),
        (f"{SITE_ORIGIN}/lab.html", "weekly", "0.7"),
    ]
    for chapter_id in chapters:
        entries.append((f"{SITE_ORIGIN}/learn.html?c={chapter_id}", "weekly", "0.8"))
    for lab_id in labs:
        entries.append((f"{SITE_ORIGIN}/lab.html?id={lab_id}", "weekly", "0.7"))

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for loc, changefreq, priority in entries:
        lines.extend(
            [
                "  <url>",
                f"    <loc>{loc}</loc>",
                f"    <changefreq>{changefreq}</changefreq>",
                f"    <priority>{priority}</priority>",
                "  </url>",
            ]
        )
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def check_seo(chapters: list[str], labs: list[str]) -> int:
    msgs: list[str] = []
    robots = WEB / "robots.txt"
    sitemap = WEB / "sitemap.xml"
    og_image = WEB / "assets" / "img" / "og-image.png"
    expected_sitemap = build_sitemap(chapters, labs)

    if not robots.is_file():
        msgs.append("missing web/robots.txt")
    else:
        robots_text = robots.read_text(encoding="utf-8")
        if f"{SITE_ORIGIN}/sitemap.xml" not in robots_text:
            msgs.append("robots.txt missing Sitemap URL")

    if not sitemap.is_file():
        msgs.append("missing web/sitemap.xml")
    elif sitemap.read_text(encoding="utf-8") != expected_sitemap:
        msgs.append(
            "sitemap.xml is out of date — run: python3 scripts/check_site_quality.py --write-sitemap"
        )

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
        if 'hreflang="en"' not in text:
            msgs.append(f"{name}: missing hreflang en")
        if 'hreflang="km"' not in text:
            msgs.append(f"{name}: missing hreflang km")
        if 'hreflang="x-default"' not in text:
            msgs.append(f"{name}: missing hreflang x-default")
        if "fonts.googleapis.com" in text or "fonts.gstatic.com" in text:
            msgs.append(f"{name}: fonts should be local, not Google Fonts")
        if "data-search-toggle" not in text:
            msgs.append(f"{name}: missing search toggle")

    home = WEB / "index.html"
    if home.is_file() and 'type="application/ld+json"' not in home.read_text(
        encoding="utf-8"
    ):
        msgs.append("index.html: missing JSON-LD WebSite schema")

    return fail(msgs, "SEO meta, robots, sitemap, og-image")


LOCAL_FONTS = (
    "epilogue-latin.woff2",
    "epilogue-latin-ext.woff2",
    "ibm-plex-mono-400-latin.woff2",
    "ibm-plex-mono-500-latin.woff2",
    "kantumruy-pro-khmer.woff2",
    "kantumruy-pro-latin.woff2",
)


def check_local_fonts() -> int:
    msgs: list[str] = []
    fonts_dir = WEB / "assets" / "fonts"
    css = WEB / "assets" / "css" / "styles.css"
    css_text = css.read_text(encoding="utf-8") if css.is_file() else ""

    if "@font-face" not in css_text:
        msgs.append("styles.css missing @font-face")
    if "fonts.googleapis.com" in css_text or "fonts.gstatic.com" in css_text:
        msgs.append("styles.css still references Google Fonts")

    for name in LOCAL_FONTS:
        path = fonts_dir / name
        if not path.is_file():
            msgs.append(f"missing web/assets/fonts/{name}")
        elif f"../fonts/{name}" not in css_text:
            msgs.append(f"styles.css missing @font-face for {name}")

    return fail(msgs, "self-hosted fonts")


def check_shared_runtime() -> int:
    msgs: list[str] = []
    util = WEB / "assets" / "js" / "util.js"
    site_js = WEB / "assets" / "js" / "site.js"
    sw = WEB / "sw.js"
    entity_map = '"&amp;"'

    if util.is_file():
        util_text = util.read_text(encoding="utf-8")
        if "function escapeHtml" not in util_text or entity_map not in util_text:
            msgs.append("util.js must own the HTML-escape implementation")

    for name in ("catalog.js", "learn.js", "site.js"):
        path = WEB / "assets" / "js" / name
        text = path.read_text(encoding="utf-8") if path.is_file() else ""
        if "ReanGitUtil.escapeHtml" not in text:
            msgs.append(f"{name} must call ReanGitUtil.escapeHtml")
        if entity_map in text:
            msgs.append(f"{name} still inlines HTML escaping")

    util_text = util.read_text(encoding="utf-8") if util.is_file() else ""
    if "recordLabChecklist" not in util_text or "completedLabCount" not in util_text:
        msgs.append("util.js must track lab checklist completion")
    if "rean-git:lab-progress" not in util_text:
        msgs.append("util.js must dispatch lab progress updates")

    learn_js = LEARN_JS.read_text(encoding="utf-8") if LEARN_JS.is_file() else ""
    if "appendVerifyHint" not in learn_js or "lab-verify" not in learn_js:
        msgs.append("learn.js must show the lab verify.sh hint")
    if "paintLabNavCompletion" not in learn_js:
        msgs.append("learn.js must mark completed labs in the sidebar")

    if not sw.is_file():
        msgs.append("missing web/sw.js")
    else:
        sw_text = sw.read_text(encoding="utf-8")
        if "caches.open" not in sw_text or "addAll" not in sw_text:
            msgs.append("sw.js must precache shell assets")

    site_text = site_js.read_text(encoding="utf-8") if site_js.is_file() else ""
    if "serviceWorker.register" not in site_text:
        msgs.append("site.js must register the service worker")
    if "UTIL_SRC" not in site_text:
        msgs.append("site.js soft-nav should load util.js")

    return fail(msgs, "shared util + service worker")


MARKED_PIN = "assets/vendor/marked.min.js"
PURIFY_PIN = "assets/vendor/purify.min.js"
MARKED_SRI = "sha384-948ahk4ZmxYVYOc+rxN1H2gM1EJ2Duhp7uHtZ4WSLkV4Vtx5MUqnV+l7u9B+jFv+"
PURIFY_SRI = "sha384-JEyTNhjM6R1ElGoJns4U2Ln4ofPcqzSsynQkmEc/KGy6336qAZl70tDLufbkla+3"


def check_markdown_hardening() -> int:
    msgs: list[str] = []
    learn_js = LEARN_JS.read_text(encoding="utf-8")
    site_js = (WEB / "assets" / "js" / "site.js").read_text(encoding="utf-8")
    marked_file = WEB / "assets" / "vendor" / "marked.min.js"
    purify_file = WEB / "assets" / "vendor" / "purify.min.js"

    if not marked_file.is_file():
        msgs.append("missing web/assets/vendor/marked.min.js")
    if not purify_file.is_file():
        msgs.append("missing web/assets/vendor/purify.min.js")

    if "sanitizeMarkdownHtml" not in learn_js or "DOMPurify.sanitize" not in learn_js:
        msgs.append("learn.js must sanitize marked HTML with DOMPurify")
    if "marked.parse(md)" in learn_js and "innerHTML = marked.parse" in learn_js:
        msgs.append("learn.js still assigns marked.parse output directly to innerHTML")

    if MARKED_PIN not in site_js or MARKED_SRI not in site_js:
        msgs.append("site.js missing vendored marked path/SRI")
    if PURIFY_PIN not in site_js or PURIFY_SRI not in site_js:
        msgs.append("site.js missing vendored DOMPurify path/SRI")
    if "PURIFY_INTEGRITY" not in site_js:
        msgs.append("site.js soft-nav should load DOMPurify with integrity")

    for name in ("learn.html", "lab.html"):
        text = (WEB / name).read_text(encoding="utf-8")
        if MARKED_PIN not in text or f'integrity="{MARKED_SRI}"' not in text:
            msgs.append(f"{name}: marked must be vendored with SRI")
        if PURIFY_PIN not in text or f'integrity="{PURIFY_SRI}"' not in text:
            msgs.append(f"{name}: DOMPurify must be vendored with SRI")
        if "cdn.jsdelivr.net" in text:
            msgs.append(f"{name}: markdown libraries should be local, not CDN")

    return fail(msgs, "Markdown vendor pin + DOMPurify hardening")


def check_pwa() -> int:
    msgs: list[str] = []
    manifest = WEB / "manifest.webmanifest"
    if not manifest.is_file():
        msgs.append("missing web/manifest.webmanifest")
    else:
        text = manifest.read_text(encoding="utf-8")
        if '"start_url"' not in text:
            msgs.append("manifest.webmanifest missing start_url")
        if "standalone" not in text:
            msgs.append("manifest.webmanifest should use display standalone")
        if "icon-192.png" not in text or "icon-512.png" not in text:
            msgs.append("manifest.webmanifest missing 192/512 icons")

    for name in ("icon-192.png", "icon-512.png"):
        if not (WEB / "assets" / "img" / name).is_file():
            msgs.append(f"missing web/assets/img/{name}")

    for name in PAGE_CANONICALS:
        path = WEB / name
        text = path.read_text(encoding="utf-8") if path.is_file() else ""
        if 'rel="manifest"' not in text:
            msgs.append(f"{name}: missing web app manifest")
        if 'name="theme-color"' not in text:
            msgs.append(f"{name}: missing theme-color")

    sw = WEB / "sw.js"
    sw_text = sw.read_text(encoding="utf-8") if sw.is_file() else ""
    if "manifest.webmanifest" not in sw_text:
        msgs.append("sw.js should precache the web app manifest")

    return fail(msgs, "PWA manifest + theme-color")


def check_print_styles() -> int:
    msgs: list[str] = []
    css = WEB / "assets" / "css" / "styles.css"
    text = css.read_text(encoding="utf-8") if css.is_file() else ""
    if "@media print" not in text:
        msgs.append("styles.css missing @media print rules")
    elif ".copy-btn" not in text.split("@media print", 1)[-1]:
        msgs.append("print styles should hide copy buttons")
    labs_html = WEB / "labs.html"
    if labs_html.is_file() and "data-labs-progress" not in labs_html.read_text(encoding="utf-8"):
        msgs.append("labs.html missing labs progress summary mount point")
    return fail(msgs, "print styles + labs progress UI")


def check_lab_verifiers(labs: list[str]) -> int:
    msgs: list[str] = []
    lib = ROOT / "scripts" / "lab_verify_lib.sh"
    if not lib.is_file():
        msgs.append("missing scripts/lab_verify_lib.sh")

    for lab_id in labs:
        path = ROOT / "labs" / lab_id / "verify.sh"
        if not path.is_file():
            msgs.append(f"labs/{lab_id}/verify.sh missing")
            continue
        if not path.stat().st_mode & 0o111:
            msgs.append(f"labs/{lab_id}/verify.sh is not executable")
        text = path.read_text(encoding="utf-8")
        if "lab_verify_lib.sh" not in text:
            msgs.append(f"labs/{lab_id}/verify.sh must source lab_verify_lib.sh")
        result = subprocess.run(
            ["bash", "-n", str(path)],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            detail = (result.stderr or result.stdout).strip()
            msgs.append(f"labs/{lab_id}/verify.sh syntax error: {detail}")

    return fail(msgs, "lab verify scripts")


def write_sitemap(chapters: list[str], labs: list[str]) -> None:
    path = WEB / "sitemap.xml"
    path.write_text(build_sitemap(chapters, labs), encoding="utf-8")
    print(f"Wrote {path.relative_to(ROOT)}")


def build_content_precache(labs: list[str]) -> list[str]:
    paths = ["./content/en/guide.md", "./content/km/guide.md"]
    for lab_id in labs:
        paths.append(f"./content/en/labs/{lab_id}.md")
        paths.append(f"./content/km/labs/{lab_id}.md")
    return paths


def write_content_precache(labs: list[str]) -> None:
    path = WEB / "content-precache.json"
    payload = build_content_precache(labs)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {path.relative_to(ROOT)} ({len(payload)} URLs)")


def check_content_precache(labs: list[str]) -> int:
    msgs: list[str] = []
    path = WEB / "content-precache.json"
    expected = build_content_precache(labs)
    if not path.is_file():
        msgs.append("missing web/content-precache.json")
    else:
        try:
            actual = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            msgs.append("content-precache.json is not valid JSON")
            actual = None
        if isinstance(actual, list) and actual != expected:
            msgs.append(
                "content-precache.json is out of date — run: "
                "python3 scripts/check_site_quality.py --write-content-precache"
            )

    sw = WEB / "sw.js"
    sw_text = sw.read_text(encoding="utf-8") if sw.is_file() else ""
    if "content-precache.json" not in sw_text:
        msgs.append("sw.js must load content-precache.json for offline reading")

    return fail(msgs, "offline content precache manifest")


def main() -> int:
    write_sitemap_mode = "--write-sitemap" in sys.argv
    write_precache_mode = "--write-content-precache" in sys.argv
    chapters, labs = parse_curriculum()
    if write_sitemap_mode or write_precache_mode:
        if write_sitemap_mode:
            write_sitemap(chapters, labs)
        if write_precache_mode:
            write_content_precache(labs)
        return 0

    print(f"Curriculum: {len(chapters)} chapters, {len(labs)} labs")
    print()
    failures = 0
    failures += check_locale_parity()
    print()
    failures += check_locale_vs_code(chapters, labs)
    print()
    failures += check_content_files(chapters, labs)
    print()
    failures += check_km_content(chapters, labs)
    print()
    failures += check_markdown_links(labs)
    print()
    failures += check_html_assets(labs)
    print()
    failures += check_seo(chapters, labs)
    print()
    failures += check_local_fonts()
    print()
    failures += check_shared_runtime()
    print()
    failures += check_markdown_hardening()
    print()
    failures += check_pwa()
    print()
    failures += check_print_styles()
    print()
    failures += check_content_precache(labs)
    print()
    failures += check_lab_verifiers(labs)
    print()
    if failures:
        print("Site quality check failed.")
        return 1
    print("Site quality check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
