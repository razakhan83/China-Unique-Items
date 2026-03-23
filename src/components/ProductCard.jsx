"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductCardAddToCartButton from "@/components/ProductCardAddToCartButton";
import { CLOUDINARY_IMAGE_PRESETS, optimizeCloudinaryUrl } from "@/lib/cloudinaryImage";
import { getPrimaryProductImage } from "@/lib/productImages";
import { getBlurPlaceholderProps } from "@/lib/imagePlaceholder";

const BADGE_OVERLAY_SURFACE =
  "border border-border/60 bg-background/90 text-foreground backdrop-blur-md";

const formatPrice = (raw) => {
  let cleanNumbers = String(raw).replace(/[^\d.]/g, "");
  if (!cleanNumbers) return "Rs. 0";
  return `Rs. ${Number(cleanNumbers).toLocaleString("en-PK")}`;
};

function getDiscountBadge(product) {
  if (product.isDiscounted && product.discountPercentage > 0) {
    return `${product.discountPercentage}% OFF`;
  }
  return null;
}

export default function ProductCard({ product, className = "" }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productName = product.Name || product.name || "Unknown";
  const primaryImage = getPrimaryProductImage(product);
  const primaryImageSrc = primaryImage?.url
    ? optimizeCloudinaryUrl(primaryImage.url, CLOUDINARY_IMAGE_PRESETS.productCard)
    : "";
  const productPrice = product.Price || product.price || 0;
  const productSlug = product.slug || product._id || product.id;
  const productHref = `/products/${productSlug}`;

  const discountLabel = getDiscountBadge(product);
  const dummyReviewLabel = product.averageRating || product.rating || "4.2";

  const hasRealDiscount = Boolean(product.isDiscounted && product.discountPercentage > 0);
  const discountedPrice = hasRealDiscount
    ? (product.discountedPrice != null
        ? product.discountedPrice
        : Math.round(productPrice * (1 - product.discountPercentage / 100)))
    : null;

  return (
    <Card
      className={cn(
        "group relative flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-300 md:hover:shadow-md",
        "py-0",
        className
      )}
      draggable={false}
    >
      <div className="relative">
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1.5">
          <Badge
            className={cn(
              "pointer-events-auto rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums",
              BADGE_OVERLAY_SURFACE,
              "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
            )}
          >
            <Star className="mr-1 size-3.5 fill-current" />
            {dummyReviewLabel}
          </Badge>

          {discountLabel && (
            <Badge
              className={cn(
                "pointer-events-auto rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
                BADGE_OVERLAY_SURFACE,
                "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              )}
            >
              {discountLabel}
            </Badge>
          )}
        </div>

        <button
          type="button"
          role="checkbox"
          aria-checked={isWishlisted}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          data-slot="checkbox"
          data-state={isWishlisted ? "checked" : "unchecked"}
          value="on"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsWishlisted((current) => !current);
          }}
          className={cn(
            "group/wishlist absolute right-2.5 top-2.5 z-10 inline-flex size-7 items-center justify-center rounded-full border border-border/60 bg-background/90 p-0 text-foreground shadow-xs backdrop-blur-md outline-none transition-[transform,opacity,border-color,box-shadow,color] duration-200 ease-out hover:scale-[1.03] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring/50 md:hover:border-destructive/30 md:hover:text-destructive md:hover:shadow-sm after:absolute after:-inset-2 after:content-['']",
            isWishlisted ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          )}
        >
          <span className="relative block size-3.5">
            <Heart
              className={cn(
                "absolute inset-0 size-3.5 transition-all duration-200 ease-out md:group-hover/wishlist:text-destructive/70",
                isWishlisted ? "scale-75 opacity-0" : "scale-100 opacity-100"
              )}
            />
            <Heart
              className={cn(
                "absolute inset-0 size-3.5 fill-destructive stroke-destructive transition-all duration-200 ease-out",
                isWishlisted ? "scale-100 opacity-100" : "scale-75 opacity-0"
              )}
            />
          </span>
        </button>

        <Link
          href={productHref}
          scroll={true}
          className="relative block aspect-square w-full overflow-hidden bg-muted/30"
          draggable={false}
        >
          {primaryImageSrc ? (
            <Image
              src={primaryImageSrc}
              alt={productName}
              fill
              draggable={false}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              className="object-cover outline outline-1 outline-black/5 transition-transform duration-500 ease-out md:group-hover:scale-105"
              {...getBlurPlaceholderProps(primaryImage.blurDataURL)}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted/50">
              <ShoppingCart className="size-10 text-muted-foreground/30" />
            </div>
          )}
        </Link>
      </div>

      <CardContent className="flex flex-col gap-2 bg-card p-4 pt-4">
        <Link
          href={productHref}
          scroll={true}
          className="block text-left"
          draggable={false}
        >
          <h3
            className="line-clamp-1 text-base font-semibold leading-snug text-primary/80"
            title={productName}
            draggable={false}
          >
            {productName}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            {hasRealDiscount ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <p
                  className="text-xl font-semibold text-foreground tabular-nums"
                  draggable={false}
                >
                  {formatPrice(discountedPrice)}
                </p>
                <p
                  className="text-sm font-medium text-muted-foreground/75 line-through"
                  draggable={false}
                >
                  {formatPrice(productPrice)}
                </p>
              </div>
            ) : (
              <p
                className="text-xl font-semibold text-foreground tabular-nums"
                draggable={false}
              >
                {formatPrice(productPrice)}
              </p>
            )}
          </div>
          <ProductCardAddToCartButton product={product} />
        </div>
      </CardContent>
    </Card>
  );
}
