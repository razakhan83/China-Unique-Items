'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

import { cn } from '@/lib/utils';

export default function ProductWishlistButton() {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isWishlisted}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      data-slot="checkbox"
      data-state={isWishlisted ? 'checked' : 'unchecked'}
      value="on"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsWishlisted((current) => !current);
      }}
      className={cn(
        "group/wishlist absolute right-2.5 top-2.5 z-10 inline-flex size-7 items-center justify-center rounded-full border border-border/60 bg-background/90 p-0 text-foreground shadow-xs backdrop-blur-md outline-none transition-[transform,opacity,border-color,box-shadow,color] duration-200 ease-out hover:scale-[1.03] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring/50 md:hover:border-destructive/30 md:hover:text-destructive md:hover:shadow-sm after:absolute after:-inset-2 after:content-['']",
        isWishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
      )}
    >
      <span className="relative block size-3.5">
        <Heart
          className={cn(
            'absolute inset-0 size-3.5 transition-all duration-200 ease-out md:group-hover/wishlist:text-destructive/70',
            isWishlisted ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
          )}
        />
        <Heart
          className={cn(
            'absolute inset-0 size-3.5 fill-destructive stroke-destructive transition-all duration-200 ease-out',
            isWishlisted ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          )}
        />
      </span>
    </button>
  );
}
