import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const PUBLIC = path.join(ROOT, 'public', 'images');
const MANIFEST = path.join(ROOT, 'src', 'data', 'image-manifest.json');
const REPORT = path.join(ROOT, 'docs', 'content-inventory', 'data', 'assets-downloaded.csv');
const BASE = 'https://www.emaplink.com.cn/';

const assets = [
  // 首页 Hero
  { url: 'images3/index/banner1.png', out: 'home/hero-1.webp', width: 1920, quality: 82 },
  { url: 'images/banner-2.png', out: 'home/hero-2.webp', width: 1920, quality: 82 },
  { url: 'images/banner-3.png', out: 'home/hero-3.webp', width: 1920, quality: 82 },

  // 产品
  { url: 'images3/products-insert/banner.png', out: 'products/zsac-gateway/banner.webp', width: 1600, quality: 84 },
  { url: 'images3/products-insert/bottom.png', out: 'products/zsac-gateway/diagram.webp', width: 1600, quality: 88 },
  { url: 'images3/products-insert/middle_bg.jpg', out: 'products/zsac-gateway/diagram-bg.webp', width: 1600, quality: 88, optional: true },
  { url: 'images3/products-app/banner.png', out: 'products/zsac-server/banner.webp', width: 1600, quality: 84 },
  { url: 'images3/products-app/bottom.png', out: 'products/zsac-server/diagram-alt.webp', width: 1600, quality: 88, optional: true },
  { url: 'images3/products-app/middle.png', out: 'products/zsac-server/diagram.webp', width: 1600, quality: 88, optional: true },
  { url: 'images3/products-model/banner.png', out: 'products/zsac-crypto-module/banner.webp', width: 1600, quality: 84 },
  { url: 'images3/products-model/ZSAC.png', out: 'products/zsac-crypto-module/diagram.webp', width: 1600, quality: 88, optional: true },
  { url: 'images3/products-model/1.png', out: 'products/zsac-crypto-module/gallery-1.webp', width: 1200, quality: 88, optional: true },
  { url: 'images3/products-model/2.png', out: 'products/zsac-crypto-module/gallery-2.webp', width: 1200, quality: 88, optional: true },
  { url: 'images3/products-model/3.png', out: 'products/zsac-crypto-module/gallery-3.webp', width: 1200, quality: 88, optional: true },
  { url: 'images3/products-model/4.png', out: 'products/zsac-crypto-module/gallery-4.webp', width: 1200, quality: 88, optional: true },
  { url: 'images3/products-dynamic/banner.png', out: 'products/zsac-otp/banner.webp', width: 1600, quality: 84 },

  // 解决方案
  { url: 'images3/programme-insert/banner.png', out: 'solutions/multi-terminal-access/banner.webp', width: 1600, quality: 84 },
  { url: 'images3/programme-insert/bg.png', out: 'solutions/multi-terminal-access/bg.webp', width: 1600, quality: 86, optional: true },
  { url: 'images3/programme-interactive/bg.jpg', out: 'solutions/data-exchange/banner.webp', width: 1600, quality: 84 },
  { url: 'images3/programme-app/banner.png', out: 'solutions/app-protection/banner.webp', width: 1600, quality: 84 },

  // 关于
  { url: 'images/qiyewenhua1.png', out: 'about/culture-1.webp', width: 1200, quality: 84 },
  { url: 'images/qiyewenhua3.png', out: 'about/culture-2.webp', width: 1200, quality: 84 },
  { url: 'images/con-1.png', out: 'about/contact-map.webp', width: 1200, quality: 86 },
  { url: 'images/about-banner.png', out: 'about/banner.webp', width: 1920, quality: 82, optional: true },

  // 荣誉资质（线上页面引用的 10 张）
  { url: 'attach/credentials/CN112948777B.png', out: 'about/credentials/patent-1.webp', width: 1200, quality: 86 },
  { url: 'attach/credentials/CN112565155B.png', out: 'about/credentials/patent-2.webp', width: 1200, quality: 86 },
  { url: 'attach/credentials/CN112559561B.png', out: 'about/credentials/patent-3.webp', width: 1200, quality: 86 },
  { url: 'attach/credentials/1.png', out: 'about/credentials/cert-1.webp', width: 1200, quality: 86 },
  { url: 'attach/credentials/5.JPG', out: 'about/credentials/cert-2.webp', width: 1200, quality: 86 },
  { url: 'attach/credentials/2025.png', out: 'about/credentials/high-tech-2025.webp', width: 1200, quality: 86 },
  { url: 'attach/credentials/ZSAC.png', out: 'about/credentials/zsac.webp', width: 1200, quality: 86 },
  { url: 'attach/credentials/ZSAC-ONE.png', out: 'about/credentials/zsac-one.webp', width: 1200, quality: 86 },
  { url: 'attach/credentials/ZSAC-MM.png', out: 'about/credentials/zsac-mm.webp', width: 1200, quality: 86 },
  { url: 'attach/credentials/ZSAC-OTP.png', out: 'about/credentials/zsac-otp.webp', width: 1200, quality: 86 },

  // 初版 5 篇资讯正文图
  { url: 'images3/news-details/132-1.png', out: 'news/shared/132-1.webp', width: 1200, quality: 86 },
  { url: 'images3/news-details/132-2.jpeg', out: 'news/shared/132-2.webp', width: 1200, quality: 86 },
  { url: 'images3/news-details/132-3.png', out: 'news/shared/132-3.webp', width: 1200, quality: 86 },
  { url: 'images3/news-details/132-4.png', out: 'news/shared/132-4.webp', width: 1200, quality: 86 },
  { url: 'images3/news-details/126-1.png', out: 'news/shared/126-1.webp', width: 1200, quality: 86 },
  { url: 'images3/news-details/83-1.png', out: 'news/shared/83-1.webp', width: 1200, quality: 86 },
];

async function download(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  await fs.mkdir(path.dirname(REPORT), { recursive: true });

  const results = [];
  const failures = [];

  for (const asset of assets) {
    const url = new URL(asset.url, BASE).href;
    const target = path.join(PUBLIC, asset.out);
    try {
      await fs.mkdir(path.dirname(target), { recursive: true });
      const buffer = await download(url);
      const image = sharp(buffer, { failOn: 'none' });
      const metadata = await image.metadata();
      const output = await image
        .rotate()
        .resize({ width: asset.width, withoutEnlargement: true })
        .webp({ quality: asset.quality, effort: 5 })
        .toBuffer();
      await fs.writeFile(target, output);
      const info = await sharp(output).metadata();
      results.push({
        source: url,
        local: `/images/${asset.out}`,
        width: info.width ?? metadata.width ?? null,
        height: info.height ?? metadata.height ?? null,
        bytes: output.length,
      });
      console.log(`ok ${asset.out} (${Math.round(output.length / 1024)} KB)`);
    } catch (error) {
      failures.push({ source: url, out: asset.out, error: String(error) });
      console.warn(`fail ${asset.out}: ${error}`);
    }
  }

  await fs.writeFile(
    MANIFEST,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), assets: results }, null, 2)}\n`,
  );

  const csv = [
    'source,local,width,height,bytes',
    ...results.map((item) => [item.source, item.local, item.width, item.height, item.bytes].join(',')),
  ].join('\n');
  await fs.writeFile(REPORT, `${csv}\n`);

  console.log(`\nDownloaded ${results.length}/${assets.length}; failures: ${failures.length}`);
  if (failures.length) {
    console.log(JSON.stringify(failures, null, 2));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
