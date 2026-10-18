import { expect, test } from "@playwright/test";

async function loadAllImages(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let y = 0;
      const timer = window.setInterval(() => {
        window.scrollBy(0, 700);
        y += 700;
        if (y >= document.documentElement.scrollHeight) {
          window.clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 40);
    });
  });
  await page.waitForTimeout(300);
}

test("home renders hero, products, solutions and news", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toContainText("国密");
  await expect(
    page.locator('main a[href="/products/zsac-gateway/"]').first(),
  ).toBeVisible();
  await expect(page.locator('main a[href^="/solutions/"]')).toHaveCount(3);
  await expect(page.locator('#news a[href="/news/"]').first()).toBeVisible();
  await loadAllImages(page);
  const broken = await page.locator("img").evaluateAll((images) =>
    images
      .map((image) => image as HTMLImageElement)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.getAttribute("src")),
  );
  expect(broken).toEqual([]);
});

test("product card entrances preserve both rows of staggered positions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1373, height: 1244 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
  const cards = page.locator(".product-grid .product-card");
  await expect(cards.first()).toHaveCSS("opacity", "0");
  await page.mouse.move(0, 0);
  const offsets = await page.locator(".product-grid").evaluate((grid) => {
    window.scrollTo({
      top: grid.getBoundingClientRect().top + scrollY - 250,
      behavior: "instant",
    });
    return new Promise<number[][]>((resolve) => {
      const samples: number[][] = [];
      const start = performance.now();
      const sample = () => {
        const positions = Array.from(
          grid.querySelectorAll(".product-card"),
        ).map((card) => card.getBoundingClientRect().top);
        samples.push([
          positions[1] - positions[0],
          positions[3] - positions[2],
        ]);
        if (performance.now() - start < 1300) requestAnimationFrame(sample);
        else resolve(samples);
      };
      sample();
    });
  });
  for (const row of [0, 1]) {
    const values = offsets.map((sample) => sample[row]);
    expect(Math.max(...values) - Math.min(...values)).toBeLessThan(1);
    expect(values.at(-1)).toBeCloseTo(56, 0);
  }
  await expect(cards.first()).toHaveCSS("opacity", "1");
});

test("news list is text-first and paginates", async ({ page }) => {
  await page.goto("/news/");
  await expect(page.locator("h1")).toContainText("了解企业资讯");
  await expect(page.locator("[data-news-row]")).toHaveCount(10);
  await expect(page.locator("[data-news-row] img")).toHaveCount(0);
  await expect(page.locator("[data-news-row]").first()).toContainText("最新");
  await page.getByRole("link", { name: "下一页" }).click();
  await expect(page).toHaveURL(/\/news\/page\/2\/$/);
  await expect(page.locator("[data-news-row]")).toHaveCount(10);
});

test("article renders tables, code, toc and disclaimer", async ({ page }) => {
  await page.goto("/news/2026-10-13-websocket-access-control/");
  await expect(page.locator("h1")).toContainText("WebSocket");
  await expect(page.locator(".prose-news table")).toHaveCount(3);
  await expect(page.locator(".prose-news pre")).toHaveCount(14);
  await expect(page.locator('aside[aria-label="文章目录"]')).toBeVisible();
  await expect(page.locator('aside[aria-label="免责声明"]')).toContainText(
    "内容均来源于互联网",
  );
});

test("product page shows features and scenarios", async ({ page }) => {
  await page.goto("/products/zsac-gateway/");
  await expect(page.locator("h1")).toHaveText("ZSAC智能准入控制系统");
  await expect(page.getByText("可信身份标识").first()).toBeVisible();
  await expect(page.getByText("日志告警").first()).toBeVisible();
  await expect(page.getByText("适用场景").first()).toBeVisible();
});

