import { db } from '@/core/db';
import { orders, orderItems, users } from '@/core/db/schema';
import { eq, desc, asc, count, inArray } from 'drizzle-orm';
import { OrderStatusSelect } from '@/features/admin/components/OrderStatusSelect';
import { PaymentStatusBadge } from '@/features/admin/components/PaymentStatusBadge';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/core/utils';
import { formatMoney } from '@/lib/money';

const PAGE_SIZE = 20;

const ORDER_STATUSES = ['all', 'pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed', 'cancelled'] as const;
const STATUS_LABELS: Record<string, string> = {
  all:              'All',
  pending:          'Pending',
  processing:       'Processing',
  shipped:          'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  completed:        'Completed',
  cancelled:        'Cancelled',
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; dir?: string; status?: string }>;
}) {
  const { page: pageParam, sort = 'date', dir = 'desc', status = 'all' } = await searchParams;
  const pageNum = parseInt(pageParam || '1', 10);
  const page    = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;
  const offset  = (page - 1) * PAGE_SIZE;

  const statusFilter = status !== 'all' ? eq(orders.status, status as any) : undefined;

  const sortCol = sort === 'amount' ? orders.totalAmount : orders.createdAt;
  const sortFn  = dir === 'asc' ? asc : desc;

  function pageUrl(p: number) {
    const q = new URLSearchParams();
    if (sort !== 'date')  q.set('sort', sort);
    if (dir  !== 'desc')  q.set('dir',  dir);
    if (status !== 'all') q.set('status', status);
    if (p > 1)            q.set('page', String(p));
    const s = q.toString();
    return `/admin/orders${s ? `?${s}` : ''}`;
  }

  function sortUrl(field: string) {
    const nextDir = sort === field && dir === 'asc' ? 'desc' : 'asc';
    const q = new URLSearchParams({ sort: field, dir: nextDir });
    if (status !== 'all') q.set('status', status);
    return `/admin/orders?${q.toString()}`;
  }

  function filterUrl(s: string) {
    const q = new URLSearchParams();
    if (s !== 'all')     q.set('status', s);
    if (sort !== 'date') q.set('sort', sort);
    if (dir  !== 'desc') q.set('dir',  dir);
    const str = q.toString();
    return `/admin/orders${str ? `?${str}` : ''}`;
  }

  const [allOrders, [{ total }]] = await Promise.all([
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
      .where(statusFilter)
      .orderBy(sortFn(sortCol))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ total: count() }).from(orders).where(statusFilter),
  ]);

  const orderIdsOnPage = allOrders.map(o => o.id);
  const itemCounts = orderIdsOnPage.length > 0
    ? await db
        .select({ orderId: orderItems.orderId, count: count() })
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIdsOnPage))
        .groupBy(orderItems.orderId)
    : [];

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const countMap = itemCounts.reduce<Record<number, number>>((acc, r) => {
    acc[r.orderId] = r.count;
    return acc;
  }, {});

  function SortIndicator({ field }: { field: string }) {
    if (sort !== field) return <span className="text-neutral-300">↕</span>;
    return <span>{dir === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <div className="p-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Orders</h1>
        <p className="text-sm text-neutral-500 mt-1">Monitor and manage all customer purchases.</p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {ORDER_STATUSES.map(s => (
          <Link
            key={s}
            href={filterUrl(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors whitespace-nowrap',
              status === s
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200'
            )}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <a
          href="/api/admin/export/orders"
          download
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 text-[12px] font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          ↓ Export CSV
        </a>
      </div>

      <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60">
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Order</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Customer</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Items</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  <Link href={sortUrl('date')} className="flex items-center gap-1 hover:text-neutral-700 transition-colors">
                    Date <SortIndicator field="date" />
                  </Link>
                </th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  <Link href={sortUrl('amount')} className="flex items-center gap-1 hover:text-neutral-700 transition-colors">
                    Amount <SortIndicator field="amount" />
                  </Link>
                </th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Payment</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Order Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {allOrders.map(row => (
                <tr key={row.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="px-5 py-4 font-semibold text-neutral-900">
                    #{row.id.toString().padStart(5, '0')}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-neutral-900">{row.userName || '—'}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{row.userEmail}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-neutral-500">
                      <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span className="text-xs font-medium">
                        {countMap[row.id] ?? 0} item{(countMap[row.id] ?? 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-neutral-500">
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                      : '—'}
                  </td>
                  <td className="px-5 py-4 font-semibold text-neutral-900">
                    ${formatMoney(row.totalAmount)}
                  </td>
                  <td className="px-5 py-4">
                    <PaymentStatusBadge status={row.status || 'pending'} />
                  </td>
                  <td className="px-5 py-4">
                    <OrderStatusSelect orderId={row.id} currentStatus={row.status || 'pending'} />
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/orders/${row.id}`}
                      className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-900 transition-colors whitespace-nowrap"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {allOrders.length === 0 && (
          <div className="py-16 text-center text-sm text-neutral-400">
            {status !== 'all' ? `No ${STATUS_LABELS[status]?.toLowerCase()} orders.` : 'No orders yet.'}
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              Page {page} of {totalPages} · {total} orders
            </p>
            <div className="flex items-center gap-1">
              <Link
                href={pageUrl(page - 1)}
                aria-disabled={page <= 1}
                className={`p-1.5 rounded-lg border border-neutral-200 transition-colors ${page <= 1 ? 'pointer-events-none opacity-30' : 'hover:bg-neutral-100'}`}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-neutral-600" />
              </Link>
              <Link
                href={pageUrl(page + 1)}
                aria-disabled={page >= totalPages}
                className={`p-1.5 rounded-lg border border-neutral-200 transition-colors ${page >= totalPages ? 'pointer-events-none opacity-30' : 'hover:bg-neutral-100'}`}
              >
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
