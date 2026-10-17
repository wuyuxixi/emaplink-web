import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const INVENTORY = path.join(ROOT, 'docs', 'content-inventory');
const ARCHIVE = path.join(INVENTORY, 'archive');
const DATA = path.join(INVENTORY, 'data');
const BASE = 'https://www.emaplink.com.cn/';

const published = new Map([
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

function normalize(value) {
  return value.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n').trim();
}

function csvEscape(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""').replace(/\r?\n/g, ' ')}"`;
}

function archiveHtml({ title, date, source, body }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow">
  <title>${title}（归档）</title>
  <style>
    body{font-family:"Microsoft YaHei",system-ui,sans-serif;max-width:52rem;margin:2rem auto;padding:0 1.25rem;line-height:1.8;color:#233545}
    h1{font-size:1.75rem;line-height:1.4;color:#0a1d2e}
    .meta{color:#5a6b7b;font-size:.875rem;margin-bottom:2rem}
    img{max-width:100%;height:auto}
    table{border-collapse:collapse;width:100%;font-size:.9rem}
    th,td{border:1px solid #dce5ec;padding:.5rem .625rem;text-align:left;vertical-align:top}
    pre{overflow:auto;background:#0d1b27;color:#e6edf3;padding:1rem;border-radius:.5rem}
    blockquote{border-left:3px solid #0062a2;margin-left:0;padding-left:1rem;color:#26465e}
  </style>
</head>
<body>
  <article>
    <h1>${title}</h1>
    <p class="meta">发布时间：${date}${source ? ` · 来源：${source}` : ''} · 归档稿，未发布</p>
    ${body}
  </article>
</body>
</html>
`;
}

async function main() {
  await fs.mkdir(ARCHIVE, { recursive: true });
  await fs.mkdir(DATA, { recursive: true });

  const newsData = JSON.parse(await fetchText(new URL('newsData.json', BASE).href));
  const rows = [];
  let archived = 0;

  for (let index = 0; index < newsData.length; index += 1) {
    const item = newsData[index];
    const id = item.path.match(/news-details(\d+)\.html/)?.[1] ?? item.path;
    const legacyPath = `news-details/${item.path}`;
    const isPublished = published.has(id);

    try {
      const html = await fetchText(new URL(legacyPath, BASE).href);
      const $ = cheerio.load(html, { decodeEntities: false });
      const template = $('.news-content').length ? 'new' : 'old';
      const bodyRoot = template === 'new' ? $('.news-content').first() : $('#detailBody').first();
      if (!bodyRoot.length) throw new Error('body root not found');

      const title =
        normalize(
          template === 'new'
            ? $('.news-article__title').first().text() || $('h1').first().text()
            : $('.subNewsTitle h3').first().text(),
        ) || item.title;

      const pageText = normalize($('body').text());
      const date = pageText.match(/发布时间：\s*(\d{4}-\d{2}-\d{2})/)?.[1] ?? (item.date.match(/\d{4}-\d{2}-\d{2}/) ?? [''])[0];
      const source =
        pageText.match(/出处为：\s*([^\s【]+)/)?.[1] ??
        pageText.match(/来源：\s*([^\s【]+)/)?.[1];

      const bodyText = normalize(bodyRoot.text());
      const images = bodyRoot.find('img').length;
      const tables = bodyRoot.find('table').length;
      const base64 = bodyRoot.html()?.includes('base64') ?? false;

      if (!isPublished) {
        const clone = bodyRoot.clone();
        clone.find('script, style, iframe, video, source, noscript').remove();
        clone.find('span, font').each((_, element) => {
          const node = $(element);
          if (node.closest('pre').length) return;
          node.replaceWith(node.contents());
        });
        clone.find('*').each((_, element) => {
          const node = $(element);
          for (const attribute of Object.keys(element.attribs ?? {})) {
            if (!['href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'scope', 'class'].includes(attribute)) {
              node.removeAttr(attribute);
            }
          }
        });
        const body = clone.html() ?? '';
        await fs.writeFile(
          path.join(ARCHIVE, `${id}.html`),
          archiveHtml({ title, date, source: source?.replace(/\s+/g, ''), body }),
          'utf8',
        );
        archived += 1;
      }

      rows.push({
        id,
        legacyPath,
        slug: published.get(id) ?? '',
        title,
        date,
        source: source ?? '',
        summary: item.description ?? '',
        originalCover: item.image ?? '',
        bodyChars: bodyText.length,
        images,
        tables,
        base64,
        template,
        published: isPublished,
        archive: isPublished ? '' : `archive/${id}.html`,
      });
      console.log(`[${index + 1}/${newsData.length}] ${id} ${isPublished ? 'published' : 'archived'}`);
    } catch (error) {
      rows.push({
        id,
        legacyPath,
        slug: published.get(id) ?? '',
        title: item.title,
        date: (item.date.match(/\d{4}-\d{2}-\d{2}/) ?? [''])[0],
        source: '',
        summary: item.description ?? '',
        originalCover: item.image ?? '',
        bodyChars: 0,
        images: 0,
        tables: 0,
        base64: false,
        template: 'error',
        published: isPublished,
        archive: '',
        error: String(error),
      });
      console.warn(`[${index + 1}/${newsData.length}] ${id} failed: ${error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const header = [
    'id',
    'legacy_path',
    'slug',
    'title',
    'date',
    'source',
    'summary',
    'original_cover',
    'body_chars',
    'images',
    'tables',
    'base64',
    'template',
    'published',
    'archive',
    'error',
  ];
  const csv = [
    header.join(','),
    ...rows.map((row) =>
      [
        row.id,
        row.legacyPath,
        row.slug,
        csvEscape(row.title),
        row.date,
        csvEscape(row.source),
        csvEscape(row.summary),
        row.originalCover,
        row.bodyChars,
        row.images,
        row.tables,
        row.base64,
        row.template,
        row.published,
        row.archive,
        csvEscape(row.error ?? ''),
      ].join(','),
    ),
  ].join('\n');
  await fs.writeFile(path.join(DATA, 'articles.csv'), `${csv}\n`, 'utf8');

  await fs.writeFile(
    path.join(ARCHIVE, 'README.md'),
    `# 未发布资讯归档\n\n本目录保存 ${archived} 篇尚未迁移为 Markdown 的资讯正文，仅用于内容留存与后续转换，不参与站点构建。\n\n- 已发布 5 篇见 \`src/content/news/\`。\n- 归档稿已移除脚本、样式、视频和内联事件属性，保留正文结构；图片仍指向原站相对路径。\n- 后续需要发布时，按 \`docs/adding-news.md\` 转为 Markdown，并补充 frontmatter。\n`,
    'utf8',
  );

  console.log(`\narticles: ${rows.length}; archived: ${archived}; published: ${rows.filter((row) => row.published).length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
