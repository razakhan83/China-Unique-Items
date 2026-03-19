import { Suspense } from 'react';
import { BadgeCheck, PackageCheck, Truck } from 'lucide-react';
import { notFound } from 'next/navigation';

import CategoryProductSlider from '@/components/CategoryProductSlider';
import ProductActions from '@/components/ProductActions';
import ProductDetailSkeleton from '@/components/ProductDetailSkeleton';
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
import { Separator } from '@/components/ui/separator';
import { getProductBySlug, getRelatedProducts } from '@/lib/data';
import { getCategoryColor } from '@/lib/categoryColors';
import { getProductCategories } from '@/lib/productCategories';
const formatPrice = (raw) => `Rs. ${Number(raw || 0).toLocaleString('en-PK')}`;

export async function generateStaticParams() {
  return [{ id: '__placeholder__' }];
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

export default async function ProductPage({ params }) {
  const { id } = await params;

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductPageContent slug={id} />
    </Suspense>
  );
}

async function ProductPageContent({ slug }) {
  if (slug === '__placeholder__') {
    notFound();
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryCategory = getProductCategories(product)[0];
  const categoryLabel = primaryCategory?.name || '';
  const categorySlug = primaryCategory?.id || '';
  const colors = getCategoryColor(categoryLabel);
  const relatedProducts = await getRelatedProducts({
    category: categorySlug,
    excludeSlug: product.slug,
    limit: 8,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 pb-2 pt-4">
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
      </div>

      <div className="container mx-auto max-w-7xl px-4 pb-20 pt-4 md:py-8">
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

        <div className="mb-4 mt-12">
          <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-muted" />}>
            <ProductReviews productId={product._id} productName={product.Name} />
          </Suspense>
        </div>
      </div>

      {relatedProducts.length > 0 ? (
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
      ) : null}
    </div>
  );
}
