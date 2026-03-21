import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductCardAddToCartButton from "@/components/ProductCardAddToCartButton";
import { CLOUDINARY_IMAGE_PRESETS, optimizeCloudinaryUrl } from "@/lib/cloudinaryImage";
import { getPrimaryProductImage } from "@/lib/productImages";
import { getBlurPlaceholderProps } from "@/lib/imagePlaceholder";

const formatPrice = (raw) => {
  let cleanNumbers = String(raw).replace(/[^\d.]/g, "");
  if (!cleanNumbers) return "Rs. 0";
  return `Rs. ${Number(cleanNumbers).toLocaleString("en-PK")}`;
};

/**
 * Determines the discount badge (top-left).
 * Uses real `discountPercentage` when the product has an active discount,
 * otherwise falls back to a stable dummy badge for visual variety.
 */
function getDiscountBadge(product) {
  // Real discount from DB
  if (product.isDiscounted && product.discountPercentage > 0) {
    return `${product.discountPercentage}% OFF`;
  }
  return null;
}

/**
 * Determines the status badge (top-right).
 * Priority: Best Selling → Trending → New (last 30 days).
 * Each has a unique color.
 */
function getStatusBadge(product) {
  if (product.StockStatus === "Out of Stock") {
    return {
      label: "Out of Stock",
      className: "bg-destructive text-destructive-foreground border-destructive",
    };
  }

  // Best Selling
  if (product.isBestSelling || product.bestSelling || product.isBestseller) {
    return {
      label: "Best Selling",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    };
  }

  // Trending
  if (product.isTrending || product.trending) {
    return {
      label: "Trending",
      className: "bg-orange-100 text-orange-800 border-orange-200",
    };
  }

  // New Arrivals Toggle
  if (product.isNewArrival) {
    return {
      label: "New",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
  }

  return null;
}

export default function ProductCard({ product, className = "" }) {
  const productName = product.Name || product.name || "Unknown";
  const productDescription = product.Description || product.description || "";
  const primaryImage = getPrimaryProductImage(product);
  const primaryImageSrc = primaryImage?.url
    ? optimizeCloudinaryUrl(primaryImage.url, CLOUDINARY_IMAGE_PRESETS.productCard)
    : "";
  const productPrice = product.Price || product.price || 0;
  const productSlug = product.slug || product._id || product.id;
  const productHref = `/products/${productSlug}`;

  const discountLabel = getDiscountBadge(product);
  const statusBadge = getStatusBadge(product);

  // Real discount computed values
  const hasRealDiscount = Boolean(product.isDiscounted && product.discountPercentage > 0);
  const discountedPrice = hasRealDiscount
    ? (product.discountedPrice != null ? product.discountedPrice : Math.round(productPrice * (1 - product.discountPercentage / 100)))
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
      {/* Image Section */}
      <Link
        href={productHref}
        scroll={true}
        className="relative block aspect-square w-full overflow-hidden bg-muted/30"
        draggable={false}
      >
        {/* Discount Badge — top left */}
        {discountLabel && (
          <Badge
            className={cn(
              "absolute left-2.5 top-2.5 z-10",
              "rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
              "bg-secondary text-secondary-foreground border-border",
              "shadow-sm md:backdrop-blur-sm"
            )}
          >
            {discountLabel}
          </Badge>
        )}

        {/* Status Badge — top right (New / Best Selling / Trending) */}
        {statusBadge && (
          <Badge
            className={cn(
              "absolute right-2.5 top-2.5 z-10",
              "rounded-md px-2 py-1 text-[10px] font-bold tracking-wider",
              "shadow-sm md:backdrop-blur-sm",
              statusBadge.className
            )}
          >
            {statusBadge.label}
          </Badge>
        )}

        {/* Product Image */}
        {primaryImageSrc ? (
          <Image
            src={primaryImageSrc}
            alt={productName}
            fill
            draggable={false}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-105"
            {...getBlurPlaceholderProps(primaryImage.blurDataURL)}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted/50">
            <ShoppingCart className="size-10 text-muted-foreground/30" />
          </div>
        )}
      </Link>

      {/* Content Section — white background */}
      <CardContent className="flex flex-col gap-1.5 bg-card p-3 pt-3">
        {/* Product Title */}
        <Link
          href={productHref}
          scroll={true}
          className="block text-left"
          draggable={false}
        >
          <h3
            className="line-clamp-1 text-sm font-semibold leading-tight text-primary"
            title={productName}
            draggable={false}
          >
            {productName}
          </h3>
        </Link>

        {/* Description */}
        {productDescription ? (
          <p
            className="line-clamp-2 text-xs text-muted-foreground"
            draggable={false}
          >
            {productDescription}
          </p>
        ) : (
          <div className="h-4" />
        )}

        {/* Price Row + Add to Cart */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex flex-col gap-0.5">
            {hasRealDiscount ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <p
                  className="text-xs font-medium text-muted-foreground line-through"
                  draggable={false}
                >
                  {formatPrice(productPrice)}
                </p>
                <p
                  className="text-base font-bold tracking-tight text-red-600 dark:text-red-500"
                  draggable={false}
                >
                  {formatPrice(discountedPrice)}
                </p>
              </div>
            ) : (
              <p
                className="text-base font-bold tracking-tight text-foreground"
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
