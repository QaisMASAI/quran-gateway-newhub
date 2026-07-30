import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { listHadithByTopicSlug } from "@/lib/hadith.functions";
import type { Locale } from "@/lib/i18n";
import { tafsirFontClass } from "@/lib/locale-ui";

const COLLECTION_LABEL: Record<string, string> = {
  bukhari: "Sahih al-Bukhari",
  muslim: "Sahih Muslim",
};

export function TopicHadithSection({ slug, locale }: { slug: string; locale: Locale }) {
  const fn = useServerFn(listHadithByTopicSlug);
  const [page, setPage] = useState(1);
  const [collection, setCollection] = useState<string>("");
  const [narrator, setNarrator] = useState<string>("");
  const [sort, setSort] = useState<"relevance" | "narrator" | "collection">("relevance");

  const { data, isLoading } = useQuery({
    queryKey: ["topic-hadith", slug, page, collection, narrator, sort],
    queryFn: () =>
      fn({
        data: {
          slug,
          page,
          pageSize: 10,
          collection: collection || null,
          narrator: narrator || null,
          sort,
        },
      }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  if (isLoading && !data) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading hadith…
      </p>
    );
  }
  if (!data || data.total === 0) return null;

  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const selectClass =
    "rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Collection"
          className={selectClass}
          value={collection}
          onChange={(e) => {
            setCollection(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All collections</option>
          {data.collections.map((c) => (
            <option key={c} value={c}>
              {COLLECTION_LABEL[c] ?? c}
            </option>
          ))}
        </select>
        <select
          aria-label="Narrator"
          className={selectClass}
          value={narrator}
          onChange={(e) => {
            setNarrator(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All narrators</option>
          {data.narrators.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort"
          className={selectClass}
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as typeof sort);
            setPage(1);
          }}
        >
          <option value="relevance">Sort: relevance</option>
          <option value="narrator">Sort: narrator</option>
          <option value="collection">Sort: collection</option>
        </select>
        <span className="text-xs text-muted-foreground">{data.total} hadith</span>
      </div>

      <ul className="space-y-3">
        {data.items.map((h) => (
          <li key={h.id}>
            <Link
              to="/hadith/$collection/entry/$num"
              params={{ collection: h.collection_slug, num: String(h.id_in_book) }}
              className="surface-card block p-4 transition-colors hover:border-primary/40"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                {COLLECTION_LABEL[h.collection_slug] ?? h.collection_slug} · #{h.id_in_book}
              </div>
              {h.narrator && (
                <div className="mt-1 text-xs text-muted-foreground">{h.narrator}</div>
              )}
              <p
                className={`mt-2 line-clamp-3 text-sm text-foreground/90 ${tafsirFontClass(locale)}`}
                dir={locale === "en" ? "ltr" : "rtl"}
              >
                {locale === "en"
                  ? (h.english_text ?? h.arabic_text)
                  : locale === "he"
                    ? (h.hebrew_text ?? h.arabic_text)
                    : h.arabic_text}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {page} / {pages}
          </span>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:opacity-40"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
