import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const outDir = 'docs/preview';
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });
const errors = [];

async function shot(name, viewport, isMobile = false) {
  const page = await browser.newPage({ viewport, isMobile, hasTouch: isMobile, deviceScaleFactor: 1 });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${name}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`${name}: ${error.message}`));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const timer = window.setInterval(() => {
        window.scrollBy(0, 700);
        y += 700;
        if (y >= document.documentElement.scrollHeight) {
          window.clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 60);
    });
  });
  await page.waitForTimeout(700);
  const info = await page.evaluate(() => {
    const broken = Array.from(document.images)
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.getAttribute('src'));
    return {
      title: document.title,
      h1: Array.from(document.querySelectorAll('h1')).map((node) => node.textContent?.trim()),
      h2: Array.from(document.querySelectorAll('h2')).slice(0, 8).map((node) => node.textContent?.trim()),
      broken,
      width: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    };
  });
  console.log(name, JSON.stringify(info, null, 2));
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  await page.close();
}

await shot('home-1440', { width: 1440, height: 900 });
await shot('home-375', { width: 375, height: 812 }, true);

console.log('errors:', errors);
await browser.close();
