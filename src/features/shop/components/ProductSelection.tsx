'use client';

import { useState } from 'react';
import { useCart } from '@/features/cart/store';
import { ShoppingBag, Heart, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/core/utils';

interface ProductSelectionProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string | null;
    category: string;
    sizes?: string | null;
  };
}

export function ProductSelection({ product }: ProductSelectionProps) {
  const [selectedSize, setSelectedSize] = useState('');
  const { addItem } = useCart();

  const sizes = product.sizes ? product.sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
  const hasSizes = sizes.length > 0;

  const handleAdd = () => {
    if (hasSizes && !selectedSize) {
      toast.error('Please select a size first');
      return;
    }
    addItem({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      image:    product.image,
      category: product.category,
      size:     selectedSize || undefined,
      quantity: 1,
    });
    toast.success(`Added to bag${selectedSize ? ` — Size ${selectedSize}` : ''}`);
  };

  return (
    <div className="space-y-6">

      {/* Size selection */}
      {hasSizes && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Select Size</h3>
            <button className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 underline underline-offset-2 transition-colors">
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'min-w-[48px] h-11 px-3 rounded-lg border text-sm font-semibold transition-all duration-150',
                  selectedSize === size
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
                )}
              >
                {size}
              </button>
            ))}
          </div>
          {hasSizes && !selectedSize && (
            <p className="text-[11px] text-neutral-400">Please select a size to add to bag</p>
          )}
        </div>
      )}

      {/* Add to bag */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="flex-1 h-12 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Bag
        </button>
        <button
          className="w-12 h-12 border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Save to wishlist"
        >
          <Heart className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button
          className="w-12 h-12 border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors"
          aria-label="Share product"
        >
          <Share2 className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
