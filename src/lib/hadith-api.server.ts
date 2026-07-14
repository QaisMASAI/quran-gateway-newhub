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

import { normalizeArabic, normalizeEnglish } from "@/utils/normalize";

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
const DEFAULT_CACHE_TTL_MS = 5 * 60_000;

const requestCache = new Map<string, { expiresAt: number; data: unknown }>();
const inFlightRequests = new Map<string, Promise<unknown>>();

export class SunnahApiError extends Error {
  status: number;
  endpoint: string;
  requestId: string | null;
  responseBody: string;

  constructor(args: {
    status: number;
    endpoint: string;
    requestId?: string | null;
    responseBody?: string;
  }) {
    super(`sunnah_api_${args.status}:${(args.responseBody ?? "").slice(0, 200)}`);
    this.name = "SunnahApiError";
    this.status = args.status;
    this.endpoint = args.endpoint;
    this.requestId = args.requestId ?? null;
    this.responseBody = args.responseBody ?? "";
  }
}

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
  options?: { ttlMs?: number },
): Promise<T> {
  const key = getApiKey();
  const url = new URL(`${SUNNAH_BASE}${path}`);
  for (const [k, v] of Object.entries(searchParams ?? {})) {
    if (v === null || typeof v === "undefined") continue;
    url.searchParams.set(k, String(v));
  }

  const cacheKey = `sunnah:${url.toString()}`;
  const ttlMs = options?.ttlMs ?? DEFAULT_CACHE_TTL_MS;
  const now = Date.now();
  const cached = requestCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  const running = inFlightRequests.get(cacheKey);
  if (running) {
    return (await running) as T;
  }

  const run = (async () => {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-API-Key": key,
          },
        });

        if (!response.ok) {
          const body = await response.text().catch(() => "");
          const requestId = response.headers.get("x-request-id") || response.headers.get("request-id");
          const err = new SunnahApiError({
            status: response.status,
            endpoint: `${path}${url.search}`,
            requestId,
            responseBody: body,
          });

          console.error(
            JSON.stringify({
              type: "sunnah_api_failure",
              status: response.status,
              endpoint: `${path}${url.search}`,
              request_id: requestId,
              attempt: attempt + 1,
            }),
          );

          if (response.status === 403) {
            throw err;
          }

          const transientStatus = response.status === 408 || response.status === 429 || response.status >= 500;
          if (transientStatus && attempt < 3) {
            const backoffMs = Math.min(5000, 250 * 2 ** attempt);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }
          throw err;
        }

        const parsed = (await response.json()) as T;
        requestCache.set(cacheKey, { expiresAt: Date.now() + ttlMs, data: parsed });
        return parsed;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (lastError instanceof SunnahApiError && lastError.status === 403) {
          throw lastError;
        }
        if (attempt < 3) {
          const backoffMs = Math.min(5000, 250 * 2 ** attempt);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }
    throw lastError ?? new Error("sunnah_api_failed");
  })();

  inFlightRequests.set(cacheKey, run);
  try {
    return (await run) as T;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

export async function probeSunnahApiConnection() {
  const checks = [
    { key: "collections", path: "/collections", params: { page: 1, limit: 1 } },
    { key: "bukhari_books", path: "/collections/bukhari/books", params: { page: 1, limit: 1 } },
    { key: "muslim_books", path: "/collections/muslim/books", params: { page: 1, limit: 1 } },
  ] as const;

  const results: Array<{
    endpoint: string;
    ok: boolean;
    status: number;
    requestId: string | null;
    error: string | null;
  }> = [];

  for (const check of checks) {
    try {
      await sunnahFetch<unknown>(check.path, check.params, { ttlMs: 5_000 });
      results.push({ endpoint: check.key, ok: true, status: 200, requestId: null, error: null });
    } catch (error) {
      if (error instanceof SunnahApiError) {
        results.push({
          endpoint: check.key,
          ok: false,
          status: error.status,
          requestId: error.requestId,
          error: error.message,
        });
      } else {
        results.push({
          endpoint: check.key,
          ok: false,
          status: 0,
          requestId: null,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  return {
    ok: results.every((r) => r.ok),
    has403: results.some((r) => r.status === 403),
    results,
  };
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
  }, { ttlMs: 10 * 60_000 });

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
    }, { ttlMs: 10 * 60_000 });
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
    { ttlMs: 3 * 60_000 },
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
    undefined,
    { ttlMs: 10 * 60_000 },
  );
  const row =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data?: SunnahHadithRecord }).data
      : (payload as SunnahHadithRecord);
  if (!row) return null;
  return mapHadithRecord(row);
}

function normalizeHadithSearchText(input: string): string {
  const ar = normalizeArabic(input).toLowerCase();
  const en = normalizeEnglish(input).toLowerCase();
  return `${ar} ${en}`.replace(/\s+/g, " ").trim();
}

function tokenizeSearch(input: string): string[] {
  return normalizeHadithSearchText(input)
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1)
    .slice(0, 10);
}

export async function fetchHadithSearch(args: {
  q: string;
  collections?: string[];
  page: number;
  pageSize: number;
}): Promise<{ items: HadithApiEntry[]; total: number; hasMore: boolean }> {
  const q = args.q.trim();
  if (!q) return { items: [], total: 0, hasMore: false };

  const wanted = (args.collections?.map(normalizeHadithCollection).filter(Boolean) as Array<
    "bukhari" | "muslim"
  >) ?? ["bukhari", "muslim"];

  const tokens = tokenizeSearch(q);
  if (tokens.length === 0) return { items: [], total: 0, hasMore: false };

  const matches = new Map<number, { row: HadithApiEntry; score: number }>();
  const scanHardLimitReached = { value: false };
  for (const collection of wanted) {
    for (let page = 1; page <= 6; page += 1) {
      const payload = await sunnahFetch<SunnahPage<SunnahHadithRecord>>("/hadiths", {
        collection,
        page,
        limit: 100,
      });
      for (const row of (payload.data ?? []).map(mapHadithRecord)) {
        const english = normalizeEnglish(row.english_text ?? "").toLowerCase();
        const arabic = normalizeArabic(row.arabic_text).toLowerCase();
        const text = `${english} ${arabic}`.replace(/\s+/g, " ").trim();
        if (!tokens.every((t) => text.includes(t))) continue;

        const phraseNorm = normalizeHadithSearchText(q);
        const score =
          (text.includes(phraseNorm) ? 4 : 0) +
          (english.includes(phraseNorm) ? 2 : 0) +
          (arabic.includes(phraseNorm) ? 2 : 0) +
          Math.max(0, 4 - Math.abs((row.id_in_book ?? 0) - 1) / 1000);
        const prev = matches.get(row.id);
        if (!prev || score > prev.score) matches.set(row.id, { row, score });
      }
      if (!payload.next) break;
      if (matches.size >= (args.page + 2) * args.pageSize * 3) {
        scanHardLimitReached.value = true;
        break;
      }
    }
  }

  const sorted = [...matches.values()]
    .sort((a, b) => b.score - a.score || b.row.global_id - a.row.global_id)
    .map((v) => v.row);

  const start = args.page * args.pageSize;
  const end = start + args.pageSize;
  const items = sorted.slice(start, end);
  const hasMore = end < sorted.length || scanHardLimitReached.value;

  return {
    items,
    total: sorted.length,
    hasMore,
  };
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
      }, { ttlMs: 7 * 60_000 });
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