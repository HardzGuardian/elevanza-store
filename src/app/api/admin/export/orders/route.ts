import { auth } from '@/core/auth/auth';
import { db } from '@/core/db';
import { orders, orderItems, users } from '@/core/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { escapeCell } from '@/lib/csv';
import { formatMoney } from '@/lib/money';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [allOrders, itemCounts] = await Promise.all([
    db
      .select({
        id:          orders.id,
        totalAmount: orders.totalAmount,
        status:      orders.status,
        createdAt:   orders.createdAt,
        userName:    users.name,
        userEmail:   users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt)),
    db
      .select({ orderId: orderItems.orderId, count: count() })
      .from(orderItems)
      .groupBy(orderItems.orderId),
  ]);

  const countMap = itemCounts.reduce<Record<number, number>>((acc, r) => {
    acc[r.orderId] = r.count;
    return acc;
  }, {});

  const header  = ['Order ID', 'Customer Name', 'Customer Email', 'Items', 'Amount ($)', 'Status', 'Date'];
  const rows    = allOrders.map(o => [
    `#${o.id.toString().padStart(5, '0')}`,
    o.userName ?? '',
    o.userEmail ?? '',
    countMap[o.id] ?? 0,
    formatMoney(o.totalAmount),
    o.status ?? '',
    o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '',
  ]);

  const csv = [header, ...rows]
    .map(row => row.map(escapeCell).join(','))
    .join('\n');

  const date = new Date().toISOString().split('T')[0];
  return new Response(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="orders-${date}.csv"`,
    },
  });
}
