import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

async function optimizeFile(input, output) {
  await fs.mkdir(path.dirname(output), { recursive: true });
  const info = await sharp(input)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(output);
  const bytes = (await fs.stat(output)).size;
  console.log(
    `optimized: ${input} -> ${output} (${info.width}x${info.height}, ${Math.round(bytes / 1024)} KB)`,
  );
}

const [input, output] = process.argv.slice(2);

if (!input) {
  console.error('用法：pnpm optimize:image <图片或目录> [输出文件]');
  console.error('示例：pnpm optimize:image public/images/news/2026-11-05-my-news');
  process.exit(1);
}

const stat = await fs.stat(input);

if (stat.isDirectory()) {
  const files = (await fs.readdir(input))
    .filter((file) => /\.(png|jpe?g)$/i.test(file))
    .sort();
  if (!files.length) {
    console.error(`目录中没有 PNG/JPG：${input}`);
    process.exit(1);
  }
  for (const file of files) {
    const source = path.join(input, file);
    const target = path.join(input, file.replace(/\.(png|jpe?g)$/i, '.webp'));
    await optimizeFile(source, target);
  }
  console.log(`完成：${files.length} 张图片`);
} else {
  let target = output;
  if (!target) {
    target = input.replace(/\.(png|jpe?g)$/i, '.webp');
    if (target === input) target = `${input.replace(/\.(png|jpe?g)$/i, '')}-opt.webp`;
  }
  await optimizeFile(input, target);
}
