# Elevanza Store

A modern e-commerce platform for fashion retail built with Next.js 15, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework** — Next.js 15 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4
- **Database** — PostgreSQL (Supabase)
- **ORM** — Drizzle ORM
- **Auth** — NextAuth.js
- **Payments** — Stripe
- **Image Hosting** — Cloudinary
- **Deployment** — Vercel

## Features

- Full storefront with product catalog, filters, and search
- Shopping cart with persistent state
- Stripe checkout with webhook-based order fulfillment
- Admin dashboard — products, orders, customers, CMS pages
- Store settings — banner, design, layout, footer configuration
- Festival/sale mode with site-wide discount
- Cloudinary image uploads
- Real-time order notifications

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.  
Admin panel is at [http://localhost:3000/admin](http://localhost:3000/admin).

## Environment Variables

Create a `.env.local` file in the root with the following:

```env
DATABASE_URL=

NEXTAUTH_SECRET=
AUTH_SECRET=

NEXT_PUBLIC_APP_URL=http://localhost:3000

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Database

This project uses Drizzle ORM with PostgreSQL.

```bash
# Push schema to database
npm run db:push
```

## License

MIT © [Sagar Salunkhe](https://github.com/HardzGuardian)
