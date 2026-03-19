'use client';

import { useRouter } from 'next/navigation';

import CategoryProductSlider from '@/components/CategoryProductSlider';

export default function HomeCategories({ sections = [] }) {
  const router = useRouter();

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
      {sections.map((section, index) => {
        const sectionClassName =
          index % 2 === 0 ? 'bg-[color:color-mix(in_oklab,var(--color-primary)_10%,white)]' : 'bg-white';

        return (
          <section key={section.category.id} className={`py-8 md:py-12 ${sectionClassName}`}>
            <div className="mx-auto w-full max-w-[1240px] px-4">
              <CategoryProductSlider
                categoryId={section.category.id}
                categoryLabel={section.category.label}
                products={section.products}
                skipFilter
                onViewAll={(categoryId) => router.push(`/products?category=${categoryId}`)}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
