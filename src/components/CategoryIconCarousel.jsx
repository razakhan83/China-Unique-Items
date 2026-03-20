"use client";

import { useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Mousewheel } from "swiper/modules";
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
import { SHARED_SWIPER_PROPS } from "@/components/swiper/swiperConfig";

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

const CATEGORY_CIRCLE_BREAKPOINTS = {
  0: { slidesPerView: "auto", spaceBetween: 16 },
  768: { slidesPerView: "auto", spaceBetween: 20 },
  1024: { slidesPerView: "auto", spaceBetween: 24 },
};

function buildMarqueeCategories(categories) {
  const repeatCount = Math.max(5, Math.ceil(18 / categories.length));
  return Array.from({ length: repeatCount }, (_, repeatIndex) =>
    categories.map((category) => ({
      ...category,
      _marqueeKey: `${category.id}-${repeatIndex}`,
    }))
  ).flat();
}

export default function CategoryIconCarousel({ categories }) {
  const router = useRouter();
  const isDraggingRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });

  if (!categories?.length) return null;

  const marqueeCategories = useMemo(
    () => (categories.length > 1 ? buildMarqueeCategories(categories) : categories),
    [categories]
  );
  const baseCount = categories.length;
  const middleIndex = categories.length > 1 ? baseCount * 2 : 0;

  const normalizeInfinitePosition = useCallback((swiper) => {
    if (!swiper || baseCount <= 1) return;

    const minIndex = baseCount;
    const maxIndex = baseCount * 4;

    if (swiper.activeIndex < minIndex) {
      swiper.slideTo(swiper.activeIndex + baseCount * 2, 0, false);
    } else if (swiper.activeIndex >= maxIndex) {
      swiper.slideTo(swiper.activeIndex - baseCount * 2, 0, false);
    }
  }, [baseCount]);

  return (
    <div className="w-full border-b border-border bg-card/70 py-4 md:py-5">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="overflow-hidden">
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 md:w-10"
              style={{ background: "linear-gradient(to right, var(--color-card), transparent)" }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 md:w-10"
              style={{ background: "linear-gradient(to left, var(--color-card), transparent)" }}
            />
            <Swiper
              {...SHARED_SWIPER_PROPS}
              modules={[Autoplay, FreeMode, Mousewheel]}
              breakpoints={CATEGORY_CIRCLE_BREAKPOINTS}
              watchOverflow={false}
              preventInteractionOnTransition={false}
              initialSlide={middleIndex}
              slidesPerView="auto"
              freeMode={{
                enabled: true,
                momentum: true,
                momentumBounce: false,
                sticky: false,
              }}
              mousewheel={{
                enabled: true,
                releaseOnEdges: false,
                sensitivity: 0.8,
                thresholdDelta: 4,
              }}
              speed={4200}
              autoplay={
                marqueeCategories.length > 1
                  ? {
                      delay: 1,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: false,
                      waitForTransition: true,
                    }
                  : false
              }
              allowTouchMove
              simulateTouch
              touchRatio={1}
              touchAngle={45}
              grabCursor
              preventClicks
              preventClicksPropagation
              className="category-icon-swiper overflow-visible"
              onSwiper={(swiper) => {
                if (baseCount > 1) {
                  swiper.slideTo(middleIndex, 0, false);
                }
              }}
              onTouchStart={() => {
                isDraggingRef.current = false;
              }}
              onSlideChange={normalizeInfinitePosition}
              onTouchEnd={(swiper) => {
                requestAnimationFrame(() => normalizeInfinitePosition(swiper));
                window.setTimeout(() => {
                  isDraggingRef.current = false;
                }, 0);
              }}
              onTransitionEnd={() => {
                isDraggingRef.current = false;
              }}
            >
              {marqueeCategories.map((category, index) => {
                const colors = getCategoryColor(category.label);
                const Icon = getCategoryIcon(category.label);
                return (
                  <SwiperSlide
                    key={category._marqueeKey || `${category.id}-${index}`}
                    className="!h-auto !w-[96px] md:!w-[132px]"
                  >
                    <button
                      onPointerDown={(event) => {
                        pointerStartRef.current = { x: event.clientX, y: event.clientY };
                        isDraggingRef.current = false;
                      }}
                      onPointerMove={(event) => {
                        const deltaX = Math.abs(event.clientX - pointerStartRef.current.x);
                        const deltaY = Math.abs(event.clientY - pointerStartRef.current.y);
                        if (deltaX > 6 || deltaY > 6) {
                          isDraggingRef.current = true;
                        }
                      }}
                      onPointerUp={() => {
                        window.setTimeout(() => {
                          isDraggingRef.current = false;
                        }, 0);
                      }}
                      onDragStart={(event) => event.preventDefault()}
                      onClick={(event) => {
                        if (isDraggingRef.current) {
                          event.preventDefault();
                          event.stopPropagation();
                          return;
                        }
                        router.push(`/products?category=${category.id}`);
                      }}
                      className="home-category-card group flex h-full w-full min-w-0 cursor-pointer flex-col items-center gap-3 rounded-xl px-1 py-1 text-center select-none"
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
                      <span className="line-clamp-2 max-w-[110px] select-none text-sm font-medium leading-tight text-muted-foreground transition-colors group-hover:text-foreground md:max-w-[140px]">
                        {category.label}
                      </span>
                    </button>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
}
