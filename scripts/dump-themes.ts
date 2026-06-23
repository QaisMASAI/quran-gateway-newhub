// One-off: dump the curated theme mapping (verse → themes[]) as JSON so the
// offline Python backfill script can label each row without re-implementing
// the TS logic. Run from repo root:  bun scripts/dump-themes.ts
import { PROPHETS } from "../src/lib/prophets";
import { TOPICS } from "../src/lib/topics";
import { EMOTIONS } from "../src/lib/emotions";
import { writeFileSync } from "node:fs";

const map = new Map<string, string[]>(); // "s:a" -> themes[]

function add(s: number, a: number, theme: string) {
  const k = `${s}:${a}`;
  const arr = map.get(k) ?? [];
  if (!arr.includes(theme)) arr.push(theme);
  map.set(k, arr);
}

function expand(refs: Array<{ surah: number; ayah: number; to?: number }>, theme: string) {
  for (const r of refs) {
    const end = r.to ?? r.ayah;
    for (let a = r.ayah; a <= end; a++) add(r.surah, a, theme);
  }
}

for (const p of PROPHETS) expand(p.refs, `prophet:${p.slug}`);
for (const t of TOPICS) expand(t.refs, `topic:${t.slug}`);
for (const e of EMOTIONS) expand(e.refs, `emotion:${e.slug}`);

const out: Record<string, string[]> = {};
for (const [k, v] of map) out[k] = v;
writeFileSync("/tmp/themes.json", JSON.stringify(out));
console.log(`wrote ${Object.keys(out).length} verse→themes entries to /tmp/themes.json`);
