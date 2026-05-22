# Codebase Structure

**Analysis Date:** 2026-05-22

## Directory Layout

```
E:/projects/Ecommerce/
├── src/
│   ├── app/                        # Next.js App Router — pages, layouts, API routes
│   │   ├── layout.tsx              # Root layout (fonts, AuthContext, Realtime, Navbar, Footer, theming)
│   │   ├── (shop)/                 # Route group: public storefront (no URL prefix)
│   │   │   ├── layout.tsx          # Shop layout shell (thin passthrough)
│   │   │   ├── page.tsx            # Home page /
│   │   │   ├── products/           # /products (list) + /products/[id] (detail)
│   │   │   ├── cart/               # /cart
│   │   │   ├── checkout/           # /checkout/success
│   │   │   ├── account/            # /account (auth-protected)
│   │   │   ├── wishlist/           # /wishlist (auth-protected)
│   │   │   ├── login/              # /login
│   │   │   ├── register/           # /register
│   │   │   ├── forgot-password/    # /forgot-password
│   │   │   ├── reset-password/     # /reset-password
│   │   │   └── pages/[slug]/       # /pages/:slug — CMS content pages
│   │   ├── admin/                  # /admin/* — role-gated admin panel
│   │   │   ├── layout.tsx          # Admin shell (sidebar + topbar, session guard)
│   │   │   ├── page.tsx            # /admin redirect
│   │   │   ├── dashboard/          # /admin/dashboard — KPI charts, recent orders
│   │   │   ├── products/           # /admin/products — product CRUD table
│   │   │   ├── orders/             # /admin/orders + /admin/orders/[id]
│   │   │   ├── customers/          # /admin/customers
│   │   │   ├── taxonomy/           # /admin/taxonomy — category management
│   │   │   ├── festivals/          # /admin/festivals — sale campaigns
│   │   │   ├── pages/              # /admin/pages — CMS page editor
│   │   │   └── settings/           # /admin/settings — store configuration
│   │   └── api/                    # API Route handlers (Next.js route.ts)
│   │       ├── auth/               # /api/auth/[...nextauth], register, forgot/reset-password
│   │       ├── webhooks/stripe/    # /api/webhooks/stripe — Stripe payment events
│   │       ├── cron/               # /api/cron/cancel-pending-orders — Vercel cron job
│   │       ├── products/by-ids/    # /api/products/by-ids — batch product lookup
│   │       ├── active-festival/    # /api/active-festival
│   │       └── admin/export/       # /api/admin/export/customers + /orders — CSV export
│   ├── features/                   # Vertical feature slices
│   │   ├── shop/                   # Public storefront domain
│   │   │   ├── actions/            # customer.ts (newsletter signup etc.)
│   │   │   ├── components/         # Hero, CollectionGrid, ProductCard, AddToCartButton, ProductSelection, NewsletterSignup
│   │   │   └── services/           # data.ts (cached DB reads), pricing.ts, home-utils.ts
│   │   ├── admin/                  # Admin panel domain
│   │   │   ├── actions/            # product.ts, settings.ts, taxonomy.ts, festival.ts, pages.ts
│   │   │   └── components/         # ProductForm, ProductTable, OrderStatusSelect, SettingsForm, FestivalManager, TaxonomyManager, PageEditor, AdminSidebar, AdminTopbar, AdminBreadcrumbs, PaymentStatusBadge, DbErrorView, etc.
│   │   │       └── settings-tabs/  # BannerTab, DesignTab, FooterTab, GeneralTab, LayoutTab
│   │   ├── checkout/               # Checkout + payment domain
│   │   │   ├── actions/            # checkout.ts (Stripe session creation, retry), order.ts
│   │   │   └── components/         # CartClearer, RetryPaymentButton
│   │   ├── account/                # Logged-in user profile domain
│   │   │   ├── actions/            # account-actions.ts (update profile)
│   │   │   └── components/         # AccountSettingsForm, UserRealtimeListener
│   │   ├── auth/                   # Auth forms domain
│   │   │   └── components/         # Login, Register, ForgotPassword, ResetPassword form components
│   │   ├── cart/                   # Cart state
│   │   │   └── store.ts            # Zustand store (persisted to localStorage)
│   │   └── wishlist/               # Wishlist state + sync
│   │       ├── store.ts            # Zustand store
│   │       ├── actions.ts          # Server Actions (add/remove from DB)
│   │       ├── WishlistSyncer.tsx  # Client component: syncs store to DB on login
│   │       └── useWishlist.ts      # Hook wrapping store + actions
│   ├── core/                       # Shared infrastructure
│   │   ├── db/
│   │   │   ├── index.ts            # Barrel re-export
│   │   │   ├── connection.ts       # Drizzle + postgres-js singleton `db`
│   │   │   ├── schema.ts           # All table definitions + relations
│   │   │   ├── init.ts             # DB initialization / seed guard
│   │   │   ├── ensure-settings-columns.ts  # Migration helper
│   │   │   └── ensure-content-pages-visibility.ts
│   │   ├── auth/
│   │   │   ├── auth.ts             # NextAuth.js server instance (providers, adapters)
│   │   │   ├── auth.config.ts      # NextAuth config: callbacks (jwt, session, authorized)
│   │   │   └── AuthContext.tsx     # Client SessionProvider wrapper
│   │   ├── email/
│   │   │   └── mailer.ts           # Nodemailer/Brevo SMTP transporter + email templates
│   │   ├── realtime/
│   │   │   └── SupabaseRealtimeProvider.tsx  # Context + useTableSubscription hook
│   │   ├── services/
│   │   │   └── upload.ts           # Cloudinary image upload Server Action
│   │   ├── supabase/
│   │   │   └── client.ts           # Supabase JS client singleton
│   │   ├── types/
│   │   │   ├── index.ts            # Product, StoreSettings, Category, Festival interfaces
│   │   │   └── filters.ts          # PublicProductFilters, NormalizedProductFilters
│   │   └── utils.ts                # `cn()` Tailwind class merger
│   ├── components/                 # Shared presentational components
│   │   ├── layout/                 # Navbar, Footer, Container, Section, EmergencyBanner, FestivalBanner, Copyright
│   │   └── ui/                     # Primitives: Button, Card, Dialog, Input, Label, Badge, Skeleton, Textarea, Separator, DropdownMenu, OptimizedImage, ImageUpload
│   └── lib/                        # (currently empty / reserved)
├── drizzle/                        # Drizzle migration files and meta
│   └── meta/
├── scripts/                        # One-off maintenance and migration scripts
│   ├── maintenance/
│   └── migrations/
├── public/
│   └── uploads/                    # Local file uploads (dev only; production uses Cloudinary)
├── middleware.ts                   # NextAuth edge middleware (route protection)
├── next.config.ts                  # Next.js configuration
├── drizzle.config.ts               # Drizzle Kit configuration
├── tsconfig.json                   # TypeScript configuration
├── vercel.json                     # Vercel cron job configuration
├── components.json                 # shadcn/ui component registry config
└── package.json
```

