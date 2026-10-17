import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import matter from 'gray-matter';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'news');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const INVENTORY_DIR = path.join(ROOT, 'docs', 'content-inventory', 'data');
const BASE = 'https://www.emaplink.com.cn/';

const selected = [
  {
    id: '134',
    slug: '2026-10-13-websocket-access-control',
    template: 'new',
    imageMap: {},
  },
  {
    id: '133',
    slug: '2026-08-22-crypto-evaluation-rule',
    template: 'old',
    imageMap: { '132-1.png': '/images/news/shared/132-1.webp' },
  },
  {
    id: '132',
    slug: '2026-08-18-civil-aviation-crypto-standard',
    template: 'old',
    imageMap: {
      '132-1.png': '/images/news/shared/132-1.webp',
      '132-2.jpeg': '/images/news/shared/132-2.webp',
      '132-3.png': '/images/news/shared/132-3.webp',
      '132-4.png': '/images/news/shared/132-4.webp',
    },
  },
  {
    id: '128',
    slug: '2026-05-30-password-defines-security',
    template: 'old',
    imageMap: { '126-1.png': '/images/news/shared/126-1.webp' },
  },
  {
    id: '127',
    slug: '2026-05-30-mlps-compliance',
    template: 'old',
    imageMap: { '83-1.png': '/images/news/shared/83-1.webp' },
  },
];

async function fetchText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return new TextDecoder('utf-8').decode(buffer);
}

function normalizeText(value) {
  return value.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n').trim();
}

function cleanupHtml($, root) {
  root.find('script, style, iframe, video, source, noscript').remove();
  root.find('span, font').each((_, element) => {
    const node = $(element);
    node.replaceWith(node.contents());
  });

  root.find('*').each((_, element) => {
    const node = $(element);
    const allowed = new Set(['href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'scope']);
    for (const attribute of Object.keys(element.attribs ?? {})) {
      if (!allowed.has(attribute)) node.removeAttr(attribute);
    }
  });

  root.find('p').each((_, element) => {
    const node = $(element);
    const text = normalizeText(node.text());
    if (!text && !node.find('img, table, pre').length) node.remove();
  });

  root.find('a').each((_, element) => {
    const node = $(element);
    const href = node.attr('href') ?? '';
    if (!href || href.startsWith('javascript:')) {
      node.replaceWith(node.contents());
      return;
    }
    if (href.startsWith('../news-details/')) {
      node.attr('href', '/news/');
    } else if (/^https?:\/\//.test(href)) {
      node.attr('target', '_blank');
      node.attr('rel', 'noopener noreferrer');
    }
  });
}

function rewriteImages($, root, item, title) {
  let index = 0;
  root.find('img').each((_, element) => {
    const node = $(element);
    const src = node.attr('src') ?? '';
    if (!src) {
      node.remove();
      return;
    }
    index += 1;
    const base = src.split('/').pop()?.split('?')[0] ?? '';
    const mapped = item.imageMap[base];
    if (mapped) {
      node.attr('src', mapped);
    } else if (src.startsWith('data:')) {
      node.remove();
      return;
    } else {
      node.attr('src', src.startsWith('http') ? src : new URL(src, BASE).href);
    }
    const alt = node.attr('alt')?.trim();
    node.attr('alt', alt || `${title} 配图 ${index}`);
  });
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
    .replace(/^\s*\|?\s*-{2,}\s*\|?\s*$/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function main() {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(INVENTORY_DIR, { recursive: true });

  const newsData = JSON.parse(await fetchText(new URL('newsData.json', BASE).href));
  const byPath = new Map(newsData.map((item) => [item.path, item]));
  const turndown = createTurndown();
  const report = [];

  for (const item of selected) {
    const legacyPath = `news-details/news-details${item.id}.html`;
    const meta = byPath.get(`news-details${item.id}.html`) ?? {};
    const html = await fetchText(new URL(legacyPath, BASE).href);
    const $ = cheerio.load(html, { decodeEntities: false });

    const bodyRoot = item.template === 'new' ? $('.news-content').first() : $('#detailBody').first();
    if (!bodyRoot.length) throw new Error(`${item.id}: body root not found`);

    const title =
      normalizeText(
        item.template === 'new'
          ? $('.news-article__title').first().text() || $('h1').first().text()
          : $('.subNewsTitle h3').first().text(),
      ) || meta.title;

    const pageText = normalizeText($('body').text());
    const dateMatch = pageText.match(/发布时间：\s*(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch?.[1] ?? (meta.date ?? '').match(/(\d{4}-\d{2}-\d{2})/)?.[1];
    if (!date) throw new Error(`${item.id}: date not found`);

    const sourceMatch =
      pageText.match(/出处为：\s*([^\s【]+)/) ?? pageText.match(/来源：\s*([^\s【]+)/);
    const source = sourceMatch?.[1]?.replace(/[，。；]$/, '').trim();

    cleanupHtml($, bodyRoot);
    rewriteImages($, bodyRoot, item, title);

    const bodyHtml = bodyRoot.html() ?? '';
    const markdown = postProcessMarkdown(turndown.turndown(bodyHtml));

    const frontmatterData = {
      title,
      date,
      summary: meta.description ?? '',
      ...(source ? { source } : {}),
      draft: false,
      legacyPath,
    };

    const output = matter.stringify(`${markdown}\n`, frontmatterData);
    await fs.writeFile(path.join(CONTENT_DIR, `${item.slug}.md`), output, 'utf8');

    report.push({
      id: item.id,
      slug: item.slug,
      title,
      date,
      source: source ?? '',
      markdownChars: markdown.length,
      images: (bodyHtml.match(/<img/g) ?? []).length,
      tables: (bodyHtml.match(/<table/g) ?? []).length,
      codeBlocks: (bodyHtml.match(/<pre/g) ?? []).length,
    });
    console.log(`converted ${item.slug} (${markdown.length} chars)`);
  }

  const publishedByLegacy = new Map(
    selected.map((item) => [`news-details/${item.slug}`, item.slug]),
  );

  const legacy = newsData.map((item) => {
    const id = item.path.match(/news-details(\d+)\.html/)?.[1] ?? item.path;
    const selectedItem = selected.find((entry) => entry.id === id);
    return {
      id,
      legacyPath: `news-details/${item.path}`,
      title: item.title,
      date: (item.date.match(/\d{4}-\d{2}-\d{2}/) ?? [''])[0],
      published: Boolean(selectedItem),
      slug: selectedItem?.slug ?? null,
      image: item.image ?? null,
    };
  });

  await fs.writeFile(
    path.join(DATA_DIR, 'legacy-news.json'),
    `${JSON.stringify(legacy, null, 2)}\n`,
    'utf8',
  );

  const csvHeader = 'id,slug,title,date,source,markdown_chars,images,tables,code_blocks';
  const csvRows = report.map((item) =>
    [item.id, item.slug, `"${item.title.replaceAll('"', '""')}"`, item.date, item.source, item.markdownChars, item.images, item.tables, item.codeBlocks].join(','),
  );
  await fs.writeFile(
    path.join(INVENTORY_DIR, 'published-news.csv'),
    `${[csvHeader, ...csvRows].join('\n')}\n`,
    'utf8',
  );

  console.log(`legacy news: ${legacy.length}; published: ${legacy.filter((item) => item.published).length}`);
  console.log(`publishedByLegacy: ${JSON.stringify([...publishedByLegacy.keys()])}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
