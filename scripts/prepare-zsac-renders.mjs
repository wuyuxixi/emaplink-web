import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = path.resolve("docs/design/zsac/render-masters");
const output = path.resolve("public/images/products/zsac-gateway/renders");
const names = ["gateway", "phone", "drone", "camera", "helmet"];
await fs.mkdir(output, { recursive: true });
const report = [];
for (const name of names) {
  const input = path.join(source, `${name}.png`);
  const metadata = await sharp(input).metadata();
  if (!metadata.hasAlpha) throw new Error(`${name} requires transparent alpha`);
  const sizes = name === "gateway" ? [480, 800, 1200] : [240, 480, 720];
  for (const width of sizes) {
    const file = `${name}-${width}.webp`;
    const result = await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 94, effort: 6 })
      .toFile(path.join(output, file));
    report.push({
      file,
      width: result.width,
      height: result.height,
      bytes: result.size,
    });
  }
}
await fs.writeFile(
  path.join(source, "delivery-manifest.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report));
