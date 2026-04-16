'use client';

import { useState } from 'react';
import { useTableSubscription } from '@/core/realtime/SupabaseRealtimeProvider';

interface RealtimeStockBadgeProps {
  productId: number;
  initialStock: number;
}

export function RealtimeStockBadge({ productId, initialStock }: RealtimeStockBadgeProps) {
  const [stock, setStock] = useState(initialStock);

  useTableSubscription('products', 'UPDATE', (payload) => {
    const updatedProduct = payload.new;
    if (updatedProduct.id === productId) {
      setStock(updatedProduct.stock);
    }
  });

  return (
    <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start pt-6 border-t border-gray-50">
      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${stock > 0 ? 'bg-green-500' : 'bg-red-500'} transition-colors duration-500`}></span>
      {stock > 0 ? `In Stock (${stock} items remaining)` : 'Out of Stock'}
    </p>
  );
}
