import { db } from '@/core/db';
import { orders, users } from '@/core/db/schema';
import { eq, desc } from 'drizzle-orm';
import { OrderStatusSelect } from '@/features/admin/components/OrderStatusSelect';

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
              <tr className="border-b border-neutral-100">
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Order</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Customer</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Date</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Amount</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Status</th>
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
