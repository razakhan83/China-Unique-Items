import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import ProductCard from '@/components/ProductCard';

export default function HomeFeaturedProducts({ products = [] }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="bg-[color:color-mix(in_oklab,var(--color-primary)_6%,white)] py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
              Ready Now
            </p>
            <h2 className="mt-2 text-[1.9rem] font-bold tracking-[-0.05em] text-primary [text-wrap:balance] md:text-[2.5rem]">
              Instant picks from this store
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground [text-wrap:pretty] md:text-base">
              The first batch is preloaded so the catalog feels immediate. Everything else flows in as you continue
              scrolling.
            </p>
          </div>

          <Link
            href="/products"
            className="hidden h-10 items-center gap-1 rounded-full border border-primary/15 bg-white/80 px-4 text-sm font-semibold text-primary shadow-[0_12px_30px_rgba(10,61,46,0.08)] transition-[transform,background-color,color,box-shadow] duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_16px_36px_rgba(10,61,46,0.14)] active:scale-[0.96] md:inline-flex"
          >
            Browse all
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid auto-rows-max grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {products.map((product, index) => (
            <div key={product.slug || product._id || product.id || index}>
              <ProductCard product={product} imagePriority={index < 4} />
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-center md:hidden">
          <Link
            href="/products"
            className="inline-flex h-10 items-center gap-1 rounded-full border border-primary/15 bg-white/85 px-4 text-sm font-semibold text-primary shadow-[0_10px_24px_rgba(10,61,46,0.08)] transition-[transform,background-color,color] duration-300 hover:bg-primary hover:text-primary-foreground active:scale-[0.96]"
          >
            Browse all
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
