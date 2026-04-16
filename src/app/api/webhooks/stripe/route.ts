import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/core/db';
import { orders, orderItems, products } from '@/core/db/schema';
import { eq, sql } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Stripe Webhook Handler
 * Processes payment confirmation and triggers post-purchase logic.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // 1. Handle Successful Payment
  if (event.type === 'checkout.session.completed') {
    const orderId = Number.parseInt(session.metadata?.orderId as string, 10);
    
    if (!orderId) {
      return new NextResponse('Order ID missing in metadata', { status: 400 });
    }

    console.log(`Payment confirmed for Order #${orderId}`);

    try {
      // 2. Update Order Status to Processing/Completed
      await db.update(orders)
        .set({ status: 'completed' })
        .where(eq(orders.id, orderId));

// ... (existing code)

      // 3. Fetch Items to reduce stock
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

      // 4. Reduce Inventory
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

  return new NextResponse(null, { status: 200 });
}
