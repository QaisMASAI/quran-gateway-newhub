import { normalizeArabic, normalizeEnglish } from "@/utils/normalize";

export type ProviderCollection = {
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

export type ProviderBook = {
  collection_slug: string;
  book_id: number;
  name_ar: string;
  name_en: string;
  name_he: string | null;
  hadith_count: number;
};

export type ProviderEntry = {
  collection_slug: string;
  book_id: number;
  chapter_number: number | null;
  id_in_book: number;
  global_id: number;
  narrator: string | null;
  arabic_text: string;
  english_text: string | null;
  grade: string | null;
  grade_source: string | null;
  chain_text: string | null;
  reference_text: string | null;
  source_payload: Record<string, unknown>;
};

export type HadithProvider = {
  id: "ummahapi" | "islamic_app";
  probe: () => Promise<{ ok: boolean; status: number; error: string | null }>;
  listCollections: () => Promise<ProviderCollection[]>;
  listBooks: (collection: string) => Promise<ProviderBook[]>;
  listBookEntries: (args: {
    collection: string;
    book: number;
    page: number;
    pageSize: number;
  }) => Promise<{ items: ProviderEntry[]; total: number }>;
};

const KNOWN_COLLECTIONS = [
  { slug: "bukhari", en: "Sahih al-Bukhari", ar: "صحيح البخاري", sort: 1 },
  { slug: "muslim", en: "Sahih Muslim", ar: "صحيح مسلم", sort: 2 },
  { slug: "abudawud", en: "Sunan Abu Dawud", ar: "سنن أبي داود", sort: 3 },
  { slug: "tirmidhi", en: "Jami at-Tirmidhi", ar: "جامع الترمذي", sort: 4 },
  { slug: "ibnmajah", en: "Sunan Ibn Majah", ar: "سنن ابن ماجه", sort: 5 },
  { slug: "nasai", en: "Sunan an-Nasa'i", ar: "سنن النسائي", sort: 6 },
  { slug: "malik", en: "Muwatta Malik", ar: "موطأ مالك", sort: 7 },
];

function normalizeCollectionSlug(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  if (!s) return "unknown";
  if (s.includes("bukh")) return "bukhari";
  if (s.includes("muslim")) return "muslim";
  if (s.includes("abud") || s.includes("abudaud") || s.includes("abudawud")) return "abudawud";
  if (s.includes("tirm")) return "tirmidhi";
  if (s.includes("majah")) return "ibnmajah";
  if (s.includes("nas")) return "nasai";
  if (s.includes("muwatta") || s.includes("malik")) return "malik";
  return s;
}

function parseIntSafe(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  const n = Number(String(value ?? "").replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

function extractNarrator(englishText: string | null | undefined): string | null {
  if (!englishText) return null;
  const line =
    englishText
      .trim()
      .split("\n")
      .find((v) => v.trim().length > 0) ?? "";
  const match = line.match(/^Narrated\s+([^:]{2,160}):/i);
  return match ? match[1].replace(/\s+/g, " ").trim() : null;
}

async function providerFetch(
  baseUrl: string,
  path: string,
  options?: {
    apiKey?: string;
    searchParams?: Record<string, string | number | null | undefined>;
    authHeader?: "x-api-key" | "authorization";
  },
): Promise<{ status: number; json: unknown }> {
  const url = new URL(path, baseUrl);
  for (const [k, v] of Object.entries(options?.searchParams ?? {})) {
    if (v === null || typeof v === "undefined") continue;
    url.searchParams.set(k, String(v));
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (options?.apiKey) {
        if (options.authHeader === "authorization")
          headers.Authorization = `Bearer ${options.apiKey}`;
        else headers["x-api-key"] = options.apiKey;
      }
      const res = await fetch(url.toString(), { method: "GET", headers });
      if (!res.ok) {
        const transient = res.status === 408 || res.status === 429 || res.status >= 500;
        if (transient && attempt < 3) {
          await new Promise((r) => setTimeout(r, Math.min(5000, 300 * 2 ** attempt)));
          continue;
        }
        return { status: res.status, json: await res.text().catch(() => "") };
      }
      return { status: res.status, json: await res.json() };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, Math.min(5000, 300 * 2 ** attempt)));
      }
    }
  }
  throw lastError ?? new Error("provider_fetch_failed");
}

