"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { ImageIcon, Pencil, Plus, Search, Tag, Trash2, MessageSquare, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import AdminReviewsDialog from "@/components/AdminReviewsDialog";
import { deleteProductAction, toggleProductLiveAction } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getProductCategoryNames } from "@/lib/productCategories";
import { getPrimaryProductImage } from "@/lib/productImages";
import { getBlurPlaceholderProps } from "@/lib/imagePlaceholder";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownWideNarrow, MoreVertical } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Discount Dialog                                                     */
/* ------------------------------------------------------------------ */

function DiscountDialog({ open, product, onOpenChange, onSuccess }) {
  const [pct, setPct] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync input value whenever the dialog opens for a different product
  useEffect(() => {
    if (open && product) {
      setPct(String(product.discountPercentage > 0 ? product.discountPercentage : ""));
    }
  }, [open, product]);

  async function sendDiscount(discountPercentage) {
    const res = await fetch(`/api/products/${product._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discountPercentage }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || json.message || 'Failed to update discount');
    }
    return json.data; // { discountPercentage, isDiscounted, discountedPrice }
  }

  async function handleApply() {
    const value = Number(pct);
    if (isNaN(value) || value < 0 || value > 100) {
      toast.error("Enter a valid percentage between 0 and 100.");
      return;
    }
    setSaving(true);
    try {
      const result = await sendDiscount(value);
      toast.success(
        value > 0
          ? `${value}% discount applied to "${product.Name}".`
          : `Discount removed from "${product.Name}".`
      );
      onSuccess(product._id, result.discountPercentage, result.isDiscounted, result.discountedPrice);
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message || "Failed to update discount.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      const result = await sendDiscount(0);
      toast.success(`Discount removed from "${product.Name}".`);
      onSuccess(product._id, result.discountPercentage, result.isDiscounted, result.discountedPrice);
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message || "Failed to remove discount.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Tag className="size-4 text-primary" />
            Set Discount
          </AlertDialogTitle>
          <AlertDialogDescription>
            Enter a discount percentage for{" "}
            <span className="font-semibold text-foreground uppercase tracking-wide">{product?.Name}</span>.
            Set to 0 to remove the discount.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="px-0 py-2">
          <div className="relative flex items-center">
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="e.g. 20"
              value={pct}
              onChange={(e) => setPct(e.target.value)}
              className="pr-10"
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
            />
            <span className="pointer-events-none absolute right-3 text-sm font-medium text-muted-foreground">
              %
            </span>
          </div>

          {product?.Price > 0 && Number(pct) > 0 && Number(pct) <= 100 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Discounted price:{" "}
              <span className="font-semibold text-foreground">
                PKR{" "}
                {Math.round(product.Price * (1 - Number(pct) / 100)).toLocaleString("en-PK")}
              </span>
              {" "}
              <span className="line-through text-muted-foreground/70">
                PKR {Number(product.Price).toLocaleString("en-PK")}
              </span>
            </p>
          )}
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          {product?.isDiscounted && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={handleRemove}
              disabled={saving}
            >
              Remove Discount
            </Button>
          )}
          <AlertDialogCancel className={cn(buttonVariants({ variant: "outline" }))} disabled={saving}>
            Cancel
          </AlertDialogCancel>
          <Button onClick={handleApply} disabled={saving}>
            {saving ? "Saving…" : "Apply Discount"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

export default function AdminProductsClient({ initialProducts }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");
  const [statusFilter, setStatusFilter] = useState("all"); // all, live, draft
  const [stockFilter, setStockFilter] = useState("all"); // all, in-stock, out-of-stock
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [togglingStockId, setTogglingStockId] = useState(null);
  const [discountModal, setDiscountModal] = useState({ open: false, product: null });
  const [reviewsModal, setReviewsModal] = useState({ open: false, product: null });

  useEffect(() => {
    // Merge incoming server data into current state.
    // If we have a locally-applied discount that the server hasn't yet reflected
    // (cache lag), keep the local optimistic discount values instead of reverting.
    setProducts((current) => {
      if (current === initialProducts) return initialProducts;
      const localMap = new Map(current.map((p) => [p._id, p]));
      return initialProducts.map((incoming) => {
        const local = localMap.get(incoming._id);
        if (!local) return incoming;
        // If local has a discount that the server hasn't reflected yet, keep local
        const serverLostOurDiscount =
          local.isDiscounted && !incoming.isDiscounted;
        if (serverLostOurDiscount) {
          return { ...incoming, discountPercentage: local.discountPercentage, isDiscounted: local.isDiscounted };
        }
        return incoming;
      });
    });
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (statusFilter !== "all") {
      result = result.filter((p) => (statusFilter === "live" ? p.isLive : !p.isLive));
    }

    if (stockFilter !== "all") {
      result = result.filter((p) => (stockFilter === "in-stock" ? p.StockStatus === "In Stock" : p.StockStatus !== "In Stock"));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      // Check if the search matches "special offers" conceptually
      const isSearchingSpecialOffers = "special offers".includes(query) || "special-offers".includes(query);
      
      result = result.filter((product) => {
        // Direct name match
        if (product.Name?.toLowerCase().includes(query)) return true;
        
        // Category match
        if (getProductCategoryNames(product).some((category) => category.toLowerCase().includes(query))) return true;
        
        // Special Offers match
        if (isSearchingSpecialOffers && product.isDiscounted) return true;
        
        return false;
      });
    }

    result = [...result];

    switch (sortOption) {
      case "category":
        result.sort((a, b) => {
          const catA = getProductCategoryNames(a)[0] || "";
          const catB = getProductCategoryNames(b)[0] || "";
          return catA.localeCompare(catB);
        });
        break;
      case "last-updated":
        result.sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        break;
      case "date-asc":
        result.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeA - timeB; // Oldest first
        });
        break;
      case "date-desc":
      default:
        result.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA; // Newest first
        });
        break;
    }

    return result;
  }, [products, searchQuery, sortOption, statusFilter, stockFilter]);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortOption("date-desc");
    setStatusFilter("all");
    setStockFilter("all");
    setCurrentPage(1);
  };

  async function handleDelete() {
    if (!deleteModal.product) return;
    setDeleting(true);
    startTransition(async () => {
      try {
        await deleteProductAction(deleteModal.product._id);
        setProducts((previous) => previous.filter((product) => product._id !== deleteModal.product._id));
        toast.error(`Product "${deleteModal.product.Name}" deleted.`);
        setDeleteModal({ open: false, product: null });
      } catch (error) {
        toast.error(error.message || "Failed to delete product");
      } finally {
        setDeleting(false);
      }
    });
  }

  async function handleToggleLive(product) {
    setTogglingId(product._id);
    startTransition(async () => {
      try {
        const result = await toggleProductLiveAction(product._id, !product.isLive);
        setProducts((previous) =>
          previous.map((entry) => (entry._id === product._id ? { ...entry, isLive: result.isLive } : entry)),
        );
        toast.success(`"${product.Name}" is now ${result.isLive ? "Live" : "Draft"}.`);
      } catch (error) {
        toast.error(error.message || "Toggle failed");
      } finally {
        setTogglingId(null);
      }
    });
  }

  async function handleToggleStock(product) {
    setTogglingStockId(product._id);
    const newStockStatus = product.StockStatus === "In Stock" ? "Out of Stock" : "In Stock";
    startTransition(async () => {
      try {
        const res = await fetch(`/api/products/${product._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ StockStatus: newStockStatus }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || json.message || "Failed to update stock status");
        
        setProducts((previous) =>
          previous.map((entry) => (entry._id === product._id ? { ...entry, StockStatus: newStockStatus } : entry)),
        );
        toast.success(`"${product.Name}" is now ${newStockStatus}.`);
        router.refresh(); // Refresh Server Components cache
      } catch (error) {
        toast.error(error.message || "Toggle failed");
      } finally {
        setTogglingStockId(null);
      }
    });
  }

  const toggleProductFlag = async (productId, flag, currentStatus) => {
    const originalProducts = [...products];
    const newStatus = !currentStatus;
    try {
      setProducts((prev) => prev.map((p) => (p._id === productId ? { ...p, [flag]: newStatus } : p)));
      
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [flag]: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update flag');
      toast.success('Product updated');
    } catch (err) {
      setProducts(originalProducts);
      toast.error('Failed to update product');
    }
  };

  function handleDiscountSuccess(productId, discountPercentage, isDiscounted, discountedPrice) {
    setProducts((previous) =>
      previous.map((entry) =>
        entry._id === productId
          ? { ...entry, discountPercentage, isDiscounted, discountedPrice: discountedPrice ?? null }
          : entry,
      ),
    );
    router.refresh();
  }

  const formatPrice = (price) => `PKR ${Number(price).toLocaleString("en-PK")}`;

  return (
    <div className="pb-24 md:pb-0">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage inventory ({products.length} total, {products.filter((product) => product.isLive).length} live)
          </p>
        </div>
        <Link href="/admin/products/add">
          <Button>
            <Plus data-icon="inline-start" />
            Add New Product
          </Button>
        </Link>
      </div>

      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products or categories"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-10"
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="h-10 w-full">
                <div className="flex items-center gap-2">
                  <ArrowDownWideNarrow className="size-4 text-muted-foreground" />
                  <SelectValue placeholder="Sort By" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date Created (Newest)</SelectItem>
                <SelectItem value="date-asc">Date Created (Oldest)</SelectItem>
                <SelectItem value="last-updated">Last Updated</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={(v) => { setStockFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          {(searchQuery || statusFilter !== "all" || stockFilter !== "all" || sortOption !== "date-desc") && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-2 text-muted-foreground hover:text-foreground">
              <X className="size-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* ---- Mobile Cards ---- */}
      <div className="space-y-4 md:hidden">
        {paginatedProducts.length === 0 ? (
          <div className="surface-card rounded-xl p-10 text-center">
            <p className="font-medium text-muted-foreground">No products found.</p>
          </div>
        ) : (
          paginatedProducts.map((product) => (
            <div key={product._id} className="surface-card rounded-xl p-4">
              <div className="flex gap-4">
                <div className="relative size-20 overflow-hidden rounded-lg border border-border bg-muted">
                  {getPrimaryProductImage(product)?.url ? (
                    <Image
                      src={getPrimaryProductImage(product).url}
                      alt={product.Name}
                      fill
                      className="object-cover"
                      {...getBlurPlaceholderProps(getPrimaryProductImage(product).blurDataURL)}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="size-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-base font-semibold text-foreground">{product.Name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-lg font-bold text-primary">
                      {product.isDiscounted && product.discountPercentage > 0
                        ? `PKR ${Math.round(product.Price * (1 - product.discountPercentage / 100)).toLocaleString("en-PK")}`
                        : formatPrice(product.Price)}
                    </p>
                    {product.isDiscounted && product.discountPercentage > 0 && (
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        {product.discountPercentage}% OFF
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {getProductCategoryNames(product).map((category) => (
                      <Badge key={category} variant="secondary">{category}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.isLive}
                      disabled={togglingId === product._id}
                      onCheckedChange={() => handleToggleLive(product)}
                      aria-label={`Toggle ${product.Name} live status`}
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {product.isLive ? "Live" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.StockStatus === "In Stock"}
                      disabled={togglingStockId === product._id}
                      onCheckedChange={() => handleToggleStock(product)}
                      aria-label={`Toggle ${product.Name} stock status`}
                    />
                    <Badge variant={product.StockStatus === "In Stock" ? "emerald" : "destructive"} className="text-[10px] uppercase">
                      {product.StockStatus === "In Stock" ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleProductFlag(product._id, 'isNewArrival', product.isNewArrival)}
                      className={cn(
                        "flex h-7 px-2 items-center justify-center rounded-md border text-[9px] font-bold transition-all",
                        product.isNewArrival 
                          ? "bg-primary/10 border-primary/20 text-primary" 
                          : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                      )}
                      title="New Arrival"
                    >
                      NEW
                    </button>
                    <button
                      onClick={() => toggleProductFlag(product._id, 'isTrending', product.isTrending)}
                      className={cn(
                        "flex h-7 px-2 items-center justify-center rounded-md border text-[9px] font-bold transition-all",
                        product.isTrending 
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-600" 
                          : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                      )}
                      title="Trending"
                    >
                      HOT
                    </button>
                    <button
                      onClick={() => toggleProductFlag(product._id, 'isBestSelling', product.isBestSelling)}
                      className={cn(
                        "flex h-7 px-2 items-center justify-center rounded-md border text-[9px] font-bold transition-all",
                        product.isBestSelling 
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-600" 
                          : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                      )}
                      title="Best Selling"
                    >
                      TOP
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={product.isDiscounted ? "default" : "outline"}
                    size="icon"
                    onClick={() => setDiscountModal({ open: true, product })}
                    aria-label={`Set discount for ${product.Name}`}
                    title="Set Discount"
                  >
                    <Tag className="size-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-semibold transition-all duration-200 outline-none select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-3 focus-visible:ring-ring/20 border-border bg-background text-foreground hover:bg-muted size-10"
                      )}
                      title="Actions"
                    >
                      <MoreVertical className="size-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer"
                        >
                          <Link href={`/admin/products/edit/${product._id}`} className="flex w-full items-center">
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setReviewsModal({ open: true, product })}
                        >
                          <MessageSquare className="mr-2 size-4" />
                          Reviews
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                          onClick={() => setDeleteModal({ open: true, product })}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4">Flags</th>
                <th className="px-6 py-4 text-center">Visibility</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <p className="font-medium text-muted-foreground">No products found for the selected criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product._id} className="transition-colors hover:bg-muted/35">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative size-12 overflow-hidden rounded-lg border border-border bg-muted">
                          {getPrimaryProductImage(product)?.url ? (
                            <Image
                              src={getPrimaryProductImage(product).url}
                              alt={product.Name}
                              fill
                              className="object-cover"
                              {...getBlurPlaceholderProps(getPrimaryProductImage(product).blurDataURL)}
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-muted-foreground">
                              <ImageIcon className="size-4" />
                            </div>
                          )}
                        </div>
                        <span className="max-w-[220px] line-clamp-2 text-sm font-semibold text-foreground">{product.Name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.isDiscounted && product.discountPercentage > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-primary">
                            PKR {Math.round(product.Price * (1 - product.discountPercentage / 100)).toLocaleString("en-PK")}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.Price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-primary">{formatPrice(product.Price)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex max-w-[180px] flex-wrap gap-1.5">
                        {getProductCategoryNames(product).map((category) => (
                          <Badge key={category} variant="secondary" className="text-[10px]">{category}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2">
                        <Switch
                          checked={product.StockStatus === "In Stock"}
                          disabled={togglingStockId === product._id}
                          onCheckedChange={() => handleToggleStock(product)}
                          aria-label={`Toggle ${product.Name} stock status`}
                        />
                        <Badge variant={product.StockStatus === "In Stock" ? "emerald" : "destructive"} className="min-w-[85px] justify-center text-[10px] uppercase">
                          {product.StockStatus === "In Stock" ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleProductFlag(product._id, 'isNewArrival', product.isNewArrival)}
                          className={cn(
                            "flex h-7 px-2 items-center justify-center rounded-md border text-[9px] font-bold transition-all",
                            product.isNewArrival 
                              ? "bg-primary/10 border-primary/20 text-primary" 
                              : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                          )}
                          title="New Arrival"
                        >
                          NEW
                        </button>
                        <button
                          onClick={() => toggleProductFlag(product._id, 'isTrending', product.isTrending)}
                          className={cn(
                            "flex h-7 px-2 items-center justify-center rounded-md border text-[9px] font-bold transition-all",
                            product.isTrending 
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-600" 
                              : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                          )}
                          title="Trending"
                        >
                          HOT
                        </button>
                        <button
                          onClick={() => toggleProductFlag(product._id, 'isBestSelling', product.isBestSelling)}
                          className={cn(
                            "flex h-7 px-2 items-center justify-center rounded-md border text-[9px] font-bold transition-all",
                            product.isBestSelling 
                              ? "bg-rose-500/10 border-rose-500/20 text-rose-600" 
                              : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                          )}
                          title="Best Selling"
                        >
                          TOP
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-3">
                        <Switch
                          checked={product.isLive}
                          disabled={togglingId === product._id}
                          onCheckedChange={() => handleToggleLive(product)}
                          aria-label={`Toggle ${product.Name} live status`}
                        />
                        <span className="min-w-10 text-left text-[11px] font-bold uppercase text-muted-foreground">
                          {product.isLive ? "Live" : "Draft"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 relative">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant={product.isDiscounted ? "default" : "outline"}
                          size="sm"
                          className="h-8 px-3"
                          onClick={() => setDiscountModal({ open: true, product })}
                          title="Set Discount"
                        >
                          <Tag className="mr-1.5 size-3.5" />
                          {product.isDiscounted ? `${product.discountPercentage}%` : "Disc."}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={cn(
                              "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 outline-none select-none hover:bg-muted hover:text-foreground text-muted-foreground size-8 border border-transparent hover:border-border"
                            )}
                            title="Actions"
                          >
                            <MoreVertical className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer"
                              >
                                <Link href={`/admin/products/edit/${product._id}`} className="flex w-full items-center">
                                  <Pencil className="mr-2 size-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => setReviewsModal({ open: true, product })}
                              >
                                <MessageSquare className="mr-2 size-4" />
                                Reviews
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:bg-destructive cursor-pointer focus:text-destructive-foreground"
                                onClick={() => setDeleteModal({ open: true, product })}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Pagination ---- */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{" "}
            <span className="font-medium text-foreground">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
            </span>{" "}
            of <span className="font-medium text-foreground">{filteredProducts.length}</span> products
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Show first, last, and current +/- 1
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className="size-9 font-medium"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-1 text-muted-foreground">...</span>;
                }
                return null;
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ---- Delete Confirmation ---- */}
      <AlertDialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal((previous) => ({ ...previous, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-semibold text-foreground">{deleteModal.product?.Name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={cn(buttonVariants({ variant: "outline" }))} onClick={() => setDeleteModal({ open: false, product: null })}>
              Cancel
            </AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Product"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ---- Discount Dialog ---- */}
      <DiscountDialog
        open={discountModal.open}
        product={discountModal.product}
        onOpenChange={(open) => setDiscountModal((previous) => ({ ...previous, open }))}
        onSuccess={handleDiscountSuccess}
      />

      {/* ---- Reviews Dialog ---- */}
      <AdminReviewsDialog
        open={reviewsModal.open}
        product={reviewsModal.product}
        onOpenChange={(open) => setReviewsModal((previous) => ({ ...previous, open }))}
      />
    </div>
  );
}
