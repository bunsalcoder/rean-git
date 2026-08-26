const { test, expect } = require("@playwright/test");

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".headline")).toBeVisible();
  await expect(page.locator("[data-lab-track] li")).not.toHaveCount(0);
  const escaped = await page.evaluate(() => window.ReanGitUtil.escapeHtml("<hi>"));
  expect(escaped).toBe("&lt;hi&gt;");
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

  await page.locator('[data-lab-filter="intermediate"]').click();
  await expect(page.locator('[data-lab-grid] a[data-lab-id="08-stash"]')).toBeVisible();
  await expect(page.locator('[data-lab-grid] a[data-lab-id="07-team-workflow"]')).toBeVisible();
  await expect(page.locator('[data-lab-grid] a[data-lab-id="11-interactive-rebase"]')).toHaveCount(0);

  await page.locator('[data-lab-filter="all"]').click();
  await expect(grid).toHaveCount(total);
});

test("pages advertise a web app manifest", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    /manifest\.webmanifest/
  );
  await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1);
});

test("lab page offers a verify.sh self-check", async ({ page }) => {
  await page.goto("/lab.html?id=01-first-repo");
  await expect(page.locator(".lab-verify")).toBeVisible();
  await expect(page.locator(".lab-verify")).toContainText("./verify.sh");
});

test("home shows completed lab count from local progress", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "rean-git:lab-progress",
      JSON.stringify({
        "01-first-repo": { checked: 3, total: 3, complete: true },
      })
    );
  });
  await page.goto("/");
  const complete = page.locator("[data-home-labs-complete]");
  await expect(complete).toBeVisible();
  await expect(complete).toContainText("1");
});

test("labs page shows completed lab count from local progress", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "rean-git:lab-progress",
      JSON.stringify({
        "01-first-repo": { checked: 3, total: 3, complete: true },
      })
    );
  });
  await page.goto("/labs.html");
  const complete = page.locator("[data-labs-progress]");
  await expect(complete).toBeVisible();
  await expect(complete).toContainText("1");
});

test("lab sidebar marks completed labs", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "rean-git:lab-progress",
      JSON.stringify({
        "01-first-repo": { checked: 3, total: 3, complete: true },
      })
    );
    localStorage.setItem(
      "rean-git:checklist:/lab.html?id=01-first-repo",
      JSON.stringify({ 0: true, 1: true, 2: true })
    );
  });
  await page.goto("/lab.html?id=01-first-repo");
  await expect(
    page.locator('[data-lab-nav] a[data-lab-id="01-first-repo"].is-complete')
  ).toBeVisible();
});

test("styles include print rules", async ({ page }) => {
  const css = await page.goto("/assets/css/styles.css");
  const text = await css.text();
  expect(text).toContain("@media print");
  expect(text).toContain(".copy-btn");
});

test("content precache manifest lists handbook and labs", async ({ page }) => {
  const res = await page.request.get("/content-precache.json");
  expect(res.ok()).toBeTruthy();
  const urls = await res.json();
  expect(urls).toContain("./content/en/guide.md");
  expect(urls).toContain("./content/en/labs/01-first-repo.md");
  expect(urls).toContain("./content/en/labs/17-signing.md");
  expect(urls).toContain("./content/km/guide.md");
});

test("professional labs appear in the catalog", async ({ page }) => {
  await page.goto("/labs.html");
  for (const id of ["17-signing", "18-forks", "19-submodules-lfs"]) {
    await expect(page.locator(`[data-lab-grid] a[data-lab-id="${id}"]`)).toBeVisible();
  }
});

test("copy button copies a code block", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/lab.html?id=01-first-repo");
  const block = page.locator("[data-lab-body] .code-block").first();
  await expect(block).toBeVisible();
  const expected = await block.locator("pre").innerText();
  await block.locator(".copy-btn").click();
  await expect(page.locator("[data-lab-body] .copy-btn").first()).toHaveText(/Copied/i);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.trim()).toBe(expected.trim());
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

test("arrow keys move to the next chapter", async ({ page }) => {
  await page.goto("/learn.html?c=how-to-use");
  await expect(page.locator("[data-chapter-title]")).not.toHaveText(/Loading/i);
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/[?&]c=1(?:&|$)/);
});