function toCollectionFallback(slug: string): ProviderCollection {
  const known = KNOWN_COLLECTIONS.find((c) => c.slug === slug);
  return {
    slug,
    title_ar: known?.ar ?? slug,
    title_en: known?.en ?? slug,
    title_he: null,
    author_ar: null,
    author_en: null,
    total_hadith: 0,
    total_books: 0,
    sort_order: known?.sort ?? 99,
  };
}

function toLocalSearchText(entry: ProviderEntry) {
  const ar = normalizeArabic(entry.arabic_text).toLowerCase();
  const en = normalizeEnglish(entry.english_text ?? "").toLowerCase();
  return `${ar} ${en}`.replace(/\s+/g, " ").trim();
}

function createUmmahApiProvider(): HadithProvider {
  const baseUrl = process.env.UMMAH_API_BASE_URL ?? "https://ummahapi.com/api";
  const apiKey = process.env.UMMAH_API_KEY;

  return {
    id: "ummahapi",
    probe: async () => {
      const res = await providerFetch(baseUrl, "/collections", {
        apiKey,
        authHeader: "x-api-key",
        searchParams: { page: 1, limit: 1 },
      });
      return { ok: res.status >= 200 && res.status < 300, status: res.status, error: null };
    },
    listCollections: async () => {
      const res = await providerFetch(baseUrl, "/collections", {
        apiKey,
        authHeader: "x-api-key",
        searchParams: { page: 1, limit: 100 },
      });
      if (res.status < 200 || res.status >= 300) {
        return KNOWN_COLLECTIONS.map((k) => toCollectionFallback(k.slug));
      }
      const body = res.json as { data?: Array<Record<string, unknown>> };
      const rows = Array.isArray(body?.data) ? body.data : [];
      if (rows.length === 0) return KNOWN_COLLECTIONS.map((k) => toCollectionFallback(k.slug));
      return rows
        .map((row) => {
          const slug = normalizeCollectionSlug(
            String(row.slug ?? row.name ?? row.collection ?? ""),
          );
          const fallback = toCollectionFallback(slug);
          return {
            ...fallback,
            title_en: String(row.title_en ?? row.title ?? row.name ?? fallback.title_en),
            title_ar: String(row.title_ar ?? row.arabic_name ?? fallback.title_ar),
            total_hadith: parseIntSafe(row.total_hadith ?? row.totalAvailableHadith, 0),
            total_books: parseIntSafe(row.total_books, 0),
          } satisfies ProviderCollection;
        })
        .filter((row) => row.slug !== "unknown");
    },
    listBooks: async (collection) => {
      const res = await providerFetch(baseUrl, `/collections/${collection}/books`, {
        apiKey,
        authHeader: "x-api-key",
        searchParams: { page: 1, limit: 300 },
      });
      if (res.status < 200 || res.status >= 300) return [];
      const body = res.json as { data?: Array<Record<string, unknown>> };
      const rows = Array.isArray(body?.data) ? body.data : [];
      return rows
        .map((row) => ({
          collection_slug: collection,
          book_id: parseIntSafe(row.book_id ?? row.bookNumber, 0),
          name_ar: String(
            row.title_ar ??
              row.name_ar ??
              row.book_title_ar ??
              `كتاب ${row.book_id ?? row.bookNumber ?? ""}`,
          ),
          name_en: String(
            row.title_en ??
              row.name_en ??
              row.book_title_en ??
              `Book ${row.book_id ?? row.bookNumber ?? ""}`,
          ),
          name_he: null,
          hadith_count: parseIntSafe(row.hadith_count ?? row.numberOfHadith, 0),
        }))
        .filter((b) => b.book_id > 0)
        .sort((a, b) => a.book_id - b.book_id);
    },
    listBookEntries: async ({ collection, book, page, pageSize }) => {
      const res = await providerFetch(baseUrl, `/collections/${collection}/books/${book}/hadiths`, {
        apiKey,
        authHeader: "x-api-key",
        searchParams: { page: page + 1, limit: pageSize },
      });
      if (res.status < 200 || res.status >= 300) return { items: [], total: 0 };
      const body = res.json as { data?: Array<Record<string, unknown>>; total?: number };
      const rows = Array.isArray(body?.data) ? body.data : [];
      const items = rows.map((row) => {
        const hadith = (Array.isArray(row.hadith) ? row.hadith : []) as Array<
          Record<string, unknown>
        >;
        const ar =
          String(
            hadith.find((h) => String(h.lang ?? "").startsWith("ar"))?.body ??
              row.arabic ??
              row.arabic_text ??
              "",
          ) || "";
        const en =
          String(
            hadith.find((h) => String(h.lang ?? "").startsWith("en"))?.body ??
              row.english ??
              row.english_text ??
              "",
          ) || null;
        const global = parseIntSafe(row.global_id ?? row.hadithNumber ?? row.id, 0);
        return {
          collection_slug: collection,
          book_id: book,
          chapter_number: parseIntSafe(row.chapterNumber ?? row.chapter_id, 0) || null,
          id_in_book: parseIntSafe(row.id_in_book ?? row.hadithNumber, global),
          global_id: global,
          narrator: String(row.narrator ?? "").trim() || extractNarrator(en),
          arabic_text: ar,
          english_text: en,
          grade: String(row.grade ?? "").trim() || null,
          grade_source: String(row.grade_source ?? row.gradeSource ?? "").trim() || null,
          chain_text: String(row.chain ?? row.isnad ?? "").trim() || null,
          reference_text: String(row.reference ?? row.hadith_reference ?? "").trim() || null,
          source_payload: row,
        } satisfies ProviderEntry;
      });
      return {
        items: items.filter((i) => i.global_id > 0 && i.arabic_text.length > 0),
        total: parseIntSafe(body.total, items.length),
      };
    },
  };
}

