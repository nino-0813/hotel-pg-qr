import type { Frame, Decor, Overlay, Anchor } from "./frames";

type Ctx = CanvasRenderingContext2D;

export type ImageMap = Map<string, HTMLImageElement | null>;

export function drawFrameOverlay(
  ctx: Ctx,
  frame: Frame,
  images: ImageMap,
  size: number,
) {
  drawDecorBackground(ctx, frame.decor, size);
  for (const o of frame.overlays) {
    const img = images.get(o.src);
    if (!img) continue;
    drawSingleOverlay(ctx, img, o, size);
  }
  drawDecorForeground(ctx, frame.decor, size);
  if (frame.banner) drawBanner(ctx, frame.banner, size);
  if (frame.subtitle && frame.banner)
    drawSubtitle(ctx, frame.subtitle, frame.banner, size);
}

function drawSingleOverlay(
  ctx: Ctx,
  img: HTMLImageElement,
  o: Overlay,
  size: number,
) {
  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;
  if (!naturalW || !naturalH) return;

  let w: number;
  let h: number;
  if (o.width && !o.height) {
    w = o.width * size;
    h = (w / naturalW) * naturalH;
  } else if (o.height && !o.width) {
    h = o.height * size;
    w = (h / naturalH) * naturalW;
  } else if (o.width && o.height) {
    w = o.width * size;
    h = o.height * size;
  } else {
    w = naturalW;
    h = naturalH;
  }

  const px = o.x * size;
  const py = o.y * size;
  const anchor: Anchor = o.anchor ?? "tl";
  let dx = px;
  let dy = py;
  if (anchor[0] === "c") dy = py - h / 2;
  if (anchor[0] === "b") dy = py - h;
  if (anchor[1] === "c") dx = px - w / 2;
  if (anchor[1] === "r") dx = px - w;

  ctx.save();
  if (o.opacity !== undefined) ctx.globalAlpha = o.opacity;
  if (o.rotate || o.flip) {
    ctx.translate(dx + w / 2, dy + h / 2);
    if (o.rotate) ctx.rotate(o.rotate);
    if (o.flip) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  } else {
    ctx.drawImage(img, dx, dy, w, h);
  }
  ctx.restore();
}

function drawBanner(ctx: Ctx, banner: NonNullable<Frame["banner"]>, size: number) {
  const bannerH = size * 0.1;
  const y = banner.position === "bottom" ? size - bannerH : 0;

  ctx.save();
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = banner.bg;
  ctx.fillRect(0, y, size, bannerH);
  ctx.restore();

  ctx.fillStyle = banner.color;
  ctx.globalAlpha = 0.4;
  const accentY = banner.position === "bottom" ? y : y + bannerH;
  ctx.fillRect(0, accentY - 1, size, 2);
  ctx.globalAlpha = 1;

  ctx.fillStyle = banner.color;
  ctx.font = `800 ${size * 0.048}px "Hiragino Sans", "Yu Gothic", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(banner.text, size / 2, y + bannerH / 2);
}

function drawSubtitle(
  ctx: Ctx,
  text: string,
  banner: NonNullable<Frame["banner"]>,
  size: number,
) {
  const bannerH = size * 0.1;
  const y =
    banner.position === "bottom"
      ? size - bannerH - size * 0.04
      : bannerH + size * 0.03;
  ctx.font = `500 ${size * 0.024}px "Hiragino Sans", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const metrics = ctx.measureText(text);
  const padding = size * 0.015;
  const pillW = metrics.width + padding * 4;
  const pillH = size * 0.04;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect((size - pillW) / 2, y - pillH / 2, pillW, pillH);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, size / 2, y);
}

function drawDecorBackground(ctx: Ctx, decor: Decor | undefined, size: number) {
  if (!decor) return;
  switch (decor) {
    case "ship":
      drawShipStripes(ctx, size);
      break;
    case "certificate":
      drawCertificateBorder(ctx, size);
      break;
    case "stamp":
      drawStampBgTint(ctx, size);
      break;
  }
}

function drawDecorForeground(ctx: Ctx, decor: Decor | undefined, size: number) {
  if (!decor) return;
  switch (decor) {
    case "festival":
      drawFestivalConfetti(ctx, size);
      break;
    case "samurai":
      drawSamuraiStamps(ctx, size);
      break;
    case "cycle":
      drawCycleMedallion(ctx, size);
      break;
    case "go":
      drawGoStones(ctx, size);
      break;
    case "ship":
      drawShipWaves(ctx, size);
      break;
    case "stamp":
      drawStampPerf(ctx, size);
      drawPostmark(ctx, size);
      break;
    case "passport":
      drawPassportStamp(ctx, size);
      break;
    case "certificate":
      drawCertificateCorners(ctx, size);
      break;
  }
}

