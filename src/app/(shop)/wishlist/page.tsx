'use client';

import { useWishlistStore } from '@/features/wishlist/store';
import { useWishlist } from '@/features/wishlist/useWishlist';
import { useCart } from '@/features/cart/store';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Container } from '@/components/layout/Container';
import { formatPrice } from '@/features/shop/services/pricing';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string | null;
  category: string;
  salePercentage: string | null;
}

export default function WishlistPage() {
  const { ids } = useWishlistStore();
  const { toggle } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); setLoading(false); return; }
    fetch(`/api/products/by-ids?ids=${ids.join(',')}`)
      .then(r => r.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [ids]);

  const handleRemove = async (product: Product) => {
    await toggle(product.id);
    toast('Removed from wishlist');
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id:       product.id,
      name:     product.name,
      price:    parseFloat(product.price),
      image:    product.image,
      category: product.category,
      quantity: 1,
    });
    toast.success('Added to bag');
  };

  if (loading) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-neutral-300 text-sm">Loading wishlist…</div>
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="bg-white min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-6">
          <Heart className="w-7 h-7 text-neutral-300" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your wishlist is empty</h2>
        <p className="text-sm text-neutral-500 max-w-xs leading-relaxed mb-8">
          Save items you love by tapping the heart icon on any product.
        </p>
        <Link href="/products">
          <span className="inline-flex items-center gap-2 px-7 py-3.5 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[calc(100vh-68px)]">
      <Container className="py-12 md:py-16">
        <div className="flex items-baseline justify-between mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            Wishlist
            <span className="ml-2 text-lg font-normal text-neutral-400">({ids.length})</span>
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
          {products.map(product => (
            <div key={product.id} className="group flex flex-col">
              {/* Image */}
              <Link href={`/products/${product.id}`} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100 block mb-3.5">
                <OptimizedImage
                  src={product.image || ''}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                {/* Remove button */}
                <button
                  onClick={e => { e.preventDefault(); handleRemove(product); }}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all"
                  aria-label="Remove from wishlist"
                >
                  <Heart className="w-3.5 h-3.5" fill="#ef4444" stroke="#ef4444" strokeWidth={1.5} />
                </button>
              </Link>

              {/* Info */}
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400 mb-0.5">
                {product.category}
              </p>
              <Link href={`/products/${product.id}`}>
                <h3 className="text-sm font-semibold text-neutral-900 hover:opacity-50 transition-opacity line-clamp-1 mb-1">
                  {product.name}
                </h3>
              </Link>
              <p className="text-[13px] font-bold text-neutral-900 mb-3">
                {formatPrice(parseFloat(product.price))}
              </p>

              {/* Add to bag */}
              <button
                onClick={() => handleAddToCart(product)}
                className="mt-auto w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-[11px] font-semibold uppercase tracking-[0.1em] rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add to Bag
              </button>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
