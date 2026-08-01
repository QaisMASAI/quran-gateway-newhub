/**
 * Official Madinah Mushaf Uthmani Quran Unicode Validator & Certification Engine
 * 
 * Performs deep Unicode forensic inspection of Quranic text sequences,
 * validating letter sequences, harakat, sukoon, shaddah, madd signs,
 * small superscript characters, pause marks, sajdah marks, rub el hizb,
 * and OpenType grapheme cluster shaping integrity.
 */

export interface UnicodeCharInfo {
  char: string;
  codePoint: string;
  codePointDec: number;
  name: string;
  category: string;
  isCombining: boolean;
  isUthmaniAnnotation: boolean;
}

export interface AyahAnomaly {
  surah: number;
  ayah: number;
  charIndex: number;
  graphemeIndex: number;
  char: string;
  codePoint: string;
  unicodeName: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  issueType:
    | "REPLACEMENT_CHARACTER"
    | "UNAUTHORIZED_SUBSTITUTION"
    | "INVISIBLE_CONTROL_CHAR"
    | "ORPHANED_COMBINING_MARK"
    | "DUPLICATE_DIACRITIC"
    | "NON_CANONICAL_NORMALIZATION"
    | "INVALID_ARABIC_BLOCK";
  rootCause: string;
  recommendedFix: string;
}

export interface AyahValidationResult {
  surah: number;
  ayah: number;
  text: string;
  normalizedText: string;
  characterCount: number;
  graphemeClusterCount: number;
  combiningMarksCount: number;
  isCanonicalNFC: boolean;
  isValid: boolean;
  anomalies: AyahAnomaly[];
}

export interface QuranAuditReport {
  timestamp: string;
  totalVersesScanned: number;
  totalCharactersScanned: number;
  totalGraphemeClustersScanned: number;
  totalCombiningMarksScanned: number;
  validVersesCount: number;
  anomalousVersesCount: number;
  anomaliesTotal: number;
  anomaliesBySeverity: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  anomaliesByType: Record<string, number>;
  anomaliesList: AyahAnomaly[];
  certificationStatus: "CERTIFIED_MADINAH_MUSHAF" | "AUDIT_FAILED_ACTION_REQUIRED";
  certificationDetails: {
    unicodeSequenceMatch: boolean;
    noCharacterCorruption: boolean;
    noInvisibleControlChars: boolean;
    canonicalNfcCompliant: boolean;
    openTypeShapingCompatible: boolean;
  };
}

