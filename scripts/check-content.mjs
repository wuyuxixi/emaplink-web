import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { newsSchema } from '../src/lib/news-schema.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const NEWS_DIR = path.join(ROOT, 'src', 'content', 'news');
const PUBLIC_DIR = path.join(ROOT, 'public');
const LEGACY_FILE = path.join(ROOT, 'src', 'data', 'legacy-news.json');

const files = (await fs.readdir(NEWS_DIR))
  .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
  .sort();

const errors = [];
const warnings = [];
const published = [];
const drafts = [];
const legacyPaths = new Set();

let legacy = [];
try {
  legacy = JSON.parse(await fs.readFile(LEGACY_FILE, 'utf8'));
} catch {
  warnings.push('src/data/legacy-news.json 不存在；旧 URL 将只按已发布 MD 的 legacyPath 映射。');
}
const knownLegacyPaths = new Set(legacy.map((item) => item.legacyPath));

function publicFileExists(urlPath) {
  if (!urlPath || !urlPath.startsWith('/')) return true;
  const file = path.join(PUBLIC_DIR, urlPath.replace(/^\//, ''));
  return fs
    .access(file)
    .then(() => true)
    .catch(() => false);
}

for (const file of files) {
  const fullPath = path.join(NEWS_DIR, file);
  const raw = await fs.readFile(fullPath, 'utf8');
  let parsed;
  try {
    parsed = matter(raw);
  } catch (error) {
    errors.push(`${file}: frontmatter 解析失败：${error.message}`);
    continue;
  }

  const result = newsSchema.safeParse(parsed.data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${file}: ${issue.path.join('.') || 'frontmatter'} - ${issue.message}`);
    }
    continue;
  }

  const data = result.data;
  if (data.draft) {
    drafts.push(file);
  } else {
    published.push({ file, data });
  }

  if (data.legacyPath) {
    if (legacyPaths.has(data.legacyPath)) {
      errors.push(`${file}: legacyPath 重复：${data.legacyPath}`);
    }
    legacyPaths.add(data.legacyPath);
    if (knownLegacyPaths.size > 0 && !knownLegacyPaths.has(data.legacyPath)) {
      warnings.push(`${file}: legacyPath 不在已抓取的 121 条旧 URL 中：${data.legacyPath}`);
    }
  }

  if (data.cover && !(await publicFileExists(data.cover))) {
    errors.push(`${file}: cover 文件不存在：${data.cover}`);
  }

  const imageRefs = new Set();
  for (const match of parsed.content.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)\)/g)) {
    imageRefs.add(match[1]);
  }
  for (const match of parsed.content.matchAll(/<img[^>]+src="(\/images\/[^"]+)"/g)) {
    imageRefs.add(match[1]);
  }
  for (const image of imageRefs) {
    if (!(await publicFileExists(image))) {
      errors.push(`${file}: 正文图片不存在：${image}`);
    }
  }

  if (!parsed.content.trim()) {
    errors.push(`${file}: 正文为空`);
  }
}

if (published.length < 5) {
  errors.push(`已发布资讯只有 ${published.length} 篇，初版要求至少 5 篇。`);
}

console.log(`资讯文件：${files.length}；已发布：${published.length}；草稿：${drafts.length}`);
console.log('已发布：');
for (const item of published) {
  console.log(`  - ${item.file}  ${item.data.date.toISOString().slice(0, 10)}  ${item.data.title}`);
}
if (drafts.length) {
  console.log(`草稿：${drafts.join(', ')}`);
}

if (warnings.length) {
  console.log('\n警告：');
  for (const warning of warnings) console.log(`  ! ${warning}`);
}

if (errors.length) {
  console.error(`\n发现 ${errors.length} 个错误：`);
  for (const error of errors) console.error(`  ✗ ${error}`);
  process.exitCode = 1;
} else {
  console.log('\n内容校验通过。');
}
