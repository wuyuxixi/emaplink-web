import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function toUrlPath(file) {
  return `/${path.relative(DIST, file).replaceAll('\\', '/')}`;
}

function resolveTarget(sourceFile, href) {
  const sourceUrl = new URL(toUrlPath(sourceFile), 'https://example.com');
  const url = new URL(href, sourceUrl);
  if (url.origin !== 'https://example.com') return null;
  return decodeURIComponent(url.pathname);
}

async function existsForPath(urlPath) {
  const relative = urlPath.replace(/^\//, '');
  const candidates = [];
  if (!relative || relative.endsWith('/')) {
    candidates.push(path.join(DIST, relative, 'index.html'));
  } else {
    candidates.push(path.join(DIST, relative));
    if (!path.extname(relative)) candidates.push(path.join(DIST, relative, 'index.html'));
    if (relative.endsWith('.html')) candidates.push(path.join(DIST, relative));
  }
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return { file: candidate, urlPath };
    } catch {
      // continue
    }
  }
  return null;
}

const files = (await walk(DIST)).filter((file) => file.endsWith('.html'));
const broken = [];
const checked = new Set();
let linkCount = 0;
let assetCount = 0;

for (const file of files) {
  const html = await fs.readFile(file, 'utf8');
  const $ = cheerio.load(html);
  const from = toUrlPath(file);

  const links = [
    ...$('a[href]').map((_, element) => $(element).attr('href')).get(),
    ...$('link[href]').map((_, element) => $(element).attr('href')).get(),
    ...$('img[src]').map((_, element) => $(element).attr('src')).get(),
    ...$('script[src]').map((_, element) => $(element).attr('src')).get(),
  ];

  for (const href of links) {
    if (!href) continue;
    if (/^(https?:)?\/\//.test(href) || /^(mailto|tel|javascript|data):/.test(href)) continue;

    const [pathname, hash] = href.split('#');
    const isHashOnly = href.startsWith('#');
    if (!pathname && hash) {
      const target = from;
      const targetFile = path.join(DIST, target.replace(/^\//, ''));
      const targetHtml = await fs.readFile(targetFile, 'utf8').catch(() => '');
      const id = decodeURIComponent(hash);
      if (!targetHtml.includes(`id="${id}"`) && !targetHtml.includes(`name="${id}"`)) {
        broken.push({ from, href, reason: `当前页锚点不存在：#${id}` });
      }
      continue;
    }
    if (isHashOnly) continue;

    const resolved = resolveTarget(file, pathname);
    if (!resolved) continue;
    const key = `${from} -> ${resolved}`;
    if (checked.has(key)) continue;
    checked.add(key);
    linkCount += 1;

    const target = await existsForPath(resolved);
    if (!target) {
      broken.push({ from, href, reason: '目标文件不存在' });
      continue;
    }

    if (/\.(png|jpe?g|webp|gif|svg|ico|css|js|json|xml|txt|woff2?)$/i.test(resolved)) {
      assetCount += 1;
      continue;
    }

    if (hash) {
      const targetHtml = await fs.readFile(target.file, 'utf8');
      const id = decodeURIComponent(hash);
      if (!targetHtml.includes(`id="${id}"`) && !targetHtml.includes(`name="${id}"`)) {
        broken.push({ from, href, reason: `锚点不存在：#${id}` });
      }
    }
  }
}

// 旧 URL 别名存在性与目标检查
const legacy = JSON.parse(await fs.readFile(path.join(ROOT, 'src', 'data', 'legacy-news.json'), 'utf8'));
const aliasChecks = [];

for (const item of legacy) {
  const alias = path.join(DIST, item.legacyPath);
  try {
    const html = await fs.readFile(alias, 'utf8');
    const target = item.published && item.slug ? `/news/${item.slug}/` : '/news/';
    if (!html.includes(`url=${target}`)) {
      aliasChecks.push({ alias: item.legacyPath, reason: `未指向 ${target}` });
    }
  } catch {
    aliasChecks.push({ alias: item.legacyPath, reason: '别名文件不存在' });
  }
}

console.log(`扫描 HTML：${files.length}；内部链接/资源：${linkCount}；静态资源：${assetCount}`);
console.log(`旧文章别名检查：${legacy.length}；异常：${aliasChecks.length}`);

if (broken.length || aliasChecks.length) {
  console.error(`\n发现 ${broken.length + aliasChecks.length} 个问题：`);
  for (const item of broken) console.error(`  ✗ ${item.from} -> ${item.href} (${item.reason})`);
  for (const item of aliasChecks) console.error(`  ✗ ${item.alias}: ${item.reason}`);
  process.exitCode = 1;
} else {
  console.log('\n链接检查通过。');
}
