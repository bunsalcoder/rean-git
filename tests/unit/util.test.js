"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { loadUtil } = require("./load-util.cjs");

const util = loadUtil();

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

  it("rejects empty output, wrong lab id, and failed runs", () => {
    assert.equal(util.looksLikePassedVerify("", "01-first-repo"), false);
    assert.equal(
      util.looksLikePassedVerify("All 3 checks passed for 02-branching.", "01-first-repo"),
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
});

describe("lab id aliases in progress", () => {
  it("remaps stored lab progress through migrateLabIds", () => {
    util.writeStorageItem(
      "rean-git:lab-progress",
      JSON.stringify({
        "00-branching": { checked: 2, total: 2, complete: true },
      })
    );
    util.migrateLabIds((id) => (id === "00-branching" ? "02-branching" : id));
    assert.equal(util.isLabComplete("02-branching"), true);
    assert.equal(util.isLabComplete("00-branching"), false);
  });
});
