// Islamic-inspired logo tailored to the site palette (olive green + gold).
// Composition: rounded square emblem → 8-pointed Khatam star (Rub el Hizb)
// → inner circular medallion → crescent + star, all gold on deep olive.
export function Logo({ className = "h-15 w-15" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.32 0.07 160)" />
          <stop offset="100%" stopColor="oklch(0.22 0.05 165)" />
        </linearGradient>
        <linearGradient id="logo-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.86 0.13 85)" />
          <stop offset="100%" stopColor="oklch(0.68 0.14 65)" />
        </linearGradient>
      </defs>

      {/* Emblem plate */}
      <rect x="2" y="2" width="90" height="90" rx="14" fill="url(#logo-bg)" />
      <rect
        x="3.5"
        y="3.5"
        width="57"
        height="57"
        rx="12.5"
        fill="none"
        stroke="url(#logo-gold)"
        strokeWidth="0.8"
        opacity="0.55"
      />

      <g transform="translate(32 32)" fill="none" stroke="url(#logo-gold)" strokeLinejoin="round">
        {/* Khatam — 8-pointed star from two overlapping squares */}
        <rect x="-18" y="-18" width="36" height="36" rx="1.5" strokeWidth="1.4" />
        <rect x="-18" y="-18" width="36" height="36" rx="1.5" strokeWidth="1.4" transform="rotate(45)" />
        {/* Inner medallion */}
        <circle r="11" strokeWidth="0.9" opacity="0.7" />

        {/* Crescent + star (filled gold) */}
        <g fill="url(#logo-gold)" stroke="none">
          <path d="M 4 -7 a 8 8 0 1 0 0 14 a 6 6 0 1 1 0 -14 z" />
          <path d="M 7.5 -1 l 1.1 2.3 l 2.5 .35 l -1.8 1.75 l .45 2.5 l -2.25 -1.2 l -2.25 1.2 l .45 -2.5 l -1.8 -1.75 l 2.5 -.35 z" />
        </g>
      </g>
    </svg>
  );
}
