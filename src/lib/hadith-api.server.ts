type SunnahLangItem = {
  lang?: string;
  title?: string;
  shortIntro?: string;
  name?: string;
  chapterNumber?: string;
  chapterTitle?: string;
  urn?: number;
  body?: string;
};

type SunnahCollection = {
  name: string;
  hasBooks?: boolean;
  hasChapters?: boolean;
  collection?: SunnahLangItem[];
  totalHadith?: number;
  totalAvailableHadith?: number;
};

type SunnahBook = {
  bookNumber: string;
  book?: SunnahLangItem[];
  hadithStartNumber?: number;
  hadithEndNumber?: number;
  numberOfHadith?: number;
};

type SunnahHadithRecord = {
  collection: string;
  bookNumber: string;
  chapterId: string;
  hadithNumber: string;
  hadith?: SunnahLangItem[];
};

type SunnahPage<T> = {
  data?: T[];
  total?: number;
  limit?: number;
  previous?: number | null;
  next?: number | null;
};

export type HadithApiCollection = {
  slug: string;
  title_ar: string;
  title_en: string;
  title_he: string | null;
  author_ar: string | null;
  author_en: string | null;
  total_hadith: number;
  total_books: number;
  sort_order: number;
};

export type HadithApiBook = {
  collection_slug: string;
  book_id: number;
  name_ar: string;
  name_en: string;
  name_he: string | null;
  hadith_count: number;
};

export type HadithApiEntry = {
  id: number;
  collection_slug: string;
  book_id: number;
  id_in_book: number;
  global_id: number;
  narrator: string | null;
  arabic_text: string;
  english_text: string | null;
  hebrew_text: string | null;
};

const SUNNAH_BASE = "https://api.sunnah.com/v1";

function getApiKey() {
  const key = process.env.SUNNAH_API_KEY;
  if (!key) throw new Error("missing_sunnah_api_key");
  return key;
}

export function normalizeHadithCollection(collection: string): "bukhari" | "muslim" | null {
  const value = collection.trim().toLowerCase();
  if (value === "bukhari" || value === "muslim") return value;
  return null;
}

async function sunnahFetch<T>(
  path: string,
  searchParams?: Record<string, string | number | null | undefined>,
): Promise<T> {
  const key = getApiKey();
  const url = new URL(`${SUNNAH_BASE}${path}`);
  for (const [k, v] of Object.entries(searchParams ?? {})) {
    if (v === null || typeof v === "undefined") continue;
    url.searchParams.set(k, String(v));
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-API-Key": key,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`sunnah_api_${response.status}:${body.slice(0, 200)}`);
  }

  return (await response.json()) as T;
}

function pickLocalized(items: SunnahLangItem[] | undefined, lang: string, key: "title" | "name") {
  const normalized = (items ?? []).map((v) => ({ lang: (v.lang ?? "").toLowerCase(), value: v[key] ?? "" }));
  return (
    normalized.find((v) => v.lang === lang)?.value ||
    normalized.find((v) => v.lang.startsWith(lang))?.value ||
    normalized.find((v) => v.lang === "en")?.value ||
    normalized.find((v) => v.lang === "ar")?.value ||
    normalized.find((v) => !!v.value)?.value ||
    ""
  );
}

