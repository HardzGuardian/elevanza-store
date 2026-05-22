import { db } from '@/core/db';
import { orders, orderItems, users, products } from '@/core/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ArrowLeft, Package, User, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { OrderStatusSelect } from '@/features/admin/components/OrderStatusSelect';
import { PaymentStatusBadge } from '@/features/admin/components/PaymentStatusBadge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { formatMoney } from '@/lib/money';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) notFound();

  const [orderResult, lineItems] = await Promise.all([
    db
      .select({
        id:           orders.id,
        totalAmount:  orders.totalAmount,
        status:       orders.status,
        createdAt:    orders.createdAt,
        userName:     users.name,
        userEmail:    users.email,
        userAddress:  users.address,
        userPhone:    users.phone,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, orderId))
      .limit(1),
    db
      .select({
        id:              orderItems.id,
        quantity:        orderItems.quantity,
        price:           orderItems.price,
        productName:     products.name,
        productImage:    products.image,
        productCategory: products.category,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId)),
  ]);

  const order = orderResult[0];
  if (!order) notFound();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Order #{order.id.toString().padStart(5, '0')}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })
                : '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PaymentStatusBadge status={order.status || 'pending'} />
          <OrderStatusSelect orderId={order.id} currentStatus={order.status || 'pending'} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Line items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 flex items-center gap-2">
                <Package className="w-3.5 h-3.5" />
                {lineItems.length} Item{lineItems.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="divide-y divide-neutral-50">
              {lineItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                    {item.productImage ? (
                      <OptimizedImage
                        src={item.productImage}
                        alt={item.productName || ''}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">
                      {item.productName || 'Deleted product'}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5 capitalize">
                      {item.productCategory || '—'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-neutral-900">
                      ${formatMoney(parseFloat(String(item.price)) * item.quantity)}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {item.quantity} × ${formatMoney(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-neutral-100 bg-neutral-50/60 flex justify-between items-center">
              <p className="text-sm font-semibold text-neutral-600">Order Total</p>
              <p className="text-lg font-bold text-neutral-900">
                ${formatMoney(order.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Customer */}
          <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Customer
              </p>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="font-semibold text-neutral-900">{order.userName || '—'}</p>
                <p className="text-sm text-neutral-400 mt-0.5">{order.userEmail}</p>
              </div>
              {order.userPhone && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400 mb-0.5">Phone</p>
                  <p className="text-sm text-neutral-700">{order.userPhone}</p>
                </div>
              )}
              {order.userAddress && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400 mb-0.5">Address</p>
                  <p className="text-sm text-neutral-700 whitespace-pre-line">{order.userAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment summary */}
          <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" />
                Payment
              </p>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Status</span>
                <PaymentStatusBadge status={order.status || 'pending'} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Total</span>
                <span className="font-bold text-neutral-900">
                  ${formatMoney(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
