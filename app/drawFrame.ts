import type { Frame, Decor, CharacterPos } from "./frames";

type Ctx = CanvasRenderingContext2D;

export function drawFrameOverlay(
  ctx: Ctx,
  frame: Frame,
  character: HTMLImageElement | null,
  size: number,
) {
  drawDecorBackground(ctx, frame.decor, size);
  drawCharacter(ctx, character, frame.posePosition, frame.poseScale, size);
  drawDecorForeground(ctx, frame.decor, size);
  drawBanner(ctx, frame.banner, size);
  if (frame.subtitle) drawSubtitle(ctx, frame.subtitle, frame.banner, size);
}

function drawBanner(
  ctx: Ctx,
  banner: Frame["banner"],
  size: number,
) {
  const bannerH = size * 0.105;
  const y = banner.position === "bottom" ? size - bannerH : 0;

  ctx.save();
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = banner.bg;
  ctx.fillRect(0, y, size, bannerH);
  ctx.restore();

  // thin accent line at the inner edge
  ctx.fillStyle = banner.color;
  ctx.globalAlpha = 0.5;
  const accentY = banner.position === "bottom" ? y : y + bannerH;
  ctx.fillRect(0, accentY - 1, size, 2);
  ctx.globalAlpha = 1;

  ctx.fillStyle = banner.color;
  ctx.font = `800 ${size * 0.05}px "Hiragino Sans", "Yu Gothic", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(banner.text, size / 2, y + bannerH / 2);
}

function drawSubtitle(
  ctx: Ctx,
  text: string,
  banner: Frame["banner"],
  size: number,
) {
  const bannerH = size * 0.105;
  const y =
    banner.position === "bottom" ? size - bannerH - size * 0.04 : bannerH + size * 0.025;
  ctx.fillStyle = banner.color;
  ctx.globalAlpha = 0.85;
  ctx.font = `500 ${size * 0.025}px "Hiragino Sans", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // background pill
  const padding = size * 0.015;
  const metrics = ctx.measureText(text);
  const pillW = metrics.width + padding * 4;
  const pillH = size * 0.04;
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect((size - pillW) / 2, y - pillH / 2, pillW, pillH);
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 1;
  ctx.fillText(text, size / 2, y);
}

function drawCharacter(
  ctx: Ctx,
  img: HTMLImageElement | null,
  pos: CharacterPos,
  scale: number,
  size: number,
) {
  if (!img || !img.complete || img.naturalWidth === 0) return;
  const w = size * scale;
  const h = (w / img.naturalWidth) * img.naturalHeight;
  const margin = size * 0.025;
  let x: number;
  const y = size - h - margin;
  switch (pos) {
    case "bl":
      x = margin;
      break;
    case "bc":
      x = (size - w) / 2;
      break;
    case "br":
    default:
      x = size - w - margin;
      break;
  }
  ctx.drawImage(img, x, y, w, h);
}

function drawDecorBackground(ctx: Ctx, decor: Decor, size: number) {
  switch (decor) {
    case "ship":
      drawShipStripes(ctx, size);
      break;
    case "certificate":
      drawCertificateBorder(ctx, size);
      break;
    case "stamp":
      drawStampPerf(ctx, size);
      break;
  }
}

function drawDecorForeground(ctx: Ctx, decor: Decor, size: number) {
  switch (decor) {
    case "festival":
      drawFestivalDecor(ctx, size);
      break;
    case "samurai":
      drawSamuraiDecor(ctx, size);
      break;
    case "cycle":
      drawCycleDecor(ctx, size);
      break;
    case "go":
      drawGoDecor(ctx, size);
      break;
    case "ship":
      drawShipDecor(ctx, size);
      break;
    case "stamp":
      drawStampDecor(ctx, size);
      break;
    case "passport":
      drawPassportDecor(ctx, size);
      break;
    case "certificate":
      drawCertificateOrnaments(ctx, size);
      break;
  }
}

