#!/usr/bin/env python3
"""Fail if Khmer content drifts from English structure or prose baseline."""

from __future__ import annotations

import argparse
import json
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
    prose_fingerprint,
    structure_fingerprint,
)

PROSE_BASELINE = CONTENT / "km" / ".prose-baseline.json"


def english_prose_entries(chapters: list[str], labs: list[str]) -> dict[str, str]:
    entries: dict[str, str] = {}
    en_guide = CONTENT / "en" / "guide.md"
    if en_guide.is_file():
        entries["guide.md"] = prose_fingerprint(en_guide.read_text(encoding="utf-8"))
    for lab_id in labs:
        en_lab = CONTENT / "en" / "labs" / f"{lab_id}.md"
        if en_lab.is_file():
            key = f"labs/{lab_id}.md"
            entries[key] = prose_fingerprint(en_lab.read_text(encoding="utf-8"))
    return entries


def load_prose_baseline() -> dict[str, str]:
    if not PROSE_BASELINE.is_file():
        return {}
    data = json.loads(PROSE_BASELINE.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        return {}
    return {str(k): str(v) for k, v in data.items()}


def write_prose_baseline(chapters: list[str], labs: list[str]) -> None:
    entries = english_prose_entries(chapters, labs)
    PROSE_BASELINE.parent.mkdir(parents=True, exist_ok=True)
    PROSE_BASELINE.write_text(
        json.dumps(entries, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {PROSE_BASELINE.relative_to(ROOT)} ({len(entries)} entries)")


def prose_stale_messages(
    chapters: list[str], labs: list[str], baseline: dict[str, str]
) -> list[str]:
    if not baseline:
        return [
            "Khmer prose baseline missing — run "
            "python3 scripts/check_km_content_sync.py --write-prose-baseline"
        ]
    stale: list[str] = []
    current = english_prose_entries(chapters, labs)
    for key, digest in current.items():
        recorded = baseline.get(key)
        if recorded is None:
            stale.append(f"{key} has no prose baseline entry (English added or renamed?)")
        elif recorded != digest:
            stale.append(
                f"km/{key} may be stale — English prose changed since last Khmer review"
            )
    return stale


def check_km_sync(chapters: list[str], labs: list[str]) -> int:
    msgs: list[str] = []
    km_chapters = load_json(LOCALES / "km.json").get("chapters", {})

    en_guide = CONTENT / "en" / "guide.md"
    km_guide = CONTENT / "km" / "guide.md"
    if en_guide.is_file() and km_guide.is_file():
        en_fp = structure_fingerprint(en_guide.read_text(encoding="utf-8"))
        km_fp = structure_fingerprint(km_guide.read_text(encoding="utf-8"))
        if en_fp != km_fp:
            msgs.append(
                f"km/guide.md structure {km_fp} != English {en_fp} "
                "(## / ### / code blocks)"
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

    structure_code = fail(msgs, "Khmer content sync vs English")
    stale = prose_stale_messages(chapters, labs, load_prose_baseline())
    prose_code = fail(stale, "Khmer prose review vs English baseline")
    return 1 if structure_code or prose_code else 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--write-prose-baseline",
        action="store_true",
        help="Record current English prose hashes for Khmer drift checks",
    )
    args = parser.parse_args()

    chapters, labs, _cheat_sheet = parse_curriculum()
    if args.write_prose_baseline:
        write_prose_baseline(chapters, labs)
        return 0

    print(f"Curriculum: {len(chapters)} chapters, {len(labs)} labs")
    print()
    code = check_km_sync(chapters, labs)
    print()
    if code:
        print("Khmer content sync check failed.")
        print("Scaffold missing files:  ./scripts/sync_km_structure.sh")
        print("Refresh lab headings:    ./scripts/sync_km_structure.sh --fix-headings")
        print(
            "After reviewing/updating Khmer prose: "
            "python3 scripts/check_km_content_sync.py --write-prose-baseline"
        )
    else:
        print("Khmer content sync check passed.")
    return code


if __name__ == "__main__":
    raise SystemExit(main())
