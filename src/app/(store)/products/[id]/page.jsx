import { Suspense } from 'react';
import { BadgeCheck, PackageCheck, Truck } from 'lucide-react';
import { notFound } from 'next/navigation';

import CategoryProductSlider from '@/components/CategoryProductSlider';
import ProductActions from '@/components/ProductActions';
import ProductGallery from '@/components/ProductGallery';
import ProductReviews from '@/components/ProductReviews';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getProductBySlug, getProductPrerenderParams, getRelatedProducts } from '@/lib/data';
import { getCategoryColor } from '@/lib/categoryColors';
import { getProductCategories } from '@/lib/productCategories';

const formatPrice = (raw) => `Rs. ${Number(raw || 0).toLocaleString('en-PK')}`;

export async function generateStaticParams() {
  return getProductPrerenderParams(1);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) {
    return {
      title: 'Product not found',
    };
  }

  return {
    title: product.Name,
    description: product.Description || `Buy ${product.Name} from China Unique Store.`,
    openGraph: {
      title: product.Name,
      description: product.Description || `Buy ${product.Name} from China Unique Store.`,
      images: product.Images[0]?.url ? [product.Images[0].url] : [],
    },
  };
}

export default function ProductPage({ params }) {
  const slugPromise = params.then(({ id }) => id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 pb-2 pt-4">
        <Suspense fallback={<ProductBreadcrumbSkeleton />}>
          <ProductBreadcrumb slugPromise={slugPromise} />
        </Suspense>
      </div>

      <div className="container mx-auto max-w-7xl px-4 pb-20 pt-4 md:py-8">
        <Suspense fallback={<ProductHeroSkeleton />}>
          <ProductHeroSection slugPromise={slugPromise} />
        </Suspense>

        <div className="mb-4 mt-12">
          <Suspense fallback={<ProductReviewsSkeleton />}>
            <ProductReviewsSection slugPromise={slugPromise} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProductsSection slugPromise={slugPromise} />
      </Suspense>
    </div>
  );
}

async function ProductBreadcrumb({ slugPromise }) {
  const slug = await slugPromise;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/products">Products</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{product.Name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

async function ProductHeroSection({ slugPromise }) {
  const slug = await slugPromise;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryCategory = getProductCategories(product)[0];
  const categoryLabel = primaryCategory?.name || '';
  const colors = getCategoryColor(categoryLabel);

  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-10 lg:gap-14">
      <div className="w-full md:w-[55%] lg:w-[58%]">
        <ProductGallery images={product.Images} />
      </div>

      <div className="w-full md:w-[45%] lg:w-[42%]">
        <div className="flex flex-col gap-5 md:sticky md:top-28">
          <div>
            <Badge variant="outline" className={`${colors.badge} text-xs font-bold uppercase tracking-wider`}>
              {categoryLabel || 'Premium Item'}
            </Badge>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl lg:text-4xl">
            {product.Name}
          </h1>

          <div className="flex flex-wrap items-baseline gap-3">
            {product.isDiscounted && product.discountPercentage > 0 ? (
              <>
                <span className="text-3xl font-extrabold text-red-600 dark:text-red-500 md:text-4xl">
                  {formatPrice(product.discountedPrice != null ? product.discountedPrice : Math.round(product.Price * (1 - product.discountPercentage / 100)))}
                </span>
                <span className="text-lg font-medium text-muted-foreground line-through">
                  {formatPrice(product.Price)}
                </span>
                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                  {product.discountPercentage}% OFF
                </span>
              </>
            ) : (
              <span className="text-3xl font-extrabold text-primary md:text-4xl">
                {formatPrice(product.Price)}
              </span>
            )}
          </div>

          <Separator />

          <div className="text-[15px] leading-relaxed text-muted-foreground">
            <p>
              {product.Description ||
                'Discover the perfect addition to your collection. This premium item from China Unique Store is crafted with quality and elegance in mind.'}
            </p>
          </div>

          <Separator />
          <ProductActions product={product} />

          <div className="mt-2 border-t border-border pt-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="surface-card flex flex-col items-center gap-2 rounded-xl p-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <PackageCheck className="size-4" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Purchased</span>
              </div>
              <div className="surface-card flex flex-col items-center gap-2 rounded-xl p-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Truck className="size-4" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Dispatch</span>
              </div>
              <div className="surface-card flex flex-col items-center gap-2 rounded-xl p-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BadgeCheck className="size-4" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Delivered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function ProductReviewsSection({ slugPromise }) {
  const slug = await slugPromise;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductReviews productId={product._id} productName={product.Name} />;
}

async function RelatedProductsSection({ slugPromise }) {
  const slug = await slugPromise;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryCategory = getProductCategories(product)[0];
  const categorySlug = primaryCategory?.id || '';
  const relatedProducts = await getRelatedProducts({
    category: categorySlug,
    excludeSlug: product.slug,
    limit: 8,
  });

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border bg-muted/35 py-10 md:py-14">
      <div className="container mx-auto max-w-7xl px-4">
        <CategoryProductSlider
          categoryId={categorySlug}
          categoryLabel="You May Also Like"
          products={relatedProducts}
          skipFilter
        />
      </div>
    </div>
  );
}

function ProductBreadcrumbSkeleton() {
  return <Skeleton className="h-4 w-52 rounded-md" />;
}

function ProductHeroSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-10 lg:gap-14">
      <div className="w-full md:w-[55%] lg:w-[58%]">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="mt-3 flex gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square w-20 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="w-full md:w-[45%] lg:w-[42%]">
        <div className="flex flex-col gap-5 md:sticky md:top-28">
          <Skeleton className="h-7 w-32 rounded-lg" />
          <Skeleton className="h-10 w-3/4 rounded-lg" />
          <Skeleton className="h-12 w-40 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductReviewsSkeleton() {
  return (
    <div className="rounded-2xl border border-border p-6 md:p-8">
      <Skeleton className="mb-4 h-8 w-48 rounded-lg" />
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function RelatedProductsSkeleton() {
  return (
    <div className="border-t border-border bg-muted/35 py-10 md:py-14">
      <div className="container mx-auto max-w-7xl px-4">
        <Skeleton className="mb-6 h-8 w-56 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