test("ZSAC terminal selection updates its access explanation and route", async ({
  page,
}) => {
  await page.goto("/products/zsac-gateway/");
  const diagram = page.locator("[data-zsac-architecture]");
  for (const [kind, name] of [
    ["drone", "无人机"],
    ["camera", "执法记录仪"],
    ["helmet", "智能头盔"],
    ["phone", "手机"],
  ]) {
    await diagram.locator(`[data-terminal="${kind}"]`).click();
    await expect(diagram.locator("[data-terminal-title]")).toHaveText(
      `${name}接入`,
    );
    await expect(
      diagram.locator("[data-terminal-description]"),
    ).not.toBeEmpty();
    await expect(diagram.locator(`[data-terminal="${kind}"]`)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(diagram.locator('[aria-pressed="true"]')).toHaveCount(1);
    await expect(diagram.locator(`[data-route="${kind}"]`)).toHaveClass(
      /is-active/,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await diagram.locator('[data-terminal="drone"]').focus();
  await page.keyboard.press("Enter");
  await expect(diagram.locator("[data-terminal-title]")).toHaveText(
    "无人机接入",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await diagram
      .locator(".is-active")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
});

test("ZSAC rendered assets pause outside the viewport and respect reduced motion", async ({
  page,
}) => {
  await page.goto("/products/zsac-gateway/");
  const core = page.locator('[data-zsac-float="core"] img');
  await expect(core).toBeVisible();
  await expect
    .poll(() =>
      core.evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const transform = () =>
    core.evaluate((image) => getComputedStyle(image).transform);
  await page.waitForTimeout(400);
  const moving = await transform();
  await expect.poll(transform).not.toBe(moving);
  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  await page.waitForTimeout(300);
  const paused = await transform();
  await page.waitForTimeout(350);
  expect(await transform()).toBe(paused);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(transform).toBe("none");
  await expect(page.locator("[data-zsac-scene] img")).toHaveCount(5);
});

test("mobile menu opens and closes", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.locator("[data-menu-toggle]").click();
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await expect(page.locator("[data-menu-toggle]")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await page.locator("[data-menu-close]").click();
  await expect(page.locator("#mobile-menu")).toBeHidden();
});

test("search dialog returns results", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-search-open]").first().click();
  await expect(page.locator("#search-dialog")).toHaveAttribute("open", "");
  await page.locator("#search-input").fill("密码");
  await expect(page.locator("[data-search-result]").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#search-dialog")).not.toHaveAttribute("open", "");
});

test("honor lightbox opens and closes", async ({ page }) => {
  await page.goto("/about/honors/");
  await page.locator("[data-honor-open]").first().click();
  await expect(page.locator("#honor-dialog")).toHaveAttribute("open", "");
  await expect(page.locator("#honor-dialog-title")).toContainText(
    "高新技术企业",
  );
  await page.locator("[data-honor-close]").click();
  await expect(page.locator("#honor-dialog")).not.toHaveAttribute("open", "");
});

test("404 page is branded", async ({ page }) => {
  await page.goto("/404.html");
  await expect(page.locator("h1")).toContainText("页面没有找到");
  await expect(page.locator('a[href="/"]').first()).toBeVisible();
});

test("solution previews follow the selected scenario", async ({ page }) => {
  await page.goto("/");
  const choices = page.locator("[data-solution-choice]");
  for (let index = 0; index < 3; index++) {
    await choices.nth(index).click();
    await expect(choices.nth(index)).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.locator(`[data-solution-panel="${index}"]`),
    ).toBeVisible();
    await expect(page.locator("[data-solution-panel]:visible")).toHaveCount(1);
  }
});

test("redesigned pages stay within narrow viewports with reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of [
    "/",
    "/products/zsac-gateway/",
    "/solutions/data-exchange/",
    "/contact/",
    "/news/",
  ]) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(
      await page
        .locator("h1")
        .evaluate((element) => getComputedStyle(element).opacity),
    ).toBe("1");
  }
});

test("text motion preserves Chinese layout and restores content for reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
  await expect(page.locator("h1")).toHaveAttribute("aria-label", /国密/);
  await expect(page.locator("h1")).toHaveAttribute(
    "data-text-complete",
    "true",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const paragraph = page.locator("[data-scroll-fill]");
  await paragraph.scrollIntoViewIfNeeded();
  await expect(paragraph).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 768, height: 1024 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".motion-char")).toHaveCount(0);
  await expect(page.locator(".fill-char")).toHaveCount(0);
  await expect(page.locator("h1")).toContainText("国密");
  await expect(paragraph).toContainText("让每一台设备拥有可信身份");
});

test("bright theme and rolling buttons keep their accessible labels", async ({
  page,
}) => {
  await page.goto("/");
  expect(
    await page
      .locator("body")
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe("rgb(255, 255, 255)");
  const action = page.getByRole("link", {
    name: "探索 ZSAC 产品",
    exact: true,
  });
  await expect(action).toBeVisible();
  await action.hover();
  await expect(action).toHaveAccessibleName("探索 ZSAC 产品");
  await expect(action.locator('.button-label [aria-hidden="true"]')).toHaveText(
    "探索 ZSAC 产品",
  );
});
