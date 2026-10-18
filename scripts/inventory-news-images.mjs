import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const NEWS_IMAGES = path.join(ROOT, 'public', 'images', 'news');
const OUT = path.join(ROOT, 'docs', 'content-inventory', 'data', 'news-images.csv');

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

const files = (await walk(NEWS_IMAGES)).filter((file) => /\.(webp|png|jpe?g|gif)$/i.test(file)).sort();
const rows = [];

for (const file of files) {
  const metadata = await sharp(file).metadata();
  rows.push({
    path: `/${path.relative(path.join(ROOT, 'public'), file).replaceAll('\\', '/')}`,
    width: metadata.width ?? '',
    height: metadata.height ?? '',
    bytes: (await fs.stat(file)).size,
  });
}

const csv = [
  'path,width,height,bytes',
  ...rows.map((row) => [row.path, row.width, row.height, row.bytes].join(',')),
].join('\n');
await fs.writeFile(OUT, `${csv}\n`, 'utf8');
console.log(`news-images.csv: ${rows.length} images`);
