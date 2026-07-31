// Renders a beautifully designed PNG of an ayah (Arabic + Translation)
// using HTML5 Canvas with 5 stunning Islamic themes and multiple social formats.

export type VerseImageFormat =
  | "square" // 1:1 — Instagram feed, generic
  | "story" // 9:16 — Instagram/WhatsApp/Facebook stories
  | "landscape" // 1.91:1 — Facebook/Twitter/LinkedIn/OG share
  | "portrait"; // 4:5 — Instagram portrait

export type VerseImageTheme =
  | "emerald" // Emerald Night & Gold Accents
  | "golden" // Warm Illuminated Parchment & Gold
  | "navy" // Midnight Royal Navy & Stars
  | "velvet" // Velvet Sunset & Deep Gold
  | "porcelain"; // Pure Modern Light Porcelain

export interface VerseImageInput {
  surah: number;
  ayah: number;
  surahName: string;
  arabic: string;
  hebrew?: string;
  english?: string;
  translation?: string;
  locale?: string;
  url?: string;
  format?: VerseImageFormat;
  theme?: VerseImageTheme;
}

const DIMS: Record<VerseImageFormat, { w: number; h: number }> = {
  square: { w: 1200, h: 1200 },
  story: { w: 1080, h: 1920 },
  landscape: { w: 1200, h: 630 },
  portrait: { w: 1080, h: 1350 },
};

export const THEMES_META: Record<
  VerseImageTheme,
  {
    nameEn: string;
    nameAr: string;
    nameHe: string;
    bgGradients: [string, string, string];
    cardBg: string;
    cardBorder: string;
    pillBg: string;
    pillText: string;
    arabicText: string;
    translationText: string;
    brandText: string;
    accentGlow: string;
  }
> = {
  emerald: {
    nameEn: "Emerald Night",
    nameAr: "الليل الزمردي",
    nameHe: "לילה אמרלד",
    bgGradients: ["#064E3B", "#022C22", "#011B14"],
    cardBg: "#06372B",
    cardBorder: "#D97706",
    pillBg: "#D97706",
    pillText: "#FFFDF8",
    arabicText: "#FDE68A",
    translationText: "#ECFDF5",
    brandText: "#FBBF24",
    accentGlow: "rgba(251, 191, 36, 0.15)",
  },
  golden: {
    nameEn: "Golden Parchment",
    nameAr: "المخطوطة الذهبية",
    nameHe: "קלף מוזהב",
    bgGradients: ["#FBF7EE", "#F3E8D2", "#E7D3A7"],
    cardBg: "#FFFDF8",
    cardBorder: "#B45309",
    pillBg: "#B45309",
    pillText: "#FFFDF8",
    arabicText: "#1F2937",
    translationText: "#4B5563",
    brandText: "#92400E",
    accentGlow: "rgba(180, 83, 9, 0.12)",
  },
  navy: {
    nameEn: "Midnight Navy",
    nameAr: "الكحلي الملكي",
    nameHe: "כחול חצות",
    bgGradients: ["#0F172A", "#1E1B4B", "#090D16"],
    cardBg: "#111827",
    cardBorder: "#F59E0B",
    pillBg: "#F59E0B",
    pillText: "#0F172A",
    arabicText: "#FDE68A",
    translationText: "#E2E8F0",
    brandText: "#FBBF24",
    accentGlow: "rgba(245, 158, 11, 0.2)",
  },
  velvet: {
    nameEn: "Velvet Sunset",
    nameAr: "المخمل الأرجواني",
    nameHe: "שקיעת קטיפה",
    bgGradients: ["#4C0519", "#310413", "#1C020A"],
    cardBg: "#370617",
    cardBorder: "#F59E0B",
    pillBg: "#F59E0B",
    pillText: "#4C0519",
    arabicText: "#FEF3C7",
    translationText: "#FFE4E6",
    brandText: "#FBBF24",
    accentGlow: "rgba(245, 158, 11, 0.2)",
  },
  porcelain: {
    nameEn: "Pure Porcelain",
    nameAr: "الخزف الناصع",
    nameHe: "פורצלן טהור",
    bgGradients: ["#F8FAFC", "#F1F5F9", "#E2E8F0"],
    cardBg: "#FFFFFF",
    cardBorder: "#0D9488",
    pillBg: "#0D9488",
    pillText: "#FFFFFF",
    arabicText: "#0F172A",
    translationText: "#334155",
    brandText: "#0F766E",
    accentGlow: "rgba(13, 148, 136, 0.12)",
  },
};

