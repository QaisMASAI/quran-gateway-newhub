import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { HadithSearchExplorer } from "@/components/hadith/HadithSearchExplorer";
import { useHadithUserStore } from "@/lib/hadith-user-store";

export const Route = createFileRoute("/hadith/")({
  head: () => ({
    meta: [
      { title: "Hadith Explorer | Sahih Collections & Search" },
      {
        name: "description",
        content: "Search and explore authenticated Hadith collections, narrators, sanad chains, and knowledge graphs.",
      },
      { property: "og:title", content: "Hadith Explorer | Sahih Collections & Search" },
      {
        property: "og:description",
        content:
          "Browse trusted Hadith collections, navigate books, and explore narrators with structured Islamic knowledge tools.",
      },
      { property: "og:url", content: "/hadith" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/hadith" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Hadith Explorer",
          description:
            "Explore authenticated Hadith collections, narrators, and structured prophetic tradition references.",
          url: "https://quran-gateway-newhub.lovable.app/hadith",
          inLanguage: ["ar", "he", "en"],
        }),
      },
    ],
  }),
  component: HadithIndexPage,
});

function HadithIndexPage() {
  const { settings } = useHadithUserStore();

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Hadith Explorer</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Explore authentic prophetic traditions across major Hadith collections.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/hadith/topics"
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Hadith Topics
            </Link>
            <Link
              to="/hadith/narrators"
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Narrators Index
            </Link>
          </div>
        </div>

        <HadithSearchExplorer settings={settings} />
      </main>
    </div>
  );
}
