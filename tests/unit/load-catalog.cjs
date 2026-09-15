"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadCatalog(payload) {
  const links = [];
  const document = {
    querySelectorAll(selector) {
      if (selector === "[data-cheat-sheet]") return links;
      return [];
    },
    querySelector() {
      return null;
    },
  };

  const window = {
    ReanGitUtil: {
      escapeHtml(text) {
        return String(text)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      },
      migrateLabIds() {},
    },
    ReanGitI18n: {
      apply() {},
      onChange() {},
      t(_key, vars) {
        return vars?.count ? `${vars.count} labs` : "";
      },
    },
    addEventListener() {},
  };

  const context = vm.createContext({
    window,
    document,
    location: { href: "https://example.test/rean-git/" },
    fetch: async () => ({
      ok: true,
      json: async () => payload,
    }),
    URL,
    encodeURIComponent,
  });

  const catalogPath = path.join(__dirname, "../../web/assets/js/catalog.js");
  vm.runInContext(fs.readFileSync(catalogPath, "utf8"), context);
  return { catalog: context.window.ReanGitCatalog, links };
}

module.exports = { loadCatalog };
