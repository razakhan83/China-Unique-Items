"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownWideNarrow, PackageOpen, Search, Sparkles } from "lucide-react";

import ProductCard from "@/components/ProductCard";
import SearchField from "@/components/SearchField";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProductCategoryNames, hasProductCategory, normalizeCategoryId } from "@/lib/productCategories";
import { cn } from "@/lib/utils";

function ProductGridContent({
  initialProducts,
  forceSearchTerm,
  hideSearch,
  hideCategoryBar,
  activeCategoryOverride,
}) {
  const cart = useCart();
  const activeCategory = activeCategoryOverride ?? cart?.activeCategory ?? "all";
  const setActiveCategory = cart?.setActiveCategory ?? (() => {});
  const [searchTerm, setSearchTerm] = useState(forceSearchTerm || "");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const itemsPerPage = 12;
  const loadMoreRef = useRef(null);
  const categoryNavRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchFilteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [...initialProducts];
    return initialProducts.filter((product) => {
      const name = (product.Name || product.name || "").toLowerCase();
      const categories = getProductCategoryNames(product);
      return name.includes(term) || categories.some((category) => (category || "").toLowerCase().includes(term));
    });
  }, [initialProducts, searchTerm]);

  const dynamicCategories = useMemo(() => {
    const categories = new Map();
    searchFilteredProducts.forEach((product) => {
      const values = getProductCategoryNames(product);
      values.forEach((category) => {
        const trimmed = (category || "").trim();
        if (!trimmed) return;
        if (!categories.has(trimmed.toLowerCase())) categories.set(trimmed.toLowerCase(), trimmed);
      });
    });
    return Array.from(categories.values())
      .sort()
      .map((category) => ({
        id: normalizeCategoryId(category),
        label: category,
      }));
  }, [searchFilteredProducts]);

  const filteredProducts = useMemo(() => {
    let base = [...searchFilteredProducts];
    if (activeCategory === "new-arrivals") {
      base.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));
      return base.slice(0, 30);
    }

    if (activeCategory === "special-offers") {
      base = base.filter((product) => product.isDiscounted === true);
      return base;
    }

    if (activeCategory !== "all") {
      base = base.filter((product) => hasProductCategory(product, activeCategory));
    }

    if (sortBy === "price-low") {
      base.sort((a, b) => (a.Price || a.price || 0) - (b.Price || b.price || 0));
    } else if (sortBy === "price-high") {
      base.sort((a, b) => (b.Price || b.price || 0) - (a.Price || a.price || 0));
    } else if (sortBy === "az") {
      base.sort((a, b) => (a.Name || a.name || "").localeCompare(b.Name || b.name || ""));
    } else if (sortBy === "za") {
      base.sort((a, b) => (b.Name || b.name || "").localeCompare(a.Name || a.name || ""));
    } else {
      base.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));
    }
    return base;
  }, [activeCategory, searchFilteredProducts, sortBy]);

  const displayedProducts = filteredProducts.slice(0, currentPage * itemsPerPage);
  const hasMore = displayedProducts.length < filteredProducts.length;

  const handleObserver = useCallback((entries) => {
    if (entries[0].isIntersecting && hasMore) {
      setCurrentPage((previous) => previous + 1);
    }
  }, [hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { rootMargin: "200px" });
    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [handleObserver]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    if (forceSearchTerm !== undefined) {
      setSearchTerm(forceSearchTerm);
    }
  }, [forceSearchTerm]);

  useEffect(() => {
    if (categoryNavRef.current) {
      const activePill = categoryNavRef.current.querySelector("[data-active='true']");
      if (activePill) {
        categoryNavRef.current.scrollTo({
          left: activePill.offsetLeft - categoryNavRef.current.clientWidth / 2 + activePill.clientWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeCategory]);

  const suggestions = useMemo(() => {
    if (!debouncedSearch.trim()) return [];
    return searchFilteredProducts.slice(0, 5).map((product) => ({
      ...product,
      onSelect: (selected) => {
        setSearchTerm(selected.Name || selected.name || "");
        setIsFocused(false);
      },
    }));
  }, [debouncedSearch, searchFilteredProducts]);

  const categoryButtons = [
    { id: "all", label: "All Items", icon: Search },
    { id: "new-arrivals", label: "New Arrivals", icon: Sparkles },
    ...dynamicCategories.map((category) => ({ ...category, icon: null })),
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "az", label: "Name: A to Z" },
    { value: "za", label: "Name: Z to A" },
  ];

  return (
    <>
      {!hideCategoryBar ? (
        <div className="border-y border-border/70 bg-card/70">
          <div ref={categoryNavRef} className="relative mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-4 hide-scrollbar">
            {categoryButtons.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  data-active={isActive}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  {Icon ? <Icon className="size-4" /> : null}
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {!hideSearch ? (
        <div className="mx-auto max-w-7xl px-4 pt-5">
          <div className="surface-card rounded-xl p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="min-w-0 flex-1">
                <SearchField
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onSubmit={(event) => {
                    event.preventDefault();
                    setIsFocused(false);
                  }}
                  onClear={() => {
                    setSearchTerm("");
                    setIsFocused(false);
                  }}
                  onFocus={() => setIsFocused(true)}
                  isFocused={isFocused}
                  suggestions={suggestions}
                  buttonLabel="Apply"
                  showSuggestions={false}
                />
              </div>

              <div className="flex items-center gap-2 lg:w-60">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <ArrowDownWideNarrow className="size-4 text-muted-foreground" />
                    <SelectValue placeholder="Sort products" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{displayedProducts.length}</span> of{" "}
            <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
          </p>
          {searchTerm ? <Badge variant="secondary">Search: "{searchTerm}"</Badge> : null}
        </div>

        {displayedProducts.length ? (
          <div className="grid auto-rows-max grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {displayedProducts.map((product, index) => (
              <ProductCard key={`${product.slug || product._id || product.id || "product"}-${index}`} product={product} />
            ))}
          </div>
        ) : (
          <div className="surface-card flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PackageOpen className="size-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No products found</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">Try adjusting your search or selecting another category to explore the catalog.</p>
          </div>
        )}

        {displayedProducts.length ? (
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {displayedProducts.length} of {filteredProducts.length} products loaded
            </p>
            {hasMore ? <Button onClick={() => setCurrentPage((previous) => previous + 1)}>Load More Products</Button> : null}
          </div>
        ) : null}

        {hasMore ? <div ref={loadMoreRef} className="h-10 w-full" /> : null}
      </section>
    </>
  );
}

export default function ProductGridClient({
  initialProducts,
  forceSearchTerm,
  hideSearch,
  hideCategoryBar,
  activeCategoryOverride,
}) {
  return (
    <ProductGridContent
      initialProducts={initialProducts}
      forceSearchTerm={forceSearchTerm}
      hideSearch={hideSearch}
      hideCategoryBar={hideCategoryBar}
      activeCategoryOverride={activeCategoryOverride}
    />
  );
}
