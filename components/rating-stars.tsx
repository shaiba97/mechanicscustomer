"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "cn";

export function RatingStars({
  value,
  size = 14,
  interactive = false,
  onChange,
}: {
  value: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}) {
  const [hover, setHover] = React.useState(0);
  const display = interactive && hover > 0 ? hover : value;

  const stars = (
    <span
      className="inline-flex items-center gap-0.5"
      dir="ltr"
      onMouseLeave={interactive ? () => setHover(0) : undefined}
      role={interactive ? "radiogroup" : undefined}
      aria-label={`${value} / 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(display);
        const starNode = (
          <Star
            style={{ width: size, height: size }}
            className={cn(
              "shrink-0 transition-colors",
              filled ? "fill-foreground text-foreground" : "fill-transparent text-border",
            )}
          />
        );
        if (!interactive) return <span key={star}>{starNode}</span>;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} / 5`}
            onMouseEnter={() => setHover(star)}
            onClick={() => onChange?.(star)}
            className="cursor-pointer"
          >
            {starNode}
          </button>
        );
      })}
    </span>
  );

  if (!interactive) return stars;
  return (
    <div className="inline-flex items-center gap-2">
      {stars}
      <span className="text-[10px] text-muted-foreground">{display} / 5</span>
    </div>
  );
}
