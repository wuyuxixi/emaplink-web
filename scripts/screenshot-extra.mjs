import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const BASE = 'http://127.0.0.1:4321';
const OUT = 'docs/preview';
await fs.mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' });

async function full(name, url, width = 1440, height = 900) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const timer = window.setInterval(() => {
        window.scrollBy(0, 800);
        y += 800;
        if (y >= document.documentElement.scrollHeight) {
          window.clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 40);
    });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  await page.close();
}

async function article() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '/news/2026-10-13-websocket-access-control/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${OUT}/article-top-1440.png`, clip: { x: 0, y: 0, width: 1440, height: 2600 } });
  const table = page.locator('.prose-news table').first();
  await table.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/article-table-1440.png` });
  const code = page.locator('.prose-news pre').first();
  await code.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/article-code-1440.png` });
  await page.close();

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  await mobile.goto(BASE + '/news/2026-10-13-websocket-access-control/', { waitUntil: 'networkidle' });
  await mobile.screenshot({ path: `${OUT}/article-top-375.png` });
  await mobile.close();
}

await full('honors-1440', '/about/honors/');
await full('cases-1440', '/about/cases/');
await full('contact-1440', '/contact/');
await full('culture-1440', '/about/culture/');
await article();
await browser.close();
