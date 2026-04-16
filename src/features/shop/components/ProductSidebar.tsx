'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Filter, Trash2, ChevronDown } from 'lucide-react';
import { cn } from '@/core/utils';

interface ProductSidebarProps {
  categories: string[];
  availableSizes?: string[];
}

export function ProductSidebar({ categories, availableSizes = [] }: ProductSidebarProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || 'all';
  const minPrice        = searchParams.get('minPrice') || '';
  const maxPrice        = searchParams.get('maxPrice') || '';
  const currentSize     = searchParams.get('size') || '';
  const isSale          = searchParams.get('sale') === 'true';
  const inStock         = searchParams.get('stock') === 'true';
  const sort            = searchParams.get('sort') || 'newest';

  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice });

  const hasActiveFilters =
    currentCategory !== 'all' || minPrice || maxPrice || currentSize || isSale || inStock || sort !== 'newest';

  const buildQuery = useCallback(
    (params: Record<string, string | null>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([k, v]) => {
        if (v === null || v === '' || (k === 'category' && v === 'all')) p.delete(k);
        else p.set(k, v);
      });
      return p.toString();
    },
    [searchParams]
  );

  const go = (params: Record<string, string | null>) =>
    router.push(`/products?${buildQuery(params)}`);

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8 lg:sticky lg:top-24 h-fit">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-neutral-900">
          <Filter className="w-4 h-4" strokeWidth={1.5} />
          <h2 className="text-sm font-bold">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => { router.push('/products'); setPriceRange({ min: '', max: '' }); }}
            className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Sort */}
      <FilterSection title="Sort By">
        <div className="relative">
          <select
            value={sort}
            onChange={e => go({ sort: e.target.value })}
            className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 focus:outline-none focus:border-neutral-400 cursor-pointer pr-8 transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Category">
        <div className="space-y-0.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => go({ category: cat })}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize',
                currentCategory === cat
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              {cat === 'all' ? 'All Products' : cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(sz => (
              <button
                key={sz}
                onClick={() => go({ size: currentSize === sz ? null : sz })}
                className={cn(
                  'min-w-[40px] h-9 px-2 rounded-lg text-xs font-semibold uppercase border transition-all',
                  currentSize === sz
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
                )}
              >
                {sz.toUpperCase() === 'ONE SIZE' ? 'OS' : sz}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">$</span>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                className="w-full pl-6 pr-2 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 focus:outline-none focus:border-neutral-400 transition-colors"
              />
            </div>
            <span className="text-neutral-300 text-sm">–</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">$</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                className="w-full pl-6 pr-2 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 focus:outline-none focus:border-neutral-400 transition-colors"
              />
            </div>
          </div>
          <button
            onClick={() => go({ minPrice: priceRange.min, maxPrice: priceRange.max })}
            className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => go({ stock: inStock ? null : 'true' })}
              className={cn(
                'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
                inStock ? 'bg-neutral-900 border-neutral-900' : 'border-neutral-300 group-hover:border-neutral-600'
              )}
            >
              {inStock && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors">
              In Stock Only
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => go({ sale: isSale ? null : 'true' })}
              className={cn(
                'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
                isSale ? 'bg-neutral-900 border-neutral-900' : 'border-neutral-300 group-hover:border-neutral-600'
              )}
            >
              {isSale && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors">
              On Sale
            </span>
            {isSale && (
              <span className="ml-auto px-1.5 py-0.5 bg-red-50 text-red-500 text-[9px] font-bold uppercase tracking-wider rounded">
                Active
              </span>
            )}
          </label>
        </div>
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 flex-shrink-0">{title}</h3>
        <div className="h-px flex-1 bg-neutral-100" />
      </div>
      {children}
    </div>
  );
}
