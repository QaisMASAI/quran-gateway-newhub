import { describe, expect, it } from "vitest";
import { Route as AskRoute } from "@/routes/ask";
import { Route as SearchRoute } from "@/routes/search";
import { parseQueryPrefill } from "@/lib/query-prefill";

describe("query prefill parsing", () => {
  it("returns missing for absent value", () => {
    expect(parseQueryPrefill(undefined)).toEqual({
      q: "",
      qState: "missing",
      src: "unknown",
    });
  });

  it("returns empty for blank strings", () => {
    expect(parseQueryPrefill("   ")).toEqual({
      q: "",
      qState: "empty",
      src: "unknown",
    });
  });

  it("sanitizes control characters as invalid", () => {
    expect(parseQueryPrefill("mercy\u0000")).toEqual({
      q: "mercy",
      qState: "invalid",
      src: "unknown",
    });
  });
});

describe("/search validateSearch", () => {
  it("prefills q from valid query param", () => {
    const validateSearch = SearchRoute.options.validateSearch as (input: Record<string, unknown>) => unknown;
    const parsed = validateSearch({
      q: "  what is tawakkul  ",
      src: "hero_input",
    });
    expect(parsed).toEqual({
      q: "what is tawakkul",
      qState: "ok",
      src: "hero_input",
    });
  });

  it("marks non-string q as invalid", () => {
    const validateSearch = SearchRoute.options.validateSearch as (input: Record<string, unknown>) => unknown;
    const parsed = validateSearch({ q: 42 });
    expect(parsed).toEqual({
      q: "",
      qState: "invalid",
      src: "unknown",
    });
  });
});

describe("/ask validateSearch", () => {
  it("prefills q from popular questions link", () => {
    const validateSearch = AskRoute.options.validateSearch as (input: Record<string, unknown>) => unknown;
    const parsed = validateSearch({
      q: "How does the Quran teach hope?",
      src: "popular_questions",
    });
    expect(parsed).toEqual({
      q: "How does the Quran teach hope?",
      qState: "ok",
      src: "popular_questions",
    });
  });

  it("normalizes empty q to empty state", () => {
    const validateSearch = AskRoute.options.validateSearch as (input: Record<string, unknown>) => unknown;
    const parsed = validateSearch({ q: "   " });
    expect(parsed).toEqual({
      q: "",
      qState: "empty",
      src: "unknown",
    });
  });
});