## Directory Purposes

**`src/app/`:**
- Purpose: All Next.js routing — pages, layouts, loading states, API routes
- Contains: Server Components by default; `'use client'` added only when needed
- Key files: `layout.tsx` (root), `(shop)/page.tsx` (home), `admin/layout.tsx` (admin shell)

**`src/features/`:**
- Purpose: Vertical slices of product functionality — each feature owns its own UI and mutations
- Structure: `actions/` (Server Actions), `components/` (React components), `services/` (data layer), `store.ts` (client state)
- Key rule: Features do NOT import from other features; they only import from `src/core/` and `src/components/`

**`src/core/`:**
- Purpose: Shared infrastructure — database, auth, email, realtime, uploads, types
- Key rule: Core modules have no dependency on features or app-layer code
- Key files: `db/schema.ts` (single source of truth for DB shape), `auth/auth.config.ts` (route protection rules), `types/index.ts` (shared business interfaces)

**`src/components/`:**
- Purpose: Reusable presentational components with no business logic
- `layout/`: Site-wide chrome (Navbar, Footer, banners, Container)
- `ui/`: Low-level primitives, mostly shadcn/ui based (Button, Card, Dialog, Input, etc.)

**`drizzle/`:**
- Purpose: Auto-generated migration SQL files from `drizzle-kit generate`
- Generated: Yes
- Committed: Yes (migration history)

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout — wraps entire app with providers and chrome
- `src/app/(shop)/page.tsx`: Home page
- `src/app/admin/layout.tsx`: Admin shell with session guard
- `middleware.ts`: Edge-level route protection

**Database:**
- `src/core/db/schema.ts`: All table and relation definitions (single source of truth)
- `src/core/db/connection.ts`: Drizzle `db` client singleton
- `drizzle.config.ts`: Drizzle Kit migration configuration

**Auth:**
- `src/core/auth/auth.config.ts`: `authorized` callback, redirect rules, role checks
- `src/core/auth/auth.ts`: NextAuth instance with credential provider
- `src/core/auth/AuthContext.tsx`: Client-side `SessionProvider` wrapper

