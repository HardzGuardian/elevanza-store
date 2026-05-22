# Testing Patterns

**Analysis Date:** 2026-05-22

## Test Framework

**Runner:** None

No test framework is configured in this project. No `jest.config.*`, `vitest.config.*`, or similar config files were found. No `*.test.ts`, `*.spec.ts`, or `__tests__/` directories exist in `src/`.

**Assertion Library:** None

**Run Commands:**
```bash
# No test commands configured
# package.json does not contain a "test" script
```

## Test File Organization

**Location:** Not applicable — no tests exist

**Naming:** No convention established

## Current State

This codebase has **zero test coverage**. There are no:
- Unit tests for server actions (`src/features/admin/actions/`)
- Integration tests for Drizzle queries (`src/core/db/`)
- Component tests for React components (`src/features/admin/components/`)
- E2E tests for user flows (checkout, admin workflows)
- API route tests (`src/app/api/`)

All test files found during analysis belong to `node_modules/` (third-party library test suites), not to project source code.

## Risk Areas Without Test Coverage

**Critical — `assertAdmin()` guard (`src/features/admin/actions/product.ts`, `src/features/admin/actions/settings.ts`):**
- Admin authorization guard is untested
- Inconsistency: `src/features/admin/actions/festival.ts` lacks `assertAdmin()` call entirely
- Risk: Auth bypass goes undetected

**Critical — Drizzle mutations (`src/features/admin/actions/*.ts`, `src/features/checkout/actions/order.ts`):**
- `createProduct`, `updateProduct`, `deleteProduct`, `bulkDeleteProducts` — no regression safety
- `saveSettings` upsert logic (update → fallback insert) — untested edge case
- `toggleFestival` deactivation side-effect (sets all others inactive) — untested

**High — Server action return shape:**
- All actions return `{ success: boolean, error?: string }` — no contract enforced
- Callers in client components depend on this shape; drift would be silent

**High — Cache invalidation (`revalidatePath` / `revalidateTag`):**
- Cache busting calls are untested — wrong paths would serve stale data silently

**Medium — Filter normalization (`src/features/shop/services/data.ts` → `normalizeProductFilters`):**
- URL parameter sanitization logic has no unit tests

**Medium — Cron endpoint auto-cancel:**
- `auto-cancel pending orders after 5 minutes` (Vercel cron) — no test for timing or status logic

## Recommended Testing Setup

If tests are introduced, the following stack matches the Next.js + TypeScript project:

**Unit/Integration:**
- Vitest (preferred over Jest for ESM/TypeScript projects without extra config)
- Config: `vitest.config.ts` at project root

**Component:**
- Vitest + `@testing-library/react`

**E2E:**
- Playwright (official Next.js recommendation)

**Suggested test file placement:**
- Co-locate with source: `src/features/admin/actions/product.test.ts`
- Or centralized: `src/__tests__/`

**Mock patterns to establish (when tests are added):**

```typescript
// Mock Drizzle db for unit tests
vi.mock('@/core/db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
  },
}));

// Mock auth for assertAdmin
vi.mock('@/core/auth/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { role: 'admin' } }),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
```

**First tests to write (priority order):**

1. `assertAdmin()` — verify throws for non-admin, passes for admin
2. `createProduct` / `updateProduct` / `deleteProduct` — happy path + error path
3. `normalizeProductFilters` — pure function, easiest to test
4. `saveSettings` upsert logic — update-existing and insert-new branches
5. `toggleFestival` — verify deactivation of other festivals

## Coverage

**Requirements:** None enforced

**Current coverage:** 0%

**Recommended minimum targets (if adopted):**
- Server actions: 80%+ (highest business risk)
- Core utilities / filter normalization: 100% (pure functions)
- Components: 60%+ (focus on interaction handlers)

---

*Testing analysis: 2026-05-22*
