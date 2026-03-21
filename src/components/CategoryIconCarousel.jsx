"use client";

import { useMemo } from "react";
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

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { getCategoryColor } from "@/lib/categoryColors";
import { CLOUDINARY_IMAGE_PRESETS, optimizeCloudinaryUrl } from "@/lib/cloudinaryImage";
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
  const categoryCount = categories?.length ?? 0;

  const carouselOptions = useMemo(
    () => ({
      active: categoryCount > 1,
      align: "start",
      containScroll: categoryCount > 1 ? false : "trimSnaps",
      dragFree: categoryCount > 1,
      loop: categoryCount > 1,
      slideChanges: false,
      slidesToScroll: 1,
      ssr: Array.from({ length: categoryCount }, () => 31.25),
      breakpoints: {
        "(min-width: 640px)": {
          ssr: Array.from({ length: categoryCount }, () => 24),
        },
        "(min-width: 768px)": {
          ssr: Array.from({ length: categoryCount }, () => 18),
        },
        "(min-width: 1024px)": {
          ssr: Array.from({ length: categoryCount }, () => 13.5),
        },
        "(min-width: 1280px)": {
          ssr: Array.from({ length: categoryCount }, () => 11.25),
        },
      },
    }),
    [categoryCount]
  );

  if (!categoryCount) return null;

  return (
    <section className="border-b border-border bg-card/70 py-4 md:py-5">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 md:w-10"
            style={{ background: "linear-gradient(to right, var(--color-card), transparent)" }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 md:w-10"
            style={{ background: "linear-gradient(to left, var(--color-card), transparent)" }}
          />
          <Carousel
            opts={carouselOptions}
            className="w-full"
          >
            <CarouselContent className="ml-0 gap-2 sm:gap-3">
              {categories.map((category, index) => {
                const colors = getCategoryColor(category.label);
                const Icon = getCategoryIcon(category.label);
                const categoryImageSrc = category.image
                  ? optimizeCloudinaryUrl(category.image, CLOUDINARY_IMAGE_PRESETS.categoryCircle)
                  : "";

                return (
                  <CarouselItem
                    key={`${category.id}-${index}`}
                    className="basis-[31.25%] pl-0 sm:basis-[24%] md:basis-[18%] lg:basis-[13.5%] xl:basis-[11.25%]"
                  >
                    <button
                      type="button"
                      onClick={() => router.push(`/products?category=${category.id}`, { scroll: true })}
                      className="flex w-full min-w-0 flex-col items-center gap-3 px-1 py-1 text-center"
                    >
                      <span
                        className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/80 md:h-[6.75rem] md:w-[6.75rem]"
                        style={{
                          background: `radial-gradient(circle at 30% 25%, white, ${colors.hex})`,
                        }}
                      >
                        {categoryImageSrc ? (
                          <Image
                            src={categoryImageSrc}
                            alt={category.label}
                            fill
                            sizes="(max-width: 768px) 80px, 108px"
                            className="object-cover"
                            {...getBlurPlaceholderProps(category.blurDataURL)}
                          />
                        ) : (
                          <span className={`flex size-full items-center justify-center rounded-full ${colors.bg}`}>
                            <Icon className={`${colors.text} size-7 md:size-9`} />
                          </span>
                        )}
                      </span>

                      <span className="line-clamp-2 min-h-10 max-w-[112px] text-sm font-medium leading-tight text-muted-foreground md:max-w-[132px]">
                        {category.label}
                      </span>
                    </button>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
