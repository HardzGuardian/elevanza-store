'use client';

import { useCart } from '@/features/cart/store';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string | null;
    category: string;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({ ...product, quantity: 1 });
    toast.success('Added to bag');
  };

  return (
    <button
      onClick={handleAdd}
      className="flex-1 h-12 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
    >
      <ShoppingBag className="w-4 h-4" />
      Add to Bag
    </button>
  );
}
