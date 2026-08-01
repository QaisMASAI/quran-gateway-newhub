import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BookOpen, Calendar, MapPin, Award, ScrollText, CheckCircle2 } from "lucide-react";
import type { TafsirSourceMeta } from "@/lib/tafsir-sources";

interface TafsirScholarBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  meta: TafsirSourceMeta | null;
  locale: "he" | "ar" | "en";
}

export function TafsirScholarBioModal({
  isOpen,
  onClose,
  meta,
  locale,
}: TafsirScholarBioModalProps) {
  if (!meta) return null;
  const isRtl = locale !== "en";

  const author =
    locale === "ar" ? meta.author_ar : locale === "en" ? meta.author_en : meta.author_he;
  const summary =
    locale === "ar"
      ? meta.scholarBio.summary_ar
      : locale === "en"
        ? meta.scholarBio.summary_en
        : meta.scholarBio.summary_he;
  const description =
    locale === "ar"
      ? meta.description_ar
      : locale === "en"
        ? meta.description_en
        : meta.description_he;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-3xl p-6" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader className="space-y-2 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${meta.badgeColor}`}
            >
              {locale === "ar"
                ? meta.methodologyLabel_ar
                : locale === "he"
                  ? meta.methodologyLabel_he
                  : meta.methodologyLabel_en}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{meta.era}</span>
          </div>

          <DialogTitle className="text-xl font-bold text-foreground">
            {locale === "ar" ? meta.name_ar : locale === "en" ? meta.name_en : meta.name_he}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-primary">
            {author}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-border/60 bg-secondary/40 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>
                  {locale === "ar" ? "سنوات الحياة" : locale === "he" ? "תקופת חיים" : "Lifespan"}
                </span>
              </div>
              <p className="font-semibold text-foreground">{meta.scholarBio.birthDeath}</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-secondary/40 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>
                  {locale === "ar"
                    ? "مكان النشأة والعمل"
                    : locale === "he"
                      ? "מקום פעילות"
                      : "Origin"}
                </span>
              </div>
              <p className="font-semibold text-foreground">{meta.scholarBio.birthplace}</p>
            </div>
          </div>

          {/* Biography & Scholarly Impact */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ScrollText className="h-4 w-4 text-primary" />
              <span>
                {locale === "ar"
                  ? "السيرة العلمية والأثر"
                  : locale === "he"
                    ? "ביוגרפיה ומורשת"
                    : "Scholarly Biography & Method"}
              </span>
            </h4>
            <p className="text-sm text-foreground/90 leading-relaxed rounded-xl bg-card p-4 border border-border/50">
              {summary}
            </p>
          </div>

          {/* Book Scope */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>
                {locale === "ar"
                  ? "منهج الكتاب وطبيعته"
                  : locale === "he"
                    ? "שיטת התפסיר"
                    : "Book Methodology"}
              </span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>

          {/* Notable Works */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" />
              <span>
                {locale === "ar"
                  ? "أبرز المؤلفات والآثار"
                  : locale === "he"
                    ? "יצירות בולטות"
                    : "Notable Works"}
              </span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {meta.scholarBio.keyWorks.map((work) => (
                <span
                  key={work}
                  className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-medium text-foreground border border-border/60"
                >
                  {work}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