**Public Data Service:**
- `src/features/shop/services/data.ts`: All `unstable_cache` wrapped read functions + `STOREFRONT_TAGS` constants
- `src/features/shop/services/pricing.ts`: `calculateBestPrice` — festival vs product discount logic

**Mutations:**
- `src/features/admin/actions/product.ts`: Product CRUD
- `src/features/admin/actions/settings.ts`: Store settings
- `src/features/checkout/actions/checkout.ts`: Stripe session creation + retry
- `src/features/account/actions/account-actions.ts`: Profile updates
- `src/features/wishlist/actions.ts`: Wishlist DB sync

**Webhooks / Background:**
- `src/app/api/webhooks/stripe/route.ts`: Payment confirmation + stock decrement
- `src/app/api/cron/cancel-pending-orders/route.ts`: Vercel cron — cancel stale pending orders

**Client State:**
- `src/features/cart/store.ts`: Zustand cart store (localStorage)
- `src/features/wishlist/store.ts`: Zustand wishlist store

**Shared Types:**
- `src/core/types/index.ts`: `Product`, `StoreSettings`, `Category`, `Festival`
- `src/core/types/filters.ts`: `PublicProductFilters`, `NormalizedProductFilters`

## Naming Conventions

**Files:**
- React components: PascalCase — `ProductCard.tsx`, `AdminSidebar.tsx`
- Server Actions files: kebab-case noun — `account-actions.ts`, `checkout.ts`
- Service/utility files: kebab-case — `data.ts`, `pricing.ts`, `home-utils.ts`
- Next.js conventions enforced: `page.tsx`, `layout.tsx`, `loading.tsx`, `route.ts`

**Directories:**
- Feature slices: lowercase noun — `shop/`, `admin/`, `checkout/`, `account/`
- Sub-directories within features: lowercase noun — `actions/`, `components/`, `services/`
- Route groups: parentheses — `(shop)/`
- Dynamic segments: brackets — `[id]/`, `[slug]/`

**Exports:**
- Components: named exports preferred (`export function Navbar`)
- Server Actions: named exports required (Next.js constraint)
- Stores: named export of hook (`export const useCart`)
- Types: named exports from barrel `src/core/types/index.ts`

**Path Aliases:**
- `@/` maps to `src/` (configured in `tsconfig.json`)
- Use: `import { db } from '@/core/db'`, `import { useCart } from '@/features/cart/store'`

## Where to Add New Code

**New Storefront Page:**
- Route file: `src/app/(shop)/<route>/page.tsx`
- Feature components: `src/features/shop/components/<ComponentName>.tsx`
- Data fetching: add a new `unstable_cache` wrapped function in `src/features/shop/services/data.ts`

**New Admin Section:**
- Route file: `src/app/admin/<section>/page.tsx` + optional `loading.tsx`
- Server Actions: `src/features/admin/actions/<domain>.ts`
- UI components: `src/features/admin/components/<ComponentName>.tsx`
- Add nav link in `src/features/admin/components/AdminSidebar.tsx`

**New API Route:**
- Location: `src/app/api/<path>/route.ts`
- Pattern: export named HTTP method functions (`GET`, `POST`, etc.)

**New Database Table:**
- Add table definition to `src/core/db/schema.ts`
- Add relations if needed (same file)
- Run `drizzle-kit generate` then `drizzle-kit migrate`
- Add corresponding TypeScript interface to `src/core/types/index.ts`

**New Server Action (mutation):**
- Add to the relevant feature's `actions/` directory
- Always start with `'use server'` directive
- Admin actions must call `assertAdmin()` first
- Call `revalidateTag` / `revalidatePath` after DB writes

**New Shared UI Component:**
- Primitive (button, input): `src/components/ui/<ComponentName>.tsx`
- Layout chrome: `src/components/layout/<ComponentName>.tsx`
- Feature-specific but reused across pages within one feature: `src/features/<feature>/components/<ComponentName>.tsx`

**New Business Type:**
- Add interface to `src/core/types/index.ts`

## Special Directories

**`drizzle/`:**
- Purpose: Drizzle ORM migration files and snapshot metadata
- Generated: Yes (by `drizzle-kit generate`)
- Committed: Yes

**`public/uploads/`:**
- Purpose: Local filesystem uploads in development
- Generated: At runtime
- Production: Not used — Cloudinary handles all image uploads in production

**`scripts/`:**
- Purpose: One-time maintenance scripts and manual migration helpers
- Generated: No
- Committed: Yes (reference scripts for DB ops)

**`.planning/`:**
- Purpose: GSD planning documents — codebase maps, phase plans
- Generated: By GSD tools
- Committed: Yes

---

*Structure analysis: 2026-05-22*
