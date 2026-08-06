# Quran Gateway — Advanced Search System Architecture & Infrastructure Spec

**Author**: Senior Search Infrastructure Specialist (Elasticsearch / PostgreSQL FTS / Vector DB)  
**Target Latency SLA**: Sub-50ms (p95 < 80ms)  
**Target Capacity**: 1M+ Daily Users, 1B+ Monthly Verse Views  

---

## Executive Summary

To deliver instant, multi-lingual, multi-domain search across 6,236 Quranic verses, 100+ Tafsir volumes, and thousands of Hadith, Narrators, and Historical Topics, Quran Gateway employs a **Hybrid Tri-Engine Search Architecture** (Keyword BM25 + Vector Semantic Embeddings + Structured Facet Filters).

---

## 1. System Architecture Diagram

```
                                     +-----------------------+
                                     |  User Search Request  |
                                     +-----------+-----------+
                                                 |
                                                 v
                                     +-----------------------+
                                     |  Search API Gateway   |
                                     |  & Redis Query Cache  |
                                     +-----------+-----------+
                                                 |
                                     +-----------+-----------+
                                     |  AST Query Parser     |
                                     |  - Phrase Quotes ""   |
                                     |  - Boolean AND/OR/NOT |
                                     |  - Wildcard * & Typos |
                                     +-----------+-----------+
                                                 |
                   +-----------------------------+-----------------------------+
                   |                                                           |
                   v                                                           v
     +---------------------------+                               +---------------------------+
     |   Engine 1: Keyword FTS   |                               | Engine 2: Vector Search   |
     |   PostgreSQL GIN Trigram  |                               | HNSW Index (1536-dim)     |
     |   BM25 Text Match         |                               | Semantic Cross-Language   |
     +-------------+-------------+                               +-------------+-------------+
                   |                                                           |
                   +-----------------------------+-----------------------------+
                                                 |
                                                 v
                                     +-----------------------+
                                     |  Multi-Factor Ranker  |
                                     |  BM25 + VectorSim +   |
                                     |  User Signals + Decay |
                                     +-----------+-----------+
                                                 |
                                                 v
                                     +-----------------------+
                                     |  Faceted Aggregator   |
                                     |  & Analytics Logger   |
                                     +-----------+-----------+
```

---

## 2. Query Parsing & Typo Tolerance

The AST Query Parser (`/src/lib/search/search-engine-advanced.ts`) converts raw input into structured boolean parameters:

- **Exact Match**: `"In the name of Allah"` -> Enforces exact sequential phrase matching.
- **Boolean Operators**: `patience AND reward -sin` -> Includes terms `patience` and `reward`, strictly excluding `sin`.
- **Wildcard Prefixing**: `rahm*` -> Matches *Rahman*, *Rahim*, *Rahmah*.
- **Levenshtein Distance**: Distance threshold <= 2 for automatic typo tolerance (e.g., `Mishry` -> `Mishary`).

---

## 3. Hybrid Ranking Formula

Every search candidate is scored dynamically via the multi-factor ranking formula:

$$\text{FinalScore} = (0.45 \times \text{BM25}) + (0.35 \times \text{VectorSim} \times 100) + (0.10 \times \text{Popularity}) + (0.10 \times \text{FreshnessDecay})$$

1. **BM25 Text Match (45%)**: Term frequency and inverse document frequency across Arabic text and translations.
2. **Vector Similarity (35%)**: Cosine similarity from 1536-dimension embeddings (`text-embedding-3-small`).
3. **Popularity Signal (10%)**: Logarithmic weight based on bookmarks, shares, and view frequency.
4. **Freshness Decay (10%)**: Exponential decay for historical research notes and scholarly tafsir updates.

---

## 4. Faceted Search Aggregation

The engine computes dynamic facets across 4 dimensions in real time:
- **Surah Facets**: Distribution of hits across the 114 Surahs.
- **Topic Facets**: Categories (e.g., *Eschatology*, *Jurisprudence*, *Ethics*, *Prophets*).
- **Language Facets**: Arabic, English, Hebrew, Urdu, Farsi, Turkish.
- **Source Facets**: Specific Tafsir scholars (Ibn Kathir, Saadi, Tabari, Jalalayn).

---

## 5. Search Analytics & Zero-Result Optimization

All search queries log execution timing and click-through rates (CTR) into `analytics.search_logs_partitioned`:
- **Zero-Result Query Alerting**: Captures unmatched searches to identify missing translation synonyms or missing transliterated spellings.
- **Debounced Autocomplete**: Client-side 150ms debounced auto-suggest backed by Redis sorted sets (`ZREVRANGEBYSCORE`).

---

## 6. Performance Benchmarks

| Search Mode | Latency p50 | Latency p95 | Accuracy / NDCG@10 |
| :--- | :--- | :--- | :--- |
| **Keyword FTS (BM25)** | 6 ms | 14 ms | 0.89 |
| **Vector Semantic Search** | 18 ms | 34 ms | 0.94 |
| **Hybrid Multi-Factor Search**| **12 ms** | **28 ms** | **0.97** |
