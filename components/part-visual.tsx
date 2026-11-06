"use client";

import { cn } from "cn";
import { useLocale } from "@/hooks/use-locale";
import type { Part } from "@/hooks/use-parts";

type PartVisualProps = {
  part?: Part | null;
  className?: string;
  detailed?: boolean;
};

export function PartVisual({ part, className, detailed = false }: PartVisualProps) {
  const { locale } = useLocale();
  const imageUrl = part?.imageUrl?.trim();
  const label =
    part?.sku || (locale === "ar" ? "قطعة ميكانيكية" : "Mechanical part");

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[#F3F3F1] dark:bg-[#151515]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
      {imageUrl ? (
        <div
          role="img"
          aria-label={label}
          className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-[1.04]"
          style={{ backgroundImage: `url("${imageUrl.replace(/"/g, "%22")}")` }}
        />
      ) : (
        <Schematic label={label} detailed={detailed} />
      )}
      <span className="absolute start-3 top-3 rounded-full border border-black/10 bg-white/80 px-2 py-1 font-mono text-[9px] tracking-widest text-black/55 backdrop-blur-md dark:border-white/10 dark:bg-black/50 dark:text-white/55">
        {part?.sku || "MECHANIC"}
      </span>
    </div>
  );
}

function Schematic({ label, detailed }: { label: string; detailed: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
      <svg
        viewBox="0 0 220 220"
        className={cn(
          "h-[78%] w-[78%] text-black/70 transition-transform duration-700 group-hover:rotate-6 dark:text-white/70",
          detailed && "h-[72%] w-[72%]",
        )}
        fill="none"
      >
        <circle cx="110" cy="110" r="76" stroke="currentColor" strokeOpacity="0.16" />
        <circle
          cx="110"
          cy="110"
          r="64"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 5"
        />
        <circle cx="110" cy="110" r="48" stroke="currentColor" strokeWidth="2" />
        <circle cx="110" cy="110" r="20" stroke="currentColor" strokeWidth="2" />
        <circle cx="110" cy="110" r="7" stroke="currentColor" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <circle
            key={angle}
            cx={Math.round((110 + 56 * Math.cos((angle * Math.PI) / 180)) * 1000) / 1000}
            cy={Math.round((110 + 56 * Math.sin((angle * Math.PI) / 180)) * 1000) / 1000}
            r="3"
            fill="currentColor"
            fillOpacity="0.7"
          />
        ))}
        <path d="M110 34v-12M110 198v-12M34 110H22M198 110h-12" stroke="currentColor" />
        <path
          d="M150 74c14 10 21 26 18 43"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="M160 66l9 15-17 3" stroke="currentColor" strokeWidth="1.5" />
        {detailed ? (
          <>
            <path d="M110 62v96M62 110h96" stroke="currentColor" strokeOpacity="0.18" />
            <text x="152" y="130" fill="currentColor" fontSize="7" fontFamily="monospace">
              Ø 320
            </text>
            <text x="38" y="76" fill="currentColor" fontSize="7" fontFamily="monospace">
              {label.slice(0, 12)}
            </text>
          </>
        ) : null}
      </svg>
    </div>
  );
}
