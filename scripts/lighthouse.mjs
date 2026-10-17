import fs from 'node:fs/promises';
import path from 'node:path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'docs', 'lighthouse');
const BASE = process.env.LH_BASE ?? 'http://127.0.0.1:4321';

const targets = [
  ['home', '/'],
  ['product', '/products/zsac-gateway/'],
  ['article', '/news/2026-10-13-websocket-access-control/'],
];

await fs.mkdir(OUT, { recursive: true });

const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});

try {
  for (const [name, pathname] of targets) {
    const url = new URL(pathname, BASE).href;
    const result = await lighthouse(url, {
      port: chrome.port,
      output: ['json', 'html'],
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });
    if (!result) throw new Error(`No Lighthouse result for ${url}`);

    const [json, html] = result.report;
    await fs.writeFile(path.join(OUT, `${name}.report.json`), json, 'utf8');
    await fs.writeFile(path.join(OUT, `${name}.report.html`), html, 'utf8');

    const scores = Object.fromEntries(
      Object.entries(result.lhr.categories).map(([key, value]) => [key, Math.round((value.score ?? 0) * 100)]),
    );
    console.log(`${name}: ${JSON.stringify(scores)}`);
  }
} finally {
  chrome.kill();
}
