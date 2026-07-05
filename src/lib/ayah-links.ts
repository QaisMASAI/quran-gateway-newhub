// Reverse index: for any (surah, ayah), return the prophets, topics, and
// emotions whose curated references include that verse, plus a list of
// connected verses (siblings sharing a curated group).
// All data is source-only — no AI interpretation.

import { PROPHETS, type Prophet } from "./prophets";
import { TOPICS, type Topic } from "./topics";
import { EMOTIONS } from "./emotions";
import { SURAH_NAMES_HE } from "./surah-names-he";

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

export function getAyahLinks(surah: number, ayah: number): AyahLink[] {
  const bySurah = INDEX.get(surah);
  if (!bySurah) return [];
  const b = bySurah.get(ayah);
  if (!b) return [];
  const out: AyahLink[] = [];
  for (const [slug, title] of b.prophets) out.push({ kind: "prophet", slug, title });
  for (const [slug, title] of b.topics) out.push({ kind: "topic", slug, title });
  for (const [slug, title] of b.emotions) out.push({ kind: "emotion", slug, title });
  return out;
}

/**
 * Returns up to `limit` other verses that share a curated group
 * (topic/emotion/prophet) with the given verse. Preference order:
 * topics first (denser semantic links), then emotions, then prophets.
 * Each result carries the group it came from so the UI can label "מתוך: …".
 */
export function getConnectedVerses(surah: number, ayah: number, limit = 4): ConnectedVerse[] {
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
        surahName: SURAH_NAMES_HE[m.surah] ?? `סורה ${m.surah}`,
        via: meta,
      });
    }
  }

  return out;
}

export type { Prophet, Topic };
