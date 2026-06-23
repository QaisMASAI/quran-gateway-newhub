// Server-only helper for calling the Lovable AI Gateway embeddings endpoint.
// We use a raw fetch rather than the AI SDK's embed() because (a) we need
// fine-grained batching control for the backfill job and (b) it keeps this
// helper dependency-free and easy to share with scripts.
//
// Default model: openai/text-embedding-3-large (3072 dims) — matches the
// schema's `embedding vector(3072)` column. Re-embedding under a different
// model requires changing the column type.

export const EMBEDDING_MODEL = "openai/text-embedding-3-large";
export const EMBEDDING_DIMS = 3072;

const ENDPOINT = "https://ai.gateway.lovable.dev/v1/embeddings";

export interface EmbedOptions {
  apiKey: string;
  input: string | string[];
  model?: string;
}

export async function embedTexts({
  apiKey,
  input,
  model = EMBEDDING_MODEL,
}: EmbedOptions): Promise<number[][]> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    body: JSON.stringify({ model, input }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Embedding request failed: ${res.status} ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    data?: Array<{ embedding: number[]; index: number }>;
  };
  const data = json.data ?? [];
  // Sort by `index` to preserve input order regardless of provider ordering.
  data.sort((a, b) => a.index - b.index);
  return data.map((d) => d.embedding);
}
