import Link from "next/link";

const STAR_PATH =
  "M32 17 L35.53 27.15 L46.27 27.37 L37.71 33.85 L40.82 44.14 L32 38 L23.18 44.14 L26.29 33.85 L17.73 27.37 L28.47 27.15 Z";

/**
 * RateAI brand mark — the "Index Seal".
 * An ink medallion with a gold rating star and a ring of gauge ticks:
 * an editorial seal of approval that measures and rates AI tools.
 */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="RateAI"
      className="shrink-0"
    >
      <circle cx="32" cy="32" r="31" fill="var(--primary)" />
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

/** Full horizontal lockup: seal mark + "RateAI" wordmark. */
export function Logo({
  size = 30,
  href = "/",
}: {
  size?: number;
  href?: string | null;
}) {
  const inner = (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span
        className="font-display"
        style={{
          fontSize: Math.round(size * 0.72),
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          lineHeight: 1,
        }}
      >
        RateAI
      </span>
    </span>
  );
  if (href === null) return inner;
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  );
}
