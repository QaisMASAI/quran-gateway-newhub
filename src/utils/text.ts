/**
 * Text manipulation utilities
 */

/**
 * Preserves authentic Official Madinah Mushaf Uthmani text glyphs and Unicode code points.
 * Ensures strict Unicode NFC normalization and strips invisible zero-width anomalies
 * that break browser OpenType text shaping.
 */
export function sanitizeArabicText(s: string): string {
  if (!s) return "";
  return s
    // Remove invisible control characters that break font OpenType shaping
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Apply canonical Unicode Normalization Form C (NFC) for proper grapheme clustering
    .normalize("NFC")
    .trim();
}

/**
 * Strip HTML tags and clean whitespace
 */
export function cleanText(s: string): string {
  return s
    .replace(/<sup[^>]*>.*?<\/sup>/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Pad number with leading zeros
 */
export function padNumber(num: number, length: number): string {
  return String(num).padStart(length, "0");
}
