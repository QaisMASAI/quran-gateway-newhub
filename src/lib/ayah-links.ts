// Reverse index: for any (surah, ayah), return the prophets, topics, and
// emotions whose curated references include that verse, plus a list of
// connected verses (siblings sharing a curated group).
// All data is source-only — no AI interpretation.

import { PROPHETS, type Prophet } from "./prophets";
import { TOPICS, type Topic } from "./topics";
import { EMOTIONS } from "./emotions";
import { SURAH_NAMES_AR, SURAH_NAMES_EN, SURAH_NAMES_HE } from "./surah-names-he";

type UiLocale = "he" | "ar" | "en";

export type AyahLink =
  | { kind: "prophet"; slug: string; title: string }
  | { kind: "topic"; slug: string; title: string }
  | { kind: "emotion"; slug: string; title: string };

export type ConnectedVerse = {
  surah: number;
  ayah: number;
  surahName: string;
  via: { kind: "topic" | "emotion" | "prophet"; title: string };
};

type Bucket = {
  prophets: Map<string, string>;
  topics: Map<string, string>;
  emotions: Map<string, string>;
};

// surah -> ayah -> bucket
const INDEX = new Map<number, Map<number, Bucket>>();

// group key -> ordered list of {surah, ayah}
const GROUP_MEMBERS = new Map<string, Array<{ surah: number; ayah: number }>>();
const GROUP_TITLE = new Map<string, { kind: "topic" | "emotion" | "prophet"; title: string }>();

function ensure(surah: number, ayah: number): Bucket {
  let bySurah = INDEX.get(surah);
  if (!bySurah) {
    bySurah = new Map();
    INDEX.set(surah, bySurah);
  }
  let b = bySurah.get(ayah);
  if (!b) {
    b = { prophets: new Map(), topics: new Map(), emotions: new Map() };
    bySurah.set(ayah, b);
  }
  return b;
}

function indexRefs(
  refs: Array<{ surah: number; ayah: number; to?: number }>,
  add: (surah: number, ayah: number) => void,
) {
  for (const r of refs) {
    const end = r.to ?? r.ayah;
    for (let a = r.ayah; a <= end; a++) add(r.surah, a);
  }
}

function registerGroup(
  key: string,
  meta: { kind: "topic" | "emotion" | "prophet"; title: string },
  refs: Array<{ surah: number; ayah: number; to?: number }>,
) {
  GROUP_TITLE.set(key, meta);
  const members: Array<{ surah: number; ayah: number }> = [];
  indexRefs(refs, (s, a) => members.push({ surah: s, ayah: a }));
  GROUP_MEMBERS.set(key, members);
}

function build() {
  for (const p of PROPHETS) {
    indexRefs(p.refs, (s, a) => {
      ensure(s, a).prophets.set(p.slug, p.nameHe);
    });
    registerGroup(`prophet:${p.slug}`, { kind: "prophet", title: p.nameHe }, p.refs);
  }
  for (const t of TOPICS) {
    indexRefs(t.refs, (s, a) => {
      ensure(s, a).topics.set(t.slug, t.title);
    });
    registerGroup(`topic:${t.slug}`, { kind: "topic", title: t.title }, t.refs);
  }
  for (const e of EMOTIONS) {
    indexRefs(e.refs, (s, a) => {
      ensure(s, a).emotions.set(e.slug, e.title);
    });
    registerGroup(`emotion:${e.slug}`, { kind: "emotion", title: e.title }, e.refs);
  }
}

build();

function hasHebrewLetters(value: string): boolean {
  return /[\u0590-\u05FF]/.test(value);
}

function slugToReadable(slug: string): string {
  return slug
    .split("-")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ""))
    .join(" ")
    .trim();
}

function topicTitleForLocale(topic: Topic, locale: UiLocale): string {
  if (locale === "he") return topic.title;

  if (locale === "ar" && topic.subtitle && !hasHebrewLetters(topic.subtitle)) {
    return topic.subtitle;
  }

  return slugToReadable(topic.slug);
}

function prophetTitleForLocale(prophet: Prophet, locale: UiLocale): string {
  if (locale === "ar") return prophet.nameAr;
  if (locale === "he") return prophet.nameHe;
  return slugToReadable(prophet.slug);
}

function emotionTitleForLocale(emotion: (typeof EMOTIONS)[number], locale: UiLocale): string {
  if (locale === "he") return emotion.title;
  return slugToReadable(emotion.slug);
}

function surahNameForLocale(surah: number, locale: UiLocale): string {
  if (locale === "ar") return SURAH_NAMES_AR[surah] ?? `سورة ${surah}`;
  if (locale === "en") return SURAH_NAMES_EN[surah] ?? `Surah ${surah}`;
  return SURAH_NAMES_HE[surah] ?? `סורה ${surah}`;
}

export function getAyahLinks(surah: number, ayah: number, locale: UiLocale = "he"): AyahLink[] {
  const bySurah = INDEX.get(surah);
  if (!bySurah) return [];
  const b = bySurah.get(ayah);
  if (!b) return [];
  const out: AyahLink[] = [];

  for (const [slug] of b.prophets) {
    const prophet = PROPHETS.find((p) => p.slug === slug);
    out.push({
      kind: "prophet",
      slug,
      title: prophet ? prophetTitleForLocale(prophet, locale) : slugToReadable(slug),
    });
  }

  for (const [slug] of b.topics) {
    const topic = TOPICS.find((t) => t.slug === slug);
    out.push({
      kind: "topic",
      slug,
      title: topic ? topicTitleForLocale(topic, locale) : slugToReadable(slug),
    });
  }

  for (const [slug] of b.emotions) {
    const emotion = EMOTIONS.find((e) => e.slug === slug);
    out.push({
      kind: "emotion",
      slug,
      title: emotion ? emotionTitleForLocale(emotion, locale) : slugToReadable(slug),
    });
  }

  return out;
}

/**
 * Returns up to `limit` other verses that share a curated group
 * (topic/emotion/prophet) with the given verse. Preference order:
 * topics first (denser semantic links), then emotions, then prophets.
 * Each result carries the group it came from so the UI can label "מתוך: …".
 */
export function getConnectedVerses(surah: number, ayah: number, limit = 4, locale: UiLocale = "he"): ConnectedVerse[] {
  const bySurah = INDEX.get(surah);
  const b = bySurah?.get(ayah);
  if (!b) return [];

  const seen = new Set<string>([`${surah}:${ayah}`]);
  const out: ConnectedVerse[] = [];

  const groupKeys: string[] = [
    ...[...b.topics.keys()].map((s) => `topic:${s}`),
    ...[...b.emotions.keys()].map((s) => `emotion:${s}`),
    ...[...b.prophets.keys()].map((s) => `prophet:${s}`),
  ];

  for (const key of groupKeys) {
    if (out.length >= limit) break;
    const members = GROUP_MEMBERS.get(key) ?? [];
    const meta = GROUP_TITLE.get(key)!;
    for (const m of members) {
      if (out.length >= limit) break;
      const id = `${m.surah}:${m.ayah}`;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({
        surah: m.surah,
        ayah: m.ayah,
        surahName: surahNameForLocale(m.surah, locale),
        via: meta,
      });
    }
  }

  return out;
}

export type { Prophet, Topic };
