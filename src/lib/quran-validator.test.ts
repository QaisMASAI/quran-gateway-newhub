import { describe, it, expect } from "vitest";
import { validateAyahText, getUnicodeCharInfo } from "./quran-validator";
import { sanitizeArabicText } from "@/utils/text";

describe("Quran Unicode Forensic & Uthmani Validator", () => {
  it("preserves Official Madinah Uthmani characters (U+06DF silent alef)", () => {
    // Al-Fatihah 1:1 and Al-Baqarah 2:2 with U+06DF (ARABIC SMALL HIGH ROUNDED ZERO)
    const originalText = "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ ۟";
    const sanitized = sanitizeArabicText(originalText);
    
    // Check that U+06DF is NOT converted to U+0652 (Sukoon) or stripped!
    expect(sanitized).toContain("۟");
    expect(sanitized).not.toContain("ْ ۟");
  });

  it("detects replacement characters (U+FFFD)", () => {
    const corruptText = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ \uFFFD";
    const res = validateAyahText(1, 1, corruptText);
    
    expect(res.isValid).toBe(false);
    expect(res.anomalies.some((a) => a.issueType === "REPLACEMENT_CHARACTER")).toBe(true);
  });

  it("detects zero-width control characters", () => {
    const hiddenCharText = "بِسْمِ\u200B ٱللَّهِ";
    const res = validateAyahText(1, 1, hiddenCharText);
    
    expect(res.isValid).toBe(false);
    expect(res.anomalies.some((a) => a.issueType === "INVISIBLE_CONTROL_CHAR")).toBe(true);
    
    // Verify sanitizeArabicText strips it cleanly
    const cleaned = sanitizeArabicText(hiddenCharText);
    expect(cleaned).toBe("بِسْمِ ٱللَّهِ");
  });

  it("correctly identifies Uthmani annotation marks", () => {
    const info06DF = getUnicodeCharInfo("۟");
    expect(info06DF.codePoint).toBe("U+06DF");
    expect(info06DF.isCombining).toBe(true);

    const info06D6 = getUnicodeCharInfo("ۖ");
    expect(info06D6.codePoint).toBe("U+06D6");
    expect(info06D6.isUthmaniAnnotation).toBe(true);
  });

  it("passes valid Madinah Uthmani verse", () => {
    const validAyah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
    const res = validateAyahText(1, 1, validAyah);
    
    expect(res.isValid).toBe(true);
    expect(res.anomalies.length).toBe(0);
    expect(res.isCanonicalNFC).toBe(true);
  });
});
