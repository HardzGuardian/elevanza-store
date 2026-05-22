import { auth } from '@/core/auth/auth';
import { db } from '@/core/db';
import { users, orders } from '@/core/db/schema';
import { eq, count, desc } from 'drizzle-orm';
import { escapeCell } from '@/lib/csv';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [allCustomers, orderCounts] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db
      .select({ userId: orders.userId, count: count() })
      .from(orders)
      .groupBy(orders.userId),
  ]);

  const countMap = orderCounts.reduce<Record<number, number>>((acc, r) => {
    acc[r.userId] = r.count;
    return acc;
  }, {});

  const header = ['Name', 'Email', 'Role', 'Orders', 'Phone', 'Address', 'Joined'];
  const rows   = allCustomers.map(c => [
    c.name ?? '',
    c.email,
    c.role ?? 'customer',
    countMap[c.id] ?? 0,
    c.phone ?? '',
    c.address ?? '',
    c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
  ]);

  const csv = [header, ...rows]
    .map(row => row.map(escapeCell).join(','))
    .join('\n');

  const date = new Date().toISOString().split('T')[0];
  return new Response(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="customers-${date}.csv"`,
    },
  });
}
