// Islamic-inspired logo tailored to the site palette (olive green + gold).
// Composition: rounded square emblem → 8-pointed Khatam star (Rub el Hizb)
// → inner circular medallion → crescent + star, all gold on deep olive.
export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id="noor-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.30 0.08 155)" />
          <stop offset="50%" stopColor="oklch(0.24 0.07 160)" />
          <stop offset="100%" stopColor="oklch(0.18 0.05 165)" />
        </linearGradient>

        <linearGradient id="noor-logo-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        <radialGradient id="noor-logo-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer rounded plate */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#noor-logo-bg)" />

      {/* Subtle radial inner glow */}
      <circle cx="32" cy="32" r="26" fill="url(#noor-logo-glow)" />

      {/* Gold outer border */}
      <rect
        x="3.5"
        y="3.5"
        width="57"
        height="57"
        rx="14.5"
        fill="none"
        stroke="url(#noor-logo-gold)"
        strokeWidth="1.2"
        opacity="0.65"
      />

      <g transform="translate(32 32)">
        {/* Khatam — 8-pointed star from two 45deg rotated squares */}
        <rect
          x="-17"
          y="-17"
          width="34"
          height="34"
          rx="2"
          fill="none"
          stroke="url(#noor-logo-gold)"
          strokeWidth="1.5"
        />
        <rect
          x="-17"
          y="-17"
          width="34"
          height="34"
          rx="2"
          fill="none"
          stroke="url(#noor-logo-gold)"
          strokeWidth="1.5"
          transform="rotate(45)"
        />

        {/* Inner golden ring medallion */}
        <circle r="11" fill="none" stroke="url(#noor-logo-gold)" strokeWidth="1" opacity="0.85" />
        <circle
          r="9"
          fill="none"
          stroke="url(#noor-logo-gold)"
          strokeWidth="0.5"
          strokeDasharray="1.5 1.5"
          opacity="0.6"
        />

        {/* Radiant Crescent + 8-pointed micro star */}
        <g fill="url(#noor-logo-gold)">
          <path d="M 4 -6.5 a 7.5 7.5 0 1 0 0 13 a 5.5 5.5 0 1 1 0 -13 z" />
          <path d="M 6.5 -1 l 1 2 l 2.2 .3 l -1.6 1.5 l .4 2.2 l -2 -1.1 l -2 1.1 l .4 -2.2 l -1.6 -1.5 l 2.2 -.3 z" />
        </g>
      </g>
    </svg>
  );
}
