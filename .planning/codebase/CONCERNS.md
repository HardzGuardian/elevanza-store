# Codebase Concerns

**Analysis Date:** 2026-05-22

---

## Tech Debt

**`data: any` types in all admin server actions — no Zod validation:**
- Issue: Every mutating server action accepts an untyped `data: any` parameter. No runtime validation is performed before writing to the database. Malformed, missing, or malicious values go straight to SQL.
- Files:
  - `src/features/admin/actions/product.ts` — `createProduct(data: any)`, `updateProduct(id, data: any)`
  - `src/features/admin/actions/settings.ts` — `saveSettings(data: any)`
  - `src/features/admin/actions/taxonomy.ts` — `createFestival(data: any)`, `updateFestival(id, data: any)`
  - `src/features/admin/actions/festival.ts` — `createFestival(data: any)`, `updateFestival(id, data: any)`
- Impact: A missing `price` field silently inserts `NaN`; a negative `stock` silently sets negative inventory; no constraint on string lengths beyond the DB column limit.
- Fix approach: Define Zod schemas (e.g. `ProductSchema`, `FestivalSchema`) in a `src/features/admin/schemas/` directory. Call `schema.parse(data)` at the top of each action, before `assertAdmin()`.

**Duplicate festival action files:**
- Issue: Festival CRUD logic is implemented twice in completely separate files with divergent behavior.
  - `src/features/admin/actions/festival.ts` — standalone file, no `assertAdmin()` guard on any export
  - `src/features/admin/actions/taxonomy.ts` — also exports `createFestival`, `updateFestival`, `deleteFestival`, `toggleFestival`
- Impact: `festival.ts` exports `createFestival`, `updateFestival`, `deleteFestival`, and `toggleFestival` with **zero authentication checks**. Any user who discovers these server action endpoints can create, modify, or delete festivals. `taxonomy.ts` has the same functions with proper `assertAdmin()` guards.
- Fix approach: Delete `src/features/admin/actions/festival.ts` entirely. Ensure all callers import from `taxonomy.ts`.

**`products` table loads all rows for admin — no server-side pagination:**
- Issue: `src/app/admin/products/page.tsx` calls `db.select().from(products)` with no `.limit()` or `.offset()`. All products are fetched and passed to `<ProductTable>` as a prop on every page load.
- Files: `src/app/admin/products/page.tsx`
- Impact: Performance degrades linearly with catalog size. At ~1000 products the page response becomes noticeably slow; at 10 000+ it risks timeout on serverless.
- Fix approach: Add `searchParams` props (like the orders and customers pages already do), apply `.limit(PAGE_SIZE).offset(offset)`, and add a count query. Mirror the pagination pattern in `src/app/admin/orders/page.tsx`.

**`revalidateTag` called with incorrect second argument:**
- Issue: The `revalidateTag` API in Next.js takes only one argument (the tag string). Throughout the codebase it is called as `revalidateTag(tag, {})` with a spurious second argument.
- Files: Every file in `src/features/admin/actions/` and several route handlers.
- Impact: No runtime crash (the extra argument is silently ignored), but it signals the API was integrated without reading the docs and may break on a Next.js version that tightens the signature.
- Fix approach: Remove all `, {}` trailing arguments from every `revalidateTag(...)` call.

---

## Security Considerations

**`festival.ts` server actions have no authentication guard:**
- Risk: `createFestival`, `updateFestival`, `deleteFestival`, and `toggleFestival` in `src/features/admin/actions/festival.ts` are exported `"use server"` functions with no `assertAdmin()` call. Any authenticated (or even unauthenticated, depending on Next.js action invocation) caller can mutate festival data.
- Files: `src/features/admin/actions/festival.ts`
- Current mitigation: None.
- Recommendations: Either delete the file (duplicate of `taxonomy.ts`) or add `await assertAdmin()` as the first line of every exported function.

**`taxonomy.ts` — `getCategories` and `getFestivals` are unauthenticated read actions:**
- Risk: Read-only, so impact is low, but they expose full table dumps (all columns) to any caller without session check.
- Files: `src/features/admin/actions/taxonomy.ts` lines 10–12, 41–43
- Current mitigation: Data is not secret, but there is no rate-limiting.
- Recommendations: Acceptable for now; add rate limiting if catalog becomes sensitive.

**`pages.ts` — `getPage` and `getAllPages` are unauthenticated:**
- Risk: Both functions call `ensureContentPagesVisibilityColumn()` (an `ALTER TABLE` DDL operation) on every read, including unauthenticated reads from public pages.
- Files: `src/features/admin/actions/pages.ts` lines 19–32, 34–41
- Current mitigation: The DDL is idempotent after the first run.
- Recommendations: See Runtime Schema Patching section below for the deeper fix.

