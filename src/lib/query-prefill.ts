export type QueryPrefillState = "missing" | "empty" | "invalid" | "ok";

export type QueryPrefillSource = "hero_input" | "popular_questions" | "unknown";

export type QueryPrefillResult = {
  q: string;
  qState: QueryPrefillState;
  src: QueryPrefillSource;
};

const MAX_QUERY_LENGTH = 240;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

export function parseQueryPrefill(raw: unknown): QueryPrefillResult {
  const base = parseQueryPrefillRaw(raw);
  return {
    ...base,
    src: "unknown",
  };
}

function parseQueryPrefillRaw(raw: unknown): Omit<QueryPrefillResult, "src"> {
  if (raw === undefined || raw === null) {
    return { q: "", qState: "missing" };
  }

  if (typeof raw !== "string") {
    return { q: "", qState: "invalid" };
  }

  const withoutControls = raw.replace(CONTROL_CHARS, "");
  const trimmed = withoutControls.trim();

  if (!trimmed) {
    return { q: "", qState: "empty" };
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return { q: trimmed.slice(0, MAX_QUERY_LENGTH), qState: "invalid" };
  }

  if (withoutControls !== raw) {
    return { q: trimmed, qState: "invalid" };
  }

  return { q: trimmed, qState: "ok" };
}

function parsePrefillSource(raw: unknown): QueryPrefillSource {
  if (raw === "hero_input" || raw === "popular_questions") return raw;
  return "unknown";
}

export function buildQueryPrefillSearch(search: Record<string, unknown>): QueryPrefillResult {
  const parsed = parseQueryPrefillRaw(search.q);
  return {
    ...parsed,
    src: parsePrefillSource(search.src),
  };
}
