/**
 * Text manipulation utilities
 */

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
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Pad number with leading zeros
 */
export function padNumber(num: number, length: number): string {
  return String(num).padStart(length, "0");
}
