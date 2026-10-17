import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'http://127.0.0.1:4321';
const OUT = 'docs/preview';
await fs.mkdir(OUT, { recursive: true });

const pages = [
  ['home', '/'],
  ['product-gateway', '/products/zsac-gateway/'],
  ['product-crypto', '/products/zsac-crypto-module/'],
  ['solution-multi', '/solutions/multi-terminal-access/'],
  ['news-list', '/news/'],
  ['news-article', '/news/2026-10-13-websocket-access-control/'],
  ['about', '/about/'],
  ['culture', '/about/culture/'],
  ['honors', '/about/honors/'],
  ['cases', '/about/cases/'],
  ['contact', '/contact/'],
  ['not-found', '/404.html'],
];

const browser = await chromium.launch({ channel: 'msedge' });
const summary = [];
const errors = [];

for (const [name, url] of pages) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${name}: console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`${name}: pageerror: ${error.message}`));

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
      }, 50);
    });
  });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  await page
    .waitForFunction(() => Array.from(document.images).every((image) => image.complete), null, { timeout: 8000 })
    .catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);

  const desktop = await page.evaluate(() => {
    const broken = Array.from(document.images)
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.getAttribute('src'));
    return {
      title: document.title,
      h1: Array.from(document.querySelectorAll('h1')).map((node) => node.textContent?.trim()),
      broken,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      height: document.documentElement.scrollHeight,
      links: document.querySelectorAll('a[href]').length,
      images: document.images.length,
    };
  });

  await page.screenshot({ path: path.join(OUT, `${name}-1440.png`), fullPage: true });
  await page.close();

  const mobile = await browser.newPage({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  await mobile.goto(BASE + url, { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(300);
  const mobileInfo = await mobile.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    h1: Array.from(document.querySelectorAll('h1')).map((node) => node.textContent?.trim()),
  }));
  await mobile.screenshot({ path: path.join(OUT, `${name}-375.png`), fullPage: false });
  await mobile.close();

  summary.push({ name, url, desktop, mobile: mobileInfo });
  console.log(`${name}: h1=${desktop.h1.length} broken=${desktop.broken.length} overflow=${desktop.overflow}/${mobileInfo.overflow} height=${desktop.height}`);
}

await fs.writeFile(path.join(OUT, 'qa-summary.json'), `${JSON.stringify({ summary, errors }, null, 2)}\n`);
console.log(`\nconsole/page errors: ${errors.length}`);
if (errors.length) console.log(errors.join('\n'));
await browser.close();