test("j moves to the next lab", async ({ page }) => {
  await page.goto("/lab.html?id=01-first-repo");
  await expect(page.locator("[data-lab-body]")).toBeVisible();
  await page.keyboard.press("j");
  await expect(page).toHaveURL(/id=02-branch-merge/);
});

test("j after bisect goes to worktrees, not internals", async ({ page }) => {
  await page.goto("/lab.html?id=12-bisect");
  await expect(page.locator("[data-lab-body]")).toBeVisible();
  await page.keyboard.press("j");
  await expect(page).toHaveURL(/id=14-worktrees/);
});

test("arrow keys do not navigate while typing in sidebar search", async ({ page }) => {
  await page.goto("/learn.html?c=1");
  await expect(page.locator("[data-chapter-title]")).not.toHaveText(/Loading/i);
  await page.locator("[data-side-search]").fill("x");
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(/[?&]c=1(?:&|$)/);
  await expect(page.locator("[data-side-search]")).toHaveValue("x");
});

test("footer links to the GitHub repo", async ({ page }) => {
  await page.goto("/");
  const link = page.locator(
    '.site-footer a[href="https://github.com/bunsalcoder/rean-git"]'
  );
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("target", "_blank");
});

test("home asks visitors to clone the repo", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-clone-command]")).toContainText("git clone");
  await expect(page.locator("[data-home-lede]")).toContainText("27");
  await expect(page.locator("[data-home-lede]")).toContainText("19");
});

test("lab track puts internals last", async ({ page }) => {
  await page.goto("/");
  const last = page.locator("[data-lab-track] a[data-lab-id]").last();
  await expect(last).toHaveAttribute("data-lab-id", "13-internals");
});

test("lab page links to the matching handbook chapter", async ({ page }) => {
  await page.goto("/lab.html?id=08-stash");
  const related = page.locator("[data-related-chapter] a");
  await expect(related).toBeVisible();
  await expect(related).toHaveAttribute("href", /c=14/);
});

test("unchecking every lab box clears completion", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "rean-git:lab-progress",
      JSON.stringify({
        "01-first-repo": { checked: 3, total: 3, complete: true },
      })
    );
    localStorage.setItem(
      "rean-git:checklist:/lab.html?id=01-first-repo",
      JSON.stringify({ 0: true, 1: true, 2: true })
    );
  });
  await page.goto("/lab.html?id=01-first-repo");
  const link = page.locator('[data-lab-nav] a[data-lab-id="01-first-repo"]');
  await expect(link).toHaveClass(/is-complete/);
  const boxes = page.locator('[data-lab-body] input[type="checkbox"]');
  const count = await boxes.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    if (await boxes.nth(i).isChecked()) {
      await boxes.nth(i).click();
    }
  }
  await expect(link).not.toHaveClass(/is-complete/);
});

test("search finds text inside a chapter", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-search-toggle]").click();
  const input = page.locator("[data-search-input]");
  await expect(input).toBeVisible();
  await input.fill("suitcase");
  const results = page.locator("[data-search-results] [role='option']");
  await expect(results.first()).toBeVisible({ timeout: 10000 });
  const titles = await results.allTextContents();
  expect(titles.some((text) => /mental model/i.test(text))).toBeTruthy();
});

test("learn page can mark a chapter done", async ({ page }) => {
  await page.goto("/learn.html?c=1");
  const button = page.locator("[data-mark-done]");
  await expect(button).toBeVisible();
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator('[data-chapter-nav] a[data-chapter-id="1"].is-complete')
  ).toBeVisible();
});

test("404 page is served for the dedicated not-found document", async ({ page }) => {
  await page.goto("/404.html");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("[data-search-toggle]")).toBeVisible();
});

test("cheat sheet nav uses the catalog chapter id", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-cheat-sheet]").first()).toHaveAttribute(
    "href",
    /learn\.html\?c=26/
  );
});

test("reset progress clears completed labs on home", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "rean-git:lab-progress",
      JSON.stringify({
        "01-first-repo": { checked: 3, total: 3, complete: true },
      })
    );
  });
  await page.goto("/");
  await expect(page.locator("[data-home-labs-complete]")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("[data-reset-progress]").click();
  await expect(page.locator("[data-home-progress]")).toBeHidden();
});
