'use client';

import { useState } from 'react';
import { updateOrderStatus } from '@/features/checkout/actions/order';
import { toast } from 'react-hot-toast';
import { cn } from '@/core/utils';

const STATUS_STYLES: Record<string, string> = {
  pending:          'bg-amber-50 text-amber-700 border-amber-200',
  processing:       'bg-blue-50 text-blue-700 border-blue-200',
  shipped:          'bg-neutral-100 text-neutral-700 border-neutral-200',
  out_for_delivery: 'bg-sky-50 text-sky-700 border-sky-200',
  delivered:        'bg-green-50 text-green-700 border-green-200',
  completed:        'bg-green-50 text-green-700 border-green-200',
  cancelled:        'bg-red-50 text-red-700 border-red-200',
};

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const [status, setStatus]   = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (next: string) => {
    setLoading(true);
    const result = await updateOrderStatus(orderId, next);
    if (result.success) {
      setStatus(next);
      toast.success('Status updated');
    } else {
      toast.error('Failed to update status');
    }
    setLoading(false);
  };

  return (
    <select
      value={status}
      disabled={loading}
      onChange={e => handleChange(e.target.value)}
      className={cn(
        'rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] border outline-none cursor-pointer transition-colors disabled:opacity-50',
        STATUS_STYLES[status] || 'bg-neutral-50 text-neutral-600 border-neutral-200'
      )}
    >
      <option value="pending">Pending</option>
      <option value="processing">Processing</option>
      <option value="shipped">Shipped</option>
      <option value="out_for_delivery">Out for Delivery</option>
      <option value="delivered">Delivered</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}
