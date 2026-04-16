'use client';

import { useTableSubscription } from '@/core/realtime/SupabaseRealtimeProvider';
import { toast } from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserRealtimeListener({ userId }: { userId: string | number }) {
  const router = useRouter();

  useTableSubscription('orders', 'UPDATE', (payload) => {
    const updatedOrder = payload.new;
    
    // Only notify if it's the current user's order and the status has changed
    if (Number(updatedOrder.user_id) === Number(userId)) {
      toast.success(`Order #${updatedOrder.id} status updated to ${updatedOrder.status}!`, {
        icon: <Bell className="w-5 h-5 text-indigo-600" />,
        duration: 5000,
      });
      
      router.refresh();
    }
  });

  return null;
}
