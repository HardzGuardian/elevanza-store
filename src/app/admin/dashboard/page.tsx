import { db } from '@/core/db';
import { products, orders, users } from '@/core/db/schema';
import { count, sum, sql, eq } from 'drizzle-orm';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';
import { AdminRealtimeListener } from '@/features/admin/components/AdminRealtimeListener';
import { DbErrorView } from '@/features/admin/components/DbErrorView';

export default async function AdminDashboard() {
  let productCount, userCount, orderCount, totalRevenue;

  try {
    [productCount, userCount, orderCount, totalRevenue] = await Promise.all([
      db.select({ value: count() }).from(products),
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(orders).where(sql`${orders.status} != 'pending'`),
      db.select({ value: sum(orders.totalAmount) }).from(orders).where(sql`${orders.status} NOT IN ('pending', 'cancelled')`),
    ]);
  } catch (error) {
    return <DbErrorView error={error} />;
  }

  const stats = [
    {
      label:  'Total Revenue',
      value:  `$${parseFloat(totalRevenue[0].value || '0').toFixed(2)}`,
      icon:   DollarSign,
      change: '+12.5%',
      sub:    'from completed orders',
    },
    {
      label:  'Total Orders',
      value:  orderCount[0].value.toString(),
      icon:   ShoppingBag,
      change: '+3',
      sub:    'new orders today',
    },
    {
      label:  'Products',
      value:  productCount[0].value.toString(),
      icon:   Package,
      change: null,
      sub:    'across all categories',
    },
    {
      label:  'Customers',
      value:  userCount[0].value.toString(),
      icon:   Users,
      change: '+2',
      sub:    'registrations today',
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <AdminRealtimeListener />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Welcome back — here's an overview of your store.</p>
      </div>

      {/* Stats grid */}
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
                {stat.change && (
                  <span className="flex items-center gap-0.5 text-[11px] font-semibold text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </span>
                )}
                <span className="text-[11px] text-neutral-400">{stat.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-neutral-100 h-56 flex items-center justify-center text-sm text-neutral-400 font-medium">
          Sales Analytics — Coming Soon
        </div>
        <div className="bg-white rounded-xl border border-neutral-100 h-56 flex items-center justify-center text-sm text-neutral-400 font-medium">
          Recent Activity Feed — Coming Soon
        </div>
      </div>
    </div>
  );
}
