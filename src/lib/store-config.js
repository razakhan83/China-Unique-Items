const DEFAULT_STORE = {
  key: 'default-store',
  name: 'Storefront',
  shortName: 'Storefront',
  tagline: 'Curated shopping experience',
  description: 'A flexible multi-store commerce experience powered by the shared engine.',
  contactLocation: 'Pakistan',
  footerDescription:
    'A flexible destination for curated products, distinctive merchandising, and a polished buying experience.',
  logoTextPrimary: 'Storefront',
  logoTextSecondary: 'Engine',
  logoImageUrl: '',
  logoImageDarkUrl: '',
  siteUrl: 'https://example.com',
  primaryColor: 'oklch(0.396 0.0722 178.59)',
  primaryForegroundColor: 'oklch(0.985 0.004 95)',
  accentColor: 'oklch(0.78 0.11 92)',
  accentForegroundColor: 'oklch(0.23 0.02 160)',
  emailFromName: 'Storefront',
};

const STORE_PRESETS = {
  'china-unique': {
    primaryColor: 'oklch(0.396 0.0722 178.59)',
    primaryForegroundColor: 'oklch(0.985 0.004 95)',
    accentColor: 'oklch(0.78 0.11 92)',
    accentForegroundColor: 'oklch(0.23 0.02 160)',
  },
  'aam-saman': {
    name: 'Aam Samaan',
    shortName: 'Aam Samaan',
    logoTextPrimary: 'Aam Samaan',
    logoTextSecondary: '',
    logoImageUrl: '/brands/aam-samaan-wordmark-dark.webp',
    logoImageDarkUrl: '/brands/aam-samaan-wordmark-light.webp',
    primaryColor: 'oklch(0.55 0.14 145)',
    primaryForegroundColor: 'oklch(0.99 0.01 95)',
    accentColor: 'oklch(0.82 0.12 88)',
    accentForegroundColor: 'oklch(0.22 0.03 145)',
  },
};

function trimValue(value, fallback = '') {
  const normalized = String(value || '').trim();
  return normalized || fallback;
}

function normalizeAamSamaanLabel(storeKey, value) {
  if (storeKey !== 'aam-saman') return value;
  if (/^aam$/i.test(value) || /^aam\s+saman$/i.test(value)) {
    return 'Aam Samaan';
  }
  if (/^saman$/i.test(value)) {
    return '';
  }
  return value;
}

export function getStoreConfig() {
  const storeKey = trimValue(process.env.NEXT_PUBLIC_STORE_KEY, DEFAULT_STORE.key);
  const preset = STORE_PRESETS[storeKey] || {};
  const resolveLabel = (value, fallback = '') =>
    normalizeAamSamaanLabel(storeKey, trimValue(value, fallback));
  const siteUrl = trimValue(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL,
    DEFAULT_STORE.siteUrl,
  );

  const shortName = resolveLabel(
    process.env.NEXT_PUBLIC_STORE_SHORT_NAME,
    resolveLabel(process.env.NEXT_PUBLIC_STORE_NAME, preset.shortName || DEFAULT_STORE.shortName),
  );

  return {
    key: storeKey,
    name: resolveLabel(process.env.NEXT_PUBLIC_STORE_NAME, preset.name || DEFAULT_STORE.name),
    shortName,
    tagline: trimValue(process.env.NEXT_PUBLIC_STORE_TAGLINE, DEFAULT_STORE.tagline),
    description: trimValue(process.env.NEXT_PUBLIC_STORE_DESCRIPTION, DEFAULT_STORE.description),
    contactLocation: trimValue(
      process.env.NEXT_PUBLIC_STORE_CONTACT_LOCATION,
      DEFAULT_STORE.contactLocation,
    ),
    footerDescription: trimValue(
      process.env.NEXT_PUBLIC_STORE_FOOTER_DESCRIPTION,
      DEFAULT_STORE.footerDescription,
    ),
    logoTextPrimary: resolveLabel(
      process.env.NEXT_PUBLIC_STORE_LOGO_TEXT_PRIMARY,
      preset.logoTextPrimary || shortName,
    ),
    logoTextSecondary: resolveLabel(
      process.env.NEXT_PUBLIC_STORE_LOGO_TEXT_SECONDARY,
      preset.logoTextSecondary ?? DEFAULT_STORE.logoTextSecondary,
    ),
    logoImageUrl: trimValue(
      process.env.NEXT_PUBLIC_STORE_LOGO_URL,
      preset.logoImageUrl || DEFAULT_STORE.logoImageUrl,
    ),
    logoImageDarkUrl: trimValue(
      process.env.NEXT_PUBLIC_STORE_LOGO_DARK_URL,
      preset.logoImageDarkUrl || DEFAULT_STORE.logoImageDarkUrl,
    ),
    siteUrl,
    primaryColor: trimValue(
      process.env.NEXT_PUBLIC_STORE_PRIMARY_COLOR,
      preset.primaryColor || DEFAULT_STORE.primaryColor,
    ),
    primaryForegroundColor: trimValue(
      process.env.NEXT_PUBLIC_STORE_PRIMARY_FOREGROUND_COLOR,
      preset.primaryForegroundColor || DEFAULT_STORE.primaryForegroundColor,
    ),
    accentColor: trimValue(
      process.env.NEXT_PUBLIC_STORE_ACCENT_COLOR,
      preset.accentColor || DEFAULT_STORE.accentColor,
    ),
    accentForegroundColor: trimValue(
      process.env.NEXT_PUBLIC_STORE_ACCENT_FOREGROUND_COLOR,
      preset.accentForegroundColor || DEFAULT_STORE.accentForegroundColor,
    ),
    emailFromName: trimValue(process.env.STORE_EMAIL_FROM_NAME, shortName),
  };
}

export function getStoreThemeStyle() {
  const config = getStoreConfig();

  return {
    '--store-primary': config.primaryColor,
    '--store-primary-foreground': config.primaryForegroundColor,
    '--store-accent': config.accentColor,
    '--store-accent-foreground': config.accentForegroundColor,
  };
}

export function getStoreMetadata({
  title,
  description,
  path = '',
} = {}) {
  const config = getStoreConfig();
  const normalizedPath = path ? `${path.startsWith('/') ? '' : '/'}${path}` : '';

  return {
    title: title || config.name,
    description: description || config.description,
    alternates: {
      canonical: `${config.siteUrl}${normalizedPath}`,
    },
  };
}
