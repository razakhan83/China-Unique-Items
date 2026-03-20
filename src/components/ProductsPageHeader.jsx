"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Search, Sparkles, Tag } from "lucide-react";
import { useLinkStatus } from "next/link";

import { useProductsNavigationFeedback } from "@/components/ProductsNavigationFeedback";
import { buttonVariants } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

function buildTitle(activeCategory, categories, searchTerm) {
  if (activeCategory === "new-arrivals") return "New Arrivals";
  if (activeCategory && activeCategory !== "all") {
    return categories.find((category) => category.id === activeCategory)?.label || "Products";
  }
  if (searchTerm) return "Search Results";
  return "All Products";
}

function buildCategoryHref(categoryId, searchTerm) {
  const params = new URLSearchParams();
  if (searchTerm) {
    params.set("search", searchTerm);
  }
  if (categoryId !== "all") {
    params.set("category", categoryId);
  }
  const queryString = params.toString();
  return queryString ? `/products?${queryString}` : "/products";
}

function CategoryLinkLeadingIcon({ Icon }) {
  const { pending } = useLinkStatus();

  return (
    <span aria-hidden className="relative inline-flex size-4 items-center justify-center">
      <Loader2
        className={cn(
          "absolute size-4 text-current transition-[opacity,transform,filter] duration-200 ease-out",
          pending ? "opacity-100 blur-0 scale-100 animate-spin" : "opacity-0 blur-[4px] scale-[0.25]"
        )}
      />
      {Icon ? (
        <Icon
          className={cn(
            "absolute size-4 transition-[opacity,transform,filter] duration-200 ease-out",
            pending ? "opacity-0 blur-[4px] scale-[0.25]" : "opacity-100 blur-0 scale-100"
          )}
        />
      ) : null}
    </span>
  );
}

function CategoryLinkContent({ categoryId, Icon, label }) {
  const { pending } = useLinkStatus();
  const { setCategoryPending } = useProductsNavigationFeedback();

  useEffect(() => {
    setCategoryPending(categoryId, pending);

    return () => {
      setCategoryPending(categoryId, false);
    };
  }, [categoryId, pending, setCategoryPending]);

  return (
    <>
      <CategoryLinkLeadingIcon Icon={Icon} />
      {label}
    </>
  );
}

export default function ProductsPageHeader({
  categories,
  activeCategory = "all",
  searchTerm = "",
}) {
  const { pendingCategoryId } = useProductsNavigationFeedback();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const categoryButtons = [
    { id: "all", label: "All Items", icon: Search},
    { id: "new-arrivals", label: "New Arrivals", icon: Sparkles},
    { id: "special-offers", label: "Special Offers", icon: Tag},
    ...categories
      .filter(c => c.id !== 'special-offers' && c.id !== 'new-arrivals')
      .map(c => ({ ...c, icon: Tag })),
  ];
  const optimisticCategory = pendingCategoryId ?? activeCategory;
  const pageTitle = buildTitle(optimisticCategory, categories, searchTerm);

  const categoryNavRef = useRef(null);

  useEffect(() => {
    const nav = categoryNavRef.current;
    if (!nav) return;

    const updateScrollState = () => {
      const maxScrollLeft = nav.scrollWidth - nav.clientWidth;
      setCanScrollPrev(nav.scrollLeft > 4);
      setCanScrollNext(maxScrollLeft - nav.scrollLeft > 4);
    };

    updateScrollState();

    nav.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      nav.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [categoryButtons.length]);

  useEffect(() => {
    const nav = categoryNavRef.current;
    if (nav) {
      const activePill = nav.querySelector("[data-active='true']");
      if (activePill) {
        nav.scrollTo({
          left: activePill.offsetLeft - nav.clientWidth / 2 + activePill.clientWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [optimisticCategory]);

  function scrollCategories(direction) {
    const nav = categoryNavRef.current;
    if (!nav) return;

    nav.scrollBy({
      left: direction * Math.max(nav.clientWidth * 0.75, 180),
      behavior: "smooth",
    });
  }

  return (
    <div>
      <div className="products-page-bar fixed inset-x-0 top-24 z-30 border-y border-border/70 bg-card/95 backdrop-blur">
        <div className="relative mx-auto max-w-7xl px-4">
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-4 left-4 z-10 w-10 transition-opacity duration-200",
              canScrollPrev ? "opacity-100" : "opacity-0"
            )}
            style={{ background: "linear-gradient(to right, var(--color-card), transparent)" }}
          />
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-4 right-4 z-10 w-10 transition-opacity duration-200",
              canScrollNext ? "opacity-100" : "opacity-0"
            )}
            style={{ background: "linear-gradient(to left, var(--color-card), transparent)" }}
          />
          <button
            type="button"
            onClick={() => scrollCategories(-1)}
            disabled={!canScrollPrev}
            className={cn(
              "absolute left-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-sm transition-[opacity,transform,background-color] duration-200",
              canScrollPrev ? "opacity-100" : "pointer-events-none opacity-0",
              "active:scale-[0.96]"
            )}
            aria-label="Previous categories"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollCategories(1)}
            disabled={!canScrollNext}
            className={cn(
              "absolute right-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-sm transition-[opacity,transform,background-color] duration-200",
              canScrollNext ? "opacity-100" : "pointer-events-none opacity-0",
              "active:scale-[0.96]"
            )}
            aria-label="Next categories"
          >
            <ChevronRight className="size-5" />
          </button>
          <div
            ref={categoryNavRef}
            className="relative flex gap-2 overflow-x-auto px-12 py-4 hide-scrollbar md:px-14"
          >
            {categoryButtons.map((category) => {
              const Icon = category.icon;
              const isActive = optimisticCategory === category.id;
              return (
                <Link
                  key={category.id}
                  href={buildCategoryHref(category.id, searchTerm)}
                  prefetch={false}
                  scroll={false}
                  data-active={isActive}
                  className={cn(
                    buttonVariants({ variant: isActive ? "default" : "outline", size: "sm" }),
                    "shrink-0"
                  )}
                >
                  <CategoryLinkContent categoryId={category.id} Icon={Icon} label={category.label} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="h-22 md:h-24" aria-hidden="true" />

      <div className="container mx-auto mb-3 max-w-7xl px-4">
        <Breadcrumb className="products-page-meta mb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="products-page-heading text-3xl font-bold tracking-tight text-foreground [text-wrap:balance]">
          {pageTitle}
        </h1>
      </div>
    </div>
  );
}
