#!/usr/bin/env python3
"""Generate COMPACT SQL: one multi-row INSERT per table."""
import json, pathlib
seed = json.loads(pathlib.Path("scripts/seeds/knowledge-seed.json").read_text())
def s(x): return "'" + x.replace("'", "''") + "'"
def j(o): return s(json.dumps(o, ensure_ascii=False, separators=(',',':'))) + "::jsonb"

rows = []
for i,e in enumerate(seed["entities"]):
    rows.append(f"('{e['kind']}',{s(e['slug'])},{j(e['title'])},{j(e['summary'])},'{{}}'::jsonb,{j({'en':e.get('keywords',[])})},{i},true)")
ent_sql = "INSERT INTO public.knowledge_entities(kind,slug,title_i18n,summary_i18n,description_i18n,keywords_i18n,sort_order,published) VALUES " + ",".join(rows) + " ON CONFLICT (slug) DO UPDATE SET kind=EXCLUDED.kind,title_i18n=EXCLUDED.title_i18n,summary_i18n=EXCLUDED.summary_i18n,keywords_i18n=EXCLUDED.keywords_i18n,sort_order=EXCLUDED.sort_order,published=true;"

# Verses via VALUES join on slug
vrows = []
for v in seed["verses"]:
    for k,(su,a1,a2) in enumerate(v["links"]):
        vrows.append(f"({s(v['slug'])},{su},{a1},{a2},{k})")
ver_sql = (
    "INSERT INTO public.knowledge_entity_verses(entity_id,surah,ayah_start,ayah_end,relevance,sort_order) "
    f"SELECT e.id, v.surah, v.ayah_start, v.ayah_end, 7, v.sort_order FROM (VALUES {','.join(vrows)}) AS v(slug,surah,ayah_start,ayah_end,sort_order) "
    "JOIN public.knowledge_entities e ON e.slug = v.slug ON CONFLICT DO NOTHING;"
)

rrows = [f"({s(f)},{s(t)},'{r}')" for f,t,r in seed["relations"]]
rel_sql = (
    "INSERT INTO public.knowledge_relations(from_id,to_id,relation,weight) "
    f"SELECT a.id, b.id, r.relation::knowledge_relation, 6 FROM (VALUES {','.join(rrows)}) AS r(from_slug,to_slug,relation) "
    "JOIN public.knowledge_entities a ON a.slug=r.from_slug JOIN public.knowledge_entities b ON b.slug=r.to_slug ON CONFLICT (from_id,to_id,relation) DO NOTHING;"
)

full = "BEGIN;\n" + ent_sql + "\n" + ver_sql + "\n" + rel_sql + "\nCOMMIT;\n"
pathlib.Path("/tmp/seed/compact.sql").write_text(full)
print(f"compact size: {len(full)} chars")
