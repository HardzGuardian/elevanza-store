'use server';

import { db } from "@/core/db";
import { orders, orderItems, products } from '@/core/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { revalidatePath } from "next/cache";
import { auth } from "@/core/auth/auth";
import { assertAdmin } from "@/core/auth/guards";

const VALID_ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'completed',
  'cancelled',
] as const;

type OrderStatus = typeof VALID_ORDER_STATUSES[number];

// Called when user hits back/cancel on Stripe checkout page
export async function cancelPendingOrder(orderId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const userId = Number(session.user.id);

  try {
    await db.update(orders)
      .set({ status: 'cancelled' })
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.userId, userId),
          eq(orders.status, 'pending'),
        )
      );
    return { success: true };
  } catch (error) {
    console.error('cancelPendingOrder failed:', error);
    return { success: false };
  }
}

export async function updateOrderStatus(orderId: number, status: string) {
  await assertAdmin();

  if (!VALID_ORDER_STATUSES.includes(status as OrderStatus)) {
    return {
      success: false,
      error: `Invalid status. Allowed values: ${VALID_ORDER_STATUSES.join(', ')}`,
    };
  }

  try {
    const [order] = await db.select({ userId: orders.userId }).from(orders).where(eq(orders.id, orderId)).limit(1);

    await db.update(orders)
      .set({ status: status as OrderStatus })
      .where(eq(orders.id, orderId));

    if (order) {
      // Real-time notification is now handled automatically by Supabase listening to the DB change
    }

    revalidatePath("/admin/orders");
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

