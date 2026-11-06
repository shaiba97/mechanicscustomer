"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";
import { useLocale } from "@/hooks/use-locale";
import type { Part } from "@/hooks/use-parts";

export function ProductCarousel({ parts }: { parts: Part[] }) {
  const { locale } = useLocale();

  return (
    <Carousel
      opts={{
        align: "start",
        containScroll: "trimSnaps",
        direction: locale === "ar" ? "rtl" : "ltr",
      }}
      className="w-full"
    >
      <CarouselContent>
        {parts.map((part) => (
          <CarouselItem
            key={part.id}
            className="basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
          >
            <ProductCard part={part} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselControls />
    </Carousel>
  );
}

function CarouselControls() {
  const { locale, t } = useLocale();
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();
  const PrevIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const NextIcon = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="mt-6 flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label={t("previousSlide")}
        className="grid size-10 place-items-center rounded-full border border-border transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-35"
      >
        <PrevIcon className="size-4" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!canScrollNext}
        aria-label={t("nextSlide")}
        className="grid size-10 place-items-center rounded-full border border-border transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-35"
      >
        <NextIcon className="size-4" />
      </button>
    </div>
  );
}
