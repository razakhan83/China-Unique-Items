"use client";

import Image from "next/image";
import { ArrowRight, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProductCategoryNames } from "@/lib/productCategories";
import { cn } from "@/lib/utils";
import { getPrimaryProductImage } from "@/lib/productImages";
import { getBlurPlaceholderProps } from "@/lib/imagePlaceholder";

export default function SearchField({
  value,
  onChange,
  onSubmit,
  onClear,
  onFocus,
  isFocused,
  suggestions = [],
  emptyLabel,
  className,
  inputClassName,
  buttonLabel = "Search",
  showSuggestions = true,
}) {
  return (
    <div className={cn("relative", className)}>
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            className={cn("pl-10 pr-10", inputClassName)}
            placeholder="Search for premium products"
          />
          {value ? (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <Button type="submit">{buttonLabel}</Button>
      </form>

      {showSuggestions && isFocused && value.trim() ? (
        <div className="absolute top-full z-40 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-[0_22px_60px_rgba(10,61,46,0.12)]">
          {suggestions.length ? (
            <ul className="divide-y divide-border/70">
              {suggestions.map((product, index) => (
                <li key={`${product._id || product.id || "result"}-${index}`}>
                  <button
                    type="button"
                    onClick={() => product.onSelect?.(product)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
                  >
                    <div className="relative size-12 overflow-hidden rounded-lg border border-border bg-muted">
                      {getPrimaryProductImage(product)?.url ? (
                        <Image
                          src={getPrimaryProductImage(product).url}
                          alt={product.Name || product.name || "product"}
                          fill
                          sizes="48px"
                          className="object-cover"
                          {...getBlurPlaceholderProps(getPrimaryProductImage(product).blurDataURL)}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{product.Name || product.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {getProductCategoryNames(product).join(", ") || "Uncategorized"}
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-6 text-center text-sm text-muted-foreground">{emptyLabel || `No products found for "${value}"`}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
