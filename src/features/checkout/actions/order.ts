'use server';

import { db } from "@/core/db";
import { orders, orderItems, products } from '@/core/db/schema';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: number, status: string) {
  try {
    const [order] = await db.select({ userId: orders.userId }).from(orders).where(eq(orders.id, orderId)).limit(1);
    
    await db.update(orders)
      .set({ status: status as any })
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

