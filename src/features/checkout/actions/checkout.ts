'use server';

import Stripe from 'stripe';
import { auth } from '@/core/auth/auth';
import { db } from '@/core/db';
import { orders, orderItems, products, festivals } from '@/core/db/schema';
import { revalidatePath, revalidateTag } from 'next/cache';
import { eq, inArray } from 'drizzle-orm';
import { calculateBestPrice } from '@/features/shop/services/pricing';
import { STOREFRONT_TAGS } from '@/features/shop/services/data';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27' as any,
});

/**
 * Checkout Action: Live Stripe Mode
 * Handles server-side price verification, inventory reservation (temporary),
 * and Stripe session creation.
 */
export async function createCheckoutSession(cartItems: any[]) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  const userId = Number.parseInt(session.user.id, 10);
  if (Number.isNaN(userId)) {
    throw new Error('Invalid session user');
  }

  // 1. Fetch live product data to prevent price manipulation
  const productIds = cartItems.map(item => item.id);
  const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));
  
  // 2. Fetch Active Festival for discounts
  const [activeFestival] = await db.select().from(festivals).where(eq(festivals.isActive, true)).limit(1);
  const festivalDiscount = activeFestival?.salePercentage || 0;

  // 3. Recalculate everything server-side
  const verifiedItems = cartItems.map(cartItem => {
    const dbProduct = dbProducts.find(p => p.id === cartItem.id);
    if (!dbProduct) throw new Error(`Product not found: ${cartItem.id}`);
    
    const pricing = calculateBestPrice(
      Number(dbProduct.price),
      Number(dbProduct.salePercentage || 0),
      festivalDiscount
    );

    return {
      ...cartItem,
      verifiedPrice: pricing.finalPrice,
      name: dbProduct.name,
      image: dbProduct.image,
    };
  });

  const totalAmount = verifiedItems.reduce((sum, item) => sum + (item.verifiedPrice * item.quantity), 0);

  // 4. Create a PENDING order in the database
  // This allows us to track the intent and reconcile it in the webhook.
  const [newOrder] = await db.insert(orders).values({
    userId,
    totalAmount: totalAmount.toFixed(2),
    status: 'pending',
  }).returning({ id: orders.id });

  const orderId = newOrder.id;

  // Insert line items
  for (const item of verifiedItems) {
    await db.insert(orderItems).values({
      orderId,
      productId: item.id,
      quantity: item.quantity,
      price: item.verifiedPrice.toString(),
    });
  }

  // 5. Create Stripe Checkout Session
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const line_items = verifiedItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.verifiedPrice * 100),
      },
      quantity: item.quantity,
    }));

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      // Send the user to the success page with the orderId for immediate verification
      success_url: `${appUrl}/checkout/success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
      metadata: {
        userId: String(userId),
        orderId: String(orderId),
      },
    });

    console.log(`Stripe session created for Order #${orderId}`);

    return { url: stripeSession.url };
  } catch (error) {
    console.error('Stripe error:', error);
    // Cleanup the pending order if session creation fails
    await db.delete(orders).where(eq(orders.id, orderId));
    throw new Error('Failed to create checkout session');
  }
}
