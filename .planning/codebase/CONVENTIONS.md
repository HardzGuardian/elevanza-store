# Coding Conventions

**Analysis Date:** 2026-05-22

## Naming Patterns

**Files:**
- React components: PascalCase `.tsx` — e.g., `ProductTable.tsx`, `DbErrorView.tsx`, `PaymentStatusBadge.tsx`
- Server actions: camelCase grouped by domain — e.g., `product.ts`, `settings.ts`, `festival.ts`
- Services/utilities: kebab-case or camelCase — e.g., `home-utils.ts`, `pricing.ts`, `data.ts`
- Hooks: camelCase with `use` prefix — e.g., `useWishlist.ts`
- Stores: camelCase `store.ts` — e.g., `src/features/cart/store.ts`

**Components:**
- Named exports only (no default exports for components): `export function ProductTable(...)`, `export function DbErrorView(...)`
- Pages use default exports: `export default async function AdminProductsPage()`
- Props typed inline via `interface`: `interface ProductTableProps { products: any[]; categoriesList: any[]; }`

**Functions:**
- Event handlers: `handleDelete`, `handleChange`, `handleBulkDelete` — `handle` prefix
- Internal utilities: `toggleSort`, `toggleRow`, `toggleAll`, `pageUrl`, `sortUrl`, `filterUrl`
- Server action guards: `assertAdmin()` — private async function, throws on failure
- Data services: `getStorefrontShellCached`, `normalizeProductFilters`, `getQuickProductSearchResults`

**Variables:**
- camelCase throughout
- State variables use aligned multi-declaration with spaces:
  ```typescript
  const [isAddOpen,      setIsAddOpen]       = useState(false);
  const [editingProduct, setEditingProduct]  = useState<any>(null);
  const [sortField,      setSortField]       = useState<...>(null);
  ```
- Constants: SCREAMING_SNAKE_CASE for config objects — `STOREFRONT_TAGS`, `PAGE_SIZE`, `STATUS_LABELS`, `STATUS_STYLES`

**Types/Interfaces:**
- PascalCase, `interface` preferred over `type` for object shapes
- Centralized in `src/core/types/index.ts` for shared business entities
- Local interfaces defined at the top of the file where used

## Code Style

**Formatting:**
- No Prettier config detected — formatting is manual/editor-driven
- Single quotes for strings (`'use client'`, `'use server'`)
- Semicolons used throughout
- 2-space indentation

