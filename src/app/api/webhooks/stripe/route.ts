import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/core/db';
import { orders, orderItems, products } from '@/core/db/schema';
import { eq, sql } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body      = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // ── Payment successful ────────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const orderId = Number.parseInt(session.metadata?.orderId as string, 10);

    if (!orderId) {
      return new NextResponse('Order ID missing in metadata', { status: 400 });
    }

    console.log(`Payment confirmed for Order #${orderId}`);

    try {
      await db.update(orders)
        .set({ status: 'processing' })
        .where(eq(orders.id, orderId));

      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

      for (const item of items) {
        await db.execute(sql`
          UPDATE products
          SET stock = stock - ${item.quantity}
          WHERE id = ${item.productId} AND stock >= ${item.quantity}
        `);
      }

      console.log(`Order #${orderId} fulfilled and stock reduced.`);
    } catch (error) {
      console.error(`Fulfillment failed for Order #${orderId}:`, error);
      return new NextResponse('Internal fulfillment error', { status: 500 });
    }
  }

  // ── Payment failed / session expired ─────────────────────────────────────
  if (
    event.type === 'checkout.session.expired' ||
    event.type === 'payment_intent.payment_failed'
  ) {
    const orderId = Number.parseInt(session.metadata?.orderId as string, 10);

    if (orderId) {
      console.log(`Payment failed/expired for Order #${orderId} — marking cancelled.`);
      try {
        // Only cancel if still pending (don't overwrite a completed order)
        await db.update(orders)
          .set({ status: 'cancelled' })
          .where(eq(orders.id, orderId));
      } catch (error) {
        console.error(`Failed to cancel Order #${orderId}:`, error);
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
