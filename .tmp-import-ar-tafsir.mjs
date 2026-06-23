import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const files = [
  ['ar.muyassar.json', 'al_muyassar', 'אל-תפסיר אל-מיסר', 'التفسير الميسر', 'Tafsir Al-Muyassar', 'Unknown', 'Modern'],
  ['ar.qurtubi.json', 'al_qurtubi', 'תפסיר אל-קורטובי', 'تفسير القرطبي', 'Tafsir Al-Qurtubi', 'Al-Qurtubi', '13th century'],
  ['ar.saddi.json', 'al_saadi', 'תפסיר א-סעדי', 'تفسير السعدي', 'Tafsir Al-Saadi', 'Al-Saadi', '20th century'],
  ['ar.jalalayn.json', 'al_jalalayn', 'תפסיר אל-ג׳לאלין', 'تفسير الجلالين', 'Tafsir Al-Jalalayn', 'Al-Mahalli & Al-Suyuti', '15th century'],
  ['ar.baghawi.json', 'al_baghawi', 'תפסיר אל-בע׳אווי', 'تفسير البغوي', 'Tafsir Al-Baghawi', 'Al-Baghawi', '12th century'],
  ['ar.waseet.json', 'al_waseet', 'א-תפסיר אל-ווסיט', 'التفسير الوسيط', 'Tafsir Al-Waseet', 'Muhammad Sayyid Tantawi', 'Modern'],
  ['ar.tanweer.json', 'al_tanweer', 'א-תחריר וא-תנוויר', 'التحرير والتنوير', 'Tafsir Al-Tanweer', 'Ibn Ashur', '20th century'],
];

const sourceRows = files.map(([, slug, name_he, name_ar, name_en, author, era]) => ({
  slug,
  name_he,
  name_ar,
  name_en,
  author,
  era,
  license: 'public-domain',
}));

let { error } = await supabase
  .from('tafsir_sources')
  .upsert(sourceRows, { onConflict: 'slug' });
if (error) throw error;

const slugs = files.map(([, slug]) => slug);
const { data: sources, error: srcErr } = await supabase
  .from('tafsir_sources')
  .select('id,slug')
  .in('slug', slugs);
if (srcErr) throw srcErr;

const sourceIdBySlug = new Map((sources ?? []).map((s) => [s.slug, s.id]));

for (const slug of slugs) {
  const sourceId = sourceIdBySlug.get(slug);
  if (!sourceId) continue;
  const del = await supabase
    .from('tafsir_passages')
    .delete()
    .eq('source_id', sourceId)
    .eq('lang', 'ar');
  if (del.error) throw del.error;
}

const batchSize = 500;
let total = 0;
for (const [filename, slug] of files) {
  const sourceId = sourceIdBySlug.get(slug);
  if (!sourceId) {
    console.log('skip_missing_source', slug);
    continue;
  }

  const raw = await readFile(`/mnt/user-uploads/${filename}`, 'utf8');
  const parsed = JSON.parse(raw);
  const tafsir = Array.isArray(parsed?.tafsir) ? parsed.tafsir : [];

  const rows = [];
  for (let s = 0; s < tafsir.length; s += 1) {
    const surahRows = Array.isArray(tafsir[s]) ? tafsir[s] : [];
    for (let a = 0; a < surahRows.length; a += 1) {
      const body = typeof surahRows[a] === 'string' ? surahRows[a].trim() : String(surahRows[a] ?? '').trim();
      if (!body) continue;
      rows.push({
        source_id: sourceId,
        surah: s + 1,
        ayah_start: a + 1,
        ayah_end: a + 1,
        lang: 'ar',
        body,
        citation: null,
      });
    }
  }

  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const ins = await supabase.from('tafsir_passages').insert(chunk);
    if (ins.error) {
      throw new Error(`${slug} insert failed at chunk ${i / batchSize + 1}: ${ins.error.message}`);
    }
  }

  total += rows.length;
  console.log('imported', slug, rows.length);
}

console.log('done_total', total);
