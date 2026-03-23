'use client';

import { Children } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CategoryProductSlider({ categoryLabel, children, viewAllHref }) {
  const slides = Children.toArray(children);
  const slideCount = slides.length;

  if (slideCount === 0) return null;

  return (
    <div className="category-products-carousel-shell w-full">
      <div className="mb-5 flex items-center justify-between gap-4 md:mb-6 md:items-end">
        <div className="min-w-0 flex-1">
          <h2 className="text-[1.7rem] font-bold tracking-[-0.04em] text-primary [text-wrap:balance] md:text-[2.1rem]">
            {categoryLabel}
          </h2>
        </div>

        <div className="category-products-carousel-controls" aria-hidden="true" />
      </div>

      <div
        className="category-products-css-carousel"
        aria-label={`${categoryLabel} products`}
      >
        <div className="category-products-css-carousel__track">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="category-products-css-carousel__slide"
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
