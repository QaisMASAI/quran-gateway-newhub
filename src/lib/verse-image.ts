// Renders a beautifully designed PNG of an ayah (Arabic + Hebrew)
// using HTML5 Canvas. Multiple formats for social networks.

export type VerseImageFormat =
  | "square" // 1:1 — Instagram feed, generic
  | "story" // 9:16 — Instagram/WhatsApp/Facebook stories
  | "landscape" // 1.91:1 — Facebook/Twitter/LinkedIn/OG share
  | "portrait"; // 4:5 — Instagram portrait

export interface VerseImageInput {
  surah: number;
  ayah: number;
  surahName: string;
  arabic: string;
  hebrew: string;
  url?: string;
  format?: VerseImageFormat;
}

const DIMS: Record<VerseImageFormat, { w: number; h: number }> = {
  square: { w: 1200, h: 1200 },
  story: { w: 1080, h: 1920 },
  landscape: { w: 1200, h: 630 },
  portrait: { w: 1080, h: 1350 },
};

async function ensureFonts() {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const fonts = (document as any).fonts as FontFaceSet;
  // Sample strings include actual Arabic + Hebrew glyphs so the browser actually
  // fetches the right subsets — loading a Latin-only "test" string isn't enough.
  const arabicSample = "بِسْمِ اللَّهِ";
  const hebrewSample = "בשם אללה";
  try {
    await Promise.all([
      fonts.load('700 96px "Amiri Quran"', arabicSample),
      fonts.load('400 96px "Amiri Quran"', arabicSample),
      fonts.load('700 96px "Amiri"', arabicSample),
      fonts.load('500 40px "Heebo"', hebrewSample),
      fonts.load('600 28px "Heebo"', hebrewSample),
      fonts.load('700 32px "Heebo"', hebrewSample),
    ]);
    // Wait for the FontFaceSet to settle (handles already-in-flight loads).
    if ("ready" in fonts) await fonts.ready;
  } catch {
    /* fall through to whatever fonts are available */
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split(/\n+/);
  const lines: string[] = [];
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  family: string,
  weight: string,
  startSize: number,
  minSize: number,
  lineHeightRatio = 1.5,
): { size: number; lines: string[] } {
  let size = startSize;
  while (size >= minSize) {
    ctx.font = `${weight} ${size}px ${family}`;
    const lines = wrap(ctx, text, maxWidth);
    const total = lines.length * size * lineHeightRatio;
    if (total <= maxHeight) return { size, lines };
    size -= 2;
  }
  ctx.font = `${weight} ${minSize}px ${family}`;
  return { size: minSize, lines: wrap(ctx, text, maxWidth) };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderVerseImage(input: VerseImageInput): Promise<Blob> {
  await ensureFonts();
  const format = input.format ?? "square";
  const { w: W, h: H } = DIMS[format];
  const landscape = format === "landscape";

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background — warm parchment gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#FBF7EE");
  bg.addColorStop(1, "#EDE0C4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Decorative top/bottom bands
  ctx.fillStyle = "rgba(139,108,53,0.10)";
  ctx.fillRect(0, 0, W, 10);
  ctx.fillRect(0, H - 10, W, 10);

  // Card
  const pad = Math.round(Math.min(W, H) * 0.05);
  const cardX = pad;
  const cardY = pad;
  const cardW = W - pad * 2;
  const cardH = H - pad * 2;
  const r = Math.round(Math.min(W, H) * 0.03);

  ctx.save();
  ctx.shadowColor = "rgba(60,40,10,0.14)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = "#FFFDF8";
  roundRect(ctx, cardX, cardY, cardW, cardH, r);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "rgba(139,108,53,0.22)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, cardX, cardY, cardW, cardH, r);
  ctx.stroke();

  // Layout metrics
  const innerX = cardX + Math.round(cardW * 0.06);
  const innerW = cardW - Math.round(cardW * 0.12);

  // Header pill
  const headerH = Math.round(H * (landscape ? 0.13 : 0.07));
  const headerCenterY = cardY + headerH;
  const pillFontSize = Math.round(Math.min(W, H) * (landscape ? 0.035 : 0.024));
  ctx.font = `700 ${pillFontSize}px "Heebo", system-ui, sans-serif`;
  const label = `سورة ${input.surahName} · ${input.surah}:${input.ayah}`;
  const labelW = ctx.measureText(label).width + pillFontSize * 2;
  const pillH = pillFontSize * 2;
  const pillX = (W - labelW) / 2;
  ctx.fillStyle = "#8B6C35";
  roundRect(ctx, pillX, headerCenterY - pillH / 2, labelW, pillH, pillH / 2);
  ctx.fill();
  ctx.fillStyle = "#FFFDF8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, W / 2, headerCenterY);

  // Decorative dot divider (skip on tight landscape)
  if (!landscape) {
    ctx.strokeStyle = "rgba(139,108,53,0.35)";
    ctx.lineWidth = 1;
    const divY = headerCenterY + pillH;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 120, divY);
    ctx.lineTo(W / 2 + 120, divY);
    ctx.stroke();
    ctx.fillStyle = "#8B6C35";
    ctx.beginPath();
    ctx.arc(W / 2, divY, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Footer band reserve
  const footerReserve = Math.round(H * (landscape ? 0.18 : 0.12));

  // Content area
  const contentTop = headerCenterY + pillH + Math.round(H * (landscape ? 0.04 : 0.05));
  const contentBottom = cardY + cardH - footerReserve;
  const contentH = contentBottom - contentTop;

  // Split content between Arabic (~60%) and Hebrew (~40%)
  const arabicMaxH = contentH * 0.58;
  const hebrewMaxH = contentH * 0.36;

  // Arabic
  const arabicStart = Math.round(Math.min(W, H) * (landscape ? 0.08 : 0.085));
  const arabicMin = Math.round(arabicStart * 0.45);
  ctx.direction = "rtl" as CanvasDirection;
  const arabicFit = fitFont(
    ctx,
    input.arabic,
    innerW,
    arabicMaxH,
    '"Amiri Quran", "Amiri", serif',
    "700",
    arabicStart,
    arabicMin,
    1.55,
  );
  ctx.fillStyle = "#1F2937";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 ${arabicFit.size}px "Amiri Quran", "Amiri", serif`;
  const arLh = arabicFit.size * 1.55;
  const arabicBlockH = arabicFit.size + (arabicFit.lines.length - 1) * arLh;
  const arabicTop = contentTop + (arabicMaxH - arabicBlockH) / 2;
  arabicFit.lines.forEach((ln, i) => {
    ctx.fillText(ln, W / 2, arabicTop + arabicFit.size + i * arLh);
  });
  const arabicBottom = arabicTop + arabicBlockH;

  // Divider
  ctx.strokeStyle = "rgba(139,108,53,0.18)";
  ctx.beginPath();
  ctx.moveTo(innerX + innerW * 0.2, arabicBottom + contentH * 0.05);
  ctx.lineTo(innerX + innerW * 0.8, arabicBottom + contentH * 0.05);
  ctx.stroke();

  // Hebrew
  const hebStart = Math.round(Math.min(W, H) * (landscape ? 0.04 : 0.04));
  const hebMin = Math.round(hebStart * 0.5);
  const hebFit = fitFont(
    ctx,
    input.hebrew,
    innerW,
    hebrewMaxH,
    '"Heebo", system-ui, sans-serif',
    "500",
    hebStart,
    hebMin,
    1.55,
  );
  ctx.fillStyle = "#374151";
  ctx.font = `500 ${hebFit.size}px "Heebo", system-ui, sans-serif`;
  const hebLh = hebFit.size * 1.55;
  const hebTop = arabicBottom + contentH * 0.1;
  hebFit.lines.forEach((ln, i) => {
    ctx.fillText(ln, W / 2, hebTop + hebFit.size + i * hebLh);
  });

  // Footer brand
  ctx.direction = "ltr" as CanvasDirection;
  ctx.textAlign = "center";
  ctx.fillStyle = "#8B6C35";
  const brandSize = Math.round(Math.min(W, H) * (landscape ? 0.035 : 0.022));
  ctx.font = `700 ${brandSize}px "Heebo", system-ui, sans-serif`;
  const brandY = cardY + cardH - Math.round(H * (landscape ? 0.1 : 0.06));
  ctx.fillText("Noor Al-Quran · نور القرآن", W / 2, brandY);
  if (input.url) {
    const urlSize = Math.round(brandSize * 0.78);
    ctx.font = `400 ${urlSize}px "Heebo", system-ui, sans-serif`;
    ctx.fillStyle = "rgba(60,40,10,0.55)";
    ctx.fillText(input.url.replace(/^https?:\/\//, ""), W / 2, brandY + brandSize * 1.4);
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png", 0.95);
  });
}

export const FORMAT_LABELS: Record<VerseImageFormat, string> = {
  square: "מרובע · אינסטגרם / כללי",
  story: "סטורי · 9:16",
  landscape: "אופקי · פייסבוק / טוויטר",
  portrait: "פורטרט · אינסטגרם 4:5",
};
