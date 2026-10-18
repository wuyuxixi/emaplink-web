import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import matter from 'gray-matter';

const ROOT = path.resolve(import.meta.dirname, '..');
const NEWS_DIR = path.join(ROOT, 'src', 'content', 'news');
const PUBLIC_DIR = path.join(ROOT, 'public');
const CONVERTIBLE = /\.(png|jpe?g)$/i;
const NEWS_IMAGE_PREFIX = '/images/news/';

function collectRefs(content) {
  const refs = new Set();
  for (const match of content.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) refs.add(match[1]);
  for (const match of content.matchAll(/<img[^>]+src="([^"]+)"/g)) refs.add(match[1]);
  return refs;
}

async function listMarkdown() {
  return (await fs.readdir(NEWS_DIR)).filter((file) => file.endsWith('.md'));
}

/**
 * 把新闻 Markdown 引用到的 PNG/JPG 转成 WebP，更新 Markdown，成功后删除原图。
 * 只处理 /images/news/ 下的图片；缺图/损坏图会保留原图并记录 warning。
 */
export async function runAutoWebp({ log = true } = {}) {
  const files = await listMarkdown();
  const mappings = new Map();
  const warnings = [];
  let scanned = 0;

  for (const file of files) {
    const raw = await fs.readFile(path.join(NEWS_DIR, file), 'utf8');
    const parsed = matter(raw);
    const refs = collectRefs(parsed.content);
    if (typeof parsed.data.cover === 'string') refs.add(parsed.data.cover);

    for (const ref of refs) {
      scanned += 1;
      if (!ref.startsWith(NEWS_IMAGE_PREFIX) || !CONVERTIBLE.test(ref) || mappings.has(ref)) continue;

      const source = path.join(PUBLIC_DIR, ref.replace(/^\//, ''));
      const targetRef = ref.replace(CONVERTIBLE, '.webp');
      const target = path.join(PUBLIC_DIR, targetRef.replace(/^\//, ''));

      try {
        const stat = await fs.stat(source);
        if (!stat.isFile()) throw new Error('不是文件');
        await fs.mkdir(path.dirname(target), { recursive: true });
        await sharp(source, { failOn: 'none' })
          .rotate()
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 82, effort: 5 })
          .toFile(target);
        const targetStat = await fs.stat(target);
        if (!targetStat.size) throw new Error('WebP 输出为空');
        mappings.set(ref, targetRef);
      } catch (error) {
        warnings.push({ ref, reason: String(error.message ?? error) });
      }
    }
  }

  if (mappings.size === 0) {
    if (log && warnings.length) {
      console.warn(`auto-webp: ${warnings.length} 张图片无法转换，已保留原图`);
      for (const warning of warnings.slice(0, 10)) console.warn(`  - ${warning.ref}: ${warning.reason}`);
    }
    return { converted: 0, updated: 0, deleted: 0, warnings };
  }

  let updated = 0;
  for (const file of files) {
    const filePath = path.join(NEWS_DIR, file);
    const raw = await fs.readFile(filePath, 'utf8');
    let next = raw;
    for (const [oldRef, newRef] of mappings) {
      if (next.includes(oldRef)) next = next.split(oldRef).join(newRef);
    }
    if (next !== raw) {
      await fs.writeFile(filePath, next, 'utf8');
      updated += 1;
    }
  }

  let deleted = 0;
  for (const oldRef of mappings.keys()) {
    const source = path.join(PUBLIC_DIR, oldRef.replace(/^\//, ''));
    try {
      await fs.rm(source);
      deleted += 1;
    } catch (error) {
      warnings.push({ ref: oldRef, reason: `原图删除失败：${String(error.message ?? error)}` });
    }
  }

  if (log) {
    console.log(`auto-webp: 转换 ${mappings.size} 张，更新 ${updated} 个 Markdown，删除 ${deleted} 张原图`);
    if (warnings.length) {
      console.warn(`auto-webp: ${warnings.length} 张图片保留原图`);
      for (const warning of warnings.slice(0, 10)) console.warn(`  - ${warning.ref}: ${warning.reason}`);
    }
  }

  return { converted: mappings.size, updated, deleted, warnings };
}

const isCli = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isCli) {
  runAutoWebp().catch((error) => {
    console.error('auto-webp failed:', error);
    process.exitCode = 1;
  });
}
