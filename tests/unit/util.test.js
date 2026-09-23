"use strict";

const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { loadUtil } = require("./load-util.cjs");

let util;

beforeEach(() => {
  ({ util } = loadUtil());
});

describe("looksLikePassedVerify", () => {
  it("accepts a green verify summary for the matching lab", () => {
    const output = [
      "== Lab verify: 01-first-repo ==",
      "  ok  playground is a git repo",
      "  ok  working tree is clean",
      "",
      "All 3 checks passed for 01-first-repo.",
    ].join("\n");
    assert.equal(util.looksLikePassedVerify(output, "01-first-repo"), true);
  });

  it("accepts singular check wording and is case-insensitive", () => {
    assert.equal(
      util.looksLikePassedVerify("all 1 check passed for 00-install-config.", "00-install-config"),
      true
    );
  });

  it("rejects empty output, wrong lab id, and failed runs", () => {
    assert.equal(util.looksLikePassedVerify("", "01-first-repo"), false);
    assert.equal(util.looksLikePassedVerify(null, "01-first-repo"), false);
    assert.equal(
      util.looksLikePassedVerify("All 3 checks passed for 03-branching.", "01-first-repo"),
      false
    );
    assert.equal(
      util.looksLikePassedVerify(
        "All 2 checks passed for 01-first-repo.\n\nFAIL: 1 check(s) failed for 01-first-repo.",
        "01-first-repo"
      ),
      false
    );
  });

  it("does not treat a partial lab id prefix as a match", () => {
    assert.equal(
      util.looksLikePassedVerify("All 1 checks passed for 01-first-repo-extra.", "01-first-repo"),
      false
    );
  });
});

describe("codespacesLabUrl", () => {
  it("deep-links into the lab folder", () => {
    assert.equal(
      util.codespacesLabUrl("00-install-config"),
      "https://codespaces.new/bunsalcoder/rean-git/tree/main/labs/00-install-config?quickstart=1"
    );
  });

  it("falls back to the repo quickstart when no lab id is given", () => {
    assert.equal(util.codespacesLabUrl(""), "https://codespaces.new/bunsalcoder/rean-git?quickstart=1");
    assert.equal(util.codespacesLabUrl(), "https://codespaces.new/bunsalcoder/rean-git?quickstart=1");
  });
});

describe("escapeHtml", () => {
  it("escapes the common HTML metacharacters", () => {
    assert.equal(util.escapeHtml(`<a href="x"> & 'y'`), "&lt;a href=&quot;x&quot;&gt; &amp; &#39;y&#39;");
  });
});

describe("parseGuideChapters", () => {
  it("splits numbered handbook chapters and how-to-use", () => {
    const markdown = [
      "# Git from zero",
      "",
      "## How to use this guide",
      "Read one chapter.",
      "",
      "## 1. What problem does Git solve?",
      "History matters.",
      "",
      "## 2. Core mental model",
      "Commits are snapshots.",
    ].join("\n");

    const chapters = util.parseGuideChapters(markdown);
    assert.equal(
      chapters.map((chapter) => String(chapter.id)).join(","),
      "how-to-use,1,2"
    );
    assert.match(String(chapters[0].body), /Read one chapter/);
    assert.equal(String(chapters[1].title), "What problem does Git solve?");
    assert.match(String(chapters[2].body), /Commits are snapshots/);
  });

  it("also recognizes the Khmer how-to-use heading", () => {
    const chapters = util.parseGuideChapters("## របៀបប្រើមគ្គុទ្ទេសក៍នេះ\nbody\n");
    assert.equal(String(chapters[0].id), "how-to-use");
  });

  it("skips duplicate chapter ids and returns empty for blank input", () => {
    assert.equal(util.parseGuideChapters("").length, 0);
    const chapters = util.parseGuideChapters(
      ["## 1. First", "a", "## 1. Duplicate", "b", "## 2. Second", "c"].join("\n")
    );
    assert.equal(chapters.map((chapter) => chapter.id).join(","), "1,2");
    assert.match(chapters[0].body, /Duplicate/);
  });
});

describe("rewriteChapterAnchors", () => {
  it("maps GitHub-style numbered heading anchors to the Learn reader", () => {
    assert.equal(
      util.rewriteChapterAnchors("See [branching](#5-branching-basics) and [undo](#6)."),
      "See [branching](./learn.html?c=5) and [undo](./learn.html?c=6)."
    );
  });

  it("leaves non-chapter anchors alone", () => {
    assert.equal(
      util.rewriteChapterAnchors("Stay [here](#setup) and [external](https://example.com)."),
      "Stay [here](#setup) and [external](https://example.com)."
    );
  });
});

