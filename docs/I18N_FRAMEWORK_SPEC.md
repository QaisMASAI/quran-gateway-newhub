# Quran Gateway — Internationalization (i18n) & Bidi Architecture Spec

**Author**: Lead Internationalization Specialist  
**Supported Locales**: Arabic (`ar` - Classical/MSA), English (`en` - US/UK), Hebrew (`he` - Modern)  
**Expansion Locales**: Urdu (`ur`), Farsi (`fa`), Turkish (`tr`)  
**Compliance Standard**: W3C Internationalization (i18n) & Unicode Bidirectional (Bidi) Algorithm (UAX #9)  

---

## Executive Summary

Quran Gateway provides an advanced, zero-compromise multilingual experience across Arabic, English, and Hebrew. The platform supports Right-To-Left (RTL) layout switching, complex Arabic 6-category plural rules, bidirectional text isolation (preventing layout distortion when embedding Latin/Hebrew terms inside Arabic Ayahs), and regional Islamic localization.

---

## 1. i18n System Architecture

```
                                  +-----------------------+
                                  | User Preference /     |
                                  | Auto Language Detect  |
                                  +-----------+-----------+
                                              |
                                              v
                                  +-----------------------+
                                  |   /src/lib/i18n.ts    |
                                  |   (i18next Engine)    |
                                  +-----------+-----------+
                                              |
              +-------------------------------+-------------------------------+
              |                               |                               |
              v                               v                               v
   +---------------------+         +---------------------+         +---------------------+
   | Arabic (ar - RTL)   |         | Hebrew (he - RTL)   |         | English (en - LTR)  |
   | - Amiri Font        |         | - Frank Ruhl Libre  |         | - Plus Jakarta Sans |
   | - 6 Plural Forms    |         | - Gender Rules      |         | - Standard Plurals  |
   | - Eastern Numerals  |         | - Western Numerals  |         | - Western Numerals  |
   +----------+----------+         +----------+----------+         +----------+----------+
              |                               |                               |
              +-------------------------------+-------------------------------+
                                              |
                                              v
                                  +-----------------------+
                                  |  /src/lib/locale-ui   |
                                  |  DOM Direction        |
                                  |  dir="rtl" / "ltr"    |
                                  +-----------------------+
```

---

## 2. String Externalization & Pluralization Matrix

### 2.1 Arabic 6-Category Pluralization (CLDR Standard)
Unlike English (2 plural forms: singular/plural), Arabic requires **6 distinct forms**:

| Category | Count Rule | Arabic Example | English Equivalent |
| :--- | :--- | :--- | :--- |
| **`zero`** | `count = 0` | لا يوجد آيات | 0 verses |
| **`one`** | `count = 1` | آية واحدة | 1 verse |
| **`two`** | `count = 2` | آيتان | 2 verses |
| **`few`** | `count = 3..10` | 5 آيات | 5 verses |
| **`many`** | `count = 11..99` | 25 آيةً | 25 verses |
| **`other`** | `count = 100+` | 100 آية | 100 verses |

### 2.2 Hebrew Gender Agreement
Hebrew requires specific suffix variations depending on user or subject gender (e.g. *Baruch Haba* vs *Brucha Haba'a*). Neutral key abstractions are used in `he/common.json`.

---

## 3. Bidirectional (Bidi) Text & Layout Isolation

### 3.1 The Bidi Problem & Solution
When mixed directional text occurs (e.g., embedding an English term like *"Surah Baqarah"* inside an Arabic text paragraph or an Arabic Ayah inside an English sentence), standard rendering engines can distort punctuation, parentheses, and sentence ordering.

### 3.2 Mitigation Pattern (`/src/lib/i18n-bidi-plural.ts`)
- **First Strong Isolate (FSI)**: Encapsulate embedded foreign phrases in `\u2068...\u2069` unicode control characters or JSX `<bdi>` elements.
- **Form Controls**: Enforce `dir="auto"` on user comment and notes inputs so text auto-aligns based on the user's input script.

```tsx
// Bidi Safe Rendering Example
import { wrapBidiIsolate } from "@/lib/i18n-bidi-plural";

export function BidiVerseTitle({ verseKey, englishTitle }: Props) {
  return (
    <h3 dir="auto" className="text-lg font-bold">
      <bdi>{verseKey}</bdi> — <span>{wrapBidiIsolate(englishTitle, "ltr")}</span>
    </h3>
  );
}
```

---

## 4. Typography & Font Loading Strategy

To ensure zero Layout Shift (CLS = 0.00) during language switching, custom font stacks are loaded dynamically based on the active locale:

| Locale | UI Font Stack | Serif / Quranic Reading Stack | Tafsir / Hadith Stack |
| :--- | :--- | :--- | :--- |
| **Arabic (`ar`)** | `font-ui-ar` (Cairo / Naskh) | `font-reading-ar` (Amiri Uthmani) | `font-tafsir-hadith-ar` (Scheherazade) |
| **Hebrew (`he`)** | `font-ui-he` (Assistant) | `font-reading-he` (Frank Ruhl Libre) | `font-tafsir-hadith-he` (David Libre) |
| **English (`en`)** | `font-ui-en` (Plus Jakarta) | `font-reading-en` (Playfair Display) | `font-tafsir-hadith-en` (Merriweather) |

---

## 5. Regional Islamic Features

1. **Hijri Calendar Localization**: Integrated `formatHijriDate()` supporting Umm al-Qura (`ar-SA-u-ca-islamic-umalqura`) and international Hijri calendars.
2. **Regional Tafsir Routing**:
   - Arabic: Default to Ibn Kathir, Al-Tabari, Al-Qurtubi.
   - English: Default to Saheeh International, Clear Quran (Mustafa Khattab), Bridges Translation.
   - Hebrew: Default to Hebrew Quran Translation (Uri Rubin / Rav Rivlin scholarly editions).

---

## 6. Community Translator & Contributor Guidelines

1. **Adding New Keys**: Always add matching keys to `src/locales/en/common.json`, `src/locales/ar/common.json`, and `src/locales/he/common.json`.
2. **Variable Placeholders**: Use double curly brace syntax: `{{count}}`, `{{name}}`.
3. **Punctuation Rules**: Do not hardcode trailing colons or brackets inside translation strings; let CSS pseudo-elements or layout code manage visual delimiters.

---

## 7. Testing Strategy & Automation

- **Pseudo-localization Testing**: Run `npm run test:i18n` with pseudo-locale (`qps-ploc`) to verify that variable strings expand without truncating or overflowing container UI elements.
- **RTL Screenshot Regression**: Automated Playwright viewport snapshots comparing RTL (`ar`, `he`) and LTR (`en`) route layouts.
