import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import i18n, { normalizeLocale } from "@/lib/i18n";

export const Route = createFileRoute("/learn/tafsir-ibn-kathir")({
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    const copy =
      locale === "ar"
        ? {
            title: "تفسير ابن كثير: منهج وقراءة عملية | نور القرآن والحديث",
            description:
              "دليل موجز لفهم تفسير ابن كثير: منهجه في التفسير بالمأثور، التعامل مع الروايات، وكيفية القراءة مع الجلالين وسياق النزول.",
            h1: "دليل تفسير ابن كثير",
            intro:
              "هذا الدليل يشرح كيف يقرأ طالب العلم تفسير ابن كثير قراءة منهجية، مع ضبط الاستدلال وربط الآيات بالسياق.",
          }
        : locale === "en"
          ? {
              title: "Tafsir Ibn Kathir Guide: Method & Study Path | Noor Quran & Hadith",
              description:
                "A practical guide to Tafsir Ibn Kathir: narration-based method, source evaluation, and how to study it alongside Jalalayn and asbab al-nuzul.",
              h1: "Tafsir Ibn Kathir Guide",
              intro:
                "This guide explains how to study Tafsir Ibn Kathir with a grounded method while keeping verse context and source reliability central.",
            }
          : {
              title: "מדריך תפסיר אבן כת'יר: שיטה ונתיב לימוד | נור קוראן וחדית'",
              description:
                "מדריך מעשי ללימוד תפסיר אבן כת'יר: שיטת פירוש מבוססת מסורות, בחינת מקורות, ושילוב עם ג'לאלין וסיבות הירידה.",
              h1: "מדריך תפסיר אבן כת'יר",
              intro:
                "המדריך מסביר איך ללמוד את אבן כת'יר באופן שיטתי, עם דגש על הקשר הפסוקים ואמינות המקורות.",
            };

    const url = "/learn/tafsir-ibn-kathir";
    return {
      meta: [
        { title: copy.title },
        { name: "description", content: copy.description },
        { property: "og:title", content: copy.title },
        { property: "og:description", content: copy.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: copy.title },
        { name: "twitter:description", content: copy.description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: copy.h1,
            description: copy.description,
            url,
          }),
        },
      ],
    };
  },
  component: TafsirIbnKathirPage,
});

function TafsirIbnKathirPage() {
  const locale = normalizeLocale(i18n.language) ?? "he";
  const isRtl = locale !== "en";
  const copy =
    locale === "ar"
      ? {
          h1: "دليل تفسير ابن كثير",
          intro:
            "هذا الدليل يشرح كيف يقرأ طالب العلم تفسير ابن كثير قراءة منهجية، مع ضبط الاستدلال وربط الآيات بالسياق.",
          bullets: [
            "الأساس: تفسير القرآن بالقرآن ثم بالسنة ثم بأقوال السلف.",
            "التثبّت من الأسانيد والروايات قبل بناء الأحكام أو الاستدلال.",
            "قراءة الآية ضمن سياق السورة وربطها بسبب النزول عند توفره.",
            "المقارنة بين ابن كثير والجلالين لفهم الفروق في التركيز والمنهج.",
          ],
          cta: "افتح مسارات التعلّم",
        }
      : locale === "en"
        ? {
            h1: "Tafsir Ibn Kathir Guide",
            intro:
              "Use this practical framework to study Ibn Kathir with strong source discipline and contextual Quran reading.",
            bullets: [
              "Core order: Quran explains Quran, then Sunnah, then early scholarly reports.",
              "Evaluate narration reliability before deriving claims from reports.",
              "Read each verse inside its surah flow and asbab context when available.",
              "Compare Ibn Kathir with Jalalayn to understand method and emphasis differences.",
            ],
            cta: "Open learning journeys",
          }
        : {
            h1: "מדריך תפסיר אבן כת'יר",
            intro:
              "המסגרת הזו עוזרת ללמוד אבן כת'יר בצורה עקבית: מקורות מאומתים, הקשר פסוקים, ושילוב פרשנות קלאסית.",
            bullets: [
              "סדר העבודה: פירוש קוראן בקוראן, אחר כך סונה, ואז דברי הסלף.",
              "בודקים אמינות מסורות לפני שימוש בהן בהסקת מסקנות.",
              "קוראים כל פסוק בתוך רצף הסורה ובהקשר סיבת הירידה כשקיים.",
              "משווים בין אבן כת'יר לג'לאלין כדי להבין הבדלי שיטה ודגשים.",
            ],
            cta: "פתח מסלולי לימוד",
          };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-foreground">{copy.h1}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{copy.intro}</p>
        <ul className="mt-6 space-y-3">
          {copy.bullets.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link
            to="/learn/journeys"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            {copy.cta}
          </Link>
        </div>
      </main>
    </div>
  );
}
