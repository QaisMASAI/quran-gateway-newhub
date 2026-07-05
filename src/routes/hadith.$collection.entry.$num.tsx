import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { getHadithEntry } from "@/lib/hadith.functions";

export const Route = createFileRoute("/hadith/$collection/entry/$num")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.collection === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim"} — Hadith #${params.num}`,
      },
      { property: "og:url", content: `/hadith/${params.collection}/entry/${params.num}` },
    ],
    links: [{ rel: "canonical", href: `/hadith/${params.collection}/entry/${params.num}` }],
  }),
  loader: async ({ context, params }) => {
    if (!["bukhari", "muslim"].includes(params.collection)) throw notFound();
    const num = Number(params.num);
    if (!Number.isFinite(num) || num < 1) throw notFound();
    await context.queryClient.ensureQueryData({
      queryKey: ["hadith", "entry", params.collection, num],
      queryFn: () => getHadithEntry({ data: { collection: params.collection, num } }),
    });
  },
  component: HadithDetailPage,
});

function HadithDetailPage() {
  const { collection, num } = Route.useParams();
  const numId = Number(num);
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const fn = useServerFn(getHadithEntry);
  const { data: h } = useQuery({
    queryKey: ["hadith", "entry", collection, numId],
    queryFn: () => fn({ data: { collection, num: numId } }),
  });

  if (!h) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">
          Hadith not found.
        </main>
      </div>
    );
  }

  const label = collection === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          to="/hadith/$collection/$book"
          params={{ collection, book: String(h.book_id) }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Book {h.book_id}
        </Link>
        <h1 className="mt-2 text-xl font-bold text-foreground">
          {label} · #{h.id_in_book}
        </h1>
        {h.narrator && <p className="mt-1 text-sm italic text-muted-foreground">{h.narrator}</p>}

        <article className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-5">
          <p
            className="font-reading-ar text-right text-xl leading-loose text-foreground"
            dir="rtl"
            lang="ar"
          >
            {h.arabic_text}
          </p>
          {h.english_text && (
            <p
              className="font-reading-en border-t border-border pt-4 text-base leading-relaxed text-foreground/90"
              dir="ltr"
            >
              {h.english_text}
            </p>
          )}
        </article>

        <p className="mt-6 text-xs text-muted-foreground">
          Source: {label}, Book {h.book_id}, Hadith {h.id_in_book} (global #{h.global_id}).
        </p>
      </main>
    </div>
  );
}
