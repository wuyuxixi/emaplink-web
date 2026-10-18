import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const BASE = 'http://127.0.0.1:4321';
const samples = [
  'news-1',
  'news-5',
  'news-26',
  'news-50',
  'news-54',
  'news-83',
  'news-86',
  'news-97',
  'news-109',
  'news-120',
  'news-121',
  'news-124',
  'news-126',
];

const browser = await chromium.launch({ channel: 'msedge' });
const results = [];
const errors = [];

for (const slug of samples) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${slug}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`${slug}: ${error.message}`));
  await page.goto(`${BASE}/news/${slug}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  await page
    .waitForFunction(() => Array.from(document.images).every((image) => image.complete), null, { timeout: 8000 })
    .catch(() => {});
  const info = await page.evaluate(() => {
    const broken = Array.from(document.images)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.getAttribute('src'));
    return {
      h1: document.querySelector('h1')?.textContent?.trim(),
      images: document.images.length,
      broken,
      tables: document.querySelectorAll('.prose-news table').length,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      height: document.documentElement.scrollHeight,
    };
  });
  results.push({ slug, ...info });
  console.log(`${slug}: img=${info.images} broken=${info.broken.length} tables=${info.tables} overflow=${info.overflow} height=${info.height}`);
  if (slug === 'news-124') {
    await page.screenshot({ path: 'docs/preview/news-124-1440.png', clip: { x: 0, y: 0, width: 1440, height: 2600 } });
  }
  await page.close();
}

await fs.writeFile('docs/preview/qa-news.json', `${JSON.stringify({ results, errors }, null, 2)}\n`, 'utf8');
console.log(`errors: ${errors.length}`);
if (errors.length) console.log(errors.join('\n'));
await browser.close();
