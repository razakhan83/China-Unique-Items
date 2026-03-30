import Image from 'next/image';
import { Store } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getStoreConfig } from '@/lib/store-config';

export default function StoreBrand({
  className,
  compact = false,
  surface = 'light',
  textClassName,
  subtitle,
  subtitleClassName,
  iconClassName,
}) {
  const store = getStoreConfig();
  const hasWordmarkLogo = store.key === 'aam-saman' && store.logoImageUrl;
  const resolvedSubtitle = subtitle === undefined && hasWordmarkLogo ? null : subtitle ?? store.tagline;
  const resolvedLogoSrc = surface === 'dark' && store.logoImageDarkUrl
    ? store.logoImageDarkUrl
    : store.logoImageUrl;

  if (hasWordmarkLogo) {
    return (
      <div className={cn('flex min-w-0 flex-col gap-1', className)}>
        <Image
          src={resolvedLogoSrc}
          alt={store.name}
          width={compact ? 124 : 164}
          height={compact ? 44 : 58}
          className={cn(
            'h-auto w-auto object-contain',
            compact ? 'max-w-[7.75rem]' : 'max-w-[10.25rem]',
          )}
        />
        {resolvedSubtitle ? (
          <p className={cn('truncate text-xs text-muted-foreground', subtitleClassName)}>
            {resolvedSubtitle}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary',
          compact && 'size-9 rounded-lg',
          iconClassName,
        )}
      >
        {store.logoImageUrl ? (
          <Image
            src={resolvedLogoSrc}
            alt={store.name}
            width={40}
            height={40}
            className="size-full object-cover"
          />
        ) : (
          <Store className={cn('size-5', compact && 'size-4.5')} />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            'truncate text-sm font-semibold uppercase tracking-[0.12em] text-primary',
            textClassName,
          )}
        >
          {store.logoTextPrimary}
        </p>
        {resolvedSubtitle ? (
          <p className={cn('truncate text-xs text-muted-foreground', subtitleClassName)}>
            {resolvedSubtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
