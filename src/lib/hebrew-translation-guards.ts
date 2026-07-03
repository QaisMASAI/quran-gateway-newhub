export interface HebrewTranslationGuardInput {
  arabic: string;
  english: string;
  hebrew: string;
}

export interface HebrewTranslationGuardResult {
  ok: boolean;
  reason?: "missing_arabic" | "missing_english" | "empty_hebrew";
}

function hasMeaningfulText(value: string): boolean {
  return value.replace(/\s+/g, " ").trim().length > 0;
}

export function validateHebrewTranslationTriplet(
  input: HebrewTranslationGuardInput,
): HebrewTranslationGuardResult {
  if (!hasMeaningfulText(input.arabic)) return { ok: false, reason: "missing_arabic" };
  if (!hasMeaningfulText(input.english)) return { ok: false, reason: "missing_english" };
  if (!hasMeaningfulText(input.hebrew)) return { ok: false, reason: "empty_hebrew" };
  return { ok: true };
}
