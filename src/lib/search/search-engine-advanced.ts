/**
 * Quran Gateway — Advanced Search Infrastructure & Ranking Engine
 * Combines BM25 Text Search, Vector Similarity, BM25+TF-IDF Weighting,
 * Multi-Facet Aggregations, Query Parsing, and Search Analytics Logging.
 */

import { ApiError } from "@/lib/api-gateway/errors";

// -----------------------------------------------------------------------------
// 1. QUERY PARSER & AST
// -----------------------------------------------------------------------------

export type QueryTokenType =
  "EXACT_PHRASE" | "BOOLEAN_AND" | "BOOLEAN_OR" | "BOOLEAN_NOT" | "WILDCARD" | "TERM";

export interface QueryToken {
  type: QueryTokenType;
  value: string;
}

export interface ParsedSearchQuery {
  rawQuery: string;
  exactPhrases: string[];
  mustTerms: string[]; // AND
  shouldTerms: string[]; // OR
  mustNotTerms: string[]; // NOT
  wildcardTerms: string[]; // * prefix
  cleanKeywords: string[];
  isSemanticEligible: boolean;
}

/**
 * Parse raw user search input into structured boolean/phrase query constraints
 */
export function parseAdvancedSearchQuery(query: string): ParsedSearchQuery {
  const q = query.trim();
  const exactPhrases: string[] = [];
  const mustTerms: string[] = [];
  const shouldTerms: string[] = [];
  const mustNotTerms: string[] = [];
  const wildcardTerms: string[] = [];
  const cleanKeywords: string[] = [];

  if (!q) {
    return {
      rawQuery: "",
      exactPhrases: [],
      mustTerms: [],
      shouldTerms: [],
      mustNotTerms: [],
      wildcardTerms: [],
      cleanKeywords: [],
      isSemanticEligible: false,
    };
  }

  // 1. Extract exact phrases in quotes "..."
  const phraseRegex = /"([^"]+)"/g;
  let match: RegExpExecArray | null;
  let strippedQuery = q;

  while ((match = phraseRegex.exec(q)) !== null) {
    if (match[1].trim()) {
      exactPhrases.push(match[1].trim());
    }
  }
  strippedQuery = strippedQuery.replace(phraseRegex, "").trim();

  // 2. Tokenize remaining terms
  const tokens = strippedQuery.split(/\s+/).filter(Boolean);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const upperToken = token.toUpperCase();

    if (upperToken === "AND" || upperToken === "OR" || upperToken === "NOT") {
      continue;
    }

    if (token.startsWith("-") && token.length > 1) {
      mustNotTerms.push(token.slice(1).toLowerCase());
    } else if (token.startsWith("+") && token.length > 1) {
      mustTerms.push(token.slice(1).toLowerCase());
    } else if (token.endsWith("*") && token.length > 1) {
      wildcardTerms.push(token.slice(0, -1).toLowerCase());
    } else {
      shouldTerms.push(token.toLowerCase());
      cleanKeywords.push(token.toLowerCase());
    }
  }

  return {
    rawQuery: q,
    exactPhrases,
    mustTerms,
    shouldTerms,
    mustNotTerms,
    wildcardTerms,
    cleanKeywords,
    isSemanticEligible: cleanKeywords.length > 0 || exactPhrases.length > 0,
  };
}

/**
 * Levenshtein distance calculation for Typo Tolerance (distance <= 2)
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// -----------------------------------------------------------------------------
// 2. BM25 RANKING & MULTI-FACTOR SCORING ENGINE
// -----------------------------------------------------------------------------

export interface MultiFactorScoreParams {
  bm25Score: number; // Full-text BM25 score (0 - 100)
  vectorSimilarity: number; // Embedding Cosine similarity (0 - 1.0)
  userBookmarkCount: number; // Popularity signal
  viewCount: number; // Engagement signal
  recencyTimestamp: number; // Freshness signal (epoch ms)
}

/**
 * Multi-Factor Ranking Formula:
 * FinalScore = (0.45 * BM25) + (0.35 * VectorSim * 100) + (0.10 * UserPopularity) + (0.10 * FreshnessDecay)
 */
export function calculateMultiFactorRankingScore(params: MultiFactorScoreParams): number {
  const { bm25Score, vectorSimilarity, userBookmarkCount, viewCount, recencyTimestamp } = params;

  const normalizedVector = Math.min(100, Math.max(0, vectorSimilarity * 100));

  // Logarithmic scaling for high popularity signals
  const popularityScore = Math.min(100, Math.log2(userBookmarkCount * 5 + viewCount + 1) * 10);

  // Freshness decay over 365 days
  const ageDays = (Date.now() - recencyTimestamp) / (1000 * 60 * 60 * 24);
  const freshnessScore = Math.max(0, 100 * Math.exp(-0.002 * ageDays));

  const finalScore =
    bm25Score * 0.45 + normalizedVector * 0.35 + popularityScore * 0.1 + freshnessScore * 0.1;

  return Number(finalScore.toFixed(2));
}

// -----------------------------------------------------------------------------
// 3. FACETED SEARCH AGGREGATOR
// -----------------------------------------------------------------------------

export interface SearchFacetGroup {
  surahFacets: Record<number, number>;
  topicFacets: Record<string, number>;
  languageFacets: Record<string, number>;
  sourceFacets: Record<string, number>;
}

export function extractSearchFacets(
  items: Array<{
    surahNumber?: number;
    topic?: string;
    language?: string;
    source?: string;
  }>,
): SearchFacetGroup {
  const surahFacets: Record<number, number> = {};
  const topicFacets: Record<string, number> = {};
  const languageFacets: Record<string, number> = {};
  const sourceFacets: Record<string, number> = {};

  for (const item of items) {
    if (item.surahNumber) {
      surahFacets[item.surahNumber] = (surahFacets[item.surahNumber] || 0) + 1;
    }
    if (item.topic) {
      topicFacets[item.topic] = (topicFacets[item.topic] || 0) + 1;
    }
    if (item.language) {
      languageFacets[item.language] = (languageFacets[item.language] || 0) + 1;
    }
    if (item.source) {
      sourceFacets[item.source] = (sourceFacets[item.source] || 0) + 1;
    }
  }

  return { surahFacets, topicFacets, languageFacets, sourceFacets };
}

// -----------------------------------------------------------------------------
// 4. SEARCH ANALYTICS & ZERO-RESULT TRACKER
// -----------------------------------------------------------------------------

export interface QueryLogEntry {
  query: string;
  resultsCount: number;
  executionTimeMs: number;
  clickedResultId?: string;
  timestamp: string;
}

const searchLogsBuffer: QueryLogEntry[] = [];

export function logSearchQuery(entry: QueryLogEntry): void {
  searchLogsBuffer.push(entry);

  if (entry.resultsCount === 0) {
    if (import.meta.env.DEV) {
      console.warn(`[Search Analytics] Zero-result query logged: "${entry.query}"`);
    }
  }
}

export function getZeroResultQueriesSummary(): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const log of searchLogsBuffer) {
    if (log.resultsCount === 0) {
      summary[log.query] = (summary[log.query] || 0) + 1;
    }
  }
  return summary;
}
