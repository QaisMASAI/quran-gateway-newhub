/**
 * Text manipulation utilities
 */

/**
 * Clean and fix Arabic Uthmani text glyphs, specifically replacing problematic
 * ARABIC SMALL HIGH ROUNDED ZERO (U+06DF) on Alef that renders as broken box symbols
 */
export function sanitizeArabicText(s: string): string {
  if (!s) return "";
  return (
    s
      // Replace U+06DF (small high rounded zero over silent alef) with standard sukoon U+0652 or clean
      .replace(/[\u06DF\u06E0]/g, "\u0652")
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