async function ensureFonts() {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const fonts = (document as { fonts?: FontFaceSet }).fonts;
  if (!fonts) return;
  const arabicSample = "بِسْمِ اللَّهِ";
  const textSample = "In the name of Allah • בשם אללה";
  try {
    await Promise.all([
      fonts.load('700 96px "KFGQPC Uthmanic Script HAFS"', arabicSample),
      fonts.load('400 96px "KFGQPC Uthmanic Script HAFS"', arabicSample),
      fonts.load('700 96px "Noto Naskh Arabic"', arabicSample),
      fonts.load('500 40px "Heebo"', textSample),
      fonts.load('600 28px "Heebo"', textSample),
      fonts.load('700 32px "Heebo"', textSample),
    ]);
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
  const themeKey = input.theme ?? "emerald";
  const theme = THEMES_META[themeKey];
  const { w: W, h: H } = DIMS[format];
  const landscape = format === "landscape";

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, theme.bgGradients[0]);
  bg.addColorStop(0.5, theme.bgGradients[1]);
  bg.addColorStop(1, theme.bgGradients[2]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Decorative top & bottom gold bands
  ctx.fillStyle = theme.pillBg;
  ctx.globalAlpha = 0.25;
  ctx.fillRect(0, 0, W, 12);
  ctx.fillRect(0, H - 12, W, 12);
  ctx.globalAlpha = 1.0;

  // Main Card
  const pad = Math.round(Math.min(W, H) * 0.05);
  const cardX = pad;
  const cardY = pad;
  const cardW = W - pad * 2;
  const cardH = H - pad * 2;
  const r = Math.round(Math.min(W, H) * 0.035);

  ctx.save();
  ctx.shadowColor = theme.accentGlow;
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = theme.cardBg;
  roundRect(ctx, cardX, cardY, cardW, cardH, r);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;
  roundRect(ctx, cardX, cardY, cardW, cardH, r);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // Inner Metrics
  const innerX = cardX + Math.round(cardW * 0.06);
  const innerW = cardW - Math.round(cardW * 0.12);

  // Header Surah Pill
  const headerH = Math.round(H * (landscape ? 0.13 : 0.07));
  const headerCenterY = cardY + headerH;
  const pillFontSize = Math.round(Math.min(W, H) * (landscape ? 0.035 : 0.024));
  ctx.font = `700 ${pillFontSize}px "KFGQPC Uthmanic Script HAFS", "Heebo", system-ui, sans-serif`;
  const label = `سورة ${input.surahName} · ${input.surah}:${input.ayah}`;
  const labelW = ctx.measureText(label).width + pillFontSize * 2.2;
  const pillH = pillFontSize * 2.2;
  const pillX = (W - labelW) / 2;

  ctx.fillStyle = theme.pillBg;
  roundRect(ctx, pillX, headerCenterY - pillH / 2, labelW, pillH, pillH / 2);
  ctx.fill();

  ctx.fillStyle = theme.pillText;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, W / 2, headerCenterY);

  // Divider line
  if (!landscape) {
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    const divY = headerCenterY + pillH;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 140, divY);
    ctx.lineTo(W / 2 + 140, divY);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = theme.brandText;
    ctx.beginPath();
    ctx.arc(W / 2, divY, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Footer Reserve
  const footerReserve = Math.round(H * (landscape ? 0.18 : 0.12));
  const contentTop = headerCenterY + pillH + Math.round(H * (landscape ? 0.04 : 0.05));
  const contentBottom = cardY + cardH - footerReserve;
  const contentH = contentBottom - contentTop;

  // Split content between Arabic (~60%) and Translation (~40%)
  const arabicMaxH = contentH * 0.58;
  const transMaxH = contentH * 0.36;

  // Arabic Ayah
  const arabicStart = Math.round(Math.min(W, H) * (landscape ? 0.08 : 0.085));
  const arabicMin = Math.round(arabicStart * 0.45);
  ctx.direction = "rtl" as CanvasDirection;
  const arLineRatio = 2.0;

  const arabicFit = fitFont(
    ctx,
    input.arabic,
    innerW,
    arabicMaxH,
    '"KFGQPC Uthmanic Script HAFS", "Noto Naskh Arabic", serif',
    "700",
    arabicStart,
    arabicMin,
    arLineRatio,
  );

  ctx.fillStyle = theme.arabicText;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 ${arabicFit.size}px "KFGQPC Uthmanic Script HAFS", "Noto Naskh Arabic", serif`;
  const arLh = arabicFit.size * arLineRatio;
  const arabicBlockH = arabicFit.size + (arabicFit.lines.length - 1) * arLh;
  const arabicTop = contentTop + (arabicMaxH - arabicBlockH) / 2;

  arabicFit.lines.forEach((ln, i) => {
    ctx.fillText(ln, W / 2, arabicTop + arabicFit.size + i * arLh);
  });
  const arabicBottom = arabicTop + arabicBlockH;

  // Divider
  ctx.strokeStyle = theme.cardBorder;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(innerX + innerW * 0.2, arabicBottom + contentH * 0.05);
  ctx.lineTo(innerX + innerW * 0.8, arabicBottom + contentH * 0.05);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // Translation (English, Hebrew, or provided translation)
  const translationText =
    input.translation || (input.locale === "en" ? input.english : input.hebrew) || input.english || input.hebrew || "";

  if (translationText) {
    const transStart = Math.round(Math.min(W, H) * (landscape ? 0.04 : 0.04));
    const transMin = Math.round(transStart * 0.5);
    const transFit = fitFont(
      ctx,
      translationText,
      innerW,
      transMaxH,
      '"Heebo", system-ui, sans-serif',
      "500",
      transStart,
      transMin,
      1.55,
    );

    ctx.fillStyle = theme.translationText;
    ctx.font = `500 ${transFit.size}px "Heebo", system-ui, sans-serif`;
    const transLh = transFit.size * 1.55;
    const transTop = arabicBottom + contentH * 0.1;
    transFit.lines.forEach((ln, i) => {
      ctx.fillText(ln, W / 2, transTop + transFit.size + i * transLh);
    });
  }

  // Footer Brand Branding
  ctx.direction = "ltr" as CanvasDirection;
  ctx.textAlign = "center";
  ctx.fillStyle = theme.brandText;
  const brandSize = Math.round(Math.min(W, H) * (landscape ? 0.035 : 0.022));
  ctx.font = `700 ${brandSize}px "Heebo", system-ui, sans-serif`;
  const brandY = cardY + cardH - Math.round(H * (landscape ? 0.1 : 0.06));
  ctx.fillText("Noor Al-Huda · نور الهدى", W / 2, brandY);

  if (input.url) {
    const urlSize = Math.round(brandSize * 0.78);
    ctx.font = `400 ${urlSize}px "Heebo", system-ui, sans-serif`;
    ctx.fillStyle = theme.brandText;
    ctx.globalAlpha = 0.75;
    ctx.fillText(input.url.replace(/^https?:\/\//, ""), W / 2, brandY + brandSize * 1.4);
    ctx.globalAlpha = 1.0;
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png", 0.95);
  });
}
