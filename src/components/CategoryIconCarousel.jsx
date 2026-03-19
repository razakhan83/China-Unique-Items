"use client";

import { useMemo, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import {
  Armchair,
  Beef,
  Bolt,
  Car,
  Dumbbell,
  Flame,
  Gamepad2,
  Heart,
  PawPrint,
  PenTool,
  Shirt,
  Tag,
  UtensilsCrossed,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { getCategoryColor } from "@/lib/categoryColors";
import { getBlurPlaceholderProps } from "@/lib/imagePlaceholder";

const CATEGORY_ICONS = {
  "kitchen accessories": UtensilsCrossed,
  kitchen: Flame,
  knives: UtensilsCrossed,
  pots: Beef,
  "home decor": Armchair,
  "health & beauty": Heart,
  stationery: PenTool,
  "toys & games": Gamepad2,
  electronics: Bolt,
  fashion: Shirt,
  "sports & fitness": Dumbbell,
  "pet supplies": PawPrint,
  automotive: Car,
};

function getCategoryIcon(name) {
  return CATEGORY_ICONS[(name || "").toLowerCase().trim()] || Tag;
}

export default function CategoryIconCarousel({ categories }) {
  const router = useRouter();
  const displayCategories = useMemo(() => {
    if (!categories?.length) return [];
    return [...categories, ...categories, ...categories];
  }, [categories]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: true,
      containScroll: false,
      slidesToScroll: 1,
    }
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap() % categories.length);
  }, [emblaApi, categories.length]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList().slice(0, categories.length));
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect, categories.length]);

  if (!categories?.length) return null;

  return (
    <div className="w-full border-b border-border bg-card/70 py-4 md:py-5">
      <div className="relative mx-auto w-full max-w-[1240px] px-4">
        <div
          className="pointer-events-none absolute inset-y-0 left-4 z-10 w-12 md:w-20"
          style={{ background: "linear-gradient(to right, var(--color-card), transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-4 z-10 w-12 md:w-20"
          style={{ background: "linear-gradient(to left, var(--color-card), transparent)" }}
        />
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4 md:gap-6">
            {displayCategories.map((category, index) => {
              const colors = getCategoryColor(category.label);
              const Icon = getCategoryIcon(category.label);
              return (
                <button
                  key={`${category.id}-${index}`}
                  onClick={() => router.push(`/products?category=${category.id}`)}
                  className="group flex min-w-[110px] flex-[0_0_auto] cursor-pointer flex-col items-center gap-3 rounded-xl px-1 py-1 text-center md:min-w-[140px]"
                >
                  <div
                    className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border ${colors.border} bg-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md md:h-28 md:w-28`}
                  >
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.label}
                        fill
                        sizes="112px"
                        className="object-cover"
                        {...getBlurPlaceholderProps(category.blurDataURL)}
                      />
                    ) : (
                      <div className={`flex size-full items-center justify-center rounded-full ${colors.bg}`}>
                        <Icon className={`${colors.text} size-7 md:size-9`} />
                      </div>
                    )}
                  </div>
                  <span className="line-clamp-2 max-w-[110px] text-sm font-medium leading-tight text-muted-foreground transition-colors group-hover:text-foreground md:max-w-[140px]">
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Mobile Dot Indicators */}
        <div className="mt-4 flex justify-center gap-1.5 md:hidden">
          {scrollSnaps.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-4 rounded-full transition-all duration-300 ${
                index === selectedIndex ? "bg-primary w-6" : "bg-primary/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
