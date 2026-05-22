import { db } from '@/core/db';
import { products, orders, users } from '@/core/db/schema';
import { count, sum, sql, gte, lt, and, desc, eq } from 'drizzle-orm';
import {
  DollarSign, ShoppingBag, Users, Package,
  TrendingUp, TrendingDown, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { AdminRealtimeListener } from '@/features/admin/components/AdminRealtimeListener';
import { formatMoney } from '@/lib/money';
import { DbErrorView } from '@/features/admin/components/DbErrorView';
import { PaymentStatusBadge } from '@/features/admin/components/PaymentStatusBadge';

export default async function AdminDashboard() {
  const now       = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  // Monday-anchored week boundaries
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  let productCount, userCount, orderCount, totalRevenue,
      ordersToday, customersToday,
      thisWeekRevenue, lastWeekRevenue,
      revenueByDay, recentOrders, lowStockProducts;

  try {
    [
      productCount, userCount, orderCount, totalRevenue,
      ordersToday, customersToday,
      thisWeekRevenue, lastWeekRevenue,
      revenueByDay, recentOrders, lowStockProducts,
    ] = await Promise.all([
      db.select({ value: count() }).from(products),
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(orders).where(sql`${orders.status} != 'pending'`),
      db.select({ value: sum(orders.totalAmount) }).from(orders).where(sql`${orders.status} NOT IN ('pending', 'cancelled')`),
      db.select({ value: count() }).from(orders).where(gte(orders.createdAt, todayStart)),
      db.select({ value: count() }).from(users).where(gte(users.createdAt, todayStart)),
      // This week
      db.select({ value: sum(orders.totalAmount) }).from(orders).where(
        and(sql`${orders.status} NOT IN ('pending', 'cancelled')`, gte(orders.createdAt, weekStart))
      ),
      // Last week
      db.select({ value: sum(orders.totalAmount) }).from(orders).where(
        and(
          sql`${orders.status} NOT IN ('pending', 'cancelled')`,
          gte(orders.createdAt, lastWeekStart),
          lt(orders.createdAt, weekStart),
        )
      ),
      // Revenue by day — last 30 days
      db.select({
        date:    sql<string>`DATE(${orders.createdAt})`,
        revenue: sum(orders.totalAmount),
      })
        .from(orders)
        .where(and(sql`${orders.status} NOT IN ('pending', 'cancelled')`, gte(orders.createdAt, thirtyDaysAgo)))
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`),
      // Recent 5 orders
      db.select({
        id:          orders.id,
        totalAmount: orders.totalAmount,
        status:      orders.status,
        createdAt:   orders.createdAt,
        userName:    users.name,
      })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .orderBy(desc(orders.createdAt))
        .limit(5),
      // Low stock (under 10)
      db.select({ id: products.id, name: products.name, stock: products.stock, category: products.category })
        .from(products)
        .where(lt(products.stock, 10))
        .orderBy(products.stock)
        .limit(8),
    ]);
  } catch (error) {
    return <DbErrorView error={error} />;
  }

  // Build complete 30-day chart array (fill missing days with 0)
  const revenueMap = new Map(revenueByDay.map(r => [r.date, parseFloat(formatMoney(r.revenue))]));
  const chartData  = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    return { date: dateStr, revenue: revenueMap.get(dateStr) ?? 0 };
  });
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  // Week-over-week revenue trend
  const thisWeek = parseFloat(formatMoney(thisWeekRevenue[0].value));
  const lastWeek = parseFloat(formatMoney(lastWeekRevenue[0].value));
  let revenueTrend: { label: string; up: boolean } | null = null;
  if (lastWeek > 0) {
    const pct = ((thisWeek - lastWeek) / lastWeek) * 100;
    revenueTrend = { label: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs last week`, up: pct >= 0 };
  }

  const ordersTodayCount    = ordersToday[0].value;
  const customersTodayCount = customersToday[0].value;

  const stats = [
    {
      label:  'Total Revenue',
      value:  `$${formatMoney(totalRevenue[0].value)}`,
      icon:   DollarSign,
      trend:  revenueTrend,
      sub:    'from completed orders',
    },
    {
      label:  'Total Orders',
      value:  orderCount[0].value.toString(),
      icon:   ShoppingBag,
      trend:  ordersTodayCount > 0 ? { label: `+${ordersTodayCount} today`, up: true } : null,
      sub:    'excluding pending',
    },
    {
      label:  'Products',
      value:  productCount[0].value.toString(),
      icon:   Package,
      trend:  null,
      sub:    'across all categories',
    },
    {
      label:  'Customers',
      value:  userCount[0].value.toString(),
      icon:   Users,
      trend:  customersTodayCount > 0 ? { label: `+${customersTodayCount} today`, up: true } : null,
      sub:    'registered accounts',
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <AdminRealtimeListener />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Welcome back — here's an overview of your store.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-neutral-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">{stat.label}</p>
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-neutral-600" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 tracking-tight">{stat.value}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                {stat.trend && (
                  <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${stat.trend.up ? 'text-green-600' : 'text-red-500'}`}>
                    {stat.trend.up
                      ? <TrendingUp className="w-3 h-3" />
                      : <TrendingDown className="w-3 h-3" />}
                    {stat.trend.label}
                  </span>
                )}
                <span className="text-[11px] text-neutral-400">{stat.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Revenue</p>
              <p className="text-sm text-neutral-500 mt-0.5">Last 30 days</p>
            </div>
            {revenueTrend && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${revenueTrend.up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {revenueTrend.label}
              </span>
            )}
          </div>
          {/* Bar chart */}
          <div className="flex items-end gap-px h-28">
            {chartData.map((day, i) => {
              const pct     = (day.revenue / maxRevenue) * 100;
              const isToday = i === chartData.length - 1;
              return (
                <div
                  key={day.date}
                  title={`${day.date}: $${formatMoney(day.revenue)}`}
                  className="flex-1 flex flex-col justify-end"
                >
                  <div
                    style={{ height: `${Math.max(pct, 1.5)}%` }}
                    className={`w-full rounded-t-[2px] ${isToday ? 'bg-neutral-900' : 'bg-neutral-200 hover:bg-neutral-400'} transition-colors`}
                  />
                </div>
              );
            })}
          </div>
          {/* X-axis labels: first, mid, last */}
          <div className="flex justify-between text-[10px] text-neutral-400 font-medium">
            <span>{chartData[0]?.date.slice(5)}</span>
            <span>{chartData[14]?.date.slice(5)}</span>
            <span>{chartData[29]?.date.slice(5)}</span>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Recent Orders</p>
            <Link href="/admin/orders" className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-900 transition-colors">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-neutral-50">
            {recentOrders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-neutral-400 text-center">No orders yet.</p>
            ) : recentOrders.map(order => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900">#{order.id.toString().padStart(5, '0')}</p>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">{order.userName || 'Guest'}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                  <span className="text-sm font-bold text-neutral-900">
                    ${formatMoney(order.totalAmount)}
                  </span>
                  <PaymentStatusBadge status={order.status || 'pending'} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-100 bg-amber-50/50 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">
              Low Stock — {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} need attention
            </p>
          </div>
          <div className="divide-y divide-neutral-50">
            {lowStockProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{product.name}</p>
                  <p className="text-xs text-neutral-400 capitalize mt-0.5">{product.category}</p>
                </div>
                <span className={`text-sm font-bold ${product.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/40">
            <Link href="/admin/products" className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
              Manage products →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
