import { auth } from "@/core/auth/auth";
import { db } from "@/core/db";
import { orders, orderItems, products, users } from "@/core/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Package, Calendar, User, ShoppingBag, CheckCircle2, Circle, XCircle, Clock, Truck, MapPin, Home } from "lucide-react";
import { AccountSettingsForm } from "@/features/account/components/AccountSettingsForm";
import { UserRealtimeListener } from "@/features/account/components/UserRealtimeListener";
import { Container } from "@/components/layout/Container";

// The shipping pipeline order
const PIPELINE = [
  { key: 'completed',        label: 'Payment Confirmed', icon: CheckCircle2 },
  { key: 'processing',       label: 'Processing',        icon: Package       },
  { key: 'shipped',          label: 'Shipped',           icon: Truck         },
  { key: 'out_for_delivery', label: 'Out for Delivery',  icon: MapPin        },
  { key: 'delivered',        label: 'Delivered',         icon: Home          },
] as const;

const PIPELINE_ORDER = PIPELINE.map(s => s.key);

function getStepIndex(status: string | null): number {
  return PIPELINE_ORDER.indexOf(status as any);
}

type OrderStatus = 'pending' | 'completed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? 'pending';
  const map: Record<string, { label: string; cls: string }> = {
    pending:          { label: 'Awaiting Payment',  cls: 'bg-amber-50 text-amber-700 border-amber-100'   },
    completed:        { label: 'Payment Confirmed', cls: 'bg-green-50 text-green-700 border-green-100'   },
    processing:       { label: 'Processing',        cls: 'bg-blue-50 text-blue-700 border-blue-100'     },
    shipped:          { label: 'Shipped',            cls: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
    out_for_delivery: { label: 'Out for Delivery',  cls: 'bg-sky-50 text-sky-700 border-sky-100'        },
    delivered:        { label: 'Delivered',          cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    cancelled:        { label: 'Cancelled',          cls: 'bg-red-50 text-red-600 border-red-100'        },
  };
  const { label, cls } = map[s] || { label: s, cls: 'bg-neutral-50 text-neutral-500 border-neutral-100' };
  return (
    <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] rounded-lg border flex-shrink-0 ${cls}`}>
      {label}
    </span>
  );
}

function OrderTracker({ status }: { status: string | null }) {
  if (!status || status === 'pending' || status === 'cancelled') return null;

  const currentIdx  = getStepIndex(status);
  const totalSteps  = PIPELINE.length - 1;
  const progressPct = Math.round((currentIdx / totalSteps) * 100);

  return (
    <div className="px-5 pt-4 pb-5 border-t border-neutral-100 bg-white">
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
          Order Tracking
        </p>
        <p className="text-[10px] font-semibold text-neutral-500">
          Step {currentIdx + 1} of {PIPELINE.length}
        </p>
      </div>

      {/* Progress bar track */}
      <div className="relative">
        {/* Background track */}
        <div className="h-1.5 w-full rounded-full bg-neutral-100" />
        {/* Filled bar */}
        <div
          className="absolute top-0 left-0 h-1.5 rounded-full bg-neutral-900 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />

        {/* Step dots on the bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between -mt-[5px]">
          {PIPELINE.map((step, idx) => {
            const done    = idx <= currentIdx;
            const current = idx === currentIdx;
            const Icon    = step.icon;
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  done
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-white border-neutral-200 text-neutral-300'
                } ${current ? 'ring-2 ring-offset-1 ring-neutral-400 scale-110' : ''}`}>
                  <Icon className="w-2.5 h-2.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step labels */}
      <div className="flex justify-between mt-5">
        {PIPELINE.map((step, idx) => {
          const done    = idx <= currentIdx;
          const current = idx === currentIdx;
          return (
            <div key={step.key} className={`flex-1 text-center ${idx === 0 ? 'text-left' : idx === PIPELINE.length - 1 ? 'text-right' : ''}`}>
              <p className={`text-[9px] font-semibold uppercase tracking-[0.06em] leading-tight transition-colors ${
                current ? 'text-neutral-900' : done ? 'text-neutral-500' : 'text-neutral-300'
              }`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CancelledBanner() {
  return (
    <div className="px-5 py-3 border-t border-red-50 bg-red-50 flex items-center gap-2.5">
      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={1.5} />
      <p className="text-xs font-medium text-red-600">This order was cancelled.</p>
    </div>
  );
}

function PendingBanner() {
  return (
    <div className="px-5 py-3 border-t border-amber-50 bg-amber-50 flex items-center gap-2.5">
      <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" strokeWidth={1.5} />
      <p className="text-xs font-medium text-amber-700">Payment not yet confirmed. Complete your checkout to continue.</p>
    </div>
  );
}

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

  const orderIds = userOrders.map(o => o.id);
  const allItems = orderIds.length > 0
    ? await db
        .select({
          orderId:     orderItems.orderId,
          productName: products.name,
          quantity:    orderItems.quantity,
          price:       orderItems.price,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(inArray(orderItems.orderId, orderIds))
    : [];

  const itemsByOrder = allItems.reduce<Record<number, typeof allItems>>((acc, item) => {
    if (!acc[item.orderId]) acc[item.orderId] = [];
    acc[item.orderId].push(item);
    return acc;
  }, {});

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
              <div className="space-y-4">
                {userOrders.map(order => {
                  const items = itemsByOrder[order.id] ?? [];
                  const status = order.status ?? 'pending';

                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-neutral-100 rounded-xl hover:border-neutral-200 hover:shadow-sm transition-all overflow-hidden"
                    >
                      {/* Order header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-neutral-50 border-b border-neutral-100">
                        <div className="flex items-center gap-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                            Order #{order.id.toString().padStart(5, '0')}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <Calendar className="w-3 h-3" strokeWidth={1.5} />
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                              : 'N/A'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-base font-bold text-neutral-900">
                            ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                          </p>
                          <StatusBadge status={status} />
                        </div>
                      </div>

                      {/* Items */}
                      {items.length > 0 && (
                        <div className="px-5 py-3 space-y-2">
                          {items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-neutral-700">
                                <span className="w-5 h-5 rounded bg-neutral-100 text-neutral-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                  {item.quantity}×
                                </span>
                                <span className="font-medium">{item.productName}</span>
                              </div>
                              <span className="text-neutral-500 text-xs font-medium">
                                ${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tracking timeline */}
                      {status === 'pending'   && <PendingBanner />}
                      {status === 'cancelled' && <CancelledBanner />}
                      {status !== 'pending' && status !== 'cancelled' && (
                        <OrderTracker status={status} />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-neutral-50 rounded-2xl border border-neutral-100">
                <ShoppingBag className="w-8 h-8 text-neutral-300 mb-3" strokeWidth={1} />
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
