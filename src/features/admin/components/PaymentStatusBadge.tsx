'use client';

import { cn } from '@/core/utils';

const CONFIG: Record<string, { label: string; style: string }> = {
  pending:          { label: 'Unpaid',    style: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled:        { label: 'Cancelled', style: 'bg-red-50 text-red-700 border-red-200' },
  processing:       { label: 'Paid',      style: 'bg-green-50 text-green-700 border-green-200' },
  shipped:          { label: 'Paid',      style: 'bg-green-50 text-green-700 border-green-200' },
  out_for_delivery: { label: 'Paid',      style: 'bg-green-50 text-green-700 border-green-200' },
  delivered:        { label: 'Paid',      style: 'bg-green-50 text-green-700 border-green-200' },
  completed:        { label: 'Paid',      style: 'bg-green-50 text-green-700 border-green-200' },
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status] ?? { label: status, style: 'bg-neutral-50 text-neutral-600 border-neutral-200' };
  return (
    <span className={cn(
      'inline-block rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] border',
      cfg.style
    )}>
      {cfg.label}
    </span>
  );
}
