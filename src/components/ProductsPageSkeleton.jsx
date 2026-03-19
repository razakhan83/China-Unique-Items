import { Skeleton } from "@/components/ui/skeleton";

function ProductsHeaderSkeleton() {
  return (
    <div>
      <div className="fixed inset-x-0 top-24 z-30 border-y border-border/70 bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-hidden px-4 py-4">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      <div className="h-28 md:h-32" aria-hidden="true" />

      <div className="container mx-auto mb-4 max-w-7xl px-4">
        <Skeleton className="mb-4 h-4 w-36 rounded-md" />
        <Skeleton className="h-9 w-52 rounded-md" />
      </div>
    </div>
  );
}

function ProductsToolbarSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-5">
      <div className="surface-card rounded-xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Skeleton className="h-10 min-w-0 flex-1 rounded-lg" />
          <Skeleton className="h-10 lg:w-60 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ProductsGridSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-44 rounded-md" />
        <Skeleton className="h-7 w-28 rounded-lg" />
      </div>

      <div className="grid auto-rows-max grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border border-border bg-card">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="flex flex-col gap-3 p-3">
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProductsPageSkeleton() {
  return (
    <>
      <ProductsHeaderSkeleton />
      <ProductsToolbarSkeleton />
      <ProductsGridSkeleton />
    </>
  );
}