**Linting:**
- ESLint with `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- Config: `eslint.config.mjs`
- No custom rule overrides beyond Next.js defaults

## TypeScript Usage

**Strict mode:** Enabled (`"strict": true` in `tsconfig.json`)

**`any` usage:** Widespread in action parameters and component props:
- Server actions: `data: any` for all mutation parameters — `createProduct(data: any)`, `saveSettings(data: any)`
- Component props: `products: any[]`, `initialData?: any`, `error?: any`
- Type assertions: `status as any` used to bypass enum checks
- Union types used in business entities — `price: number | string`, `isNewArrival: boolean | number` (reflects Drizzle ORM raw vs parsed values)

**Interfaces in `src/core/types/index.ts`:**
- `Product`, `StoreSettings`, `Category`, `Festival`

**Path alias:** `@/*` maps to `./src/*` — used consistently everywhere (no relative `../../` imports)

## Import Organization

**Order (consistent pattern observed):**
1. `'use server'` or `'use client'` directive (top of file)
2. External packages — `react`, `next/*`, `drizzle-orm`, `lucide-react`
3. Internal path-aliased imports — `@/core/...`, `@/features/...`, `@/components/...`

**No barrel index files** in most feature directories — imports go directly to the file.

**`src/core/db/index.ts`** is a barrel: `export * from './connection'; export * from './schema';`

## Server Action Pattern

Every admin mutation file follows this exact structure:

```typescript
'use server';

import { auth } from "@/core/auth/auth";
import { db } from "@/core/db";
import { tableName } from "@/core/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { STOREFRONT_TAGS } from "@/features/shop/services/data";

// Step 1: Guard — private, throws on failure
async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Admin access required');
  }
}

// Step 2: Exported action
export async function doSomething(data: any) {
  await assertAdmin();  // called first, outside try/catch
  try {
    await db.insert(table).values({ ... }).returning();
    revalidatePath("/admin/...");
    revalidateTag(STOREFRONT_TAGS.something, {});
    return { success: true };
  } catch (error) {
    console.error("Failed to ...", error);
    return { success: false, error: "Human-readable message" };
  }
}
```

**Key rules:**
- `assertAdmin()` is called BEFORE the `try/catch` — auth failures throw and are not caught
- Return shape is always `{ success: boolean }` + optional `error: string` or `product/data`
- `console.error()` logs every catch — no silent failures
- `revalidatePath` + `revalidateTag` both called after successful mutations
- Some actions (e.g., `festival.ts`) omit `assertAdmin` — inconsistency exists (see CONCERNS.md)

## Drizzle Query Patterns

**Single table select:**
```typescript
const allProducts = await db.select().from(products);
```

**Filtered select:**
```typescript
const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
```

**Join with field selection:**
```typescript
db.select({
  id: orders.id,
  userName: users.name,
})
.from(orders)
.leftJoin(users, eq(orders.userId, users.id))
.where(statusFilter)
.orderBy(sortFn(sortCol))
.limit(PAGE_SIZE)
.offset(offset)
```

**Insert with returning:**
```typescript
const [product] = await db.insert(products).values({ ... }).returning();
```

**Update with returning:**
```typescript
const [updated] = await db.update(settings).set({ ... }).where(eq(settings.id, 1)).returning();
```

**Parallel queries with Promise.all:**
```typescript
const [allOrders, [{ total }], itemCounts] = await Promise.all([
  db.select(...).from(orders)...,
  db.select({ total: count() }).from(orders).where(statusFilter),
  db.select({ orderId: orderItems.orderId, count: count() }).from(orderItems).groupBy(orderItems.orderId),
]);
```

**Schema definitions:** All in `src/core/db/schema.ts` — pgTable with snake_case column names, camelCase JS property names.
- Enums declared with `pgEnum` at top of schema file
- Relations declared separately after all table definitions

## Component Patterns

**Client components** (`'use client'`):**
- Interactive tables, forms, selects — anything with useState/event handlers
- Call server actions directly: `const result = await deleteProduct(id);`
- Show toast on result: `toast.success(...)` / `toast.error(...)` via `react-hot-toast`
- Optimistic UI: update local state immediately after successful action, no page refresh
  ```typescript
  if (result.success) {
    toast.success('Product deleted');
    setProducts(prev => prev.filter(p => p.id !== id));
  }
  ```

**Server components** (`async function Page()`):**
- Fetch data directly with Drizzle in the page component
- No data fetching abstraction layer — query runs inline in the page
- Pass data as props to client components
- Error handling: wrap in try/catch, return `<DbErrorView />` on catch

**`DbErrorView` usage pattern:**
```typescript
// In server pages — wrap db call:
try {
  const data = await db.select()...
} catch (error) {
  return <DbErrorView error={error} />;
}
```

**Styling:**
- Tailwind CSS utility classes only — no CSS modules, no styled-components
- `cn()` utility from `@/core/utils` for conditional class merging
- Semantic color scale: `neutral-*` for text/borders/backgrounds, `red-*` for danger, `green-*` for success, `amber-*` for warning
- Font sizes use pixel-level values: `text-[10px]`, `text-[12px]`, `text-[13px]`
- Table header style (consistent): `text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400`

## Form Patterns

**`react-hook-form`** with `FormProvider` for complex multi-tab forms (`SettingsForm.tsx`):
```typescript
const methods = useForm<SettingsValues>();
// No Zod resolver — comment: "handle validation manually to prevent silent blocking"
```

**Simple forms:** Direct `useState` + server action call — no form library.

**Submit flow:**
1. Call server action with form data
2. Await `{ success, error }` response
3. Show `toast.success()` or `toast.error()`
4. Update local state optimistically if success

## Error Handling

**Server actions:** `try/catch` → `console.error()` → return `{ success: false, error: "string" }`

**Pages (DB failures):** Return `<DbErrorView error={error} />` component

**Client toast notifications:** `react-hot-toast` — `toast.success()` / `toast.error()`

**Auth failures:** `assertAdmin()` throws `new Error('Admin access required')` — propagates as unhandled (Next.js returns 500)

**Async catch binding:** Some catches use empty `catch { }` (no binding) for simple fallbacks:
```typescript
} catch {
  return { success: false };
}
```

## Logging

**Framework:** `console.error()` only — no logging library

**Pattern:** `console.error("Failed to [action]:", error)` in every catch block

## Comments

**JSDoc-style block comments** used for important functions:
```typescript
/**
 * Internal: Admin Guard
 * Ensures that only authenticated administrators can modify global store settings.
 */
```

**Inline comments** for non-obvious logic:
```typescript
// Attempt to update the existing singleton record (ID: 1) first
// If activating this one, deactivate all others first
```

**Directive comments** at top of files:
- `'use server'` or `'use client'` — always single-quoted

## Module Design

**Exports:** Named exports for components and utility functions; default exports for Next.js pages only.

**Feature structure:** Each feature under `src/features/{name}/` with sub-directories:
- `actions/` — server actions
- `components/` — React components
- `services/` — data fetching / business logic
- `store.ts` — Zustand stores (cart, wishlist)

---

*Convention analysis: 2026-05-22*
