import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'docs', 'content-inventory', 'data', 'links.csv');

const newsDir = path.join(ROOT, 'src', 'content', 'news');
const newsSlugs = (await fs.readdir(newsDir))
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''))
  .sort();

const pages = [
  '/index.html',
  '/products/zsac-gateway/index.html',
  '/products/zsac-server/index.html',
  '/products/zsac-crypto-module/index.html',
  '/products/zsac-otp/index.html',
  '/solutions/multi-terminal-access/index.html',
  '/solutions/data-exchange/index.html',
  '/solutions/app-protection/index.html',
  '/about/index.html',
  '/about/culture/index.html',
  '/about/honors/index.html',
  '/about/cases/index.html',
  '/contact/index.html',
  '/news/index.html',
  ...newsSlugs.map((slug) => `/news/${slug}/index.html`),
  '/404.html',
];

async function existsForPath(urlPath) {
  const relative = urlPath.replace(/^\//, '');
  const candidates = [];
  if (!relative || relative.endsWith('/')) candidates.push(path.join(DIST, relative, 'index.html'));
  else {
    candidates.push(path.join(DIST, relative));
    if (!path.extname(relative)) candidates.push(path.join(DIST, relative, 'index.html'));
  }
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return true;
    } catch {
      // continue
    }
  }
  return false;
}

function escapeCsv(value) {
  return `"${String(value).replaceAll('"', '""').replace(/\r?\n/g, ' ')}"`;
}

const rows = [];

for (const page of pages) {
  const file = path.join(DIST, page.replace(/^\//, ''));
  const html = await fs.readFile(file, 'utf8');
  const $ = cheerio.load(html);
  for (const anchor of $('a[href]').toArray()) {
    const href = $(anchor).attr('href') ?? '';
    const text = $(anchor).text().replace(/\s+/g, ' ').trim();
    if (!href) continue;

    let type = 'internal';
    let status = '';
    if (/^(https?:)?\/\//.test(href)) {
      type = 'external';
      status = 'not-checked';
    } else if (/^mailto:/.test(href)) {
      type = 'email';
      status = 'not-checked';
    } else if (/^tel:/.test(href)) {
      type = 'phone';
      status = 'not-checked';
    } else if (href.startsWith('#')) {
      type = 'anchor';
      status = 'not-checked';
    } else {
      const pathname = href.split('#')[0].split('?')[0];
      const base = new URL(page, 'https://example.com');
      const resolved = new URL(pathname, base).pathname;
      const ok = await existsForPath(resolved);
      status = ok ? '200' : '404';
    }

    rows.push({ page, href, text, type, status });
  }
}

const header = 'from_page,href,text,type,status';
const csv = [header, ...rows.map((row) => [row.page, row.href, row.text, row.type, row.status].map(escapeCsv).join(','))].join('\n');
await fs.writeFile(OUT, `${csv}\n`, 'utf8');
console.log(`links.csv: ${rows.length} links from ${pages.length} pages`);