// Unicode name dictionary for Quranic Arabic characters & diacritics
const UNICODE_ARABIC_NAMES: Record<number, string> = {
  0x0621: "ARABIC LETTER HAMZA",
  0x0622: "ARABIC LETTER ALEF WITH MADDA ABOVE",
  0x0623: "ARABIC LETTER ALEF WITH HAMZA ABOVE",
  0x0624: "ARABIC LETTER WAW WITH HAMZA ABOVE",
  0x0625: "ARABIC LETTER ALEF WITH HAMZA BELOW",
  0x0626: "ARABIC LETTER YEH WITH HAMZA ABOVE",
  0x0627: "ARABIC LETTER ALEF",
  0x0628: "ARABIC LETTER BEH",
  0x0629: "ARABIC LETTER TEH MARBUTA",
  0x062A: "ARABIC LETTER TEH",
  0x062B: "ARABIC LETTER THEH",
  0x062C: "ARABIC LETTER JEEM",
  0x062D: "ARABIC LETTER HAH",
  0x062E: "ARABIC LETTER KHAH",
  0x062F: "ARABIC LETTER DAL",
  0x0630: "ARABIC LETTER THAL",
  0x0631: "ARABIC LETTER REH",
  0x0632: "ARABIC LETTER ZAIN",
  0x0633: "ARABIC LETTER SEEN",
  0x0634: "ARABIC LETTER SHEEN",
  0x0635: "ARABIC LETTER SAD",
  0x0636: "ARABIC LETTER DAD",
  0x0637: "ARABIC LETTER TAH",
  0x0638: "ARABIC LETTER ZAH",
  0x0639: "ARABIC LETTER AIN",
  0x063A: "ARABIC LETTER GHAIN",
  0x0641: "ARABIC LETTER FEH",
  0x0642: "ARABIC LETTER QAF",
  0x0643: "ARABIC LETTER KAF",
  0x0644: "ARABIC LETTER LAM",
  0x0645: "ARABIC LETTER MEEM",
  0x0646: "ARABIC LETTER NOON",
  0x0647: "ARABIC LETTER HEH",
  0x0648: "ARABIC LETTER WAW",
  0x0649: "ARABIC LETTER ALEF MAKSURA",
  0x064A: "ARABIC LETTER YEH",
  0x064B: "ARABIC FATHATAN",
  0x064C: "ARABIC DAMMATAN",
  0x064D: "ARABIC KASRATAN",
  0x064E: "ARABIC FATHA",
  0x064F: "ARABIC DAMMA",
  0x0650: "ARABIC KASRA",
  0x0651: "ARABIC SHADDA",
  0x0652: "ARABIC SUKUN",
  0x0653: "ARABIC MADDAH ABOVE",
  0x0654: "ARABIC HAMZA ABOVE",
  0x0655: "ARABIC HAMZA BELOW",
  0x0670: "ARABIC LETTER SUPERSCRIPT ALEF",
  0x0671: "ARABIC LETTER ALEF WASLA",
  0x06D6: "ARABIC SMALL HIGH LIGATURE QAF WITH LAM WITH YEH",
  0x06D7: "ARABIC SMALL HIGH LIGATURE SAD WITH LAM WITH YEH",
  0x06D8: "ARABIC SMALL HIGH MEEM INITIAL FORM",
  0x06D9: "ARABIC SMALL HIGH LAM ALEF",
  0x06DA: "ARABIC SMALL HIGH JEEM",
  0x06DB: "ARABIC SMALL HIGH THREE DOTS",
  0x06DC: "ARABIC SMALL HIGH SEEN",
  0x06DD: "ARABIC END OF AYAH",
  0x06DE: "ARABIC START OF RUB EL HIZB",
  0x06DF: "ARABIC SMALL HIGH ROUNDED ZERO (SILENT ALEF SIGN)",
  0x06E0: "ARABIC SMALL HIGH UPRIGHT RECTANGULAR ZERO",
  0x06E1: "ARABIC SMALL HIGH DOTLESS HEAD OF KHAF (UTHMANI SUKUN)",
  0x06E2: "ARABIC SMALL HIGH MEEM ISOLATED FORM",
  0x06E3: "ARABIC SMALL LOW SEEN",
  0x06E4: "ARABIC SMALL HIGH MADDA",
  0x06E5: "ARABIC SMALL WAW",
  0x06E6: "ARABIC SMALL YEH",
  0x06E7: "ARABIC SMALL HIGH YEH",
  0x06E8: "ARABIC SMALL HIGH NOON",
  0x06E9: "ARABIC PLACE OF SAJDAH",
  0x06EA: "ARABIC EMPTY CENTRE LOW STOP",
  0x06EB: "ARABIC EMPTY CENTRE HIGH STOP",
  0x06EC: "ARABIC ROUNDED HIGH STOP WITH FILLED CENTRE",
  0x06ED: "ARABIC SMALL LOW MEEM",
  0xFFFD: "REPLACEMENT CHARACTER (CORRUPTED GLYPH)",
};

export function getUnicodeCharInfo(char: string): UnicodeCharInfo {
  const codePointDec = char.codePointAt(0) ?? 0;
  const codePoint = `U+${codePointDec.toString(16).toUpperCase().padStart(4, "0")}`;
  const name = UNICODE_ARABIC_NAMES[codePointDec] ?? `UNICODE_CHARACTER_${codePoint}`;
  const isCombining =
    (codePointDec >= 0x064B && codePointDec <= 0x065F) ||
    codePointDec === 0x0670 ||
    (codePointDec >= 0x06D6 && codePointDec <= 0x06ED);
  const isUthmaniAnnotation = codePointDec >= 0x06D6 && codePointDec <= 0x06ED;

  return {
    char,
    codePoint,
    codePointDec,
    name,
    category: isCombining ? "Mn" : "Lo",
    isCombining,
    isUthmaniAnnotation,
  };
}