function createIslamicAppProvider(): HadithProvider {
  const baseUrl = process.env.ISLAMIC_APP_BASE_URL ?? "https://islamic.app/api";
  const apiKey = process.env.ISLAMIC_APP_API_KEY;

  return {
    id: "islamic_app",
    probe: async () => {
      const res = await providerFetch(baseUrl, "/hadith/collections", {
        apiKey,
        authHeader: "authorization",
        searchParams: { page: 1, limit: 1 },
      });
      return { ok: res.status >= 200 && res.status < 300, status: res.status, error: null };
    },
    listCollections: async () => {
      const res = await providerFetch(baseUrl, "/hadith/collections", {
        apiKey,
        authHeader: "authorization",
        searchParams: { page: 1, limit: 100 },
      });
      if (res.status < 200 || res.status >= 300) {
        return KNOWN_COLLECTIONS.map((k) => toCollectionFallback(k.slug));
      }
      const body = res.json as { data?: Array<Record<string, unknown>> };
      const rows = Array.isArray(body?.data) ? body.data : [];
      return rows
        .map((row) => {
          const slug = normalizeCollectionSlug(String(row.slug ?? row.name ?? ""));
          const fallback = toCollectionFallback(slug);
          return {
            ...fallback,
            title_en: String(row.title_en ?? row.name ?? fallback.title_en),
            title_ar: String(row.title_ar ?? fallback.title_ar),
            total_hadith: parseIntSafe(row.total_hadith, 0),
            total_books: parseIntSafe(row.total_books, 0),
          };
        })
        .filter((row) => row.slug !== "unknown");
    },
    listBooks: async (collection) => {
      const res = await providerFetch(baseUrl, `/hadith/collections/${collection}/books`, {
        apiKey,
        authHeader: "authorization",
        searchParams: { page: 1, limit: 300 },
      });
      if (res.status < 200 || res.status >= 300) return [];
      const body = res.json as { data?: Array<Record<string, unknown>> };
      const rows = Array.isArray(body?.data) ? body.data : [];
      return rows
        .map((row) => ({
          collection_slug: collection,
          book_id: parseIntSafe(row.book_id ?? row.number, 0),
          name_ar: String(row.title_ar ?? row.name_ar ?? `كتاب ${row.book_id ?? row.number ?? ""}`),
          name_en: String(row.title_en ?? row.name_en ?? `Book ${row.book_id ?? row.number ?? ""}`),
          name_he: null,
          hadith_count: parseIntSafe(row.hadith_count ?? row.total, 0),
        }))
        .filter((b) => b.book_id > 0)
        .sort((a, b) => a.book_id - b.book_id);
    },
    listBookEntries: async ({ collection, book, page, pageSize }) => {
      const res = await providerFetch(
        baseUrl,
        `/hadith/collections/${collection}/books/${book}/hadiths`,
        {
          apiKey,
          authHeader: "authorization",
          searchParams: { page: page + 1, limit: pageSize },
        },
      );
      if (res.status < 200 || res.status >= 300) return { items: [], total: 0 };
      const body = res.json as { data?: Array<Record<string, unknown>>; total?: number };
      const rows = Array.isArray(body?.data) ? body.data : [];
      const items = rows.map((row) => {
        const en = String(row.english_text ?? row.english ?? "") || null;
        const ar = String(row.arabic_text ?? row.arabic ?? "");
        const global = parseIntSafe(row.global_id ?? row.hadith_number ?? row.id, 0);
        return {
          collection_slug: collection,
          book_id: book,
          chapter_number: parseIntSafe(row.chapter_number ?? row.chapter, 0) || null,
          id_in_book: parseIntSafe(row.id_in_book ?? row.hadith_number, global),
          global_id: global,
          narrator: String(row.narrator ?? "").trim() || extractNarrator(en),
          arabic_text: ar,
          english_text: en,
          grade: String(row.grade ?? "").trim() || null,
          grade_source: String(row.grade_source ?? "").trim() || null,
          chain_text: String(row.chain ?? row.isnad ?? "").trim() || null,
          reference_text: String(row.reference ?? "").trim() || null,
          source_payload: row,
        } satisfies ProviderEntry;
      });
      return {
        items: items.filter((i) => i.global_id > 0 && i.arabic_text.length > 0),
        total: parseIntSafe(body.total, items.length),
      };
    },
  };
}

