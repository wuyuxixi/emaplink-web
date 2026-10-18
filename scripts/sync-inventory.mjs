import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'docs', 'content-inventory', 'data');
const NEWS = path.join(ROOT, 'src', 'content', 'news');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function csvEscape(value) {
  return `"${String(value ?? '').replaceAll('"', '""').replace(/\r?\n/g, ' ')}"`;
}

const rawCsv = await fs.readFile(path.join(DATA, 'articles.csv'), 'utf8');
const rows = parseCsv(rawCsv);
const header = rows.shift();
const index = Object.fromEntries(header.map((name, position) => [name, position]));

const mdFiles = (await fs.readdir(NEWS)).filter((file) => file.endsWith('.md'));
const byLegacy = new Map();
const publishedRows = [];

for (const file of mdFiles) {
  const raw = await fs.readFile(path.join(NEWS, file), 'utf8');
  const parsed = matter(raw);
  const slug = file.replace(/\.md$/, '');
  if (parsed.data.legacyPath) byLegacy.set(parsed.data.legacyPath, slug);
  publishedRows.push({
    slug,
    title: parsed.data.title,
    date:
      parsed.data.date instanceof Date
        ? parsed.data.date.toISOString().slice(0, 10)
        : String(parsed.data.date).slice(0, 10),
    source: parsed.data.source ?? '',
    legacyPath: parsed.data.legacyPath ?? '',
    bodyChars: parsed.content.trim().length,
  });
}

let updated = 0;
for (const row of rows) {
  const legacyPath = row[index.legacy_path];
  const slug = byLegacy.get(legacyPath);
  if (slug) {
    row[index.published] = 'true';
    row[index.slug] = slug;
    updated += 1;
  } else {
    row[index.published] = 'false';
    row[index.slug] = '';
  }
}

const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
await fs.writeFile(path.join(DATA, 'articles.csv'), `${csv}\n`, 'utf8');

publishedRows.sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
const publishedCsv = [
  'slug,title,date,source,legacy_path,markdown_chars',
  ...publishedRows.map((row) =>
    [row.slug, row.title, row.date, row.source, row.legacyPath, row.bodyChars].map(csvEscape).join(','),
  ),
].join('\n');
await fs.writeFile(path.join(DATA, 'published-news.csv'), `${publishedCsv}\n`, 'utf8');

console.log(`articles.csv updated: ${updated} published / ${rows.length}`);
console.log(`published-news.csv: ${publishedRows.length} rows`);
