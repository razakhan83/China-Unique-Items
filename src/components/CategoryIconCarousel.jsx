"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import {
  Armchair,
  Beef,
  ChevronLeft,
  ChevronRight,
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
import { CATEGORY_ICON_BREAKPOINTS, SHARED_SWIPER_PROPS } from "@/components/swiper/swiperConfig";

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
  const swiperRef = useRef(null);

  const scrollPrev = useCallback(() => swiperRef.current?.slidePrev(), []);
  const scrollNext = useCallback(() => swiperRef.current?.slideNext(), []);

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
        <button
          type="button"
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-sm transition-colors hover:bg-card"
          aria-label="Previous categories"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-sm transition-colors hover:bg-card"
          aria-label="Next categories"
        >
          <ChevronRight className="size-5" />
        </button>
        <Swiper
          {...SHARED_SWIPER_PROPS}
          modules={[FreeMode]}
          breakpoints={CATEGORY_ICON_BREAKPOINTS}
          freeMode
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          className="overflow-hidden px-16"
        >
          {categories.map((category, index) => {
              const colors = getCategoryColor(category.label);
              const Icon = getCategoryIcon(category.label);
              return (
                <SwiperSlide key={`${category.id}-${index}`} className="!h-auto">
                  <button
                    onClick={() => router.push(`/products?category=${category.id}`)}
                    className="home-category-card group flex h-full min-w-0 cursor-pointer flex-col items-center gap-3 rounded-xl px-1 py-1 text-center"
                    style={{ "--home-category-delay": `${Math.min(index, 7) * 48}ms` }}
                  >
                    <div
                      className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border ${colors.border} bg-white transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md md:h-28 md:w-28`}
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
                </SwiperSlide>
              );
            })}
        </Swiper>
      </div>
    </div>
  );
}
