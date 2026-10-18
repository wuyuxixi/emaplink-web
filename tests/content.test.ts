import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { newsSchema } from '../src/lib/news-schema';

const ROOT = path.resolve(import.meta.dirname, '..');
const NEWS_DIR = path.join(ROOT, 'src', 'content', 'news');
const PUBLIC_DIR = path.join(ROOT, 'public');

async function loadEntries() {
  const files = (await fs.readdir(NEWS_DIR)).filter((file) => file.endsWith('.md') && !file.startsWith('_'));
  return Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(NEWS_DIR, file), 'utf8');
      const parsed = matter(raw);
      return { file, data: parsed.data, content: parsed.content };
    }),
  );
}

describe('news content', () => {
  it('has all 121 published articles with valid frontmatter', async () => {
    const entries = await loadEntries();
    expect(entries).toHaveLength(121);

    for (const entry of entries) {
      const result = newsSchema.safeParse(entry.data);
      expect(result.success, `${entry.file}: ${result.success ? '' : result.error.message}`).toBe(true);
      if (result.success) {
        expect(result.data.draft).toBe(false);
        expect(result.data.summary.length).toBeLessThanOrEqual(300);
        expect(result.data.date.toString()).not.toBe('Invalid Date');
        expect(entry.content.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('uses unique legacy paths and resolves local images', async () => {
    const entries = await loadEntries();
    const legacyPaths = new Set<string>();

    for (const entry of entries) {
      const parsed = newsSchema.parse(entry.data);
      if (parsed.legacyPath) {
        expect(legacyPaths.has(parsed.legacyPath)).toBe(false);
        legacyPaths.add(parsed.legacyPath);
      }

      const images = new Set<string>();
      for (const match of entry.content.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)\)/g)) {
        images.add(match[1]);
      }
      for (const match of entry.content.matchAll(/<img[^>]+src="(\/images\/[^"]+)"/g)) {
        images.add(match[1]);
      }
      for (const image of images) {
        const file = path.join(PUBLIC_DIR, image.replace(/^\//, ''));
        await expect(fs.access(file), `missing image: ${image}`).resolves.toBeUndefined();
      }
    }

    expect(legacyPaths.size).toBe(121);
  });
});
