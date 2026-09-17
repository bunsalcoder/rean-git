import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["web/assets/vendor/**", "node_modules/**", "test-results/**", "playwright-report/**"],
  },
  {
    files: ["web/assets/js/**/*.js", "tests/**/*.js", "playwright.config.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.node,
        marked: "readonly",
        DOMPurify: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-var": "off",
      "prefer-const": "warn",
      eqeqeq: ["warn", "smart"],
      "no-console": "off",
    },
  },
  {
    files: ["tests/**/*.js", "playwright.config.js", "eslint.config.mjs"],
    languageOptions: {
      sourceType: "module",
    },
  },
];