describe("resolveRouteOrResume", () => {
  it("prefers the routed id, then saved, then fallback", () => {
    const routed = util.resolveRouteOrResume("3", "2", "1");
    assert.equal(routed.id, "3");
    assert.equal(routed.fromRoute, true);

    const saved = util.resolveRouteOrResume(null, "2", "1");
    assert.equal(saved.id, "2");
    assert.equal(saved.fromRoute, false);

    const emptyRouted = util.resolveRouteOrResume("", "2", "1");
    assert.equal(emptyRouted.id, "2");
    assert.equal(emptyRouted.fromRoute, false);

    const fallback = util.resolveRouteOrResume(null, null, "1");
    assert.equal(fallback.id, "1");
    assert.equal(fallback.fromRoute, false);

    const none = util.resolveRouteOrResume(null, null, null);
    assert.equal(none.id, null);
    assert.equal(none.fromRoute, false);
  });
});

describe("lab progress", () => {
  it("records checklist completion and counts finished labs", () => {
    util.recordLabChecklist("01-first-repo", 2, 2);
    util.recordLabChecklist("03-branching", 1, 3);
    assert.equal(util.isLabComplete("01-first-repo"), true);
    assert.equal(util.isLabComplete("03-branching"), false);
    assert.equal(util.completedLabCount(["01-first-repo", "03-branching", "04-branch-merge"]), 1);
  });

  it("tracks chapter completion independently", () => {
    util.recordChapterComplete("3", true);
    assert.equal(util.isChapterComplete("3"), true);
    assert.equal(util.completedChapterCount(["3", "4"]), 1);
    util.recordChapterComplete("3", false);
    assert.equal(util.isChapterComplete("3"), false);
  });
});

describe("lab id aliases in progress", () => {
  it("remaps stored lab progress through migrateLabIds", () => {
    util.writeStorageItem(
      "rean-git:lab-progress",
      JSON.stringify({
        "00-branching": { checked: 2, total: 2, complete: true },
      })
    );
    util.migrateLabIds((id) => (id === "00-branching" ? "03-branching" : id));
    assert.equal(util.isLabComplete("03-branching"), true);
    assert.equal(util.isLabComplete("00-branching"), false);
  });
});

describe("progress export / import", () => {
  it("round-trips progress through export and import", () => {
    util.recordLabChecklist("01-first-repo", 3, 3);
    util.recordChapterComplete("4", true);
    util.writeStorageItem(util.LAST_CHAPTER_KEY, "4");
    util.writeStorageItem(util.LAST_LAB_KEY, "01-first-repo");

    const payload = util.exportProgress();
    assert.equal(payload.version, 1);
    assert.equal(payload.lastChapter, "4");
    assert.equal(payload.labs["01-first-repo"].complete, true);

    util.resetProgress();
    assert.equal(util.isLabComplete("01-first-repo"), false);

    util.importProgress(payload);
    assert.equal(util.isLabComplete("01-first-repo"), true);
    assert.equal(util.isChapterComplete("4"), true);
    assert.equal(util.readStorageItem(util.LAST_LAB_KEY), "01-first-repo");
  });

  it("rejects invalid payloads and unsupported versions", () => {
    assert.throws(() => util.importProgress(null), /invalid progress file/);
    assert.throws(() => util.importProgress([]), /invalid progress file/);
    assert.throws(() => util.importProgress({ version: 99, labs: {} }), /unsupported progress version/);
  });

  it("remaps lab ids on import when catalog aliases exist", () => {
    ({ util } = loadUtil({
      catalog: {
        resolveLabId(id) {
          return id === "00-branching" ? "03-branching" : id;
        },
      },
    }));

    util.importProgress({
      version: 1,
      lastLab: "00-branching",
      labs: {
        "00-branching": { checked: 1, total: 1, complete: true },
      },
      chapters: {},
      checklists: {
        "lab:00-branching": { "0": true },
      },
    });

    assert.equal(util.readStorageItem(util.LAST_LAB_KEY), "03-branching");
    assert.equal(util.isLabComplete("03-branching"), true);
    assert.equal(util.readStorageItem("rean-git:checklist:lab:03-branching"), '{"0":true}');
  });

  it("skips checklist keys that look like path traversal", () => {
    util.importProgress({
      version: 1,
      labs: {},
      chapters: {},
      checklists: {
        "../evil": { "0": true },
        "lab:01-first-repo": { "0": true },
      },
    });
    assert.equal(util.readStorageItem("rean-git:checklist:../evil"), null);
    assert.equal(util.readStorageItem("rean-git:checklist:lab:01-first-repo"), '{"0":true}');
  });
});

describe("progress backup nudge", () => {
  it("prompts after the first completed lab until dismissed or exported", () => {
    assert.equal(util.shouldPromptProgressBackup(["01-first-repo"]), false);
    util.recordLabChecklist("01-first-repo", 1, 1);
    assert.equal(util.shouldPromptProgressBackup(["01-first-repo"]), true);
    util.markProgressBackupNudge("dismissed");
    assert.equal(util.shouldPromptProgressBackup(["01-first-repo"]), false);
  });
});
