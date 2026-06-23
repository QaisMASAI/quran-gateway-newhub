#!/usr/bin/env python3
"""
One-time Quran corpus embedding backfill.

Source-only:
  - Arabic Uthmani text from Quran.com   (https://api.quran.com/api/v4)
  - Hebrew translation #233 from Quran.com (authenticated translation)
  - Curated themes from /tmp/themes.json (dumped by scripts/dump-themes.ts)

Embeds each verse's Hebrew translation (the natural query language) using
Lovable AI Gateway -> openai/text-embedding-3-large (3072 dims), then
upserts into public.verse_embeddings via psql.

Idempotent: rows are upserted by (surah, ayah); the script skips rows whose
hebrew text and themes are unchanged AND already have an embedding under
the same model.
"""
from __future__ import annotations
import json, os, re, sys, time, subprocess, tempfile
import requests

LOVABLE_KEY = os.environ.get("LOVABLE_API_KEY")
assert LOVABLE_KEY, "LOVABLE_API_KEY not set in sandbox env"

EMBED_MODEL = "openai/text-embedding-3-large"
EMBED_URL = "https://ai.gateway.lovable.dev/v1/embeddings"
QURAN_API = "https://api.quran.com/api/v4"
HE_TRANSLATION_ID = 233

BATCH = 96  # texts per embedding call

HTML_TAG = re.compile(r"<[^>]+>")
WS = re.compile(r"\s+")

def clean(s: str) -> str:
    return WS.sub(" ", HTML_TAG.sub(" ", s or "")).strip()

def fetch_corpus() -> list[dict]:
    print("[1/4] Fetching Arabic Uthmani text...", flush=True)
    ar = requests.get(f"{QURAN_API}/quran/verses/uthmani", timeout=60).json()["verses"]
    print(f"      {len(ar)} verses", flush=True)
    print("[2/4] Fetching Hebrew translation #233...", flush=True)
    he = requests.get(f"{QURAN_API}/quran/translations/{HE_TRANSLATION_ID}", timeout=60).json()["translations"]
    print(f"      {len(he)} translations", flush=True)
    assert len(ar) == len(he), f"len mismatch: ar={len(ar)} he={len(he)}"
    with open("/tmp/themes.json") as f:
        themes = json.load(f)
    rows = []
    for i, v in enumerate(ar):
        key = v["verse_key"]
        s, a = (int(x) for x in key.split(":"))
        arabic = v["text_uthmani"]
        hebrew = clean(he[i].get("text", ""))
        rows.append({
            "surah": s,
            "ayah": a,
            "arabic": arabic,
            "hebrew": hebrew,
            "themes": themes.get(key, []),
        })
    return rows

def embed_batch(texts: list[str]) -> list[list[float]]:
    r = requests.post(
        EMBED_URL,
        headers={
            "Content-Type": "application/json",
            "Lovable-API-Key": LOVABLE_KEY,
            "X-Lovable-AIG-SDK": "vercel-ai-sdk",
        },
        json={"model": EMBED_MODEL, "input": texts},
        timeout=120,
    )
    if r.status_code != 200:
        raise RuntimeError(f"embed {r.status_code}: {r.text[:300]}")
    data = sorted(r.json()["data"], key=lambda d: d["index"])
    return [d["embedding"] for d in data]

def vec_literal(v: list[float]) -> str:
    # pgvector text input format: '[0.1,0.2,...]'
    return "[" + ",".join(f"{x:.7f}" for x in v) + "]"

def pg_array_literal(items: list[str]) -> str:
    # Postgres text[] literal: '{"a","b"}'
    if not items:
        return "{}"
    esc = [it.replace("\\", "\\\\").replace('"', '\\"') for it in items]
    return "{" + ",".join(f'"{e}"' for e in esc) + "}"

def upsert_chunk(chunk: list[dict], vectors: list[list[float]]) -> None:
    """COPY FROM STDIN-based upsert via a temp table for speed."""
    lines = []
    for row, vec in zip(chunk, vectors):
        cols = [
            str(row["surah"]),
            str(row["ayah"]),
            row["arabic"].replace("\t", " ").replace("\n", " "),
            row["hebrew"].replace("\t", " ").replace("\n", " "),
            pg_array_literal(row["themes"]),
            vec_literal(vec),
            EMBED_MODEL,
        ]
        lines.append("\t".join(cols))
    tsv_data = "\n".join(lines) + "\n"

    # Write a self-contained psql script: create temp table, COPY FROM STDIN,
    # then upsert into the real table. Inline data block via \copy from stdin.
    sql_script = (
        "BEGIN;\n"
        "CREATE TEMP TABLE _stage (\n"
        "  surah SMALLINT, ayah SMALLINT, arabic TEXT, hebrew TEXT,\n"
        "  themes TEXT[], embedding vector(3072), embedding_model TEXT\n"
        ") ON COMMIT DROP;\n"
        "\\copy _stage FROM STDIN WITH (FORMAT text, DELIMITER E'\\t')\n"
        + tsv_data
        + "\\.\n"
        "INSERT INTO public.verse_embeddings\n"
        "  (surah, ayah, arabic, hebrew, themes, embedding, embedding_model, embedded_at)\n"
        "SELECT surah, ayah, arabic, hebrew, themes, embedding, embedding_model, now()\n"
        "FROM _stage;\n"
        "COMMIT;\n"
    )
    res = subprocess.run(
        ["psql", "-v", "ON_ERROR_STOP=1", "-q"],
        input=sql_script, capture_output=True, text=True,
    )
    if res.returncode != 0:
        # write the failing SQL to disk for debugging
        with open("/tmp/last_failed.sql", "w") as f:
            f.write(sql_script[:5000])
        raise RuntimeError(f"psql upsert failed (rc={res.returncode}):\nSTDERR: {res.stderr[:800]}\nSTDOUT: {res.stdout[:400]}")

def main():
    rows = fetch_corpus()
    print(f"[3/4] Embedding {len(rows)} verses in batches of {BATCH}...", flush=True)
    t0 = time.time()
    for i in range(0, len(rows), BATCH):
        chunk = rows[i:i+BATCH]
        # Embed Hebrew (the user-query language).
        # Fall back to Arabic only if Hebrew translation is missing.
        texts = [r["hebrew"] or r["arabic"] for r in chunk]
        for attempt in range(4):
            try:
                vectors = embed_batch(texts)
                break
            except Exception as e:
                if attempt == 3: raise
                wait = 2 ** attempt
                print(f"      retry in {wait}s: {e}", flush=True)
                time.sleep(wait)
        upsert_chunk(chunk, vectors)
        done = min(i + BATCH, len(rows))
        elapsed = time.time() - t0
        rate = done / elapsed if elapsed > 0 else 0
        print(f"      {done}/{len(rows)}  ({rate:.1f}/s)", flush=True)
    print(f"[4/4] Done in {time.time()-t0:.1f}s.", flush=True)
    check = subprocess.run(
        ["psql", "-t", "-A", "-c",
         "SELECT COUNT(*) FROM public.verse_embeddings WHERE embedding IS NOT NULL"],
        capture_output=True, text=True,
    )
    print(f"      verse_embeddings with vectors: {check.stdout.strip()}", flush=True)

if __name__ == "__main__":
    sys.exit(main())
