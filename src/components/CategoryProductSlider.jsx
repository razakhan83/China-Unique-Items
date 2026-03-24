'use client';

import { Children, useId, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CategoryProductSlider({ categoryLabel, children, viewAllHref }) {
  const slides = Children.toArray(children);
  const slideCount = slides.length;
  const carouselId = useId();
  const carouselRef = useRef(null);
  const isInteractive = slideCount > 1;

  if (slideCount === 0) return null;

  const scrollByPage = (direction) => {
    const element = carouselRef.current;

    if (!element) {
      return;
    }

    element.scrollBy({
      left: direction * Math.max(element.clientWidth * 0.85, 260),
      behavior: 'smooth',
    });
  };

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between gap-4 md:mb-6 md:items-end">
        <div className="min-w-0 flex-1">
          <h2 className="text-[1.7rem] font-bold tracking-[-0.04em] text-primary [text-wrap:balance] md:text-[2.1rem]">
            {categoryLabel}
          </h2>
        </div>

        <div className="category-product-carousel-controls flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            className={cn(
              'flex size-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary transition-[transform,background-color,color,box-shadow] duration-300',
              isInteractive
                ? 'hover:bg-primary hover:text-primary-foreground hover:shadow-[0_14px_34px_rgba(10,61,46,0.14)] active:scale-[0.96]'
                : 'cursor-not-allowed opacity-45'
            )}
            aria-label={`Scroll ${categoryLabel} products left`}
            aria-controls={carouselId}
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => scrollByPage(1)}
            className={cn(
              'flex size-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary transition-[transform,background-color,color,box-shadow] duration-300',
              isInteractive
                ? 'hover:bg-primary hover:text-primary-foreground hover:shadow-[0_14px_34px_rgba(10,61,46,0.14)] active:scale-[0.96]'
                : 'cursor-not-allowed opacity-45'
            )}
            aria-label={`Scroll ${categoryLabel} products right`}
            aria-controls={carouselId}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div className="category-product-carousel-shell">
        <div
          id={carouselId}
          ref={carouselRef}
          className="category-product-carousel"
          data-interactive={isInteractive ? 'true' : 'false'}
          aria-label={`${categoryLabel} products`}
          aria-roledescription="carousel"
        >
          {slides.map((slide, idx) => (
            <div
              key={`${carouselId}-${idx}`}
              className="category-product-carousel-item"
            >
              <div className="h-full min-w-0 pb-1">
                {slide}
              </div>
            </div>
          ))}
        </div>
      </div>

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
