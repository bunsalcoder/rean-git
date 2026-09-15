"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { loadCatalog } = require("./load-catalog.cjs");

describe("ReanGitCatalog cheat sheet", () => {
  it("builds hrefs from labs.json cheatSheetChapter", async () => {
    const { catalog, links } = loadCatalog({
      cheatSheetChapter: "99",
      labs: [{ id: "01-first-repo", level: "beginner", chapter: "3" }],
    });
    const link = { setAttribute() {} };
    let href = "";
    link.setAttribute = (name, value) => {
      if (name === "href") href = value;
    };
    links.push(link);

    await catalog.ready;
    assert.equal(catalog.getCheatSheetChapter(), "99");
    assert.equal(catalog.cheatSheetHref(), "./learn.html?c=99");
    assert.equal(href, "./learn.html?c=99");
  });

  it("keeps the default chapter when catalog omits cheatSheetChapter", async () => {
    const { catalog } = loadCatalog({
      labs: [{ id: "01-first-repo", level: "beginner", chapter: "3" }],
    });
    await catalog.ready;
    assert.equal(catalog.getCheatSheetChapter(), "26");
    assert.equal(catalog.cheatSheetHref(), "./learn.html?c=26");
  });
});

describe("ReanGitCatalog resolveLabId", () => {
  it("follows labIdAliases", async () => {
    const { catalog } = loadCatalog({
      cheatSheetChapter: "26",
      labIdAliases: { "00-branching": "02-branching" },
      labs: [{ id: "02-branching", level: "beginner", chapter: "5" }],
    });
    await catalog.ready;
    assert.equal(catalog.resolveLabId("00-branching"), "02-branching");
    assert.equal(catalog.getLabForChapter("5")?.id, "02-branching");
  });
});
