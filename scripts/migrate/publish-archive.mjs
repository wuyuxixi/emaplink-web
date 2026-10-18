import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import matter from 'gray-matter';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const ARCHIVE = path.join(ROOT, 'docs', 'content-inventory', 'archive');
const CONTENT = path.join(ROOT, 'src', 'content', 'news');
const PUBLIC = path.join(ROOT, 'public');
const LEGACY = path.join(ROOT, 'src', 'data', 'legacy-news.json');
const BASE = 'https://www.emaplink.com.cn/';
const SITE_BASE = 'https://www.emaplink.com.cn/news-details/';

const existingSlugs = new Map([
  ['134', '2026-10-13-websocket-access-control'],
  ['133', '2026-08-22-crypto-evaluation-rule'],
  ['132', '2026-08-18-civil-aviation-crypto-standard'],
  ['128', '2026-05-30-password-defines-security'],
  ['127', '2026-05-30-mlps-compliance'],
]);

async function fetchText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
  return new TextDecoder('utf-8').decode(Buffer.from(await response.arrayBuffer()));
}

function cleanText(value) {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}

function truncateSummary(value) {
  const text = cleanText(value ?? '');
  if (text.length <= 300) return text;
  return `${text.slice(0, 297)}…`;
}

function createTurndown() {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**',
  });
  turndown.use(gfm);
  turndown.addRule('fencedCodeBlockWithLanguage', {
    filter: (node) =>
      node.nodeName === 'PRE' &&
      node.firstChild !== null &&
      node.firstChild.nodeName === 'CODE',
    replacement: (_content, node) => {
      const code = node.firstChild;
      const className = code.getAttribute('class') ?? '';
      const language = className.match(/language-([\w-]+)/)?.[1] ?? '';
      const text = code.textContent?.replace(/\n$/, '') ?? '';
      return `\n\n\`\`\`${language}\n${text}\n\`\`\`\n\n`;
    },
  });
  return turndown;
}

function postProcessMarkdown(markdown) {
  return markdown
    .replace(/您的浏览器不支持\s*video\s*标签/g, '')
    .replace(/^\s*-->?\s*$/gm, '')
    .replace(/【发布时间：\s*\d{4}-\d{2}-\d{2}\s*】/g, '')
    .replace(/^\s*出处为：.*$/gm, '')
    .replace(/^\s*来源：.*$/gm, '')
    .replace(/^\s*注：内容均来源于互联网.*$/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function imageToFile(buffer, slug, index, hash) {
  const dir = path.join(PUBLIC, 'images', 'news', slug);
  await fs.mkdir(dir, { recursive: true });
  const file = `img-${index}-${hash}.webp`;
  const target = path.join(dir, file);
  try {
    await fs.access(target);
  } catch {
    await sharp(buffer, { failOn: 'none' })
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(target);
  }
  return `/images/news/${slug}/${file}`;
}

async function prepareBody(html, slug, title, failures) {
  const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '');
  const $ = cheerio.load(cleanHtml, { decodeEntities: false });
  const article = $('article').first();
  article.find('h1, p.meta').remove();

  article.find('script, style, iframe, video, source, noscript').remove();
  article.find('span, font').each((_, element) => {
    const node = $(element);
    if (node.closest('pre').length) return;
    node.replaceWith(node.contents());
  });

  article.find('p').each((_, element) => {
    const node = $(element);
    const text = cleanText(node.text());
    const hasMedia = node.find('img, table, iframe, video').length > 0;
    const className = node.attr('class') ?? '';
    const isHeading =
      !hasMedia &&
      text.length > 0 &&
      text.length <= 70 &&
      (/(^|\s)weight(\s|$)/.test(className) ||
        /^趋势\s*\d+/.test(text) ||
        /^[一二三四五六七八九十]+、/.test(text) ||
        /^\d+(\.\d+)?[、.．]\s*\S/.test(text));
    if (isHeading) node.replaceWith($('<h2>').text(text));
  });

  article.find('p').each((_, element) => {
    const node = $(element);
    const text = cleanText(node.text());
    if (!text && !node.find('img, table, pre').length) node.remove();
  });

  article.find('a').each((_, element) => {
    const node = $(element);
    const href = node.attr('href') ?? '';
    if (!href || href.startsWith('javascript:')) {
      node.replaceWith(node.contents());
      return;
    }
    if (/^https?:\/\//.test(href)) {
      node.attr('target', '_blank');
      node.attr('rel', 'noopener noreferrer');
    }
  });

  const imageMap = new Map();
  let imageIndex = 0;
  const images = article.find('img').toArray();
  for (const element of images) {
    const node = $(element);
    const src = node.attr('src') ?? '';
    if (!src) {
      node.remove();
      continue;
    }
    imageIndex += 1;
    const alt = cleanText(node.attr('alt') ?? '') || `${title} 配图 ${imageIndex}`;

    if (imageMap.has(src)) {
      node.attr('src', imageMap.get(src));
      node.attr('alt', alt);
      continue;
    }

    try {
      let buffer;
      if (src.startsWith('data:')) {
        const match = src.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/s);
        if (!match) throw new Error('unsupported data URI');
        buffer = Buffer.from(match[1], 'base64');
      } else {
        const url = new URL(src, SITE_BASE);
        const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        buffer = Buffer.from(await response.arrayBuffer());
      }
      const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 10);
      const local = await imageToFile(buffer, slug, imageIndex, hash);
      imageMap.set(src, local);
      node.attr('src', local);
      node.attr('alt', alt);
    } catch (error) {
      failures.push({ slug, src: src.slice(0, 120), error: String(error) });
      node.remove();
    }
  }

  article.find('*').each((_, element) => {
    const node = $(element);
    for (const attribute of Object.keys(element.attribs ?? {})) {
      const keep =
        ['href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'scope'].includes(attribute) ||
        (element.tagName === 'code' && attribute === 'class' && /language-/.test(node.attr('class') ?? ''));
      if (!keep) node.removeAttr(attribute);
    }
  });

  return article.html() ?? '';
}

