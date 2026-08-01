import { useState } from "react";
import {
  BookOpen,
  Bookmark,
  Share2,
  FileText,
  Columns,
  Check,
  Info,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TAFSIR_SOURCES_META,
  getTafsirMetaByKey,
  tafsirSourceName,
  type TafsirSourceKey,
  type TafsirSourceMeta,
} from "@/lib/tafsir-sources";
import { useTafsirUserStore } from "@/lib/tafsir-user-store";
import { ShareCardModal } from "@/components/ShareCardModal";
import { toast } from "sonner";

interface CompareItem {
  key: string;
  meta: TafsirSourceMeta | null;
  data: {
    body: string;
    lang: string;
  } | null;
}

interface TafsirCompareViewProps {
  surah: number;
  ayah: number;
  surahName?: string;
  arabicText?: string;
  translationText?: string;
  compareItems: CompareItem[];
  selectedSources: TafsirSourceKey[];
  onUpdateSources: (sources: TafsirSourceKey[]) => void;
  onOpenScholarBio: (meta: TafsirSourceMeta) => void;
  locale: "he" | "ar" | "en";
}

export function TafsirCompareView({
  surah,
  ayah,
  surahName = "Surah",
  arabicText,
  translationText,
  compareItems,
  selectedSources,
  onUpdateSources,
  onOpenScholarBio,
  locale,
}: TafsirCompareViewProps) {
  const { isBookmarked, saveBookmark } = useTafsirUserStore();
  const [shareItem, setShareItem] = useState<{ title: string; text: string } | null>(null);

  const isRtl = locale !== "en";

  const toggleSource = (key: TafsirSourceKey) => {
    if (selectedSources.includes(key)) {
      if (selectedSources.length <= 1) {
        toast.error(
          locale === "ar"
            ? "يجب اختيار تفسير واحد على الأقل للمقارنة"
            : locale === "he"
              ? "יש לבחור לפחות תפסיר אחד להשוואה"
              : "Keep at least one Tafsir selected",
        );
        return;
      }
      onUpdateSources(selectedSources.filter((s) => s !== key));
    } else {
      if (selectedSources.length >= 4) {
        toast.error(
          locale === "ar"
            ? "يمكنك مقارنة 4 تفاسير كحد أقصى في وقت واحد"
            : locale === "he"
              ? "ניתן להשוות עד 4 תפסיקים בו זמנית"
              : "You can compare up to 4 Tafsirs simultaneously",
        );
        return;
      }
      onUpdateSources([...selectedSources, key]);
    }
  };

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Top Source Selector Toolbar */}
      <div className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Columns className="h-4 w-4 text-primary" />
            <span>
              {locale === "ar"
                ? "مقارنة التفاسير جنباً إلى جنب"
                : locale === "he"
                  ? "השוואת תפסירים לצד זה"
                  : "Side-by-Side Tafsir Comparison Workspace"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {selectedSources.length}{" "}
            {locale === "ar"
              ? "تفاسير مختارة"
              : locale === "he"
                ? "תפסיקים שנבחרו"
                : "collections selected"}
          </span>
        </div>

        {/* Source Badges Selector */}
        <div className="flex flex-wrap gap-2 pt-1">
          {TAFSIR_SOURCES_META.map((source) => {
            const isSelected = selectedSources.includes(source.key);
            const name = tafsirSourceName(source, locale);
            return (
              <button
                key={source.key}
                type="button"
                onClick={() => toggleSource(source.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                    : "bg-secondary/50 text-muted-foreground border-border/60 hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5" />}
                <span>{name}</span>
                <span className="opacity-70 text-[10px]">({source.era.split("/")[0]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparative Grid */}
      <div
        className={`grid gap-4 ${
          selectedSources.length === 1
            ? "grid-cols-1"
            : selectedSources.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : selectedSources.length === 3
                ? "grid-cols-1 md:grid-cols-3"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {compareItems.map((item) => {
          const meta = item.meta ?? getTafsirMetaByKey(item.key);
          if (!meta) return null;

          const title = tafsirSourceName(meta, locale);
          const author =
            locale === "ar" ? meta.author_ar : locale === "en" ? meta.author_en : meta.author_he;
          const bookmarked = isBookmarked(surah, ayah, meta.key);
          const bodyText =
            item.data?.body ||
            (locale === "ar"
              ? "يتم تحميل التفسير المعتمد من المصادر العلمية..."
              : locale === "he"
                ? "טוען את התפסיר המאומת ממקורות המידע..."
                : "Loading authentic commentary passage...");

          return (
            <div
              key={meta.key}
              className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-3">
                  <div className="space-y-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.badgeColor}`}
                    >
                      {locale === "ar"
                        ? meta.methodologyLabel_ar
                        : locale === "he"
                          ? meta.methodologyLabel_he
                          : meta.methodologyLabel_en}
                    </span>
                    <h3 className="font-bold text-base text-foreground leading-snug">{title}</h3>
                    <p className="text-xs text-muted-foreground">{author}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenScholarBio(meta)}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                    title={
                      locale === "ar"
                        ? "ترجمة المفسر"
                        : locale === "he"
                          ? "ביוגרפיית המפרש"
                          : "Scholar Bio"
                    }
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>

                {/* Main Passage Text */}
                <div className="rounded-xl bg-secondary/20 p-4 border border-border/40 min-h-[160px]">
                  <p className="text-sm text-foreground/90 leading-relaxed font-serif whitespace-pre-line">
                    {bodyText}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
                <span className="font-mono text-[10px] uppercase">{meta.era}</span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      saveBookmark({
                        surah,
                        ayah,
                        sourceKey: meta.key,
                        surahName,
                      });
                      toast.success(
                        bookmarked
                          ? locale === "ar"
                            ? "تم إزالة التفسير من المحفوظات"
                            : "Removed from bookmarks"
                          : locale === "ar"
                            ? "تم حفظ التفسير في المفضلة"
                            : "Saved to bookmarks",
                      );
                    }}
                    className={`p-1.5 rounded-lg border transition-all ${
                      bookmarked
                        ? "bg-amber-500/20 text-amber-600 border-amber-500/40"
                        : "border-border/60 hover:bg-secondary text-muted-foreground"
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? "fill-amber-500" : ""}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShareItem({ title: `${title} (${surah}:${ayah})`, text: bodyText })
                    }
                    className="p-1.5 rounded-lg border border-border/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                    title="Share"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {shareItem && (
        <ShareCardModal
          isOpen={!!shareItem}
          onClose={() => setShareItem(null)}
          title={shareItem.title}
          arabicText={arabicText}
          translationText={shareItem.text}
          reference={`${surahName} ${surah}:${ayah}`}
          type="verse"
        />
      )}
    </div>
  );
}
