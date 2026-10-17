import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGES_DIR = path.join(ROOT, 'docs', 'content-inventory', 'pages');
const OUT = path.join(ROOT, 'docs', 'content-inventory', 'data', 'pages.json');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

const files = await walk(PAGES_DIR);
const pages = [];

for (const file of files.sort()) {
  const relative = path.relative(PAGES_DIR, file).replaceAll('\\', '/');
  const text = await fs.readFile(file, 'utf8');
  const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? relative;
  const route = text.match(/新路由\*\*[：:]\s*`([^`]+)`/)?.[1] ?? '';
  const sections = [...text.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
  pages.push({ file: relative, title, route, sections });
}

await fs.writeFile(OUT, `${JSON.stringify(pages, null, 2)}\n`, 'utf8');
console.log(`pages.json: ${pages.length} pages`);
