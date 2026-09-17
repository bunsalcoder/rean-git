"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadUtil(options = {}) {
  const store = new Map();
  const localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key(index) {
      return [...store.keys()][index] ?? null;
    },
  };

  class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  }

  const window = {
    localStorage,
    CustomEvent,
    dispatchEvent() {},
    ReanGitCatalog: options.catalog || undefined,
  };

  const context = vm.createContext({
    window,
    localStorage,
    CustomEvent,
  });

  const utilPath = path.join(__dirname, "../../web/assets/js/util.js");
  vm.runInContext(fs.readFileSync(utilPath, "utf8"), context);
  return {
    util: context.window.ReanGitUtil,
    localStorage,
    window: context.window,
  };
}

module.exports = { loadUtil };
