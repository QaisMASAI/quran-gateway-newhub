import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, Sparkles, Filter, RefreshCw, Layers, ShieldCheck, UserCheck } from "lucide-react";
import { searchHadith } from "@/lib/hadith.functions";
import { HadithCard } from "./HadithCard";
import type { HadithReadingSettings } from "@/lib/hadith-user-store";

interface HadithSearchExplorerProps {
  settings: HadithReadingSettings;
}

export function HadithSearchExplorer({ settings }: HadithSearchExplorerProps) {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"keyword" | "semantic">("keyword");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [selectedAuthenticity, setSelectedAuthenticity] = useState<string>("all");
  const [selectedNarrator, setSelectedNarrator] = useState<string>("all");
  const [page, setPage] = useState(0);

  const searchFn = useServerFn(searchHadith);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["hadith-search", activeQuery, selectedCollection, page],
    enabled: activeQuery.trim().length > 0,
    queryFn: () =>
      searchFn({
        data: {
          q: activeQuery,
          collections: selectedCollection !== "all" ? [selectedCollection] : undefined,
          page,
          pageSize: 10,
        },
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(query.trim());
    setPage(0);
  };

  const collectionsList = [
    { id: "all", name: "All Collections" },
    { id: "bukhari", name: "Sahih al-Bukhari" },
    { id: "muslim", name: "Sahih Muslim" },
    { id: "tirmidhi", name: "Jami at-Tirmidhi" },
    { id: "abudawud", name: "Sunan Abu Dawud" },
    { id: "nasai", name: "Sunan an-Nasa'i" },
    { id: "ibnmajah", name: "Sunan Ibn Majah" },
    { id: "malik", name: "Muwatta Malik" },
  ];

  const narratorsList = [
    { id: "all", name: "All Narrators" },
    { id: "abu_hurairah", name: "Abu Hurairah (أبو هريرة)" },
    { id: "aisha", name: "Aisha bint Abi Bakr (عائشة)" },
    { id: "umar", name: "Umar ibn al-Khattab (عمر بن الخطاب)" },
    { id: "anas", name: "Anas ibn Malik (أنس بن مالك)" },
    { id: "ibn_umar", name: "Abdullah ibn Umar (عبد الله بن عمر)" },
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar & Mode Switcher */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchMode === "semantic"
                ? "Describe what you're looking for (e.g., 'Hadith about honoring parents or patience in sickness')..."
                : "Search by keyword, narrator, hadith number, or Arabic text..."
            }
            className="w-full rounded-2xl border border-primary/20 bg-card py-3.5 pl-11 pr-28 text-sm text-foreground placeholder:text-muted-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />

          <button
            type="submit"
            className="absolute right-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          >
            Search
          </button>
        </div>

        {/* Mode & Filters Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Mode Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setSearchMode("keyword")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-colors ${
                searchMode === "keyword"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="h-3.5 w-3.5" /> Keyword Search
            </button>
            <button
              type="button"
              onClick={() => setSearchMode("semantic")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-colors ${
                searchMode === "semantic"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> AI Semantic Search
            </button>
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
            </div>

            {/* Collection Filter */}
            <select
              value={selectedCollection}
              onChange={(e) => {
                setSelectedCollection(e.target.value);
                setPage(0);
              }}
              className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground focus:outline-none"
            >
              {collectionsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Authenticity Filter */}
            <select
              value={selectedAuthenticity}
              onChange={(e) => setSelectedAuthenticity(e.target.value)}
              className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground focus:outline-none"
            >
              <option value="all">All Grades</option>
              <option value="sahih">Sahih (صحيح)</option>
              <option value="muttafaq">Muttafaq 'Alayh (متفق عليه)</option>
              <option value="hasan">Hasan (حسن)</option>
            </select>

            {/* Narrator Filter */}
            <select
              value={selectedNarrator}
              onChange={(e) => setSelectedNarrator(e.target.value)}
              className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground focus:outline-none"
            >
              {narratorsList.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      {/* Results Header */}
      {activeQuery && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Results for <strong className="text-foreground">"{activeQuery}"</strong>
            {data && ` (${data.total} found)`}
          </span>
          {isLoading && (
            <span className="flex items-center gap-1 text-primary">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Searching...
            </span>
          )}
        </div>
      )}

      {/* Results List */}
      {activeQuery && data && data.items.length > 0 && (
        <div className="space-y-4">
          {data.items.map((item) => (
            <HadithCard
              key={item.id}
              id={item.id}
              globalId={item.global_id}
              collectionSlug={item.collection_slug}
              collectionTitle={
                collectionsList.find((c) => c.id === item.collection_slug)?.name ||
                item.collection_slug
              }
              bookId={item.book_id}
              idInBook={item.id_in_book}
              narrator={item.narrator}
              arabicText={item.arabic_text}
              englishText={item.english_text}
              hebrewText={item.hebrew_text}
              settings={settings}
            />
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border border-border px-3 py-1.5 font-medium disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="text-muted-foreground">Page {page + 1}</span>
            <button
              type="button"
              disabled={!data.hasMore}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border border-border px-3 py-1.5 font-medium disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {activeQuery && data && data.items.length === 0 && !isLoading && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No hadiths found matching your query. Try broadening your terms or switching to AI
          Semantic Search.
        </div>
      )}
    </div>
  );
}
