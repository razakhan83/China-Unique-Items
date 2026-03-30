# Multi-Store Engine

`main` is now the shared engine branch.

Branch strategy:
- `main`: shared auth, checkout, admin, database integrations, and tenant-aware query logic.
- `china-unique-items`: store branch for China Unique Items.
- `aam-saman`: store branch for Aam Saman.

Tenant configuration:
- Store identity is driven by environment variables, not hardcoded copy.
- `NEXT_PUBLIC_STORE_KEY` is the tenant identifier used to scope `Product` and `Order` data.
- Store-scoped operational settings are stored under keys like `<storeKey>:site-settings`.

Required env vars per deployment:
- `NEXT_PUBLIC_STORE_KEY`
- `NEXT_PUBLIC_STORE_NAME`
- `NEXT_PUBLIC_STORE_SHORT_NAME`
- `NEXT_PUBLIC_STORE_TAGLINE`
- `NEXT_PUBLIC_STORE_DESCRIPTION`
- `NEXT_PUBLIC_STORE_CONTACT_LOCATION`
- `NEXT_PUBLIC_STORE_FOOTER_DESCRIPTION`
- `NEXT_PUBLIC_STORE_LOGO_TEXT_PRIMARY`
- `NEXT_PUBLIC_STORE_LOGO_TEXT_SECONDARY`
- `NEXT_PUBLIC_STORE_LOGO_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_STORE_PRIMARY_COLOR`
- `NEXT_PUBLIC_STORE_PRIMARY_FOREGROUND_COLOR`
- `NEXT_PUBLIC_STORE_ACCENT_COLOR`
- `NEXT_PUBLIC_STORE_ACCENT_FOREGROUND_COLOR`
- `STORE_EMAIL_FROM_NAME`

Notes:
- New `Product` and `Order` documents are written with `storeKey`.
- Shared-DB storefront/admin reads now scope product and order access to the active store key.
- Existing legacy data should be backfilled before both stores run against the same MongoDB in production.
- Backfill script: `node scripts/backfill-store-key.mjs`

Sample presets:
- [stores/china-unique-items.env.sample](/Users/razak/China-Unique-Items/stores/china-unique-items.env.sample)
- [stores/aam-saman.env.sample](/Users/razak/China-Unique-Items/stores/aam-saman.env.sample)