**Export CSV endpoints load entire table without pagination:**
- Risk: `GET /api/admin/export/orders` fetches all orders with no limit. A large dataset could exhaust server memory during CSV serialization.
- Files: `src/app/api/admin/export/orders\route.ts`
- Current mitigation: Auth guard present (`session.user.role !== 'admin'`).
- Recommendations: Stream the response or add a date-range filter parameter.

**No CSRF protection beyond same-origin:**
- Risk: Server actions rely on Next.js same-origin enforcement. There is no additional CSRF token layer.
- Current mitigation: Next.js 15+ enforces same-origin by default for server actions.
- Recommendations: Acceptable for current scale; document the dependency on Next.js built-in protection.

**Webhook cancellation does not check order ownership:**
- Risk: `src/app/api/webhooks/stripe/route.ts` on `checkout.session.expired` cancels the order without verifying it was still `pending`. A race condition between the webhook and an admin status change could cancel a processing order.
- Files: `src/app/api/webhooks/stripe\route.ts` lines 62–76
- Current mitigation: None — the update has no `.where(eq(orders.status, 'pending'))` guard.
- Recommendations: Add `and(eq(orders.id, orderId), eq(orders.status, 'pending'))` to the where clause.

---

## Known Bugs / Fragile Patterns

**Runtime schema patching via `ensure-*.ts` files:**
- Issue: `src/core/db/ensure-settings-columns.ts` and `src/core/db/ensure-content-pages-visibility.ts` issue live `ALTER TABLE` DDL statements on every cold start and on every read of public pages. The `ensure-settings-columns.ts` file also uses MySQL error codes (`ER_DUP_FIELDNAME`) despite the database being PostgreSQL.
- Files:
  - `src/core/db/ensure-settings-columns.ts`
  - `src/core/db/ensure-content-pages-visibility.ts`
  - `src/core/db/init.ts`
- Impact: Columns that already exist in the Drizzle schema (`is_visible` is defined in `schema.ts` line 160; `featured_segments_title` is defined at line 115) are being patched at runtime anyway — this is dead code that adds latency. The MySQL error code check `ER_DUP_FIELDNAME` will never match on PostgreSQL, meaning any unexpected error during the ALTER will be swallowed silently.
- Fix approach: Run `drizzle-kit push` or generate a proper migration once. Delete all `ensure-*.ts` files and remove `initializeDatabase()` calls. Migrations belong in version-controlled SQL files, not runtime boot code.

**`toggleFestival` — non-atomic two-step update (race condition):**
- Issue: `toggleFestival` in both `festival.ts` and `taxonomy.ts` disables all festivals in one query, then enables the target in a second query. Between those two queries, no festival is active — a concurrent request sees a broken state.
- Files:
  - `src/features/admin/actions/festival.ts` lines 56–62
  - `src/features/admin/actions/taxonomy.ts` lines 84–96
- Impact: Low probability in practice (low concurrent admin traffic), but logically incorrect.
- Fix approach: Use a single `UPDATE festivals SET is_active = (id = $target)` statement, or wrap both updates in a `db.transaction()`.

**`searchProducts` action is unauthenticated:**
- Issue: `searchProducts` in `src/features/admin/actions/product.ts` (line 99) has no `assertAdmin()` call, allowing any client to query the product search index.
- Files: `src/features/admin/actions/product.ts`
- Impact: Low — data is not sensitive — but inconsistent with the rest of the file.

**`users` table exposed fully in customer export/list:**
- Issue: `src/app/admin/customers/page.tsx` calls `db.select().from(users)` (line 54) which returns all columns including hashed passwords.
- Files: `src/app/admin/customers/page.tsx`
- Impact: Passwords are hashed (bcrypt), but they are transmitted over the wire and rendered into the page RSC payload unnecessarily.
- Fix approach: Use `db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt }).from(users)`.

---

## Dependencies at Risk

**`next-auth` v5 beta:**
- Risk: `"next-auth": "^5.0.0-beta.30"` is a pre-release package. API surface changes between beta releases without semver guarantees. The `^` range will auto-upgrade to future betas which may introduce breaking changes silently on `npm install`.
- Impact: Authentication is the security foundation of the entire app. A breaking beta update could lock users out or expose the admin panel.
- Migration plan: Pin to an exact version (`"5.0.0-beta.30"`) until v5 stable is released. Monitor the next-auth GitHub for stable release.

