'use client';

import { useCart } from '@/features/cart/store';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Loader2, Gift } from 'lucide-react';
import { createCheckoutSession } from '@/features/checkout/actions/checkout';
import { toast } from 'react-hot-toast';
import { calculateBestPrice, formatPrice } from '@/features/shop/services/pricing';
import { Container } from '@/components/layout/Container';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, clearCart } = useCart();
  const [loading, setLoading]           = useState(false);
  const [festivalDiscount, setFestivalDiscount] = useState(0);
  const [festivalName, setFestivalName] = useState('');

  useEffect(() => {
    fetch('/api/active-festival')
      .then(r => r.json())
      .then(d => { setFestivalDiscount(d.discount || 0); setFestivalName(d.name || ''); })
      .catch(() => {});
  }, []);

  const subtotal = items.reduce((sum, item) => {
    const { finalPrice } = calculateBestPrice(item.price, 0, festivalDiscount);
    return sum + finalPrice * item.quantity;
  }, 0);
  const shipping = subtotal > 500 ? 0 : 25;
  const tax      = subtotal * 0.08;
  const total    = subtotal + shipping + tax;

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const result = await createCheckoutSession(items);
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error('Failed to start checkout');
      }
    } catch {
      toast.error('Failed to initiate checkout. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Empty state ─────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-7 h-7 text-neutral-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your bag is empty</h2>
        <p className="text-sm text-neutral-500 max-w-xs leading-relaxed mb-8">
          Looks like you haven't added anything yet. Explore our collections to find something you love.
        </p>
        <Link href="/products">
          <span className="inline-flex items-center gap-2 px-7 py-3.5 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    );
  }

  /* ── Cart ────────────────────────────────────────── */
  return (
    <div className="bg-white min-h-[calc(100vh-68px)]">
      <Container className="py-12 md:py-16">

        {/* Header */}
        <div className="flex items-baseline justify-between mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            Shopping Bag
            <span className="ml-2 text-lg font-normal text-neutral-400">({totalItems()})</span>
          </h1>
          <button
            onClick={() => clearCart()}
            className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* ── Items ──────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">
            {items.map(item => {
              const { finalPrice, discountPercentage } = calculateBestPrice(item.price, 0, festivalDiscount);
              return (
                <div key={`${item.id}-${item.size}`} className="flex gap-5 pb-6 border-b border-neutral-100 last:border-none">

                  {/* Thumbnail */}
                  <Link href={`/products/${item.id}`} className="relative w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100 block">
                    <OptimizedImage
                      src={item.image || ''}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex flex-col flex-1 min-w-0 py-1 gap-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                          {item.category}
                        </p>
                        <Link href={`/products/${item.id}`}>
                          <p className="text-sm font-semibold text-neutral-900 truncate hover:opacity-60 transition-opacity">
                            {item.name}
                          </p>
                        </Link>
                        {item.size && (
                          <span className="inline-flex px-2 py-0.5 bg-neutral-100 rounded text-[10px] font-semibold text-neutral-600 mt-0.5">
                            Size: {item.size}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors flex-shrink-0 -mr-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-1">
                      {/* Qty */}
                      <div className="flex items-center gap-1 border border-neutral-200 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-neutral-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        {discountPercentage > 0 && (
                          <p className="text-[11px] text-neutral-400 line-through mb-0.5">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        )}
                        <p className="text-sm font-bold text-neutral-900">
                          {formatPrice(finalPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Summary ────────────────────────────── */}
          <div className="lg:col-span-5">
            <div className="bg-neutral-50 rounded-2xl p-7 sticky top-24 space-y-5">
              <h2 className="text-lg font-bold text-neutral-900">Order Summary</h2>

              {festivalDiscount > 0 && (
                <div className="flex items-center gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-100">
                  <Gift className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs font-semibold text-amber-800">
                    {festivalName} — {festivalDiscount}% extra savings applied
                  </p>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-neutral-900">
                    {shipping === 0
                      ? <span className="text-green-600 font-semibold">Free</span>
                      : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Tax (Est.)</span>
                  <span className="font-semibold text-neutral-900">{formatPrice(tax)}</span>
                </div>
                {subtotal < 500 && shipping > 0 && (
                  <p className="text-[11px] text-neutral-500">
                    Add {formatPrice(500 - subtotal)} more for free shipping
                  </p>
                )}
                <div className="pt-4 border-t border-neutral-200 flex justify-between text-base font-bold text-neutral-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full h-12 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><span>Proceed to Checkout</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-[11px] text-center text-neutral-500 font-medium">
                Secure payments powered by Stripe
              </p>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}
