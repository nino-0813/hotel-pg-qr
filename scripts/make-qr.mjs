import QRCode from "qrcode";
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const URL = process.env.QR_URL || "https://hotel-pg-qr.vercel.app/";
const SIZE = 1600;
const LOGO_BG_DIAMETER = Math.round(SIZE * 0.24);
const LOGO_SIZE = Math.round(LOGO_BG_DIAMETER * 0.82);

const variants = [
  {
    name: "qr.png",
    dark: "#000000",
    light: "#ffffff",
  },
  {
    name: "qr-red.png",
    dark: "#B91C1C",
    light: "#ffffff",
  },
];

const logoSrc = path.join(ROOT, "public/character.png");

for (const v of variants) {
  const qrBuffer = await QRCode.toBuffer(URL, {
    errorCorrectionLevel: "H",
    width: SIZE,
    margin: 2,
    color: { dark: v.dark, light: v.light },
  });

  const logoBuffer = await sharp(logoSrc)
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

  const out = path.join(ROOT, "public", v.name);
  await sharp(qrBuffer)
    .composite([
      { input: circleSvg, top: circleTop, left: circleLeft },
      { input: logoBuffer, top: logoTop, left: logoLeft },
    ])
    .png()
    .toFile(out);

  console.log(`✓ Generated ${out} (${v.dark} on ${v.light})`);
}

console.log(`\nQR URL: ${URL}`);
