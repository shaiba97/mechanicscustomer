"use client";

import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { cn } from "cn";
import { PartVisual } from "@/components/part-visual";
import { useLocale } from "@/hooks/use-locale";
import { useShop } from "@/hooks/use-shop";
import type { Part } from "@/hooks/use-parts";
import { formatSar } from "@/lib/i18n";
import { conditionLabel, localize } from "@/lib/localized";

export function ProductCard({ part, className }: { part: Part; className?: string }) {
  const { locale, t } = useLocale();
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const saved = isWishlisted(part.id);
  const name = localize(part.name, locale, part.sku);
  const brand = localize(part.brandName, locale);
  const category = localize(part.categoryName, locale);
  const href = `/parts/${part.id}`;
  const soldOut = part.stockQty <= 0;

  return (
    <article
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-soft",
        className,
      )}
    >
      <div className="relative">
        <Link href={href} aria-label={name} className="block">
          <PartVisual part={part} className="aspect-[4/3] w-full" />
        </Link>
        <button
          type="button"
          onClick={() => toggleWishlist(part)}
          aria-label={saved ? t("saved") : t("saveForLater")}
          aria-pressed={saved}
          className="absolute end-3 top-3 z-10 grid size-9 place-items-center rounded-full border border-black/10 bg-white/85 text-black shadow-sm backdrop-blur-md transition-all hover:scale-105 dark:border-white/15 dark:bg-black/55 dark:text-white"
        >
          <Heart className={cn("size-4", saved && "fill-current")} />
        </button>
        <span className="absolute bottom-3 start-3 rounded-full bg-black/75 px-2.5 py-1 text-[9px] font-medium tracking-wide text-white backdrop-blur-sm">
          {conditionLabel(part.condition, locale)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-3 text-[10px] font-medium tracking-wide text-muted-foreground">
          <span className="truncate">{brand || (locale === "ar" ? "ماركة غير محددة" : "Unbranded")}</span>
          <span className="shrink-0 font-mono text-[9px]">{part.sku}</span>
        </div>

        <Link href={href} className="mt-2 block">
          <h3 className="line-clamp-2 min-h-11 text-[15px] font-semibold leading-6 tracking-tight transition-colors group-hover:text-foreground/70">
            {name}
          </h3>
        </Link>

        {category ? (
          <p className="mt-1 truncate text-[11px] text-muted-foreground">{category}</p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-[17px] font-semibold tracking-tight">
              {formatSar(part.priceSar, locale)}
            </p>
            <p
              className={cn(
                "mt-1 flex items-center gap-1.5 text-[10px]",
                soldOut ? "text-muted-foreground" : "text-foreground/60",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  soldOut ? "bg-muted-foreground/40" : "bg-foreground",
                )}
              />
              {soldOut
                ? t("outOfStock")
                : part.stockQty <= 3
                  ? t("onlyLeft")
                  : `${part.stockQty} ${t("inStockCount")}`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => addToCart(part)}
            disabled={soldOut}
            aria-label={t("addToCartShort")}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
