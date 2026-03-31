'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import ProductCard from '@/components/ProductCard';

import CategoryProductSlider from '@/components/CategoryProductSlider';

export default function HomeCategories({ sections = [] }) {
  const INITIAL_VISIBLE_SECTIONS = 2;
  const SECTION_BATCH_SIZE = 2;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_SECTIONS);
  const loadMoreRef = useRef(null);

  const visibleSections = useMemo(
    () => sections.slice(0, visibleCount),
    [sections, visibleCount],
  );
  const hasMore = visibleCount < sections.length;

  useEffect(() => {
    if (!hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((current) => Math.min(current + SECTION_BATCH_SIZE, sections.length));
      },
      { rootMargin: '260px' },
    );

    const node = loadMoreRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
      observer.disconnect();
    };
  }, [hasMore, sections.length]);

  if (sections.length === 0) {
    return (
      <div className="bg-muted/30 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <p className="text-center text-muted-foreground">No products available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {visibleSections.map((section, index) => {
        const sectionClassName =
          index % 2 === 0 ? 'bg-[color:color-mix(in_oklab,var(--color-primary)_10%,white)]' : 'bg-white';

        return (
          <section
            key={section.category.id}
            className={`home-lazy-section py-8 md:py-11 ${sectionClassName}`}
          >
            <div className="mx-auto w-full max-w-7xl px-4">
              <CategoryProductSlider
                categoryLabel={section.category.label}
                viewAllHref={`/products?category=${section.category.id}`}
              >
                {section.products.map((product, productIndex) => (
                  <ProductCard
                    key={`${product.slug || product._id || product.id || 'item'}-${productIndex}`}
                    product={product}
                    className="h-full shadow-none"
                  />
                ))}
              </CategoryProductSlider>
            </div>
          </section>
        );
      })}

      {hasMore ? (
        <div ref={loadMoreRef} className="bg-white px-4 py-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 md:grid-cols-2">
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className="rounded-[1.75rem] bg-[color:color-mix(in_oklab,var(--color-primary)_7%,white)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                >
                  <div className="h-6 w-40 animate-pulse rounded-full bg-primary/10" />
                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[0, 1, 2, 3].map((cardIndex) => (
                      <div
                        key={cardIndex}
                        className="aspect-[0.8] animate-pulse rounded-2xl bg-white/70 shadow-[0_12px_28px_rgba(10,61,46,0.06)]"
                        style={{ animationDelay: `${(index * 4 + cardIndex) * 70}ms` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