**`mysql2` is installed but the database is PostgreSQL:**
- Risk: `"mysql2": "^3.22.0"` appears in `package.json` dependencies but the app uses `drizzle-orm/postgres-js` with a `postgres` client. The `ensure-settings-columns.ts` file also checks for MySQL error codes (`ER_DUP_FIELDNAME`) suggesting a prior MySQL deployment.
- Impact: Dead dependency adds ~4 MB to the bundle/node_modules. MySQL error code checks in `init.ts` line 49 will never trigger correctly on PostgreSQL.
- Migration plan: Remove `mysql2` from `package.json`. Remove MySQL error code branches from `src/core/db/init.ts`.

**`jsonwebtoken` alongside `next-auth`:**
- Risk: Both `jsonwebtoken` (^9.0.3) and `next-auth` are present. `jsonwebtoken` is a manual JWT utility that is not wired to the auth system — its presence suggests a legacy custom auth path that may still be reachable.
- Files: `package.json`
- Migration plan: Audit all imports of `jsonwebtoken`. Remove if unused; if used, document why it bypasses `next-auth`.

**`next` version 16.2.3 (non-LTS, rapid release):**
- Risk: Next.js 16 is a recent major. The `eslint-config-next` is pinned to the same version. Rapid minor updates may change App Router behavior.
- Recommendation: Keep `eslint-config-next` version locked to the same version as `next`.

---

## Performance Bottlenecks

**`itemCounts` query in orders page fetches ALL order items, not just the current page:**
- Issue: In `src/app/admin/orders/page.tsx` lines 81–84, `db.select({ orderId, count }).from(orderItems).groupBy(orderId)` fetches item counts for every order in the entire database, then filters in JavaScript using a `countMap`. Only the current page's 20 orders need their counts.
- Files: `src/app/admin/orders/page.tsx`
- Impact: As orders grow, this query returns thousands of rows that are mostly discarded.
- Fix approach: Add `.where(inArray(orderItems.orderId, allOrders.map(o => o.id)))` to scope the count query to the current page.

**No database indexes on foreign keys or frequently filtered columns:**
- Issue: The schema in `src/core/db/schema.ts` defines no explicit indexes. The following columns are used in `WHERE`, `JOIN`, and `ORDER BY` clauses on every page load but have no index:
  - `orders.user_id` (JOIN with users)
  - `orders.status` (filter by status)
  - `orders.created_at` (ORDER BY)
  - `order_items.order_id` (JOIN and GROUP BY)
  - `users.created_at` (ORDER BY)
  - `users.role` (filter by role)
  - `products.category` (filter)
- Files: `src/core/db/schema.ts`
- Impact: Full table scans on every admin page load. Acceptable at current scale, critical above ~10 000 rows.
- Fix approach: Add `.index()` calls in the Drizzle schema definitions and run `drizzle-kit push`.

**N+1 pattern in webhook stock reduction:**
- Issue: `src/app/api/webhooks/stripe/route.ts` lines 41–49 first selects all order items (`db.select().from(orderItems)`), then loops over them executing one `UPDATE products` query per item.
- Files: `src/app/api/webhooks/stripe\route.ts`
- Impact: An order with 10 items executes 11 queries (1 select + 10 updates). Under concurrent webhook delivery this compounds.
- Fix approach: Use a single bulk update with a CASE expression, or use `db.transaction()` with batched writes.

---

## Test Coverage Gaps

**No test suite exists:**
- What's not tested: 100% of application logic — server actions, API routes, auth flow, webhook handling, database queries.
- Files: Entire `src/` directory. No `*.test.ts`, `*.spec.ts`, or test runner config found.
- Risk: Any refactor to auth, order flow, or payment webhook can silently break production with no safety net. The stripe webhook in particular handles real financial transactions.
- Priority: High
- Recommendation: Start with integration tests on the three highest-risk paths:
  1. `src/app/api/webhooks/stripe/route.ts` — payment fulfillment
  2. `src/features/admin/actions/product.ts` — stock mutations
  3. `src/core/auth/auth.config.ts` — route authorization logic

---

## Scaling Limits

**Settings stored as a singleton row (ID = 1):**
- Current capacity: Single store configuration only.
- Limit: No multi-tenancy possible. The `saveSettings` action always upserts `id = 1`.
- Files: `src/features/admin/actions/settings.ts`, `src/core/db/schema.ts`
- Scaling path: Not a concern for current single-store use; document as a hard architectural constraint if multi-tenancy is ever planned.

**Serverless cold-start DDL on every deploy:**
- Current issue: `src/core/db/init.ts` runs `ALTER TABLE` statements on first request after deploy. On Vercel, multiple function instances cold-start concurrently, meaning multiple simultaneous `ALTER TABLE` attempts occur at once. PostgreSQL serializes DDL with locks but this adds latency to first-request throughput.
- Scaling path: Replace with proper migration files run as a pre-deploy step (`drizzle-kit migrate`).

---

*Concerns audit: 2026-05-22*
