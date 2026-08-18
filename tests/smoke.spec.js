const { test, expect } = require("@playwright/test");

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".headline")).toBeVisible();
  await expect(page.locator("[data-lab-track] li")).not.toHaveCount(0);
});

test("language switch updates html lang", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "ខ្មែរ" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "km");
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    "km_KH"
  );
});

test("pages advertise English and Khmer alternates", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="alternate"][hreflang="km"]')).toHaveAttribute(
    "href",
    /lang=km/
  );
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
});

test("global search finds chapters and labs", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-search-toggle]").click();
  const input = page.locator("[data-search-input]");
  await expect(input).toBeVisible();
  await input.fill("rebase");
  const results = page.locator("[data-search-results] a");
  await expect(results.first()).toBeVisible();
  const titles = await results.allTextContents();
  expect(titles.some((text) => /rebase/i.test(text))).toBeTruthy();
});

test("learn page loads a chapter", async ({ page }) => {
  await page.goto("/learn.html");
  await expect(page.locator("[data-chapter-body]")).toBeVisible();
  await expect(page.locator("[data-chapter-title]")).not.toHaveText("");
  await expect(page.locator("[data-chapter-nav] > li:not(.status)")).toHaveCount(
    await page.evaluate(async () => {
      const res = await fetch("./content/en/guide.md");
      const md = await res.text();
      const howTo = (md.match(/^## How to use this guide$/m) || []).length;
      const numbered = (md.match(/^## \d+\. /gm) || []).length;
      return howTo + numbered;
    })
  );
});

test("lab page loads instructions", async ({ page }) => {
  await page.goto("/lab.html?id=01-first-repo");
  await expect(page.locator("[data-lab-body]")).toBeVisible();
  await expect(page.locator("[data-lab-body] pre, [data-lab-body] code").first()).toBeVisible();
});

test("labs page filter narrows the grid", async ({ page }) => {
  await page.goto("/labs.html");
  const grid = page.locator("[data-lab-grid] a");
  const total = await grid.count();
  await expect(total).toBeGreaterThan(0);

  await page.locator('[data-lab-filter="beginner"]').click();
  const beginnerCount = await grid.count();
  await expect(beginnerCount).toBeGreaterThan(0);
  await expect(beginnerCount).toBeLessThan(total);

  await page.locator('[data-lab-filter="all"]').click();
  await expect(grid).toHaveCount(total);
});

test("sidebar search filters chapters", async ({ page }) => {
  await page.goto("/learn.html");
  const items = page.locator("[data-chapter-nav] > li:not(.status)");
  const total = await items.count();
  await page.locator("[data-side-search]").fill("branch");
  const visible = await items.evaluateAll((nodes) =>
    nodes.filter((node) => !node.hidden).length
  );
  await expect(visible).toBeGreaterThan(0);
  await expect(visible).toBeLessThan(total);
});
