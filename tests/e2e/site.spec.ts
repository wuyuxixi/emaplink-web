import { expect, test } from '@playwright/test';

async function loadAllImages(page: import('@playwright/test').Page) {
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

test('home renders hero, products, solutions and news', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('始于细节');
  await expect(page.locator('main a[href="/products/zsac-gateway/"]').first()).toBeVisible();
  await expect(page.locator('main a[href^="/solutions/"]')).toHaveCount(3);
  await expect(page.locator('#news a[href="/news/"]').first()).toBeVisible();
  await loadAllImages(page);
  const broken = await page.locator('img').evaluateAll((images) =>
    images
      .map((image) => image as HTMLImageElement)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.getAttribute('src')),
  );
  expect(broken).toEqual([]);
});

test('news list is text-first and paginates', async ({ page }) => {
  await page.goto('/news/');
  await expect(page.locator('h1')).toContainText('了解企业资讯');
  await expect(page.locator('[data-news-row]')).toHaveCount(10);
  await expect(page.locator('[data-news-row] img')).toHaveCount(0);
  await expect(page.locator('[data-news-row]').first()).toContainText('最新');
  await page.getByRole('link', { name: '下一页' }).click();
  await expect(page).toHaveURL(/\/news\/page\/2\/$/);
  await expect(page.locator('[data-news-row]')).toHaveCount(10);
});

test('article renders tables, code, toc and disclaimer', async ({ page }) => {
  await page.goto('/news/2026-10-13-websocket-access-control/');
  await expect(page.locator('h1')).toContainText('WebSocket');
  await expect(page.locator('.prose-news table')).toHaveCount(3);
  await expect(page.locator('.prose-news pre')).toHaveCount(14);
  await expect(page.locator('aside[aria-label="文章目录"]')).toBeVisible();
  await expect(page.locator('aside[aria-label="免责声明"]')).toContainText('内容均来源于互联网');
});

test('product page shows features and scenarios', async ({ page }) => {
  await page.goto('/products/zsac-gateway/');
  await expect(page.locator('h1')).toHaveText('ZSAC智能准入控制系统');
  await expect(page.getByText('可信身份标识').first()).toBeVisible();
  await expect(page.getByText('日志告警').first()).toBeVisible();
  await expect(page.getByText('适用场景').first()).toBeVisible();
});

test('mobile menu opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.locator('[data-menu-toggle]').click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await expect(page.locator('[data-menu-toggle]')).toHaveAttribute('aria-expanded', 'true');
  await page.locator('[data-menu-close]').click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
});

test('search dialog returns results', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-search-open]').first().click();
  await expect(page.locator('#search-dialog')).toHaveAttribute('open', '');
  await page.locator('#search-input').fill('密码');
  await expect(page.locator('[data-search-result]').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#search-dialog')).not.toHaveAttribute('open', '');
});

test('honor lightbox opens and closes', async ({ page }) => {
  await page.goto('/about/honors/');
  await page.locator('[data-honor-open]').first().click();
  await expect(page.locator('#honor-dialog')).toHaveAttribute('open', '');
  await expect(page.locator('#honor-dialog-title')).toContainText('高新技术企业');
  await page.locator('[data-honor-close]').click();
  await expect(page.locator('#honor-dialog')).not.toHaveAttribute('open', '');
});

test('404 page is branded', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.locator('h1')).toContainText('页面没有找到');
  await expect(page.locator('a[href="/"]').first()).toBeVisible();
});
