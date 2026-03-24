"use client";

import { useEffect, useState } from "react";

const DESKTOP_WISHLIST_QUERY = "(min-width: 768px) and (hover: hover) and (pointer: fine)";

export default function ProductCardWishlistSlot() {
  const [canRenderWishlist, setCanRenderWishlist] = useState(false);
  const [WishlistButton, setWishlistButton] = useState(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_WISHLIST_QUERY);
    let isActive = true;

    const syncMatch = async () => {
      const matches = mediaQuery.matches;
      setCanRenderWishlist(matches);

      if (!matches || WishlistButton || !isActive) return;

      const module = await import("@/components/ProductWishlistButton");
      if (!isActive) return;
      setWishlistButton(() => module.default);
    };

    syncMatch();
    mediaQuery.addEventListener("change", syncMatch);

    return () => {
      isActive = false;
      mediaQuery.removeEventListener("change", syncMatch);
    };
  }, [WishlistButton]);

  if (!canRenderWishlist || !WishlistButton) {
    return <span aria-hidden="true" className="hidden md:block" />;
  }

  return <WishlistButton />;
}