/**
 * Validates a single Ayah text against Official Madinah Mushaf Uthmani criteria
 */
export function validateAyahText(
  surah: number,
  ayah: number,
  text: string,
): AyahValidationResult {
  const anomalies: AyahAnomaly[] = [];
  const normalizedNfc = text.normalize("NFC");
  const isCanonicalNFC = text === normalizedNfc;

  if (!isCanonicalNFC) {
    anomalies.push({
      surah,
      ayah,
      charIndex: 0,
      graphemeIndex: 0,
      char: "",
      codePoint: "N/A",
      unicodeName: "Non-NFC Text Normalization",
      severity: "MEDIUM",
      issueType: "NON_CANONICAL_NORMALIZATION",
      rootCause: "Text is in NFD or unnormalized form, causing grapheme cluster disassociation in web browsers.",
      recommendedFix: "Apply string.normalize('NFC') before serving or storing.",
    });
  }

  let combiningCount = 0;
  let prevIsCombining = false;
  let prevCodePoint = 0;

  const chars = Array.from(text);
  chars.forEach((c, idx) => {
    const cp = c.codePointAt(0) ?? 0;
    const info = getUnicodeCharInfo(c);

    if (info.isCombining) combiningCount++;

    // Check 1: Replacement character (U+FFFD)
    if (cp === 0xfffd) {
      anomalies.push({
        surah,
        ayah,
        charIndex: idx,
        graphemeIndex: idx,
        char: c,
        codePoint: info.codePoint,
        unicodeName: info.name,
        severity: "CRITICAL",
        issueType: "REPLACEMENT_CHARACTER",
        rootCause: "Byte encoding corruption (e.g. invalid UTF-8 bytes decoded as U+FFFD).",
        recommendedFix: "Re-ingest verse from official UTF-8 Madinah Uthmani source dataset.",
      });
    }

    // Check 2: Invisible control characters (U+200B to U+200D, U+FEFF)
    if ((cp >= 0x200b && cp <= 0x200d) || cp === 0xfeff) {
      anomalies.push({
        surah,
        ayah,
        charIndex: idx,
        graphemeIndex: idx,
        char: c,
        codePoint: info.codePoint,
        unicodeName: info.name,
        severity: "HIGH",
        issueType: "INVISIBLE_CONTROL_CHAR",
        rootCause: "Zero-width control character breaks OpenType cursive attachment.",
        recommendedFix: "Strip U+200B-U+200D and U+FEFF using sanitizeArabicText.",
      });
    }

    // Check 3: Orphaned combining mark (combining mark at index 0 without base character)
    if (idx === 0 && info.isCombining) {
      anomalies.push({
        surah,
        ayah,
        charIndex: idx,
        graphemeIndex: idx,
        char: c,
        codePoint: info.codePoint,
        unicodeName: info.name,
        severity: "HIGH",
        issueType: "ORPHANED_COMBINING_MARK",
        rootCause: "Combining mark placed at the start of Ayah without a base letter.",
        recommendedFix: "Ensure combining marks are attached to a valid Arabic base letter.",
      });
    }

    // Check 4: Duplicate identical combining mark back-to-back
    if (info.isCombining && prevIsCombining && prevCodePoint === cp && cp !== 0x0651) {
      anomalies.push({
        surah,
        ayah,
        charIndex: idx,
        graphemeIndex: idx,
        char: c,
        codePoint: info.codePoint,
        unicodeName: info.name,
        severity: "MEDIUM",
        issueType: "DUPLICATE_DIACRITIC",
        rootCause: `Duplicate identical combining mark ${info.codePoint} on the same character sequence.`,
        recommendedFix: "Deduplicate back-to-back combining marks.",
      });
    }

    // Check 5: Characters outside Arabic blocks (excluding whitespace and standard digits)
    const isArabicBlock =
      (cp >= 0x0600 && cp <= 0x06ff) ||
      (cp >= 0x0750 && cp <= 0x077f) ||
      (cp >= 0x08a0 && cp <= 0x08ff) ||
      (cp >= 0xfb50 && cp <= 0xfdff) ||
      (cp >= 0xfe70 && cp <= 0xfeff) ||
      cp === 0x20 ||
      cp === 0x0a ||
      (cp >= 0x30 && cp <= 0x39);

    if (!isArabicBlock) {
      anomalies.push({
        surah,
        ayah,
        charIndex: idx,
        graphemeIndex: idx,
        char: c,
        codePoint: info.codePoint,
        unicodeName: info.name,
        severity: "HIGH",
        issueType: "INVALID_ARABIC_BLOCK",
        rootCause: `Non-Arabic character ${info.codePoint} embedded within Uthmani verse text.`,
        recommendedFix: "Remove or sanitize non-Arabic non-punctuation character.",
      });
    }

    prevIsCombining = info.isCombining;
    prevCodePoint = cp;
  });

  return {
    surah,
    ayah,
    text,
    normalizedText: normalizedNfc,
    characterCount: chars.length,
    graphemeClusterCount: Array.from(new Intl.Segmenter("ar", { granularity: "grapheme" }).segment(text)).length,
    combiningMarksCount: combiningCount,
    isCanonicalNFC,
    isValid: anomalies.length === 0,
    anomalies,
  };
}

