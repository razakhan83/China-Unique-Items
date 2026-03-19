import { Suspense } from 'react';

import ProductGridClient from '@/components/ProductGridClient';
import ProductsPageHeader from '@/components/ProductsPageHeader';
import ProductsPageSkeleton from '@/components/ProductsPageSkeleton';
import { getProductsList } from '@/lib/data';

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

  return (
    <Suspense key={buildSuspenseKey(resolvedSearchParams)} fallback={<ProductsPageSkeleton />}>
      <ProductsContent searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

async function ProductsContent({ searchParams }) {
  const data = await getProductsList({
    category: searchParams.category || 'all',
    search: searchParams.search || '',
    sort: searchParams.sort || 'newest',
    page: Number(searchParams.page || 1),
    limit: 24,
  });

  return (
    <div>
      <ProductsPageHeader
        categories={data.categories}
        activeCategory={data.activeCategory}
        searchTerm={data.searchTerm}
      />
      <ProductGridClient
        initialProducts={data.items}
        hideCategoryBar
        activeCategoryOverride={data.activeCategory}
        forceSearchTerm={data.searchTerm}
      />
    </div>
  );
}
