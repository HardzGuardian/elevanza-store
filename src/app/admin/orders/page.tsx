import { db } from '@/core/db';
import { orders, orderItems, users } from '@/core/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { OrderStatusSelect } from '@/features/admin/components/OrderStatusSelect';
import { Package } from 'lucide-react';

export default async function AdminOrdersPage() {
  const allOrders = await db
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
    .orderBy(desc(orders.createdAt));

  // Get item counts per order
  const itemCounts = await db
    .select({ orderId: orderItems.orderId, count: count() })
    .from(orderItems)
    .groupBy(orderItems.orderId);

  const countMap = itemCounts.reduce<Record<number, number>>((acc, r) => {
    acc[r.orderId] = r.count;
    return acc;
  }, {});

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Orders</h1>
        <p className="text-sm text-neutral-500 mt-1">Monitor and manage all customer purchases.</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60">
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Order</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Customer</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Items</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Date</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Amount</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Shipping Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {allOrders.map(order => (
                <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="px-5 py-4 font-semibold text-neutral-900">
                    #{order.id.toString().padStart(5, '0')}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-neutral-900">{order.userName || '—'}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{order.userEmail}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-neutral-500">
                      <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span className="text-xs font-medium">{countMap[order.id] ?? 0} item{(countMap[order.id] ?? 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-neutral-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                      : '—'}
                  </td>
                  <td className="px-5 py-4 font-semibold text-neutral-900">
                    ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <OrderStatusSelect
                      orderId={order.id}
                      currentStatus={order.status || 'pending'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {allOrders.length === 0 && (
          <div className="py-16 text-center text-sm text-neutral-400">No orders yet.</div>
        )}
      </div>
    </div>
  );
}
