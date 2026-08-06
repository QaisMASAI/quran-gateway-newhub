import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  User,
  Layers,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import type { InterconnectedKnowledgeBundle } from "@/lib/knowledge-engine";
import { Badge } from "@/components/ui/badge";

interface Props {
  bundle: InterconnectedKnowledgeBundle;
  locale?: "he" | "ar" | "en";
  className?: string;
}

export function UnifiedKnowledgePanel({ bundle, locale = "he", className = "" }: Props) {
  const [activeTab, setActiveTab] = useState<"verses" | "tafsir" | "entities">(
    bundle.verses.length > 0
      ? "verses"
      : bundle.tafsirPassages.length > 0
      ? "tafsir"
      : "entities"
  );

  const isRtl = locale !== "en";

  const totalConnected =
    bundle.verses.length +
    bundle.tafsirPassages.length +
    bundle.prophets.length +
    bundle.topics.length;

  if (totalConnected === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xs p-5 shadow-xs space-y-4 ${className}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {locale === "ar"
                ? "شبكة المعرفة والإحالات المتقاطعة"
                : locale === "he"
                ? "רשת ידע והפניות צולבות"
                : "Interconnected Knowledge Graph"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {locale === "ar"
                ? `${totalConnected} مصادر إسلامية متصلة`
                : locale === "he"
                ? `${totalConnected} מקורות איסלאמיים מקושרים`
                : `${totalConnected} connected authentic sources`}
            </p>
          </div>
        </div>

        {/* Action Badges */}
        <Badge variant="outline" className="border-gold/30 bg-gold/5 text-gold-foreground text-[11px] gap-1">
          <ShieldCheck className="h-3 w-3 text-gold" />
          {locale === "ar" ? "توثيق معتمد" : locale === "he" ? "אימות מוסמך" : "Verified Sources"}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs border-b border-border/60 pb-2">
        {bundle.verses.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("verses")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-colors ${
              activeTab === "verses"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            {locale === "ar" ? "آيات قرأنية" : locale === "he" ? "פסוקים" : "Verses"}
            <span className="rounded-full bg-primary-soft/40 px-1.5 py-0.2 text-[10px]">
              {bundle.verses.length}
            </span>
          </button>
        )}

        {bundle.tafsirPassages.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("tafsir")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-colors ${
              activeTab === "tafsir"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            {locale === "ar" ? "تفاسير علماء" : locale === "he" ? "פרשנות תפסיר" : "Tafsir"}
            <span className="rounded-full bg-primary-soft/40 px-1.5 py-0.2 text-[10px]">
              {bundle.tafsirPassages.length}
            </span>
          </button>
        )}

        {(bundle.prophets.length > 0 || bundle.topics.length > 0) && (
          <button
            type="button"
            onClick={() => setActiveTab("entities")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-colors ${
              activeTab === "entities"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            {locale === "ar" ? "أنبياء ومواضيع" : locale === "he" ? "נביאים ונושאים" : "Prophets & Topics"}
            <span className="rounded-full bg-primary-soft/40 px-1.5 py-0.2 text-[10px]">
              {bundle.prophets.length + bundle.topics.length}
            </span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="pt-2 space-y-3">
        {/* Connected Verses */}
        {activeTab === "verses" && (
          <div className="space-y-3">
            {bundle.verses.map((v, idx) => (
              <div
                key={`${v.surah}:${v.ayah}:${idx}`}
                className="rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs hover:border-primary/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-primary">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" /> Verse {v.reference}
                  </span>
                  <Link
                    to="/tafsir/$surah/$ayah"
                    params={{ surah: String(v.surah), ayah: String(v.ayah) }}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                  >
                    {locale === "ar" ? "التفسير والتحليل" : locale === "he" ? "תפסיר וניתוח" : "Tafsir Analysis"}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                {v.arabic && (
                  <p className="font-quran text-right text-lg text-foreground leading-relaxed" dir="rtl">
                    {v.arabic}
                  </p>
                )}

                {v.translation && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {v.translation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Connected Tafsirs */}
        {activeTab === "tafsir" && (
          <div className="space-y-3">
            {bundle.tafsirPassages.map((t, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline" className="text-[10px] border-gold/40 text-gold font-semibold">
                    {t.source}
                  </Badge>
                  <Link
                    to="/tafsir/$surah/$ayah"
                    params={{ surah: String(t.surah), ayah: String(t.ayah) }}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Verse {t.surah}:{t.ayah}
                  </Link>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed font-reading-ar" dir="rtl">
                  {t.body.length > 280 ? `${t.body.slice(0, 280)}…` : t.body}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Connected Entities (Prophets & Topics) */}
        {activeTab === "entities" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {bundle.prophets.map((p) => (
              <Link
                key={p.slug}
                to="/prophets/$slug"
                params={{ slug: p.slug }}
                className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-card p-3 shadow-2xs hover:border-primary/50 transition-colors"
              >
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{p.title}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{p.summary}</p>
                </div>
              </Link>
            ))}

            {bundle.topics.map((t) => (
              <Link
                key={t.slug}
                to="/topics/$slug"
                params={{ slug: t.slug }}
                className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-card p-3 shadow-2xs hover:border-primary/50 transition-colors"
              >
                <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{t.title}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{t.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
