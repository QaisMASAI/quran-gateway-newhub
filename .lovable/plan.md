# Website Upgrade Plan (Content-first, reliability-first, multilingual)

## Goal
Upgrade the product into a stable, content-rich Quran knowledge experience with strong **he/ar/en parity**, while improving speed and reducing empty-state failures.

## Phase 1 — Content backbone hardening (highest priority)
- Audit all content surfaces that currently show empty/partial output:
  - Learn page and its subpages
  - Prophets and Topics overviews/details
  - Timeline, Map, Research, Ask/Search integrations
  - Verse of the Day and Ayah cards
- Normalize content resolution order for all hubs/pages:
  1. database canonical rows
  2. language-specific fallback rows in database
  3. vetted seed corpus (already in repo)
  4. explicit "no authenticated source" state (never silent empty)
- Enforce source-grounded rendering for tafsir/asbab blocks:
  - show only database-backed tafsir passages and citations
  - if source missing, render a clear authenticated-empty state
- Expand Topics/Prophets library via existing structured dataset pipeline (not ad-hoc page text), then wire cards and detail pages to that dataset uniformly.

**Deliverable:** no empty core pages, complete content flow from DB-first pipeline, consistent authenticated-source behavior.

## Phase 2 — Multilingual UX parity (he/ar/en)
- Run a localization parity pass on all navigation and page labels:
  - header, bottom nav, learn entry points, map/research/timeline labels, CTAs
- Fix language-direction correctness globally:
  - RTL for Hebrew/Arabic, LTR for English
  - directional icons, alignment, and text flow mirrored correctly
- Ensure locale-specific routing/state behavior is consistent:
  - selected language persists across navigation
  - no language-only regressions in specific sections
- Align shared components to language-aware labels:
  - share actions
  - verse card controls
  - onboarding/learn/research action names

**Deliverable:** feature-parity UX in all three languages with correct directionality and translations.

## Phase 3 — Reliability and retrieval correctness
- Stabilize verse retrieval stack:
  - verify Arabic verse rendering across all consumers
  - validate DB translation source mapping and source-id resolution
  - add strict fallbacks only when canonical DB path fails
- Stabilize tafsir retrieval stack:
  - validate tafsir source keys/slugs and query filters
  - ensure Arabic tafsir lookup points to uploaded DB records
  - prevent UI regressions when one source is missing
- Repair AI search/ask behavior:
  - ensure questions trigger retrieval + grounded response flow (not just navigation)
  - improve relevance ranking from grounded chunks + entity/verse links
  - return citation-backed responses per locale

**Deliverable:** reliable verse/tafsir rendering and grounded AI retrieval in all languages.

## Phase 4 — Performance improvements (without redesign)
- Reduce repeated remote fetches by tightening client-side caching and request deduplication in translation/knowledge loaders.
- Minimize over-fetch in list/detail pages (query only needed columns/rows; avoid duplicate calls between route and component).
- Improve perceived performance:
  - prioritize first visible content for Learn/Prophets/Topics
  - defer secondary sections (deep related blocks) until primary content is rendered
- Add targeted instrumentation and sanity checks for key paths:
  - verse fetch latency
  - tafsir query success rates
  - AI retrieval hit/miss behavior

**Deliverable:** faster, more stable content rendering with lower failure rates and better responsiveness.

## Phase 5 — QA + release hardening
- Create a multilingual verification matrix (he/ar/en) across:
  - Home, Learn, Topic, Prophet, Surah, Map, Timeline, Research, Ask/Search
- Validate high-priority scenarios:
  - verse of day visible
  - ayah card visible and share actions work
  - map/timeline render non-empty data
  - AI ask returns grounded answer with citations
- Regression sweep on navigation + RTL/LTR behavior.
- Final production polish pass for consistency and trust cues (without changing design identity).

**Deliverable:** release-ready upgrade with verified multilingual parity and reliability.

---

## Technical implementation notes
- Keep TanStack route patterns and existing design identity intact.
- Prefer patching existing data pipeline modules over broad refactors.
- Maintain DB-first architecture; use seed corpus only as controlled fallback.
- Avoid introducing uncited/generated religious content paths.
- Execute in small PR-style slices to minimize risk and credits.

## Success criteria
- No empty core pages.
- Tafsir/Asbab render from database-backed sources with citations.
- Learn/Prophets/Topics show rich, multilingual content.
- AI search returns grounded, relevant results (not navigation-only).
- he/ar/en UI parity with correct RTL/LTR behavior.
- Measurable improvement in reliability and load behavior.