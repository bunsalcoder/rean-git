const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

function formatViolations(violations) {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `  - ${node.target.join(" ")}: ${node.failureSummary}`)
        .join("\n");
      return `${violation.id} (${violation.impact}): ${violation.help}\n${nodes}`;
    })
    .join("\n\n");
}

async function expectNoA11yViolations(page, label) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations, `${label}\n${formatViolations(results.violations)}`).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  // Avoid motion-frame false positives while page/soft-nav transitions settle.
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("home page has no serious a11y violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".headline")).toBeVisible();
  await expectNoA11yViolations(page, "home");
});

test("learn page has no serious a11y violations", async ({ page }) => {
  await page.goto("/learn.html?c=1");
  await expect(page.locator("[data-chapter-body]")).toBeVisible();
  await expect(page.locator("[data-chapter-title]")).not.toHaveText(/Loading/i);
  await expectNoA11yViolations(page, "learn");
});

test("labs page has no serious a11y violations", async ({ page }) => {
  await page.goto("/labs.html");
  await expect(page.locator("[data-lab-grid] a").first()).toBeVisible();
  await expectNoA11yViolations(page, "labs");
});

test("lab page has no serious a11y violations", async ({ page }) => {
  await page.goto("/lab.html?id=01-first-repo");
  await expect(page.locator("[data-lab-body]")).toBeVisible();
  await expectNoA11yViolations(page, "lab");
});

test("search dialog has no serious a11y violations", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-search-toggle]").click();
  await expect(page.locator("[data-search-input]")).toBeVisible();
  await expectNoA11yViolations(page, "search dialog");
});

test("shortcuts dialog has no serious a11y violations", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Shift+/");
  await expect(page.locator("[data-shortcuts-modal] .shortcuts-dialog")).toBeVisible();
  await expectNoA11yViolations(page, "shortcuts dialog");
});
