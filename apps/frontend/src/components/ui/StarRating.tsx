"use client";
import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
}

export default function StarRating({
  value,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  const display = hover || value;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= display;
        const half = !filled && i + 0.5 <= display;
        return (
          <Star
            key={i}
            size={size}
            className={`transition-colors ${interactive ? "cursor-pointer" : ""}`}
            style={{
              color: filled || half ? "var(--accent)" : "var(--text-muted)",
              fill: filled ? "var(--accent)" : "none",
            }}
            onMouseEnter={() => interactive && setHover(i + 1)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange?.(i + 1)}
          />
        );
      })}
    </div>
  );
}
