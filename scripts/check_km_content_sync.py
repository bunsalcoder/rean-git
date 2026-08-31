#!/usr/bin/env python3
"""Report Khmer content drift vs English structure and translation status."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from check_site_quality import (  # noqa: E402
    CONTENT,
    LOCALES,
    fail,
    parse_curriculum,
    parse_guide_chapter_ids,
)
from lib_km_content import (  # noqa: E402
    english_h2_in_km,
    is_scaffolded,
    load_json,
    structure_fingerprint,
)


def check_km_sync(chapters: list[str], labs: list[str]) -> tuple[int, list[str]]:
    msgs: list[str] = []
    warns: list[str] = []
    km_chapters = load_json(LOCALES / "km.json").get("chapters", {})

    en_guide = CONTENT / "en" / "guide.md"
    km_guide = CONTENT / "km" / "guide.md"
    if en_guide.is_file() and km_guide.is_file():
        en_mtime = en_guide.stat().st_mtime
        km_mtime = km_guide.stat().st_mtime
        en_fp = structure_fingerprint(en_guide.read_text(encoding="utf-8"))
        km_fp = structure_fingerprint(km_guide.read_text(encoding="utf-8"))
        if en_fp != km_fp:
            msgs.append(
                f"km/guide.md structure {km_fp} != English {en_fp} "
                "(## / ### / code blocks)"
            )
        elif en_mtime > km_mtime + 1:
            warns.append(
                "km/guide.md may be stale — English handbook changed after Khmer "
                "(same structure fingerprint; review prose)"
            )

        km_ids = parse_guide_chapter_ids(km_guide.read_text(encoding="utf-8"), "km")
        missing = [cid for cid in chapters if cid not in km_ids]
        if missing:
            msgs.append(f"km/guide.md missing chapters: {missing}")

    for lab_id in labs:
        en_lab = CONTENT / "en" / "labs" / f"{lab_id}.md"
        km_lab = CONTENT / "km" / "labs" / f"{lab_id}.md"
        if not en_lab.is_file():
            continue
        if not km_lab.is_file():
            msgs.append(f"missing web/content/km/labs/{lab_id}.md")
            continue

        en_text = en_lab.read_text(encoding="utf-8")
        km_text = km_lab.read_text(encoding="utf-8")
        en_fp = structure_fingerprint(en_text)
        km_fp = structure_fingerprint(km_text)
        if en_fp != km_fp:
            msgs.append(
                f"km/labs/{lab_id}.md structure {km_fp} != English {en_fp}"
            )
        elif en_lab.stat().st_mtime > km_lab.stat().st_mtime + 1:
            warns.append(
                f"km/labs/{lab_id}.md may be stale — English updated after Khmer "
                "(same structure fingerprint; review prose)"
            )

        english_headings = english_h2_in_km(km_text)
        if english_headings:
            joined = ", ".join(english_headings)
            msgs.append(
                f"km/labs/{lab_id}.md still has English ## headings: {joined}"
            )

        if is_scaffolded(km_text):
            msgs.append(f"km/labs/{lab_id}.md is still a scaffold — translate body text")

    for chapter_id in chapters:
        if chapter_id not in km_chapters:
            msgs.append(f"km.json missing chapters.{chapter_id}")

    code = fail(msgs, "Khmer content sync vs English")
    if warns:
        print("WARN:  Khmer content may need a prose review")
        for msg in warns:
            print(f"  - {msg}")
    return code, warns


def main() -> int:
    chapters, labs, _cheat_sheet = parse_curriculum()
    print(f"Curriculum: {len(chapters)} chapters, {len(labs)} labs")
    print()
    code, _warns = check_km_sync(chapters, labs)
    print()
    if code:
        print("Khmer content sync check failed.")
        print("Scaffold missing files:  ./scripts/sync_km_structure.sh")
        print("Refresh lab headings:    ./scripts/sync_km_structure.sh --fix-headings")
    else:
        print("Khmer content sync check passed.")
    return code


if __name__ == "__main__":
    raise SystemExit(main())