// ---------- festival ----------
function drawFestivalConfetti(ctx: Ctx, size: number) {
  const fruits: Array<[number, number, number]> = [
    [0.5, 0.04, 0.04],
    [0.18, 0.42, 0.035],
    [0.82, 0.4, 0.035],
  ];
  for (const [px, py, pr] of fruits) {
    drawHassakuFruit(ctx, size * px, size * py, size * pr);
  }
  for (const [fx, fy, fr] of [
    [0.35, 0.38, 0.022],
    [0.66, 0.42, 0.02],
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
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
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
function drawSamuraiStamps(ctx: Ctx, size: number) {
  const stamps: Array<[number, number, number]> = [
    [size * 0.1, size * 0.22, -0.08],
    [size * 0.22, size * 0.16, 0.1],
  ];
  for (const [cx, cy, rot] of stamps) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    const s = size * 0.07;
    ctx.fillStyle = "rgba(211, 47, 47, 0.95)";
    ctx.fillRect(-s / 2, -s, s, s * 2);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(0, -s * 0.3, s * 0.36, 0, Math.PI * 2);
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
function drawCycleMedallion(ctx: Ctx, size: number) {
  ctx.save();
  ctx.translate(size * 0.84, size * 0.22);
  ctx.rotate(0.12);
  ctx.fillStyle = "#0ea5e9";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = size * 0.008;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.085, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = `bold ${size * 0.026}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SHIMANAMI", 0, -size * 0.018);
  ctx.font = `900 ${size * 0.038}px sans-serif`;
  ctx.fillText("70 km", 0, size * 0.022);
  ctx.restore();
}

// ---------- go ----------
function drawGoStones(ctx: Ctx, size: number) {
  const stoneR = size * 0.035;
  const stones: Array<[number, number, "b" | "w"]> = [
    [size * 0.09, size * 0.16, "b"],
    [size * 0.18, size * 0.13, "w"],
    [size * 0.1, size * 0.26, "w"],
    [size * 0.9, size * 0.16, "b"],
    [size * 0.82, size * 0.22, "w"],
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
  const stripeW = size * 0.035;
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

function drawShipWaves(ctx: Ctx, size: number) {
  ctx.strokeStyle = "rgba(245, 197, 24, 0.55)";
  ctx.lineWidth = size * 0.006;
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    const baseY = size * (0.35 + pass * 0.04);
    for (let x = size * 0.06; x < size - size * 0.06; x += 4) {
      const y = baseY + Math.sin((x / size) * Math.PI * 6 + pass) * 6;
      if (x === size * 0.06) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

// ---------- stamp ----------
function drawStampBgTint(ctx: Ctx, size: number) {
  ctx.fillStyle = "rgba(245, 230, 211, 0.14)";
  ctx.fillRect(0, 0, size, size);
}

function drawStampPerf(ctx: Ctx, size: number) {
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
}

function drawPostmark(ctx: Ctx, size: number) {
  ctx.save();
  ctx.translate(size * 0.16, size * 0.84);
  ctx.rotate(-0.18);
  ctx.strokeStyle = "rgba(26,26,26,0.7)";
  ctx.lineWidth = size * 0.006;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.06, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(26,26,26,0.85)";
  ctx.font = `bold ${size * 0.018}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("INNOSHIMA", 0, -size * 0.02);
  const d = new Date();
  ctx.font = `bold ${size * 0.02}px sans-serif`;
  ctx.fillText(
    `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`,
    0,
    size * 0.012,
  );
  ctx.restore();
}

// ---------- passport ----------
function drawPassportStamp(ctx: Ctx, size: number) {
  ctx.save();
  ctx.translate(size * 0.35, size * 0.48);
  ctx.rotate(-0.18);
  ctx.strokeStyle = "rgba(220, 38, 38, 0.78)";
  ctx.lineWidth = size * 0.012;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(220, 38, 38, 0.78)";
  ctx.font = `900 ${size * 0.044}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ARRIVED", 0, -size * 0.03);
  ctx.fillText("IN INNOSHIMA", 0, size * 0.025);
  ctx.font = `bold ${size * 0.022}px sans-serif`;
  const d = new Date();
  ctx.fillText(
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`,
    0,
    size * 0.08,
  );
  ctx.restore();
}

// ---------- certificate ----------
function drawCertificateBorder(ctx: Ctx, size: number) {
  const m = size * 0.025;
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = size * 0.014;
  ctx.strokeRect(m, m, size - m * 2, size - m * 2);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = size * 0.003;
  const m2 = m * 1.8;
  ctx.strokeRect(m2, m2, size - m2 * 2, size - m2 * 2);
}

function drawCertificateCorners(ctx: Ctx, size: number) {
  const cs = size * 0.022;
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
