'use client';

import { OptimizedImage } from '@/components/ui/optimized-image';
import Link from 'next/link';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '@/features/cart/store';
import { useWishlist } from '@/features/wishlist/useWishlist';
import { toast } from 'react-hot-toast';
import { calculateBestPrice, formatPrice } from '@/features/shop/services/pricing';

interface ProductCardProps {
  product: any;
  festivalDiscount?: number;
  showNewBadge?: boolean;
  showSaleBadge?: boolean;
  showSizeBadge?: boolean;
}

export function ProductCard({
  product,
  festivalDiscount = 0,
  showNewBadge = true,
  showSaleBadge = true,
  showSizeBadge = true,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggle(product.id);
    wishlisted ? toast('Removed from wishlist') : toast.success('Saved to wishlist');
  };

  const pricing = calculateBestPrice(
    Number(product.price),
    Number(product.salePercentage || 0),
    festivalDiscount
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: pricing.finalPrice,
      image: product.image,
      category: product.category,
      quantity: 1,
    });
    toast.success('Added to bag');
  };

  const hasDiscount = pricing.discountPercentage > 0;
  const sizesList = product.sizes ? product.sizes.split(',').filter(Boolean) : [];

  return (
    <div className="group relative flex flex-col">

      {/* ── Image ───────────────────────────────────── */}
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100 block"
      >
        <OptimizedImage
          src={product.image || 'https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {pricing.isFestivalSale && (
            <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider rounded">
              Festival
            </span>
          )}
          {showNewBadge && product.isNewArrival && !pricing.isFestivalSale && (
            <span className="px-2 py-0.5 bg-neutral-900 text-white text-[9px] font-bold uppercase tracking-wider rounded">
              New
            </span>
          )}
          {showSaleBadge && hasDiscount && !pricing.isFestivalSale && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider rounded">
              -{pricing.discountPercentage}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110 shadow-sm ${
            wishlisted
              ? 'opacity-100 translate-y-0'
              : 'opacity-100 sm:opacity-0 translate-y-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0'
          }`}
          onClick={handleWishlist}
        >
          <Heart
            className="w-3.5 h-3.5 transition-colors"
            fill={wishlisted ? '#ef4444' : 'none'}
            stroke={wishlisted ? '#ef4444' : 'currentColor'}
            strokeWidth={1.5}
          />
        </button>

        {/* Quick-add bar — always visible on mobile, hover-only on desktop */}
        <div className="absolute inset-x-3 bottom-3 z-10 translate-y-0 opacity-100 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-neutral-900/95 hover:bg-black text-white text-[11px] font-semibold uppercase tracking-[0.1em] rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Bag
          </button>
        </div>
      </Link>

      {/* ── Info ─────────────────────────────────────── */}
      <div className="mt-2.5 sm:mt-3.5 space-y-0.5 sm:space-y-1">
        <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
          {product.category}
        </p>

        <Link href={`/products/${product.id}`} className="block">
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug hover:opacity-50 transition-opacity line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {showSizeBadge && sizesList.length > 0 && (
          <p className="hidden sm:block text-[10px] text-neutral-400 font-medium">
            {sizesList.length === 1
              ? sizesList[0]
              : `${sizesList.length} sizes available`}
          </p>
        )}

        <div className="flex items-baseline gap-1.5 pt-0.5">
          <span className="text-xs sm:text-[13px] font-bold text-neutral-900">
            {formatPrice(pricing.finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] sm:text-xs text-neutral-400 line-through">
              {formatPrice(pricing.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
