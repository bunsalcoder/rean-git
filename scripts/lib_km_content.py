#!/usr/bin/env python3
"""Shared helpers for Khmer handbook/lab structure sync and drift checks."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web" / "content"
LOCALES = ROOT / "web" / "locales"

H2_RE = re.compile(r"^## (.+)$", re.M)
H3_RE = re.compile(r"^### .+$", re.M)
CODE_FENCE_RE = re.compile(r"^```", re.M)
LAB_TITLE_RE = re.compile(r"^# Lab (\d+) — .+$", re.M)

LAB_SECTION_EN_TO_KM: dict[str, str] = {
    "Goal": "គោលដៅ",
    "Setup": "ការរៀបចំ",
    "Prerequisites": "លក្ខខណ្ឌមុន",
    "Steps": "ជំហាន",
    "Success criteria": "លក្ខខណ្ឌជោគជ័យ",
    "Cleanup (optional)": "សម្អាត (ស្រេចចិត្ត)",
    "Summary": "សង្ខេប",
    "Test plan": "ផែនការសាកល្បង",
}
LAB_SECTION_KM_TO_EN = {km: en for en, km in LAB_SECTION_EN_TO_KM.items()}

SCAFFOLD_START = "<!-- km-scaffold:"
SCAFFOLD_END = "-->"


def load_json(path: Path) -> dict:
    import json

    return json.loads(path.read_text(encoding="utf-8"))


def lab_display_number(lab_id: str) -> str:
    return lab_id.split("-", 1)[0]


def structure_fingerprint(text: str) -> tuple[int, int, int]:
    fences = len(CODE_FENCE_RE.findall(text))
    return (
        len(H2_RE.findall(text)),
        len(H3_RE.findall(text)),
        fences // 2 if fences else 0,
    )


def iter_markdown_lines(text: str):
    """Yield (line, in_code_fence) pairs."""
    in_fence = False
    for line in text.splitlines():
        if line.startswith("```"):
            in_fence = not in_fence
            yield line, in_fence
            continue
        yield line, in_fence


def top_level_h2_headings(text: str) -> list[str]:
    headings: list[str] = []
    for line, in_fence in iter_markdown_lines(text):
        if in_fence or not line.startswith("## "):
            continue
        headings.append(line.removeprefix("## "))
    return headings


def h2_headings(text: str) -> list[str]:
    return H2_RE.findall(text)


def translate_lab_h2(line: str) -> str:
    match = re.match(r"^## (.+)$", line)
    if not match:
        return line
    heading = match.group(1)
    km = LAB_SECTION_EN_TO_KM.get(heading)
    if km:
        return f"## {km}"
    return line


def english_h2_in_km(text: str) -> list[str]:
    english: list[str] = []
    for heading in top_level_h2_headings(text):
        if heading in LAB_SECTION_EN_TO_KM:
            english.append(heading)
    return english


def is_scaffolded(text: str) -> bool:
    return SCAFFOLD_START in text


def scaffold_banner(lab_id: str) -> str:
    return (
        f"{SCAFFOLD_START} translate body from web/content/en/labs/{lab_id}.md "
        f"{SCAFFOLD_END}\n"
        "> **ការបកប្រែ:** ឯកសារនេះត្រូវបានបង្កើតពីអក្សរអង់គ្លេស។ "
        "សូមបកប្រែអត្ថបទខាងក្រោម រក្សាពាក្យបញ្ជា និង code blocks ដដែល។\n"
    )


def scaffold_lab_from_en(en_text: str, lab_id: str, title_km: str) -> str:
    number = lab_display_number(lab_id)
    lines = en_text.splitlines()
    out: list[str] = [scaffold_banner(lab_id).rstrip()]

    for index, line in enumerate(lines):
        if index == 0 and line.startswith("# Lab "):
            out.append(f"# មន្ទីរពិសោធន៍ {number} — {title_km}")
            continue
        if line.startswith("## "):
            out.append(translate_lab_h2(line))
            continue
        out.append(line)

    return "\n".join(out).rstrip() + "\n"


def refresh_lab_headings(km_text: str) -> tuple[str, list[str]]:
    """Replace known English top-level ## headings with Khmer."""
    changed: list[str] = []
    out: list[str] = []
    for line, in_fence in iter_markdown_lines(km_text):
        if not in_fence and line.startswith("## "):
            translated = translate_lab_h2(line)
            if translated != line:
                changed.append(line.removeprefix("## "))
            line = translated
        out.append(line)
    text = "\n".join(out)
    if km_text.endswith("\n"):
        text += "\n"
    return text, changed


def chapter_heading(chapter_id: str, title_km: str) -> str:
    if chapter_id == "how-to-use":
        return f"## {title_km}"
    return f"## {chapter_id}. {title_km}"


def scaffold_chapter_stub(chapter_id: str, title_km: str) -> str:
    heading = chapter_heading(chapter_id, title_km)
    return (
        f"\n{heading}\n\n"
        f"{SCAFFOLD_START} translate from web/content/en/guide.md ({chapter_id}) "
        f"{SCAFFOLD_END}\n"
        "> **ការបកប្រែ:** ជំពូកនេះត្រូវបានបង្កើតជា placeholder។ "
        "សូមបកប្រែពីអក្សរអង់គ្លេស។\n"
    )
