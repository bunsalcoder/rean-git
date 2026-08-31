#!/usr/bin/env python3
"""Scaffold missing Khmer markdown from English structure (not auto-translation)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from check_site_quality import CONTENT, parse_curriculum, parse_guide_chapter_ids  # noqa: E402
from lib_km_content import (  # noqa: E402
    chapter_heading,
    is_scaffolded,
    load_json,
    refresh_lab_headings,
    scaffold_chapter_stub,
    scaffold_lab_from_en,
)


def sync_labs(labs: list[str], *, dry_run: bool, fix_headings: bool) -> int:
    km_labs = load_json(ROOT / "web" / "locales" / "km.json").get("labs", {})
    created = 0
    updated = 0

    km_lab_dir = CONTENT / "km" / "labs"
    km_lab_dir.mkdir(parents=True, exist_ok=True)

    for lab_id in labs:
        en_path = CONTENT / "en" / "labs" / f"{lab_id}.md"
        km_path = km_lab_dir / f"{lab_id}.md"
        if not en_path.is_file():
            continue

        title_km = km_labs.get(lab_id, {}).get("title", lab_id)
        if not km_path.is_file():
            text = scaffold_lab_from_en(en_path.read_text(encoding="utf-8"), lab_id, title_km)
            if dry_run:
                print(f"WOULD CREATE {km_path.relative_to(ROOT)}")
            else:
                km_path.write_text(text, encoding="utf-8")
                print(f"Created {km_path.relative_to(ROOT)}")
            created += 1
            continue

        if fix_headings:
            km_text = km_path.read_text(encoding="utf-8")
            new_text, changed = refresh_lab_headings(km_text)
            if changed:
                if dry_run:
                    print(
                        f"WOULD UPDATE headings in {km_path.relative_to(ROOT)}: "
                        + ", ".join(changed)
                    )
                else:
                    km_path.write_text(new_text, encoding="utf-8")
                    print(
                        f"Updated headings in {km_path.relative_to(ROOT)}: "
                        + ", ".join(changed)
                    )
                updated += 1

    if created == 0 and updated == 0 and not dry_run:
        print("No lab scaffolds or heading updates needed.")
    return created + updated


def sync_guide(chapters: list[str], *, dry_run: bool) -> int:
    km_chapters = load_json(ROOT / "web" / "locales" / "km.json").get("chapters", {})
    guide_path = CONTENT / "km" / "guide.md"
    if not guide_path.is_file():
        print(f"Skip guide: missing {guide_path.relative_to(ROOT)}")
        return 0

    text = guide_path.read_text(encoding="utf-8")
    present = set(parse_guide_chapter_ids(text, "km"))
    appended = 0

    for chapter_id in chapters:
        if chapter_id in present:
            continue
        title = km_chapters.get(chapter_id)
        if not title:
            print(f"Skip chapter {chapter_id}: missing km.json chapters.{chapter_id}")
            continue
        stub = scaffold_chapter_stub(chapter_id, title)
        if dry_run:
            print(f"WOULD APPEND chapter stub {chapter_id} to km/guide.md")
        else:
            if not text.endswith("\n"):
                text += "\n"
            text += stub
            print(f"Appended chapter stub {chapter_id} ({chapter_heading(chapter_id, title)})")
        appended += 1

    if appended and not dry_run:
        guide_path.write_text(text, encoding="utf-8")

    return appended


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Scaffold missing Khmer markdown from English structure."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print actions without writing files",
    )
    parser.add_argument(
        "--fix-headings",
        action="store_true",
        help="Replace known English ## headings in existing Khmer lab files",
    )
    parser.add_argument(
        "--labs-only",
        action="store_true",
        help="Only scaffold or fix lab markdown files",
    )
    parser.add_argument(
        "--guide-only",
        action="store_true",
        help="Only append missing chapter stubs to km/guide.md",
    )
    args = parser.parse_args()

    chapters, labs, _cheat_sheet = parse_curriculum()
    changes = 0

    if not args.guide_only:
        changes += sync_labs(labs, dry_run=args.dry_run, fix_headings=args.fix_headings)
    if not args.labs_only:
        changes += sync_guide(chapters, dry_run=args.dry_run)

    if args.dry_run and changes:
        print()
        print("Dry run only — no files changed.")

    if not args.dry_run and changes:
        print()
        print("Run ./scripts/check_km_content_sync.sh to verify Khmer structure.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
