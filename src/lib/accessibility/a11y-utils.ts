/**
 * Quran Gateway — Accessibility (a11y) Utilities & ARIA Live Announcements
 * Standards: WCAG 2.1 Level AA / AAA
 */

/**
 * Announce dynamic content updates to Screen Readers via ARIA Live Region
 */
export function announceToScreenReader(
  message: string,
  politeness: "polite" | "assertive" = "polite",
): void {
  if (typeof document === "undefined") return;

  let liveRegion = document.getElementById("a11y-live-region");
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "a11y-live-region";
    liveRegion.setAttribute("aria-live", politeness);
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    document.body.appendChild(liveRegion);
  } else {
    liveRegion.setAttribute("aria-live", politeness);
  }

  // Clear and update text to trigger screen reader announcement
  liveRegion.textContent = "";
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, 50);
}

/**
 * Trap focus within a modal or drawer container for keyboard accessibility
 */
export function trapFocus(containerElement: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== "Tab") return;

  const focusableSelectors =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusables = Array.from(
    containerElement.querySelectorAll<HTMLElement>(focusableSelectors),
  ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0);

  if (focusables.length === 0) return;

  const firstFocusable = focusables[0];
  const lastFocusable = focusables[focusables.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstFocusable) {
      lastFocusable.focus();
      event.preventDefault();
    }
  } else {
    if (document.activeElement === lastFocusable) {
      firstFocusable.focus();
      event.preventDefault();
    }
  }
}

/**
 * Calculate relative luminance for WCAG 2.1 Contrast Ratio formula
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Check WCAG 2.1 contrast ratio between two RGB colors
 * Returns ratio (e.g. 4.5, 7.1)
 */
export function calculateContrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number],
): number {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Validate minimum touch target dimensions (WCAG 2.1 Target Size 2.5.5 - 44x44px min / 48x48px target)
 */
export function validateTouchTarget(element: HTMLElement): {
  valid: boolean;
  width: number;
  height: number;
} {
  const rect = element.getBoundingClientRect();
  return {
    valid: rect.width >= 44 && rect.height >= 44,
    width: rect.width,
    height: rect.height,
  };
}
