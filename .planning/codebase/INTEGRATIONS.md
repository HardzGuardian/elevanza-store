# External Integrations

**Analysis Date:** 2026-05-22

## APIs & External Services

**Payments:**
- Stripe - Checkout sessions, payment confirmation, order lifecycle management
  - SDK/Client: `stripe` 22.0.1 (server), `@stripe/stripe-js` 9.1.0 (client)
  - Auth: `STRIPE_SECRET_KEY` (server), `STRIPE_WEBHOOK_SECRET` (webhook verification)
  - Checkout flow: `src/features/checkout/actions/checkout.ts`
  - Retry payment: `retryCheckout()` in `src/features/checkout/actions/checkout.ts`
  - Webhook handler: `src/app/api/webhooks/stripe/route.ts`
  - Events handled: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`

**Image Hosting:**
- Cloudinary - Product and category image uploads; CDN delivery
  - SDK: `cloudinary` 2.9.0 (server upload), `next-cloudinary` 6.17.5 (client display)
  - Auth: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - Upload service: `src/core/services/upload.ts`
  - Upload folder: `elevanza-ecommerce`
  - Component: `src/components/ui/image-upload.tsx`, `src/components/ui/optimized-image.tsx`

**Email:**
- Brevo (formerly Sendinblue) - Transactional email via SMTP relay
  - SDK: `nodemailer` 7.0.13 (transport)
  - SMTP host: `smtp-relay.brevo.com:587`
  - Auth: `BREVO_SMTP_USER`, `BREVO_SMTP_KEY`
  - Sender config: `BREVO_FROM_NAME`, `BREVO_FROM_EMAIL`
  - Mailer: `src/core/email/mailer.ts`
  - Current emails sent: password reset only (`sendPasswordResetEmail`)

## Data Storage

**Databases:**
- Supabase PostgreSQL - Primary relational data store
  - Connection: `DATABASE_URL` (full connection string with pooler URL)
  - Driver: `postgres` 3.4.9 (via `postgres-js`)
  - ORM: Drizzle ORM 0.45.2
  - Connection file: `src/core/db/connection.ts`
  - Schema file: `src/core/db/schema.ts`
  - Tables: `users`, `categories`, `products`, `orders`, `order_items`, `settings`, `wishlists`, `content_pages`, `festivals`
  - Enums: `role` (admin/customer), `order_status` (7 states), `delivery_status` (3 states)

**Realtime:**
- Supabase Realtime - Live data subscriptions (stock updates, order status)
  - Client: `@supabase/supabase-js` 2.103.2
  - Auth: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Client file: `src/core/supabase/client.ts`
  - Provider: `src/core/realtime/SupabaseRealtimeProvider` (mounted in root layout)
  - Rate limit: 10 events/second configured on client

**File Storage:**
- Cloudinary CDN (see Image Hosting above) — no local filesystem storage for media

**Caching:**
- Next.js built-in cache with `revalidateTag` / `revalidatePath`
  - Cache tags defined in: `src/features/shop/services/data.ts` (`STOREFRONT_TAGS`)
  - Root layout: `export const dynamic = 'force-dynamic'` (disables page-level cache)

## Authentication & Identity

**Auth Provider:**
- NextAuth v5 (custom Credentials provider) — no OAuth providers
  - Implementation: `src/core/auth/auth.ts` + `src/core/auth/auth.config.ts`
  - Session strategy: JWT (role + id embedded in token)
  - Password hashing: bcryptjs 3.0.3
  - Route: `src/app/api/auth/[...nextauth]/route.ts`
  - Middleware protection: `middleware.ts` (guards `/admin/*` → admin role required; `/account/*` → auth required)

**Password Reset:**
- Custom JWT-based flow (not delegated to NextAuth)
  - Token: signed with `NEXTAUTH_SECRET`, expires 1 hour, invalidated on password change (hash-slice mechanism)
  - Forgot password: `src/app/api/auth/forgot-password/route.ts`
  - Reset password: `src/app/api/auth/reset-password/route.ts`
  - Email delivery: Brevo via `src/core/email/mailer.ts`

**Registration:**
- Custom endpoint: `src/app/api/auth/register/route.ts`
- Passwords hashed with bcryptjs before storage

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry, Datadog, or equivalent)

**Logs:**
- `console.log` / `console.error` only — no structured logging library
- Key logging points: Stripe webhook fulfillment, Cloudinary upload success/failure, cron job execution

## CI/CD & Deployment

**Hosting:**
- Vercel — confirmed by `vercel.json`
- Cron jobs configured in `vercel.json`: `* * * * *` → `/api/cron/cancel-pending-orders`

**CI Pipeline:**
- Not detected (no GitHub Actions, CircleCI, etc.)

## Webhooks & Callbacks

**Incoming Webhooks:**
- Stripe → `POST /api/webhooks/stripe`
  - Handler: `src/app/api/webhooks/stripe/route.ts`
  - Verification: `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET`
  - Actions on `checkout.session.completed`: update order status to `processing`, decrement product stock
  - Actions on `checkout.session.expired` / `payment_intent.payment_failed`: update order status to `cancelled`

**Incoming Cron Calls:**
- Vercel Cron → `GET /api/cron/cancel-pending-orders`
  - Handler: `src/app/api/cron/cancel-pending-orders/route.ts`
  - Auth: `Authorization: Bearer <CRON_SECRET>` header check
  - Action: cancels `pending` orders older than 5 minutes

**Outgoing Webhooks:**
- None

## Environment Configuration

**Required env vars:**
```
# Database
DATABASE_URL

# Auth
NEXTAUTH_SECRET

# App
NEXT_PUBLIC_APP_URL

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# Supabase Realtime
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Cloudinary
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# Brevo Email
BREVO_SMTP_USER
BREVO_SMTP_KEY
BREVO_FROM_NAME
BREVO_FROM_EMAIL

# Vercel Cron
CRON_SECRET
```

**Secrets location:**
- `.env.local` (local development, not committed)
- Vercel project environment variables (production)

---

*Integration audit: 2026-05-22*
