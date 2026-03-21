import { Suspense } from 'react';

import ProductCard from '@/components/ProductCard';
import ProductsPagination from '@/components/ProductsPagination';
import { ProductsNavigationFeedbackProvider, ProductsPendingResults } from '@/components/ProductsNavigationFeedback';
import ProductsPageHeader from '@/components/ProductsPageHeader';
import ProductsToolbar from '@/components/ProductsToolbar';
import { ProductsGridSkeleton } from '@/components/ProductsPageSkeleton';
import { getProductsList, getStoreCategories } from '@/lib/data';

function buildSuspenseKey(searchParams) {
  return JSON.stringify({
    category: searchParams?.category || 'all',
    search: searchParams?.search || '',
    sort: searchParams?.sort || 'newest',
    page: searchParams?.page || '1',
  });
}

export async function generateMetadata({ searchParams }) {
  const params = (await searchParams) || {};
  const category = params.category || 'all';
  const search = params.search || '';

  if (search) {
    return {
      title: `Search results for "${search}"`,
      description: `Browse matching China Unique Store products for "${search}".`,
    };
  }

  if (category && category !== 'all') {
    return {
      title: category === 'new-arrivals' ? 'New Arrivals' : 'Products',
      description: 'Browse products by category at China Unique Store.',
    };
  }

  return {
    title: 'All Products',
    description: 'Browse the complete China Unique Store catalog.',
  };
}

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = (await searchParams) || {};
  const categories = await getStoreCategories();

  return (
    <ProductsNavigationFeedbackProvider>
      <div>
        <ProductsPageHeader
          categories={categories}
          activeCategory={resolvedSearchParams.category || 'all'}
          searchTerm={resolvedSearchParams.search || ''}
          sort={resolvedSearchParams.sort || 'newest'}
        />
        <ProductsToolbar
          initialSearch={resolvedSearchParams.search || ''}
          initialSort={resolvedSearchParams.sort || 'newest'}
        />
        <Suspense key={buildSuspenseKey(resolvedSearchParams)} fallback={<ProductsGridSkeleton />}>
          <ProductsResultsContent searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </ProductsNavigationFeedbackProvider>
  );
}

async function ProductsResultsContent({ searchParams }) {
  const data = await getProductsList({
    category: searchParams.category || 'all',
    search: searchParams.search || '',
    sort: searchParams.sort || 'newest',
    page: Number(searchParams.page || 1),
    limit: 12,
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <ProductsPendingResults>
        <div className="products-page-results-meta mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground tabular-nums">
            Showing{' '}
            <span className="font-semibold text-foreground">{data.items.length}</span>
            {' '}of{' '}
            <span className="font-semibold text-foreground">{data.total}</span>
            {' '}products
          </p>
        </div>

        {data.items.length ? (
          <div className="grid auto-rows-max grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {data.items.map((product, index) => (
              <div
                key={`${product.slug || product._id || product.id || 'product'}-${index}`}
                className="products-grid-card"
                style={{ '--products-card-delay': `${Math.min(index, 7) * 48}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="products-page-empty surface-card flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center">
            <h3 className="text-lg font-semibold text-foreground">No products found</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Try adjusting your search, sort, or category to explore the catalog.
            </p>
          </div>
        )}
      </ProductsPendingResults>

      <ProductsPagination
        pathname="/products"
        page={data.page}
        totalPages={data.totalPages}
        category={data.activeCategory}
        search={data.searchTerm}
        sort={data.sort}
      />
    </section>
  );
}
