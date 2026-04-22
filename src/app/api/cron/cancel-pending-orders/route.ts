import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/db';
import { orders } from '@/core/db/schema';
import { and, eq, lt, sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Cancel pending orders older than 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const result = await db
    .update(orders)
    .set({ status: 'cancelled' })
    .where(
      and(
        eq(orders.status, 'pending'),
        lt(orders.createdAt, fiveMinutesAgo)
      )
    )
    .returning({ id: orders.id });

  return NextResponse.json({ cancelled: result.map(r => r.id) });
}
