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
};

function trimValue(value, fallback = '') {
  const normalized = String(value || '').trim();
  return normalized || fallback;
}

export function getStoreConfig() {
  const storeKey = trimValue(process.env.NEXT_PUBLIC_STORE_KEY, DEFAULT_STORE.key);
  const preset = STORE_PRESETS[storeKey] || {};
  const siteUrl = trimValue(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL,
    DEFAULT_STORE.siteUrl,
  );

  const shortName = trimValue(
    process.env.NEXT_PUBLIC_STORE_SHORT_NAME,
    trimValue(process.env.NEXT_PUBLIC_STORE_NAME, DEFAULT_STORE.shortName),
  );

  return {
    key: storeKey,
    name: trimValue(process.env.NEXT_PUBLIC_STORE_NAME, DEFAULT_STORE.name),
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
    logoTextPrimary: trimValue(process.env.NEXT_PUBLIC_STORE_LOGO_TEXT_PRIMARY, shortName),
    logoTextSecondary: trimValue(
      process.env.NEXT_PUBLIC_STORE_LOGO_TEXT_SECONDARY,
      DEFAULT_STORE.logoTextSecondary,
    ),
    logoImageUrl: trimValue(process.env.NEXT_PUBLIC_STORE_LOGO_URL, DEFAULT_STORE.logoImageUrl),
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
    '--color-primary': config.primaryColor,
    '--color-primary-foreground': config.primaryForegroundColor,
    '--color-accent': config.accentColor,
    '--color-accent-foreground': config.accentForegroundColor,
    '--color-ring': config.primaryColor,
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
