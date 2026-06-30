# Manual verification flow

## 1) Quran.ai MCP cache invalidation (TTL + version)

1. Open **/research** and ask the same question twice (example: `patience`).
2. Confirm the second response is fast (cache hit behavior).
3. Open **/_authenticated/admin/backfill**.
4. Change **TTL (minutes)** to a small value (for example 5) and save.
5. Click **Invalidate cache now** (increments cache version).
6. Return to **/research** and ask the same question again.
7. Confirm it recomputes instead of serving stale data.

## 2) Admin authorization + validation

1. Sign in as a user with `admin` role in `public.user_roles`.
2. Open **/_authenticated/admin/backfill** and run one safe job (for example `backfill-quran-chapters`).
3. Confirm the run appears in **Recent runs** with status updates.
4. Sign in as a non-admin user and open **/_authenticated/admin/backfill**.
5. Confirm job actions fail with forbidden behavior (no successful run creation).
6. Call an admin API without auth token and confirm `401`.
7. Call an admin API with token but non-admin `adminUserId` and confirm `403`.

## 3) Hadith routes + topic grouping

1. Open **/hadith** and verify collections list loads.
2. Open:
   - **/hadith/bukhari**
   - **/hadith/muslim**
   - One book route per collection (for example **/hadith/bukhari/1**, **/hadith/muslim/1**)
3. Open one entry route from each collection:
   - **/hadith/bukhari/entry/{global_id}**
   - **/hadith/muslim/entry/{global_id}**
4. Open **/hadith/topics** and verify related topics come from DB links (`hadith_entity_links` + `knowledge_entities(kind='topic')`).

## 4) Surah + DailyVerse locale regression

Run locale checks from **/_authenticated/admin/backfill** via **Run regression** and verify:

- `en`: Arabic + English translation
- `he`: Arabic + Hebrew translation
- `ar`: Arabic only

Then manually confirm UI on:

- **/surah/1** (and a few other surahs)
- Home page **DailyVerse** block

Also verify missing translation rows degrade safely (Arabic still shown, no crash).

## 5) Tafsir language flow

1. Verify **English tafsir** is shown when `tafsir_passages.lang='en'` exists.
2. Verify **Hebrew tafsir** is DB-only (`lang='he'` first).
3. If Hebrew tafsir is unavailable, confirm fallback to Arabic DB tafsir only (no runtime Quran.com tafsir fetch).