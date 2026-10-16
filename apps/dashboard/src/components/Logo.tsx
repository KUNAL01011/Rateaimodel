const STAR_PATH =
  "M32 17 L35.53 27.15 L46.27 27.37 L37.71 33.85 L40.82 44.14 L32 38 L23.18 44.14 L26.29 33.85 L17.73 27.37 L28.47 27.15 Z";

/**
 * RateAI "Index Seal" brand mark — matches the public site.
 * Ink medallion, gold rating star, gauge-tick ring. Reads on dark surfaces.
 */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="RateAI"
      style={{ flexShrink: 0, display: "block" }}
    >
      <circle cx="32" cy="32" r="31" fill="#1E3A5F" />
      <g stroke="#E6B84C" strokeWidth="1.5" strokeLinecap="round">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const c = Math.cos(a);
          const s = Math.sin(a);
          return (
            <line
              key={i}
              x1={32 + 26.5 * c}
              y1={32 + 26.5 * s}
              x2={32 + 30 * c}
              y2={32 + 30 * s}
            />
          );
        })}
      </g>
      <path d={STAR_PATH} fill="#E6B84C" />
    </svg>
  );
}
