import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { ChevronLeft, Network, Sparkles, Layers, ShieldCheck } from "lucide-react";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { PageKnowledgeHub } from "@/components/knowledge/PageKnowledgeHub";

export const Route = createLazyFileRoute("/learn/graph")({
  component: GraphPage,
});

function GraphPage() {
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "en") as "en" | "ar" | "he";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      <Header />
      <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {locale === "ar" ? "العودة إلى مركز الاستكشاف" : locale === "he" ? "חזרה למרכז הגילוי" : "Back to Discovery"}
        </Link>

        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg">
              <Network className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold uppercase">
                {locale === "ar"
                  ? "مكشاف العلاقات المتقاطعة"
                  : locale === "he"
                    ? "רשת ידע מולטי-ממדית"
                    : "10-Dimensional Knowledge Engine"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white dir-auto">
                {locale === "ar"
                  ? "الرسم البياني للمعرفيات والعلوم الإسلامية"
                  : locale === "he"
                    ? "תרשים הידע האסלאמי המאוחד"
                    : "Dynamic Islamic Knowledge Graph"}
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 dir-auto max-w-3xl">
            {locale === "ar"
              ? "مستكشف تفاعلي يربط كل مفهوم وعنصر تلقائياً بـ 10 أبعاد رئيسية: القرآن، الحديث، التفسير، الأنبياء، العلماء، الموضوعات، القصص، الأماكن، الأحداث والمفردات."
              : locale === "he"
                ? "מפת ידע אינטראקטיבית המקשרת אוטומטית בין 10 ממדים: קוראן, חדית', תפסיר, נביאים, חכמים, נושאים, סיפורים, מקומות, איروעים ואוצר מילים."
                : "An interactive explorer automatically linking every entity across 10 core dimensions: Quran, Hadith, Tafsir, Prophets, Scholars, Topics, Stories, Places, Historical Events & Vocabulary."}
          </p>
        </header>

        {/* Embedded Page Knowledge Hub */}
        <PageKnowledgeHub
          locale={locale}
          title={
            locale === "ar"
              ? "مركز المعرفة الشامل والأبعاد الـ 10"
              : locale === "he"
                ? "מרכז הידע השלם ב-10 ממדים"
                : "Complete 10-Dimensional Knowledge Hub"
          }
        />
      </main>
    </div>
  );
}
