import { auth } from "@/core/auth/auth";
import { db } from "@/core/db";
import { orders, users } from "@/core/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Calendar, User } from "lucide-react";
import { AccountSettingsForm } from "@/features/account/components/AccountSettingsForm";
import { UserRealtimeListener } from "@/features/account/components/UserRealtimeListener";
import { Container } from "@/components/layout/Container";

const STATUS_STYLES: Record<string, string> = {
  pending:      'bg-amber-50 text-amber-700 border-amber-100',
  processing:   'bg-blue-50 text-blue-700 border-blue-100',
  shipped:      'bg-neutral-100 text-neutral-700 border-neutral-200',
  out_for_delivery: 'bg-sky-50 text-sky-700 border-sky-100',
  delivered:    'bg-green-50 text-green-700 border-green-100',
  completed:    'bg-green-50 text-green-700 border-green-100',
  cancelled:    'bg-red-50 text-red-700 border-red-100',
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = parseInt(session.user.id || "", 10);
  if (isNaN(userId)) redirect("/login");

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) redirect("/login");

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="bg-white min-h-screen">
      <Container className="py-12 md:py-16">
        <UserRealtimeListener userId={userId} />

        {/* Profile header */}
        <div className="flex items-center gap-5 mb-12 pb-8 border-b border-neutral-100">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{user.name}</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{user.email}</p>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-neutral-100 text-neutral-600 text-[9px] font-semibold uppercase tracking-[0.15em] rounded">
              Member
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">

          {/* Orders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
              <h2 className="text-base font-bold text-neutral-900">Order History</h2>
              <span className="text-sm text-neutral-400">({userOrders.length})</span>
            </div>

            {userOrders.length > 0 ? (
              <div className="space-y-3">
                {userOrders.map(order => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-neutral-100 rounded-xl hover:border-neutral-200 hover:shadow-sm transition-all"
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                        Order #{order.id.toString().padStart(5, '0')}
                      </p>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.5} />
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                          : 'N/A'}
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <p className="text-lg font-bold text-neutral-900">
                        ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                      </p>
                      <span
                        className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] rounded-lg border ${
                          STATUS_STYLES[order.status ?? ''] || 'bg-neutral-50 text-neutral-500 border-neutral-100'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-neutral-50 rounded-2xl border border-neutral-100">
                <Package className="w-8 h-8 text-neutral-300 mb-3" strokeWidth={1} />
                <p className="text-sm font-medium text-neutral-500">No orders yet</p>
                <p className="text-xs text-neutral-400 mt-1">Start shopping to see your orders here.</p>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
              <h2 className="text-base font-bold text-neutral-900">Profile Settings</h2>
            </div>
            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
              <AccountSettingsForm initialData={user} />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
