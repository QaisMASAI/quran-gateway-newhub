/**
 * Quran Gateway — Centralized API Gateway Type Definitions
 * Version: v1 / v2 architecture
 */

export interface ApiMeta {
  requestId: string;
  timestamp: string;
  path: string;
  version: string;
  processingTimeMs: number;
  rateLimit?: RateLimitMeta;
  pagination?: PaginationMeta;
  deprecation?: DeprecationMeta;
}

export interface RateLimitMeta {
  limit: number;
  remaining: number;
  resetSeconds: number;
  tier: "anonymous" | "authenticated" | "internal_admin" | "search_heavy";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DeprecationMeta {
  deprecated: boolean;
  sunsetDate?: string;
  alternativeEndpoint?: string;
  infoUrl?: string;
}

export interface ApiErrorDetail {
  code: string;
  numericCode: number;
  message: string;
  domain: string;
  httpStatus: number;
  details?: Record<string, unknown> | string[];
  remediation?: string;
}

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiErrorDetail | null;
  meta: ApiMeta;
}

export interface GatewayRequest<TBody = unknown, TParams = Record<string, string>> {
  rawRequest: Request;
  requestId: string;
  version: string;
  path: string;
  query: Record<string, string>;
  params: TParams;
  body: TBody;
  user: AuthenticatedUser | null;
  clientIp: string;
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: "user" | "admin" | "service_account";
  scopes: string[];
}

export interface GatewayRouteConfig<TBody = unknown, TParams = Record<string, string>> {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  version: string;
  summary: string;
  description: string;
  tags: string[];
  rateLimitTier?: RateLimitMeta["tier"];
  rateLimitOverride?: { limit: number; windowSeconds: number };
  requireAuth?: boolean;
  requiredScopes?: string[];
  deprecated?: boolean;
  sunsetDate?: string;
  alternativeEndpoint?: string;
  handler: (req: GatewayRequest<TBody, TParams>) => Promise<unknown> | unknown;
}

/* ========================================================================== */
/* Core Endpoint Contracts                                                   */
/* ========================================================================== */

// 1. GET /api/v1/quran/verses/:surah
export interface GetQuranVersesParams {
  surah: string; // Surah number (1-114) or slug
}

export interface GetQuranVersesQuery {
  page?: number;
  limit?: number;
  translations?: string[]; // e.g. ["hebrew-he", "english-clearquran"]
  includeTafsir?: boolean;
  tafsirSource?: string;
  lang?: "en" | "ar" | "he";
}

export interface QuranVerseItem {
  verseKey: string; // e.g. "1:1"
  surahNumber: number;
  ayahNumber: number;
  textUthmani: string;
  textSimple?: string;
  juzNumber?: number;
  pageNumber?: number;
  translations: Array<{
    sourceCode: string;
    language: string;
    author: string;
    text: string;
  }>;
  tafsirSnippet?: {
    sourceCode: string;
    author: string;
    text: string;
  };
}

export interface GetQuranVersesResponse {
  surah: {
    number: number;
    nameAr: string;
    nameEn: string;
    nameHe: string;
    revelationType: "Meccan" | "Medinan";
    totalAyat: number;
  };
  verses: QuranVerseItem[];
}

// 2. POST /api/v1/search
export interface SearchRequestBody {
  query: string;
  mode?: "hybrid" | "semantic" | "keyword" | "exact";
  languages?: Array<"en" | "ar" | "he">;
  collections?: Array<"quran" | "tafsir" | "hadith" | "knowledge_graph">;
  limit?: number;
  page?: number;
  filters?: {
    surahRange?: [number, number];
    authors?: string[];
  };
}

export interface SearchResultItem {
  id: string;
  entityType: "ayah" | "tafsir" | "hadith" | "concept" | "scholar";
  title: string;
  arabicText?: string;
  snippet: string;
  verseKey?: string;
  surahNumber?: number;
  ayahNumber?: number;
  score: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  query: string;
  correctedQuery?: string;
  totalResults: number;
  modeUsed: string;
  results: SearchResultItem[];
  suggestedQuestions?: string[];
  aiBrief?: {
    summary: string;
    confidence: number;
  };
}

// 3. GET /api/v1/user/progress
export interface GetUserProgressQuery {
  startDate?: string;
  endDate?: string;
  includeStreak?: boolean;
  includeAchievements?: boolean;
}

export interface UserProgressItem {
  date: string;
  versesReadCount: number;
  minutesSpent: number;
  completedSurahs: number[];
  bookmarksCount: number;
  notesCount: number;
}

export interface UserProgressResponse {
  userId: string;
  currentStreakDays: number;
  longestStreakDays: number;
  totalVersesRead: number;
  totalHoursStudied: number;
  readingPlanProgress: {
    planId: string;
    planName: string;
    completionPercentage: number;
    targetDaysRemaining: number;
  };
  recentDailyLogs: UserProgressItem[];
  unlockedAchievements: Array<{
    id: string;
    title: string;
    unlockedAt: string;
    badgeIcon: string;
  }>;
}
