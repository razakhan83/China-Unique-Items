'use client';

import { Children, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CategoryProductSlider({ categoryLabel, children, viewAllHref }) {
  const slides = Children.toArray(children);
  const slideCount = slides.length;
  const [carouselApi, setCarouselApi] = useState();
  const [controlsState, setControlsState] = useState({ prev: false, next: false });
  const isInteractive = slideCount > 1;
  const canGoToPrev = carouselApi ? controlsState.prev : false;
  const canGoToNext = carouselApi ? controlsState.next : isInteractive;
  const carouselOptions = useMemo(
    () => ({
      active: isInteractive,
      align: 'start',
      containScroll: 'trimSnaps',
      loop: slideCount > 4,
      slideChanges: false,
      slidesToScroll: 1,
      ssr: Array.from({ length: slideCount }, () => 78),
      breakpoints: {
        '(min-width: 640px)': {
          ssr: Array.from({ length: slideCount }, () => 46),
        },
        '(min-width: 768px)': {
          ssr: Array.from({ length: slideCount }, () => 34),
        },
        '(min-width: 1024px)': {
          ssr: Array.from({ length: slideCount }, () => 27),
        },
        '(min-width: 1280px)': {
          ssr: Array.from({ length: slideCount }, () => 23),
        },
      },
    }),
    [isInteractive, slideCount]
  );

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const syncControls = () => {
      setControlsState({
        prev: carouselApi.canGoToPrev(),
        next: carouselApi.canGoToNext(),
      });
    };

    syncControls();
    carouselApi.on('select', syncControls);
    carouselApi.on('reinit', syncControls);

    return () => {
      carouselApi.off('select', syncControls);
      carouselApi.off('reinit', syncControls);
    };
  }, [carouselApi]);

  if (slideCount === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between gap-4 md:mb-6 md:items-end">
        <div className="min-w-0 flex-1">
          <h2 className="text-[1.7rem] font-bold tracking-[-0.04em] text-primary [text-wrap:balance] md:text-[2.1rem]">
            {categoryLabel}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => carouselApi?.goToPrev()}
            disabled={!canGoToPrev}
            className={cn(
              'flex size-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary transition-[transform,background-color,color,box-shadow] duration-300',
              canGoToPrev
                ? 'hover:bg-primary hover:text-primary-foreground hover:shadow-[0_14px_34px_rgba(10,61,46,0.14)] active:scale-[0.96]'
                : 'cursor-not-allowed opacity-45'
            )}
            aria-label="Previous products"
            aria-disabled={!canGoToPrev}
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => carouselApi?.goToNext()}
            disabled={!canGoToNext}
            className={cn(
              'flex size-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary transition-[transform,background-color,color,box-shadow] duration-300',
              canGoToNext
                ? 'hover:bg-primary hover:text-primary-foreground hover:shadow-[0_14px_34px_rgba(10,61,46,0.14)] active:scale-[0.96]'
                : 'cursor-not-allowed opacity-45'
            )}
            aria-label="Next products"
            aria-disabled={!canGoToNext}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <Carousel
        setApi={setCarouselApi}
        opts={carouselOptions}
        className="w-full"
      >
        <CarouselContent className="-ml-3 md:-ml-4">
          {slides.map((slide, idx) => (
            <CarouselItem
              key={idx}
              className="basis-[78%] pl-3 sm:basis-[46%] md:basis-[34%] md:pl-4 lg:basis-[27%] xl:basis-[23%]"
            >
              <div className="h-full min-w-0 pb-1">
                {slide}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {viewAllHref ? (
        <div className="mt-6 flex justify-center">
          <Link
            href={viewAllHref}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'h-10 rounded-lg border border-primary/15 bg-background/80 px-5 text-sm font-semibold text-primary shadow-[0_12px_30px_rgba(10,61,46,0.08)] transition-[transform,background-color,color,box-shadow] duration-300 md:backdrop-blur-sm hover:bg-primary hover:text-primary-foreground hover:shadow-[0_16px_36px_rgba(10,61,46,0.14)] active:scale-[0.96]'
            )}
          >
            View All
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
