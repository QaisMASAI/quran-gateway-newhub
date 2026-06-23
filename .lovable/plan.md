
# Plan: Quran Knowledge Experience Upgrade

Audience: ages 9–70, light Muslims and non-Muslims seeking knowledge. Everything in he / ar / en. Source policy is strict: **only Quran verses, authentic Tafsir (Ibn Kathir, Al-Saadi, Al-Muyassar, Al-Tabari, Al-Qurtubi), and authentic Asbab Al-Nuzul**. When sources are missing, the UI shows "No authenticated source was found." We never let the AI invent religious content.

Five shippable steps. Each step is independently usable.

---

## Step 1 — Source-grounded content model (foundation for everything else)

Add the missing schema so every Tafsir / Asbab paragraph is *traceable* to a named source. Without this, Phases 3–6 cannot honor the "authentic sources only" rule.

New tables (migration `knowledge_sources_v1`):
- `tafsir_sources` — `slug` (ibn_kathir, al_saadi, al_muyassar, al_tabari, al_qurtubi), `name_he/ar/en`, `author`, `era`, `license`.
- `tafsir_passages` — `surah, ayah_start, ayah_end, source_id, lang, body, citation`.
- `asbab_nuzul` — `surah, ayah_start, ayah_end, source_id, lang, body, citation`.
- `topic_lessons` — `entity_id, source_id, lang, body, citation` (so "Lessons and Reflections" can only come from a cited source).
- Add `tafsir_passage_id` + `asbab_id` FKs to `knowledge_entity_verses` so a topic verse can pin a specific Tafsir paragraph.

Public `TO anon` SELECT policies + GRANTs (read-only reference data). All seeded via migration, not a server fn.

Seed: ~5 short authentic Tafsir excerpts per "core" topic/prophet to validate the pipeline end-to-end. Bulk import comes in Step 4.

---

## Step 2 — Beginner Onboarding flow

Route: `src/routes/onboarding.tsx` (public, full-screen, swipe-paginated).

Steps:
1. **Welcome** — what the Quran is, who it was revealed to, why it matters. Three illustrated cards.
2. **How to explore** — Topics / Prophets / Stories / Search / Ask. Animated tour with mini previews.
3. **Choose interests** — multi-select chips (Prophets, Family, Ethics, Prayer, Mercy, Justice, Women, Children, Spirituality, History, Interfaith, …).
4. **Recommended path** — personalized starter journey computed from selections (pulls from `knowledge_entities` filtered by `tags`).

Persistence:
- Signed-out: `localStorage` `onboarding_v1` (completed + interests).
- Signed-in: new `user_preferences` table (`user_id`, `interests text[]`, `onboarded_at`).
- Header CTA "Take the tour" for returning users.
- First-visit detection in `__root.tsx` → redirect to `/onboarding` once.

Premium polish: framer-motion page transitions, hand-drawn-style SVG illustrations (generated once), generous type, calm gold/olive accents using existing tokens.

---

## Step 3 — Topics library expansion (toward 500+)

Goal: deep, browsable Topic library — not a flat list of names.

- New migration `topics_taxonomy_v1`:
  - `topic_categories` (Faith, Worship, Ethics, Family, Society, Prophets & Stories, Afterlife, Nature & Creation, Knowledge & Wisdom, Interfaith, …).
  - Add `category_id`, `parent_id`, `tags text[]`, `difficulty smallint` to `knowledge_entities`.
- Curated seed: 500 topics across categories, trilingual `name_*`, `summary_*`, `aliases`, linked to verses via `knowledge_entity_verses`. Authored as `scripts/seeds/topics-500.json` and inserted in the migration.
- New route `src/routes/topics.tsx`: faceted browser (category tree on the side, search, sort by alphabetical / popular / recently added, beginner filter).
- Existing `/learn/topic/$slug` becomes the premium Topic Page (Step 5).

Honest scope note: 500 trilingual entries authored by hand is large. Step 3 ships a curated seed of ~150 high-value topics + the taxonomy + the library UI. A follow-on PR can keep adding 50 at a time without further schema changes.

---

## Step 4 — Authentic Tafsir + Asbab corpus

The "authentic sources only" promise requires actual source text. We import public-domain trilingual excerpts:

- Build-time importer `scripts/import/tafsir.ts` reads from the open `spa5k/tafsir_api` (Ibn Kathir, Al-Saadi, Al-Muyassar, Al-Tabari, Al-Qurtubi where available) for AR + EN, plus the existing HE corpus we already have, and writes one big SQL seed migration `tafsir_corpus_v1`.
- Same for Asbab Al-Nuzul (Al-Wahidi public domain, AR + EN).
- Verse pages and Topic pages render Tafsir grouped by source with a citation footer ("Ibn Kathir, on 2:255").
- If no row exists for the requested `(surah, ayah, lang)` → render the "No authenticated source was found" empty state, never a model answer.

AI Ask change: tighten `quran-ai.functions.ts` system prompt to **"You may only restate, summarize, or translate the provided Tafsir/Asbab excerpts and Quran verses below. If they do not cover the question, reply that no authenticated source was found."** The model becomes a translator/summarizer of cited text, not an opinion source. We pass the matched `tafsir_passages` into the prompt as context.

---

## Step 5 — Premium Topic & Prophet pages

Redesign `src/routes/learn/$kind/$slug.tsx` (or split into `topic.$slug.tsx` / `prophet.$slug.tsx`) into an editorial article layout:

Sections, in order:
1. **Hero** — name (he/ar/en), one-line essence, category chip, hero illustration.
2. **Overview** — long-form intro from `summary_*`.
3. **Quranic Perspective** — how the Quran addresses the topic, with anchor verses.
4. **Key Themes** — subtheme cards (from `tags` + `knowledge_relations`).
5. **Related Verses** — grouped by surah, each expandable to show context (±2 ayat).
6. **Contextual Passages** — surrounding ayat rendered with the same AyahCard.
7. **Authentic Tafsir** — tabs per source (Ibn Kathir / Al-Saadi / …), each with citation.
8. **Asbab Al-Nuzul** — when present.
9. **Lessons & Reflections** — rendered only from `topic_lessons` rows; otherwise hidden.
10. **Related** — Topics, Prophets, Stories, Concepts, Questions (clickable chips from `knowledge_relations`).
11. **Continue Learning** — next suggested entity from the user's journey.

Prophet page reuses the same shell + extra sections: Biography, Historical Context, Mission, People & Nation, Major Events Timeline (horizontal scroll), Connections to Other Prophets.

Design: Apple/Linear/Notion editorial — large serif display headings (already loaded), generous line-height, sticky in-page TOC on desktop, full-bleed section dividers using the existing `arabesque-bg` / `mosque-arch` motifs. Mobile-first, framer-motion section reveals.

---

## Out of scope (explicit)

- No AI-generated religious commentary.
- No paid Tafsir sources requiring licensing.
- No audio recitation, no reading plans (separate future work).
- No design overhaul of unrelated pages (home, search, ask shell stay as-is).

## Credits

- Build-time AI calls: 0
- Runtime AI calls: unchanged (1 per Ask question, now grounded in cited Tafsir)
- New ongoing cost: 0

---

## Recommended order to ship

1. Step 1 (schema) → 2. Step 2 (onboarding, visible win) → 3. Step 5 (premium page shell, even with current data) → 4. Step 3 (topic expansion) → 5. Step 4 (Tafsir corpus import).

Approve and I'll start with **Step 1: the schema migration**.
