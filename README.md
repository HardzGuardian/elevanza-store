# Elevanza Store - Project Summary

**Elevanza Store** is a full-stack fashion e-commerce platform built with Next.js 15, created by Sagar Salunkhe to practice modern web development and real-world production patterns.

## Core Features
The project delivers a complete shopping experience built around a clean neutral aesthetic. Customers can browse a product catalog with category filtering, manage a persistent cart, and complete purchases through a Stripe-powered checkout. Orders are tracked from placement through fulfillment, with stock automatically reduced on payment confirmation via webhooks.

## Technical Architecture
The application is structured around Next.js 15 App Router with a clear separation of concerns:
- **Server Actions** handle all mutations — checkout, product management, settings, CMS pages — keeping API logic colocated with features
- **Drizzle ORM** over PostgreSQL (Supabase) for type-safe database queries with schema-driven migrations
- **NextAuth.js** for session management with role-based access separating storefront users from admin
- **Cloudinary** for image hosting with an `OptimizedImage` wrapper that handles fallback states and format/quality optimization automatically

## Notable Systems
The admin dashboard provides full store control from a single settings form — banner image, color theme, footer links, featured homepage segments, and visibility toggles for each storefront section. A festival/sale mode applies site-wide discounts with a single toggle, overriding individual product pricing through a unified price calculation service. CMS pages allow custom content to be authored and published independently of the product catalog.

The checkout flow performs server-side price verification before creating a Stripe session, preventing client-side price manipulation. A pending order is created before the user reaches Stripe, then confirmed and fulfilled through a webhook after successful payment.

## Development Philosophy
The codebase uses a consistent neutral design system throughout — no framework color presets, every component using the same `neutral-` palette. Features are organized by domain under `src/features/` rather than by file type, keeping related actions, components, and services colocated. Revalidation is handled through tagged cache invalidation via `revalidateTag` and `revalidatePath` to keep data fresh without full page reloads.

## Future Roadmap
Planned additions include a wishlist system, product reviews, order tracking emails via Resend, and an analytics dashboard for the admin panel.
