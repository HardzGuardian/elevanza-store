'use client';

import { useState } from 'react';
import { retryCheckout } from '@/features/checkout/actions/checkout';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function RetryPaymentButton({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const result = await retryCheckout(orderId);
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || 'Unable to restart payment');
        setLoading(false);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRetry}
      disabled={loading}
      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-700 text-white text-[11px] font-semibold hover:bg-amber-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
    >
      {loading
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : <RefreshCw className="w-3 h-3" />}
      {loading ? 'Redirecting…' : 'Retry Payment'}
    </button>
  );
}
