/**
 * Text manipulation utilities
 */

/**
 * Clean and fix Arabic Uthmani glyphs that frequently render as unsupported
 * floating circles/boxes in some web fonts.
 */
export function sanitizeArabicText(s: string): string {
  if (!s) return "";
  return (
    s
      // Remove Quranic micro-signs that are often displayed as isolated circles
      // with non-specialized fonts (e.g. after words like "ءَامَنُوا۟").
      .replace(/[\u06DF\u06E0]/g, "")
      // Remove invisible control characters that break font rendering
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim()
  );
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