function parseIntSafe(value: string | number | undefined, fallback = 0) {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

export function extractNarrator(englishText: string | null | undefined): string | null {
  if (!englishText) return null;
  const line = englishText.trim().split("\n").find((v) => v.trim().length > 0) ?? "";
  const match = line.match(/^Narrated\s+([^:]{2,140}):/i);
  if (!match) return null;
  return match[1].replace(/\s+/g, " ").trim();
}

export async function fetchHadithCollections(): Promise<HadithApiCollection[]> {
  const payload = await sunnahFetch<SunnahPage<SunnahCollection>>("/collections", {
    page: 1,
    limit: 100,
  });

  const data = (payload.data ?? []).filter((row) => normalizeHadithCollection(row.name));
  return data
    .map((row) => {
      const slug = normalizeHadithCollection(row.name)!;
      const title_en =
        pickLocalized(row.collection, "en", "title") ||
        (slug === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim");
      const title_ar =
        pickLocalized(row.collection, "ar", "title") ||
        (slug === "bukhari" ? "صحيح البخاري" : "صحيح مسلم");

      return {
        slug,
        title_ar,
        title_en,
        title_he: null,
        author_ar: null,
        author_en: null,
        total_hadith: row.totalAvailableHadith ?? row.totalHadith ?? 0,
        total_books: 0,
        sort_order: slug === "bukhari" ? 1 : 2,
      } satisfies HadithApiCollection;
    })
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function fetchHadithBooks(collection: "bukhari" | "muslim"): Promise<HadithApiBook[]> {
  const rows: SunnahBook[] = [];
  for (let page = 1; page <= 5; page += 1) {
    const payload = await sunnahFetch<SunnahPage<SunnahBook>>(`/collections/${collection}/books`, {
      page,
      limit: 100,
    });
    rows.push(...(payload.data ?? []));
    if (!payload.next) break;
  }

  return rows
    .map((row) => ({
      collection_slug: collection,
      book_id: parseIntSafe(row.bookNumber),
      name_ar: pickLocalized(row.book, "ar", "name") || `كتاب ${row.bookNumber}`,
      name_en: pickLocalized(row.book, "en", "name") || `Book ${row.bookNumber}`,
      name_he: null,
      hadith_count: row.numberOfHadith ?? 0,
    }))
    .filter((row) => row.book_id > 0)
    .sort((a, b) => a.book_id - b.book_id);
}

function mapHadithRecord(row: SunnahHadithRecord): HadithApiEntry {
  const details = row.hadith ?? [];
  const english = details.find((d) => (d.lang ?? "").toLowerCase().startsWith("en"))?.body ?? null;
  const arabic =
    details.find((d) => (d.lang ?? "").toLowerCase().startsWith("ar"))?.body ??
    details.find((d) => !!d.body)?.body ??
    "";

  const globalId = parseIntSafe(row.hadithNumber);
  const bookId = parseIntSafe(row.bookNumber);
  const urn = details.find((d) => typeof d.urn === "number")?.urn;
  const id = typeof urn === "number" ? urn : Number(`${bookId}${String(globalId).padStart(6, "0")}`);

  return {
    id,
    collection_slug: normalizeHadithCollection(row.collection) ?? row.collection,
    book_id: bookId,
    id_in_book: globalId,
    global_id: globalId,
    narrator: extractNarrator(english),
    arabic_text: arabic,
    english_text: english,
    hebrew_text: null,
  };
}

export async function fetchHadithBookEntries(args: {
  collection: "bukhari" | "muslim";
  book: number;
  page: number;
  pageSize: number;
}): Promise<{ items: HadithApiEntry[]; total: number }> {
  const payload = await sunnahFetch<SunnahPage<SunnahHadithRecord>>(
    `/collections/${args.collection}/books/${args.book}/hadiths`,
    {
      page: args.page + 1,
      limit: args.pageSize,
    },
  );

  return {
    items: (payload.data ?? []).map(mapHadithRecord),
    total: payload.total ?? 0,
  };
}

export async function fetchHadithByGlobalNumber(args: {
  collection: "bukhari" | "muslim";
  num: number;
}): Promise<HadithApiEntry | null> {
  const payload = await sunnahFetch<unknown>(
    `/collections/${args.collection}/hadiths/${args.num}`,
  );
  const row =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data?: SunnahHadithRecord }).data
      : (payload as SunnahHadithRecord);
  if (!row) return null;
  return mapHadithRecord(row);
}

export async function fetchHadithSearch(args: {
  q: string;
  collections?: string[];
  limit: number;
}): Promise<HadithApiEntry[]> {
  const q = args.q.trim().toLowerCase();
  if (!q) return [];

  const wanted = (args.collections?.map(normalizeHadithCollection).filter(Boolean) as Array<
    "bukhari" | "muslim"
  >) ?? ["bukhari", "muslim"];

  const matches = new Map<number, { row: HadithApiEntry; score: number }>();
  for (const collection of wanted) {
    for (let page = 1; page <= 3; page += 1) {
      const payload = await sunnahFetch<SunnahPage<SunnahHadithRecord>>("/hadiths", {
        collection,
        page,
        limit: 100,
      });
      for (const row of (payload.data ?? []).map(mapHadithRecord)) {
        const text = `${row.english_text ?? ""}\n${row.arabic_text}`.toLowerCase();
        if (!text.includes(q)) continue;
        const score = (text.startsWith(q) ? 2 : 0) + (row.english_text?.toLowerCase().includes(q) ? 2 : 1);
        const prev = matches.get(row.id);
        if (!prev || score > prev.score) matches.set(row.id, { row, score });
      }
      if (!payload.next || matches.size >= args.limit * 2) break;
    }
  }

  return [...matches.values()]
    .sort((a, b) => b.score - a.score || b.row.global_id - a.row.global_id)
    .slice(0, args.limit)
    .map((v) => v.row);
}

export async function fetchTopNarrators(limit: number) {
  const buckets = new Map<string, { narrator: string; hadith_count: number; collections: Set<string> }>();
  const collections: Array<"bukhari" | "muslim"> = ["bukhari", "muslim"];

  for (const collection of collections) {
    for (let page = 1; page <= 4; page += 1) {
      const payload = await sunnahFetch<SunnahPage<SunnahHadithRecord>>("/hadiths", {
        collection,
        page,
        limit: 100,
      });
      for (const row of payload.data ?? []) {
        const mapped = mapHadithRecord(row);
        if (!mapped.narrator) continue;
        const key = mapped.narrator.toLowerCase();
        const current = buckets.get(key) ?? {
          narrator: mapped.narrator,
          hadith_count: 0,
          collections: new Set<string>(),
        };
        current.hadith_count += 1;
        current.collections.add(collection);
        buckets.set(key, current);
      }
      if (!payload.next) break;
    }
  }

  return [...buckets.values()]
    .sort((a, b) => b.hadith_count - a.hadith_count)
    .slice(0, limit)
    .map((row) => ({
      narrator: row.narrator,
      hadith_count: row.hadith_count,
      collections: [...row.collections].sort(),
    }));
}