export function listHadithProviders(): HadithProvider[] {
  const primary = (process.env.HADITH_PRIMARY_PROVIDER ?? "ummahapi").toLowerCase();
  const ummah = createUmmahApiProvider();
  const islamic = createIslamicAppProvider();
  return primary === "islamic_app" ? [islamic, ummah] : [ummah, islamic];
}

export async function probeHadithProviders() {
  const providers = listHadithProviders();
  const statuses: Array<{ id: string; ok: boolean; status: number; error: string | null }> = [];
  for (const provider of providers) {
    try {
      statuses.push({ id: provider.id, ...(await provider.probe()) });
    } catch (error) {
      statuses.push({
        id: provider.id,
        ok: false,
        status: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return statuses;
}

export async function runWithProviderFallback<T>(
  runner: (provider: HadithProvider) => Promise<T>,
): Promise<{ provider: string; value: T }> {
  const providers = listHadithProviders();
  let lastError: Error | null = null;
  for (const provider of providers) {
    try {
      return { provider: provider.id, value: await runner(provider) };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  throw lastError ?? new Error("all_hadith_providers_failed");
}

export function buildSearchTokens(input: string): string[] {
  const ar = normalizeArabic(input).toLowerCase();
  const en = normalizeEnglish(input).toLowerCase();
  return `${ar} ${en}`
    .split(/\s+/)
    .map((v) => v.trim())
    .filter((v) => v.length > 1)
    .slice(0, 12);
}

export function matchesSearch(entry: ProviderEntry, tokens: string[]): boolean {
  if (tokens.length === 0) return false;
  const text = toLocalSearchText(entry);
  return tokens.every((t) => text.includes(t));
}