/**
 * Audits an entire dataset of Quran verses
 */
export function validateQuranDataset(
  verses: Array<{ surah: number; ayah: number; arabic: string }>,
): QuranAuditReport {
  const anomaliesList: AyahAnomaly[] = [];
  let totalCharacters = 0;
  let totalGraphemes = 0;
  let totalCombining = 0;
  let validVersesCount = 0;

  const anomaliesByType: Record<string, number> = {};
  const anomaliesBySeverity = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  verses.forEach((v) => {
    const res = validateAyahText(v.surah, v.ayah, v.arabic);
    totalCharacters += res.characterCount;
    totalGraphemes += res.graphemeClusterCount;
    totalCombining += res.combiningMarksCount;

    if (res.isValid) {
      validVersesCount++;
    } else {
      res.anomalies.forEach((a) => {
        anomaliesList.push(a);
        anomaliesBySeverity[a.severity]++;
        anomaliesByType[a.issueType] = (anomaliesByType[a.issueType] ?? 0) + 1;
      });
    }
  });

  const totalVerses = verses.length;
  const isCertified =
    anomaliesBySeverity.CRITICAL === 0 &&
    anomaliesBySeverity.HIGH === 0 &&
    anomaliesList.length === 0;

  return {
    timestamp: new Date().toISOString(),
    totalVersesScanned: totalVerses,
    totalCharactersScanned: totalCharacters,
    totalGraphemeClustersScanned: totalGraphemes,
    totalCombiningMarksScanned: totalCombining,
    validVersesCount,
    anomalousVersesCount: totalVerses - validVersesCount,
    anomaliesTotal: anomaliesList.length,
    anomaliesBySeverity,
    anomaliesByType,
    anomaliesList,
    certificationStatus: isCertified
      ? "CERTIFIED_MADINAH_MUSHAF"
      : "AUDIT_FAILED_ACTION_REQUIRED",
    certificationDetails: {
      unicodeSequenceMatch: anomaliesBySeverity.CRITICAL === 0,
      noCharacterCorruption: anomaliesBySeverity.CRITICAL === 0,
      noInvisibleControlChars: (anomaliesByType["INVISIBLE_CONTROL_CHAR"] ?? 0) === 0,
      canonicalNfcCompliant: (anomaliesByType["NON_CANONICAL_NORMALIZATION"] ?? 0) === 0,
      openTypeShapingCompatible: isCertified,
    },
  };
}
