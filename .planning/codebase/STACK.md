# Technology Stack

**Analysis Date:** 2026-05-22

## Languages

**Primary:**
- TypeScript 5.x - All application code (`src/**/*.ts`, `src/**/*.tsx`)

**Secondary:**
- CSS (Tailwind v4 CSS-first config via `src/app/globals.css`)
- JavaScript - Utility scripts (`truncate-categories.js`, `manual-sync.js`)

## Runtime

**Environment:**
- Node.js 20.x (inferred from `@types/node: ^20`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.2.3 - Full-stack React framework, App Router, Server Actions
- React 19.2.4 - UI rendering

**Auth:**
- NextAuth v5 (beta.30) - Session management and route protection
  - Config: `src/core/auth/auth.config.ts`, `src/core/auth/auth.ts`
  - Middleware: `middleware.ts` (protects `/admin/*` and `/account/*`)

**ORM:**
- Drizzle ORM 0.45.2 - Database query builder and schema management
  - Config: `drizzle.config.ts`
  - Schema: `src/core/db/schema.ts`
  - Connection: `src/core/db/connection.ts`
  - Migrations output: `./drizzle/`

**Styling:**
- Tailwind CSS v4 - CSS-first configuration via `@import "tailwindcss"` in `src/app/globals.css`
  - Design tokens defined via `@theme {}` block
  - No separate `tailwind.config.*` file (v4 CSS-based config)
- shadcn/ui 4.2.0 - Component library (`src/components/ui/`)
- class-variance-authority 0.7.1 - Component variant management (`src/components/ui/button-variants.ts`)
- tailwind-merge 3.5.0 - Class conflict resolution (`src/core/utils.ts`)
- clsx 2.1.1 - Conditional class composition
- tw-animate-css 1.4.0 - Animation utilities
- framer-motion 12.38.0 - Advanced UI animations

**Forms:**
- react-hook-form 7.72.1 - Form state management
- @hookform/resolvers 5.2.2 - Zod schema integration
- zod 4.3.6 - Runtime validation schemas

**State Management:**
- Zustand 5.0.12 with `persist` middleware
  - Cart: `src/features/cart/store.ts`
  - Wishlist: `src/features/wishlist/store.ts`

**Testing:**
- Not detected

**Build/Dev:**
- drizzle-kit 0.31.10 - Schema push and studio (`db:push`, `db:studio`)
- ESLint 9 with `eslint-config-next` - Linting (`eslint.config.mjs`)
- PostCSS with `@tailwindcss/postcss` - CSS processing (`postcss.config.mjs`)

## Key Dependencies

**Critical:**
- `stripe` 22.0.1 - Payment processing SDK (server-side)
- `@stripe/stripe-js` 9.1.0 - Stripe client-side JS
- `drizzle-orm` 0.45.2 - Primary data access layer
- `postgres` 3.4.9 - PostgreSQL driver used by Drizzle (`src/core/db/connection.ts`)
- `next-auth` 5.0.0-beta.30 - Authentication (credentials provider with bcrypt)
- `bcryptjs` 3.0.3 - Password hashing

**Infrastructure:**
- `cloudinary` 2.9.0 - Image upload SDK (`src/core/services/upload.ts`)
- `next-cloudinary` 6.17.5 - Next.js Cloudinary image component
- `@supabase/supabase-js` 2.103.2 - Supabase Realtime client (`src/core/supabase/client.ts`)
- `nodemailer` 7.0.13 - Email transport via Brevo SMTP (`src/core/email/mailer.ts`)
- `jsonwebtoken` 9.0.3 - Password reset token signing (`src/app/api/auth/forgot-password/route.ts`)
- `axios` 1.15.0 - HTTP client (present; specific usage in proxy or client calls)
- `mysql2` 3.22.0 - Present in dependencies but PostgreSQL is used in production; likely legacy/unused
- `@auth/drizzle-adapter` 1.11.2 - Drizzle adapter for NextAuth (installed but custom credential auth is used instead)
- `@base-ui/react` 1.4.0 - Headless UI primitives
- `react-hot-toast` 2.6.0 - Toast notifications

## Configuration

**Environment:**
- Loaded from `.env.local` (confirmed present, never read)
- Required variables (inferred from source):
  - `DATABASE_URL` - Supabase PostgreSQL connection string
  - `NEXTAUTH_SECRET` - JWT signing secret for NextAuth + password reset tokens
  - `NEXT_PUBLIC_APP_URL` - Public base URL for redirect/email links
  - `STRIPE_SECRET_KEY` - Stripe server-side API key
  - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature verification
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
  - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud identifier
  - `CLOUDINARY_API_KEY` - Cloudinary API key
  - `CLOUDINARY_API_SECRET` - Cloudinary API secret
  - `BREVO_SMTP_USER` - Brevo SMTP username
  - `BREVO_SMTP_KEY` - Brevo SMTP password
  - `BREVO_FROM_NAME` - Sender display name (defaults to "Elevanza Store")
  - `BREVO_FROM_EMAIL` - Sender email address (defaults to "noreply@elevanza.com")
  - `CRON_SECRET` - Bearer token for Vercel cron job authorization

**Build:**
- `next.config.ts` - Remote image patterns for `images.unsplash.com` and `www.beyours.in`
- `drizzle.config.ts` - PostgreSQL dialect, schema path, migrations output
- `postcss.config.mjs` - Tailwind PostCSS plugin

## Platform Requirements

**Development:**
- Node.js 20+
- npm
- `npm run db:push` to sync schema to Supabase PostgreSQL

**Production:**
- Vercel (confirmed by `vercel.json` with cron config)
- Cron: `* * * * *` (every minute) → `GET /api/cron/cancel-pending-orders`
- Runtime: Node.js (cron route explicitly sets `export const runtime = 'nodejs'`)

---

*Stack analysis: 2026-05-22*
