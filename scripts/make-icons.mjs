import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const BG = "#dc2626";
const CHARACTER = path.join(PUBLIC, "character.png");

async function makeIcon(size, outName, padding = 0.12) {
  const inner = Math.round(size * (1 - padding * 2));
  const offset = Math.round((size - inner) / 2);

  const charBuffer = await sharp(CHARACTER)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: charBuffer, top: offset, left: offset }])
    .png()
    .toFile(path.join(PUBLIC, outName));

  console.log(`✓ ${outName} (${size}x${size})`);
}

async function makeSplash(width, height, outName) {
  const dim = Math.min(width, height);
  const charSize = Math.round(dim * 0.5);

  const charBuffer = await sharp(CHARACTER)
    .resize(charSize, charSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  const charLeft = Math.round((width - charSize) / 2);
  const charTop = Math.round((height - charSize) / 2 - dim * 0.05);

  const fontSize = Math.round(width * 0.08);
  const subFontSize = Math.round(width * 0.035);
  const textY = charTop + charSize + Math.round(dim * 0.08);
  const subTextY = textY + Math.round(fontSize * 1.2);

  const textSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <text x="${width / 2}" y="${textY}" text-anchor="middle" fill="white"
        font-family="-apple-system, sans-serif" font-size="${fontSize}"
        font-weight="800" letter-spacing="${Math.round(fontSize * 0.15)}">HOTEL PG</text>
      <text x="${width / 2}" y="${subTextY}" text-anchor="middle" fill="white" opacity="0.85"
        font-family="-apple-system, 'Hiragino Sans', sans-serif" font-size="${subFontSize}"
        font-weight="500" letter-spacing="${Math.round(subFontSize * 0.3)}">記念撮影</text>
    </svg>`,
  );

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: BG,
    },
  })
    .composite([
      { input: charBuffer, top: charTop, left: charLeft },
      { input: textSvg, top: 0, left: 0 },
    ])
    .png()
    .toFile(path.join(PUBLIC, outName));

  console.log(`✓ ${outName} (${width}x${height})`);
}

console.log("→ Generating home-screen icons");
await makeIcon(180, "apple-touch-icon.png", 0.1);
await makeIcon(192, "icon-192.png", 0.12);
await makeIcon(512, "icon-512.png", 0.12);
await makeIcon(192, "icon-maskable-192.png", 0.22);
await makeIcon(512, "icon-maskable-512.png", 0.22);
await makeIcon(32, "favicon-32.png", 0.05);

console.log("\n→ Generating iOS splash screens");
const splashes = [
  [1290, 2796, "splash-1290x2796.png"], // iPhone 16 Pro Max, 15 Pro Max, 14 Pro Max
  [1179, 2556, "splash-1179x2556.png"], // iPhone 16 Pro, 15 Pro, 15, 14 Pro
  [1170, 2532, "splash-1170x2532.png"], // iPhone 14, 13, 13 Pro, 12, 12 Pro
  [1125, 2436, "splash-1125x2436.png"], // iPhone XS, X, 11 Pro
  [1284, 2778, "splash-1284x2778.png"], // iPhone 12/13/14 Pro Max
  [828, 1792, "splash-828x1792.png"], // iPhone XR, 11
  [750, 1334, "splash-750x1334.png"], // iPhone SE 2/3, 8, 7, 6
];

for (const [w, h, name] of splashes) {
  await makeSplash(w, h, name);
}

console.log("\n✓ Done");
