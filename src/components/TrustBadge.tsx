import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { normalizeLocale } from "@/lib/i18n";

interface Props {
  size?: "sm" | "md";
  variant?: "inline" | "block";
  className?: string;
}

const COPY = {
  he: {
    blockStrong: "תכנים ממקורות מאומתים בלבד.",
    blockBody:
      "פסוקי הקוראן הקדוש ותפסיר אסלאמי קלאסי. ללא פרשנות AI, ללא ספקולציות — אם אין מקור, המערכת לא עונה.",
    inline: "מקורות מאומתים בלבד",
  },
  ar: {
    blockStrong: "محتوى من مصادر موثّقة فقط.",
    blockBody:
      "آيات القرآن الكريم وتفسير إسلامي كلاسيكي. لا تفسيرات بالذكاء الاصطناعي، ولا تخمين — إن لم يوجد مصدر، لا يجيب النظام.",
    inline: "مصادر موثّقة فقط",
  },
  en: {
    blockStrong: "Content from authenticated sources only.",
    blockBody:
      "Verses of the Holy Quran and classical Islamic tafsir. No AI interpretation, no speculation — if there is no source, the system does not answer.",
    inline: "Authenticated sources only",
  },
} as const;

export function TrustBadge({ size = "sm", variant = "inline", className = "" }: Props) {
  const { i18n } = useTranslation();
  const lang = (normalizeLocale(i18n.language) as keyof typeof COPY) ?? "en";
  const c = COPY[lang] ?? COPY.en;

  if (variant === "block") {
    return (
      <div
        className={`flex items-start gap-3 rounded-2xl border border-white/60 bg-white/[0.03] px-4 py-3 ${className}`}
      >
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-white">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="text-[12.5px] leading-relaxed text-muted-foreground">
          <strong className="text-foreground/85">{c.blockStrong}</strong> {c.blockBody}
        </div>
      </div>
    );
  }

  const text = size === "md" ? "text-xs" : "text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/5 px-2.5 py-1 ${text} font-medium text-white ${className}`}
    >
      <ShieldCheck className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} />
      <span>{c.inline}</span>
    </span>
  );
}