async function main() {
  await fs.mkdir(CONTENT, { recursive: true });
  const newsData = JSON.parse(await fetchText(new URL('newsData.json', BASE).href));
  const byPath = new Map(newsData.map((item) => [item.path, item]));
  const files = (await fs.readdir(ARCHIVE)).filter((file) => /^\d+\.html$/.test(file));
  const turndown = createTurndown();
  const failures = [];
  const converted = [];
  const skipped = [];

  for (const file of files.sort((a, b) => Number.parseInt(a) - Number.parseInt(b))) {
    const id = file.replace('.html', '');
    if (existingSlugs.has(id)) {
      skipped.push(id);
      continue;
    }

    const slug = `news-${id}`;
    const meta = byPath.get(`news-details${id}.html`);
    if (!meta) {
      failures.push({ slug, src: '', error: 'newsData.json 缺少该文章' });
      continue;
    }

    const archiveHtml = await fs.readFile(path.join(ARCHIVE, file), 'utf8');
    const $ = cheerio.load(archiveHtml, { decodeEntities: false });
    const metaText = cleanText($('p.meta').first().text());
    const source = metaText.match(/来源：([^·]+)/)?.[1]?.trim();
    const date = (meta.date.match(/\d{4}-\d{2}-\d{2}/) ?? [''])[0];
    const title = cleanText(meta.title);
    let summary = truncateSummary(meta.description);
    const bodyHtml = await prepareBody(archiveHtml, slug, title, failures);
    const markdown = postProcessMarkdown(turndown.turndown(bodyHtml));
    if (!summary) {
      summary = truncateSummary(markdown.replace(/[#>*_`\-\[\]()!|]/g, ' ').slice(0, 160));
    }

    if (!markdown) {
      failures.push({ slug, src: '', error: '正文为空' });
      continue;
    }

    const frontmatter = {
      title,
      date,
      summary,
      ...(source ? { source } : {}),
      draft: false,
      legacyPath: `news-details/${meta.path}`,
    };
    const output = matter.stringify(`${markdown}\n`, frontmatter);
    await fs.writeFile(path.join(CONTENT, `${slug}.md`), output, 'utf8');
    converted.push({ id, slug, title, date, chars: markdown.length });
    if (converted.length % 10 === 0) {
      console.log(`converted ${converted.length}/${files.length - skipped.length}`);
    }
  }

  // Update legacy-news.json from the actual MD files.
  const mdFiles = (await fs.readdir(CONTENT)).filter((file) => file.endsWith('.md'));
  const mdByLegacy = new Map();
  for (const file of mdFiles) {
    const raw = await fs.readFile(path.join(CONTENT, file), 'utf8');
    const parsed = matter(raw);
    const legacyPath = parsed.data.legacyPath;
    if (legacyPath) mdByLegacy.set(legacyPath, file.replace(/\.md$/, ''));
  }

  const legacy = JSON.parse(await fs.readFile(LEGACY, 'utf8'));
  for (const item of legacy) {
    const slug = mdByLegacy.get(item.legacyPath);
    item.published = Boolean(slug);
    item.slug = slug ?? null;
  }
  await fs.writeFile(LEGACY, `${JSON.stringify(legacy, null, 2)}\n`, 'utf8');

  const report = {
    converted: converted.length,
    skipped: skipped.length,
    publishedTotal: legacy.filter((item) => item.published).length,
    failures,
  };
  await fs.writeFile(
    path.join(ROOT, 'docs', 'content-inventory', 'data', 'publish-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );

  console.log(`\nconverted: ${converted.length}; skipped existing: ${skipped.length}; published total: ${report.publishedTotal}`);
  if (failures.length) {
    console.error(`failures: ${failures.length}`);
    for (const failure of failures.slice(0, 20)) console.error(`  - ${failure.slug}: ${failure.error} ${failure.src}`);
    process.exitCode = 1;
  } else {
    console.log('all archive articles converted');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
