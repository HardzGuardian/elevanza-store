import Link from 'next/link';
import { db } from '@/core/db';
import { orders, orderItems, products } from '@/core/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { CartClearer } from '@/features/checkout/components/CartClearer';

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string; session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params  = await searchParams;
  const orderId = params.orderId ? parseInt(params.orderId) : null;
  if (!orderId) notFound();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) notFound();

  // Stripe redirects here only after a successful payment.
  // Mark as completed if still pending (fallback in case webhook is delayed/misconfigured).
  if (order.status === 'pending' && params.session_id) {
    await db.update(orders).set({ status: 'processing' }).where(eq(orders.id, orderId));
    order.status = 'processing';
  }

  const items = await db
    .select({
      id:          orderItems.id,
      quantity:    orderItems.quantity,
      price:       orderItems.price,
      productName: products.name,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  const orderRef = `#${orderId.toString().padStart(5, '0')}`;

  return (
    <div className="bg-white min-h-screen">
      <CartClearer />
      <Container className="py-16 md:py-24">
        <div className="max-w-lg mx-auto">

          {/* ── Success header ─────────────────────── */}
          <div className="text-center space-y-4 mb-10">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-green-50 items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-7 h-7 text-green-500" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
              Order Confirmed!
            </h1>
            <p className="text-neutral-500 text-[15px] font-normal leading-relaxed">
              Your order <span className="font-semibold text-neutral-900">{orderRef}</span> has been placed successfully.
              You'll receive an email confirmation shortly.
            </p>
          </div>

          {/* ── Order summary card ─────────────────── */}
          <div className="rounded-2xl border border-neutral-200 overflow-hidden mb-8">

            {/* Card header */}
            <div className="flex items-center gap-2.5 px-6 py-4 bg-neutral-50 border-b border-neutral-100">
              <Package className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
              <h2 className="text-sm font-semibold text-neutral-900">Order Summary</h2>
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                {orderRef}
              </span>
            </div>

            {/* Items */}
            <div className="divide-y divide-neutral-100 px-6">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between py-4 gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-neutral-100 text-neutral-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {item.quantity}×
                    </span>
                    <span className="text-sm font-medium text-neutral-700">{item.productName}</span>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 flex-shrink-0">
                    ${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-end justify-between px-6 py-5 bg-neutral-50 border-t border-neutral-100">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-0.5">
                  Total Paid
                </p>
                <p className="text-2xl font-bold text-neutral-900">
                  ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                </p>
              </div>
              <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                Confirmed
              </span>
            </div>
          </div>

          {/* ── Actions ────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/products" className="flex-1">
              <span className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-semibold text-neutral-700 border border-neutral-200 rounded-xl hover:border-neutral-900 hover:text-neutral-900 transition-colors cursor-pointer">
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
              </span>
            </Link>
            <Link href="/account" className="flex-1">
              <span className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-semibold text-white bg-neutral-900 hover:bg-black rounded-xl transition-colors cursor-pointer">
                View My Orders
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

        </div>
      </Container>
    </div>
  );
}