// ---------- festival ----------
function drawFestivalDecor(ctx: Ctx, size: number) {
  const fruits: Array<[number, number, number]> = [
    [0.08, 0.28, 0.06],
    [0.92, 0.32, 0.05],
    [0.06, 0.65, 0.045],
    [0.18, 0.5, 0.035],
    [0.94, 0.6, 0.04],
  ];
  for (const [px, py, pr] of fruits) {
    drawHassakuFruit(ctx, size * px, size * py, size * pr);
  }
  for (const [fx, fy, fr] of [
    [0.25, 0.4, 0.025],
    [0.78, 0.5, 0.022],
    [0.55, 0.2, 0.02],
  ] as const) {
    drawSimpleFlower(ctx, size * fx, size * fy, size * fr);
  }
}

function drawHassakuFruit(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.fillStyle = "#F5C518";
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#16a34a";
  ctx.beginPath();
  ctx.ellipse(
    cx + r * 0.45,
    cy - r * 0.85,
    r * 0.35,
    r * 0.55,
    0.6,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function drawSimpleFlower(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(
      cx + Math.cos(a) * r * 0.6,
      cy + Math.sin(a) * r * 0.6,
      r * 0.55,
      r * 0.3,
      a,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = "#F5C518";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
}

// ---------- samurai ----------
function drawSamuraiDecor(ctx: Ctx, size: number) {
  // Red "上" stamps in corners
  const stamps: Array<[number, number, number]> = [
    [size * 0.08, size * 0.22, -0.08],
    [size * 0.92, size * 0.22, 0.08],
  ];
  for (const [cx, cy, rot] of stamps) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    const s = size * 0.08;
    ctx.fillStyle = "rgba(211, 47, 47, 0.92)";
    ctx.fillRect(-s / 2, -s, s, s * 2);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(0, -s * 0.3, s * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#D32F2F";
    ctx.font = `bold ${s * 0.55}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("上", 0, -s * 0.3);
    ctx.restore();
  }
}

// ---------- cycle ----------
function drawCycleDecor(ctx: Ctx, size: number) {
  // Distance medallion top-left
  ctx.save();
  ctx.translate(size * 0.13, size * 0.22);
  ctx.rotate(-0.12);
  ctx.fillStyle = "#0ea5e9";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = size * 0.008;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.085, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = `bold ${size * 0.028}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SHIMANAMI", 0, -size * 0.018);
  ctx.font = `900 ${size * 0.04}px sans-serif`;
  ctx.fillText("70 km", 0, size * 0.02);
  ctx.restore();

  // Checker stripe at right edge
  const cw = size * 0.025;
  for (let y = size * 0.15; y < size - cw; y += cw) {
    const dark = Math.floor((y - size * 0.15) / cw) % 2 === 0;
    ctx.fillStyle = dark ? "#0a0a0a" : "#ffffff";
    ctx.fillRect(size - cw, y, cw, cw);
  }
}

// ---------- go ----------
function drawGoDecor(ctx: Ctx, size: number) {
  const stoneR = size * 0.04;
  const stones: Array<[number, number, "b" | "w"]> = [
    [size * 0.1, size * 0.22, "b"],
    [size * 0.18, size * 0.22, "w"],
    [size * 0.1, size * 0.3, "w"],
    [size * 0.92, size * 0.78, "b"],
  ];
  for (const [x, y, c] of stones) {
    ctx.fillStyle = c === "b" ? "#0a0a0a" : "#fafafa";
    ctx.beginPath();
    ctx.arc(x, y, stoneR, 0, Math.PI * 2);
    ctx.fill();
    if (c === "w") {
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}

// ---------- ship ----------
function drawShipStripes(ctx: Ctx, size: number) {
  const stripeW = size * 0.04;
  for (let y = 0; y < size; y += stripeW * 2) {
    ctx.fillStyle = "#F5C518";
    ctx.fillRect(0, y, stripeW, stripeW);
    ctx.fillStyle = "#0a1929";
    ctx.fillRect(0, y + stripeW, stripeW, stripeW);
    ctx.fillStyle = "#F5C518";
    ctx.fillRect(size - stripeW, y, stripeW, stripeW);
    ctx.fillStyle = "#0a1929";
    ctx.fillRect(size - stripeW, y + stripeW, stripeW, stripeW);
  }
}

function drawShipDecor(ctx: Ctx, size: number) {
  ctx.strokeStyle = "rgba(245, 197, 24, 0.7)";
  ctx.lineWidth = size * 0.008;
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    const baseY = size - size * (0.18 + pass * 0.04);
    for (let x = size * 0.04; x < size - size * 0.04; x += 4) {
      const y = baseY + Math.sin((x / size) * Math.PI * 6 + pass) * 6;
      if (x === size * 0.04) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

// ---------- stamp ----------
function drawStampPerf(ctx: Ctx, size: number) {
  // background tint to make perforations read
  ctx.fillStyle = "rgba(245, 230, 211, 0.18)";
  ctx.fillRect(0, 0, size, size);
}

function drawStampDecor(ctx: Ctx, size: number) {
  const dotR = size * 0.012;
  const step = dotR * 2.6;
  ctx.fillStyle = "#1a1a1a";
  for (let x = step / 2; x < size; x += step) {
    ctx.beginPath();
    ctx.arc(x, dotR * 1.2, dotR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, size - dotR * 1.2, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let y = step / 2; y < size; y += step) {
    ctx.beginPath();
    ctx.arc(dotR * 1.2, y, dotR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size - dotR * 1.2, y, dotR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Round postmark top-right
  ctx.save();
  ctx.translate(size * 0.82, size * 0.28);
  ctx.rotate(-0.18);
  ctx.strokeStyle = "rgba(26,26,26,0.7)";
  ctx.lineWidth = size * 0.006;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.085, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.062, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(26,26,26,0.8)";
  ctx.font = `bold ${size * 0.018}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("INNOSHIMA", 0, -size * 0.022);
  const d = new Date();
  ctx.font = `bold ${size * 0.022}px sans-serif`;
  ctx.fillText(
    `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`,
    0,
    size * 0.012,
  );
  ctx.restore();
}

// ---------- passport ----------
function drawPassportDecor(ctx: Ctx, size: number) {
  ctx.save();
  ctx.translate(size / 2, size * 0.45);
  ctx.rotate(-0.16);
  ctx.strokeStyle = "rgba(220, 38, 38, 0.78)";
  ctx.lineWidth = size * 0.012;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.27, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(220, 38, 38, 0.78)";
  ctx.font = `900 ${size * 0.055}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ARRIVED", 0, -size * 0.04);
  ctx.fillText("IN INNOSHIMA", 0, size * 0.035);
  ctx.font = `bold ${size * 0.025}px sans-serif`;
  const d = new Date();
  ctx.fillText(
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`,
    0,
    size * 0.1,
  );
  ctx.restore();
}

// ---------- certificate ----------
function drawCertificateBorder(ctx: Ctx, size: number) {
  const m = size * 0.025;
  // outer gold band
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = size * 0.014;
  ctx.strokeRect(m, m, size - m * 2, size - m * 2);
  // inner thin line
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = size * 0.003;
  const m2 = m * 1.8;
  ctx.strokeRect(m2, m2, size - m2 * 2, size - m2 * 2);
}

function drawCertificateOrnaments(ctx: Ctx, size: number) {
  const cs = size * 0.025;
  const corners: Array<[number, number]> = [
    [size * 0.06, size * 0.06],
    [size - size * 0.06, size * 0.06],
    [size * 0.06, size - size * 0.06],
    [size - size * 0.06, size - size * 0.06],
  ];
  for (const [cx, cy] of corners) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "#d4af37";
    ctx.fillRect(-cs, -cs, cs * 2, cs * 2);
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(-cs * 0.4, -cs * 0.4, cs * 0.8, cs * 0.8);
    ctx.restore();
  }
}
