'use client';

import { useTableSubscription } from '@/core/realtime/SupabaseRealtimeProvider';
import { toast } from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdminRealtimeListener() {
  const router = useRouter();

  useTableSubscription('orders', 'INSERT', (payload) => {
    const newOrder = payload.new;
    
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-sm w-full bg-white shadow-xl rounded-xl pointer-events-auto flex border border-neutral-100 p-4 gap-3`}
      >
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-lg bg-neutral-900 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900">
            New Order Received
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">
            Order #{newOrder.id} — ${parseFloat(newOrder.total_amount).toFixed(2)}
          </p>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              router.refresh();
            }}
            className="mt-2 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 underline underline-offset-2"
          >
            Refresh Dashboard
          </button>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    ), { duration: 10000 });
    
    router.refresh();
  });

  return null;
}
