'use server';

import { db } from '@/core/db';
import { wishlists } from '@/core/db/schema';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/core/auth/auth';

export async function fetchWishlistIds(): Promise<number[]> {
  const session = await auth();
  if (!session?.user) return [];
  const userId = parseInt(session.user.id, 10);
  const rows = await db.select({ productId: wishlists.productId })
    .from(wishlists)
    .where(eq(wishlists.userId, userId));
  return rows.map(r => r.productId);
}

export async function toggleWishlistItem(productId: number): Promise<{ wishlisted: boolean }> {
  const session = await auth();
  if (!session?.user) return { wishlisted: false };
  const userId = parseInt(session.user.id, 10);

  const [existing] = await db.select().from(wishlists)
    .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)))
    .limit(1);

  if (existing) {
    await db.delete(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
    return { wishlisted: false };
  } else {
    await db.insert(wishlists).values({ userId, productId });
    return { wishlisted: true };
  }
}

// Bulk-insert IDs that don't already exist (used for merging guest wishlist on sign-in)
export async function syncWishlistIds(productIds: number[]): Promise<void> {
  const session = await auth();
  if (!session?.user || productIds.length === 0) return;
  const userId = parseInt(session.user.id, 10);

  const existing = await fetchWishlistIds();
  const toInsert = productIds.filter(id => !existing.includes(id));
  if (toInsert.length === 0) return;

  await db.insert(wishlists).values(toInsert.map(productId => ({ userId, productId })));
}
