<!-- refreshed: 2026-05-22 -->
# Architecture

**Analysis Date:** 2026-05-22

## System Overview

```text
┌──────────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                            │
├────────────────────────────┬─────────────────────────────────────────┤
│    Shop Storefront          │          Admin Panel                    │
│  `src/app/(shop)/`         │       `src/app/admin/`                  │
│  Route group, public       │   Role-gated, admin-only                │
└────────────┬───────────────┴───────────────┬─────────────────────────┘
             │                               │
             ▼                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       Feature Modules                                │
│  `src/features/shop/`   `src/features/admin/`   `src/features/cart/`│
│  `src/features/checkout/`  `src/features/account/`                  │
│  `src/features/auth/`      `src/features/wishlist/`                 │
│  Each feature owns: actions/ (Server Actions) + components/ (UI)    │
└────────────────────────────┬─────────────────────────────────────────┘
             │                               │
             ▼                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         Core / Shared Layer                          │
│  `src/core/db/`    `src/core/auth/`    `src/core/email/`            │
│  `src/core/realtime/`  `src/core/services/`  `src/core/types/`      │
└────────────────────────────┬─────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                 Data / External Services                             │
│  PostgreSQL via Supabase (Drizzle ORM)                              │
│  Supabase Realtime (postgres_changes)                               │
│  Stripe (payments + webhooks)                                       │
│  Cloudinary (image CDN)    Brevo SMTP (transactional email)         │
└──────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | Location |
|-----------|----------------|----------|
| Root Layout | Renders Navbar, Footer, AuthContext, RealtimeProvider, dynamic theming | `src/app/layout.tsx` |
| Shop Route Group | Public storefront pages (home, products, cart, checkout, auth) | `src/app/(shop)/` |
| Admin Layout | Role-checked sidebar + topbar shell; redirects non-admins | `src/app/admin/layout.tsx` |
| API Routes | REST handlers: webhooks, cron, auth, data export, product search | `src/app/api/` |
| Feature Actions | Server Actions for all mutations (CRUD, checkout, account) | `src/features/*/actions/` |
| Feature Components | Client/Server UI components scoped to one feature domain | `src/features/*/components/` |
| Core DB | Drizzle ORM connection + schema + migrations | `src/core/db/` |
| Core Auth | NextAuth.js config, session callbacks, role propagation | `src/core/auth/` |
| Core Types | Shared business entity interfaces (Product, StoreSettings, etc.) | `src/core/types/index.ts` |
| Core Realtime | Supabase client + React context + `useTableSubscription` hook | `src/core/realtime/` |
| Shared UI | Reusable primitives (Button, Card, Dialog) and layout shells | `src/components/` |
| Cart Store | Client-side Zustand store, persisted to localStorage | `src/features/cart/store.ts` |
| Wishlist Store | Client-side Zustand store synced to DB via Server Actions | `src/features/wishlist/store.ts` |

## Pattern Overview

**Overall:** Feature-Sliced / Vertical Slice Architecture inside Next.js App Router

**Key Characteristics:**
- Each feature (shop, admin, checkout, account, cart, wishlist, auth) is a self-contained slice with its own Server Actions and React components
- Pages in `src/app/` are thin orchestrators — they call data functions and pass results to feature components
- Data fetching is handled via `unstable_cache`-wrapped functions in `src/features/shop/services/data.ts` for public reads; admin pages query `db` directly inside Server Components
- Mutations always go through `'use server'` Server Actions, never direct API calls from the client for business logic
- Client state (cart, wishlist) lives in Zustand with `persist` middleware; server state is revalidated via `revalidateTag` / `revalidatePath`

## Layers

**App Layer (Pages & Routes):**
- Purpose: Entry points — route segments map 1:1 to URLs; layouts handle shared chrome
- Location: `src/app/`
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, `route.ts` (API handlers)
- Depends on: Feature components, feature services/actions, core auth
- Used by: Browser / Next.js router

**Feature Layer:**
- Purpose: Domain logic — Server Actions, feature-specific components, services
- Location: `src/features/`
- Contains: `actions/*.ts` (`'use server'`), `components/*.tsx`, `services/*.ts`, `store.ts`
- Depends on: Core layer (`db`, `auth`, `types`)
- Used by: App layer pages and layouts

**Core Layer:**
- Purpose: Infrastructure primitives shared across all features
- Location: `src/core/`
- Contains: `db/` (Drizzle connection + schema), `auth/` (NextAuth config + context), `email/` (Nodemailer/Brevo), `realtime/` (Supabase client + hooks), `services/` (Cloudinary upload), `types/` (business interfaces), `utils.ts` (cn helper)
- Depends on: External services only
- Used by: Feature layer and App layer

**Shared UI Layer:**
- Purpose: Presentational primitives with no business logic
- Location: `src/components/`
- Contains: `layout/` (Navbar, Footer, Container, Section, banners), `ui/` (Button, Card, Dialog, Input, Badge, etc.)
- Depends on: Nothing project-specific
- Used by: Feature components, App layer pages

## Data Flow

### Public Storefront Read (e.g., Products Page)

1. Request hits `src/app/(shop)/products/page.tsx` — async Server Component
2. Page calls `getPublicProducts(filters)` from `src/features/shop/services/data.ts`
3. Service function is wrapped in `unstable_cache` — reads from PostgreSQL via Drizzle ORM (`src/core/db/connection.ts`)
4. Cached result returns to page; page passes data to feature components (`ProductCard`, etc.)
5. Client renders HTML — no client JS required for initial render

### Checkout / Payment Flow

1. User clicks "Checkout" in `src/app/(shop)/cart/page.tsx` (or cart component)
2. Calls Server Action `createCheckoutSession` in `src/features/checkout/actions/checkout.ts`
3. Server Action: authenticates session → fetches live product prices from DB → applies festival discounts via `calculateBestPrice` (`src/features/shop/services/pricing.ts`) → inserts a `pending` order + order items → creates Stripe Checkout Session
4. Client redirects to Stripe-hosted checkout page
5. On success: Stripe calls `POST /api/webhooks/stripe` (`src/app/api/webhooks/stripe/route.ts`)
6. Webhook handler verifies signature → updates order status to `processing` → decrements product stock
7. User lands on `src/app/(shop)/checkout/success/page.tsx`; `CartClearer` component calls `clearCart()` on the Zustand store

### Order Cancellation (Cron)

1. Vercel Cron fires `GET /api/cron/cancel-pending-orders` every minute (`vercel.json`)
2. Route handler authenticates via `CRON_SECRET` bearer token
3. Updates all `pending` orders older than 5 minutes to `cancelled` status

### Admin Mutation (e.g., Create Product)

1. Admin fills `ProductForm` in `src/features/admin/components/ProductForm.tsx`
2. Form submits and calls Server Action `createProduct` in `src/features/admin/actions/product.ts`
3. Action calls `assertAdmin()` → verifies session role === `'admin'`
4. Inserts to DB via Drizzle → calls `revalidateTag(STOREFRONT_TAGS.products)` + `revalidatePath`
5. Next.js purges affected caches; subsequent public reads see fresh data

### Realtime Admin Updates

1. `AdminRealtimeListener` component mounts in admin dashboard (`src/features/admin/components/AdminRealtimeListener.tsx`)
2. Uses `useTableSubscription` hook from `src/core/realtime/SupabaseRealtimeProvider.tsx`
3. Supabase Postgres CDC pushes `INSERT`/`UPDATE`/`DELETE` events over WebSocket
4. Callback triggers `router.refresh()` to re-fetch Server Component data

**State Management:**
- Server state: `unstable_cache` (public reads, 5-min TTL), invalidated by `revalidateTag` on mutation
- Client cart state: Zustand + `persist` middleware, key `fashion-shop-cart` in localStorage
- Client wishlist state: Zustand store (`src/features/wishlist/store.ts`) synced to DB via `WishlistSyncer` component
- Auth session: NextAuth JWT tokens; role and user ID embedded in token via `jwt` callback

## Key Abstractions

**Server Actions Pattern:**
- All mutations are `'use server'` functions, never raw `fetch` POSTs from client
- Admin actions always start with `await assertAdmin()` guard
- Checkout and account actions call `await auth()` to get the session
- Examples: `src/features/admin/actions/product.ts`, `src/features/checkout/actions/checkout.ts`, `src/features/account/actions/account-actions.ts`

**`unstable_cache` Data Service:**
- Public read functions are cached with tag arrays matching `STOREFRONT_TAGS` constants
- Cache is invalidated by tag when admin mutations occur
- Location: `src/features/shop/services/data.ts`

**Drizzle ORM Schema:**
- Single schema file defining all tables and relations
- Location: `src/core/db/schema.ts`
- Tables: `users`, `products`, `categories`, `orders`, `orderItems`, `settings`, `wishlists`, `contentPages`, `festivals`
- Re-exported via barrel: `src/core/db/index.ts`

**Dynamic Theming:**
- Root layout resolves active festival → overrides CSS custom properties (`--primary`, `--accent`) inline in `<style>`
- Festival slug becomes a body class (`theme-diwali`, etc.)
- All theme data flows from `getStorefrontShell()` at render time

## Entry Points

**Shop Storefront Root:**
- Location: `src/app/(shop)/page.tsx`
- Triggers: Browser navigation to `/`
- Responsibilities: Fetches storefront shell, resolves home collections, renders Hero + CollectionGrid + ServiceFeatures + NewsletterSignup

**Admin Root:**
- Location: `src/app/admin/page.tsx` → redirects to `src/app/admin/dashboard/page.tsx`
- Triggers: Navigation to `/admin`
- Responsibilities: Guarded by `AdminLayout` which checks session role

**Root Layout:**
- Location: `src/app/layout.tsx`
- Responsibilities: Sets up AuthContext, SupabaseRealtimeProvider, global fonts, dynamic CSS variables, Navbar, Footer, Toaster, banners

**Middleware:**
- Location: `middleware.ts`
- Responsibilities: NextAuth middleware applied to all non-static routes; calls `authorized` callback which enforces `/admin` → admin-only and `/account` → logged-in-only

**Stripe Webhook:**
- Location: `src/app/api/webhooks/stripe/route.ts`
- Responsibilities: Verifies Stripe signature, transitions order status on payment events, decrements stock

## Architectural Constraints

- **Rendering:** Pages are Server Components by default; `'use client'` is only added when browser APIs or interactivity is needed (forms, Zustand stores, Supabase realtime hooks)
- **Auth check duplication:** Auth is checked both in `middleware.ts` (edge, fast redirect) and in `src/app/admin/layout.tsx` (Server Component, defense in depth) — this is intentional double-guard
- **Global singletons:** Drizzle `db` client is module-level singleton in `src/core/db/connection.ts`; Supabase `supabase` client is module-level singleton in `src/core/supabase/client.ts`
- **Stripe instantiation:** `new Stripe(...)` is called at module level in webhook route and also inline inside `retryCheckout` action — inconsistent; the inline call in `retryCheckout` shadows the module-level instance
- **`server-only` guard:** `src/features/shop/services/data.ts` uses `import 'server-only'` to prevent accidental client-side import of DB queries
- **`export const dynamic = 'force-dynamic'`:** Set on `src/app/layout.tsx` — forces the entire app to opt out of static generation, ensuring all layouts re-render per request

## Anti-Patterns

### Direct DB Queries in Admin Page Components

**What happens:** Admin page Server Components (e.g., `src/app/admin/dashboard/page.tsx`) query `db` directly with Drizzle rather than through a service layer.
**Why it's wrong:** Business logic (revenue calculations, trend math) lives in the page component, making it hard to test or reuse. Admin data fetching is inconsistent with the shop's `services/data.ts` pattern.
**Do this instead:** Extract admin queries into `src/features/admin/services/data.ts` (does not yet exist), paralleling the shop service pattern.

### Stripe Instantiated in Two Places

**What happens:** `const stripe = new Stripe(...)` is declared at module scope in `src/app/api/webhooks/stripe/route.ts` and also inline inside `retryCheckout` in `src/features/checkout/actions/checkout.ts`.
**Why it's wrong:** Potential for config drift if key handling is changed in one place but not the other.
**Do this instead:** Create a shared `src/core/services/stripe.ts` that exports a singleton `stripe` client.

## Error Handling

**Strategy:** Try/catch with structured `{ success: boolean, error?: string }` returns from Server Actions; DB errors in admin pages render `<DbErrorView>` component (`src/features/admin/components/DbErrorView.tsx`)

**Patterns:**
- Server Actions return `{ success: true, ... }` or `{ success: false, error: string }` — never throw to the client
- Page-level DB errors in admin are caught and render `<DbErrorView error={error} />`
- Stripe errors during checkout delete the pending order and throw to the action caller
- Webhook errors return HTTP 400/500 with plain text body per Stripe recommendation

## Cross-Cutting Concerns

**Logging:** `console.error` + `console.log` only — no structured logging library
**Validation:** Zod used in account actions (`src/features/account/actions/account-actions.ts`); raw type casts used in most other actions
**Authentication:** NextAuth.js JWT mode; session available server-side via `auth()` from `src/core/auth/auth.ts`, client-side via `useSession` from `AuthContext`
**Cache Invalidation:** `revalidateTag` with `STOREFRONT_TAGS` constants + `revalidatePath` called after every mutation

---

*Architecture analysis: 2026-05-22*
