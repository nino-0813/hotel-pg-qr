import QRCode from "qrcode";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(PUBLIC, "qr");

const BASE_URL = process.env.QR_URL || "https://hotel-pg-qr.vercel.app";

const SIZE = 1600;
const LOGO_BG_DIAMETER = Math.round(SIZE * 0.22);
const LOGO_SIZE = Math.round(LOGO_BG_DIAMETER * 0.82);

// Frame IDs and labels — keep in sync with app/frames.ts
const frames = [
  { id: "hassaku", label: "はっさく祭り", dark: "#1a1a1a", pose: "02hassakun.png" },
  { id: "samurai", label: "水軍出陣", dark: "#7f1d1d", pose: "pose-samurai.png" },
  { id: "cycle", label: "しまなみ完走", dark: "#075985", pose: "12hassakun.png" },
  { id: "go", label: "秀策の一手", dark: "#3e2723", pose: "14igo.png" },
  { id: "ship", label: "出航記念", dark: "#0a1929", pose: "16zousen.png" },
  { id: "stamp", label: "因島切手", dark: "#7c2d12", pose: "shimagoto_02.png" },
  { id: "passport", label: "入国スタンプ", dark: "#1e3a8a", pose: "02hassakun.png" },
  { id: "certificate", label: "因島マスター", dark: "#7c5e10", pose: "shimagoto_02.png" },
  { id: "_index", label: "全フレーム一覧", dark: "#000000", pose: "shimagoto_02.png" },
];

await fs.mkdir(OUT, { recursive: true });

async function resolveLogo(poseFile) {
  const candidates = [
    path.join(PUBLIC, "frames", poseFile),
    path.join(PUBLIC, "character.png"),
  ];
  for (const c of candidates) {
    try {
      await fs.access(c);
      return c;
    } catch {
      // try next
    }
  }
  throw new Error("No character image found");
}

for (const f of frames) {
  const url = f.id === "_index" ? BASE_URL : `${BASE_URL}/?f=${f.id}`;
  const logoPath = await resolveLogo(f.pose);

  const qrBuffer = await QRCode.toBuffer(url, {
    errorCorrectionLevel: "H",
    width: SIZE,
    margin: 2,
    color: { dark: f.dark, light: "#ffffff" },
  });

  const logoBuffer = await sharp(logoPath)
    .resize(LOGO_SIZE, LOGO_SIZE, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toBuffer();

  const circleSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${LOGO_BG_DIAMETER}" height="${LOGO_BG_DIAMETER}">
      <circle cx="${LOGO_BG_DIAMETER / 2}" cy="${LOGO_BG_DIAMETER / 2}" r="${LOGO_BG_DIAMETER / 2}" fill="#ffffff"/>
    </svg>`,
  );

  const circleTop = Math.round((SIZE - LOGO_BG_DIAMETER) / 2);
  const circleLeft = Math.round((SIZE - LOGO_BG_DIAMETER) / 2);
  const logoTop = Math.round((SIZE - LOGO_SIZE) / 2);
  const logoLeft = Math.round((SIZE - LOGO_SIZE) / 2);

  const outFile = path.join(OUT, `${f.id}.png`);
  await sharp(qrBuffer)
    .composite([
      { input: circleSvg, top: circleTop, left: circleLeft },
      { input: logoBuffer, top: logoTop, left: logoLeft },
    ])
    .png()
    .toFile(outFile);

  console.log(`✓ qr/${f.id}.png  → ${url}  (${f.label})`);
}

console.log("\n✓ Done");
