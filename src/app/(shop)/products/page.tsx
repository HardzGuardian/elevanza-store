import { ProductCard } from '@/features/shop/components/ProductCard';
import { ProductSidebar } from '@/features/shop/components/ProductSidebar';
import Link from 'next/link';
import { getAvailableProductSizes, getPublicProducts, getStorefrontShell } from '@/features/shop/services/data';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sale?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    stock?: string;
    size?: string;
    sort?: string;
  }>;
}

const categoryLabel = (cat: string | undefined) => {
  if (!cat || cat === 'all') return 'All Products';
  if (cat === 'sale')        return 'Sale';
  if (cat === 'new_arrival') return 'New Arrivals';
  return cat.replace(/_/g, ' ');
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params   = await searchParams;
  const category = params.category;
  const isSale   = params.sale === 'true';
  const inStock  = params.stock === 'true';
  const searchQuery = params.q;
  const minPrice    = params.minPrice ? parseFloat(params.minPrice) : null;
  const maxPrice    = params.maxPrice ? parseFloat(params.maxPrice) : null;
  const size        = params.size;
  const sort        = params.sort || 'newest';

  const [{ activeFestival, categories, storeSettings }, allProducts, uniqueSizes] = await Promise.all([
    getStorefrontShell(),
    getPublicProducts({ category, isSale, inStock, searchQuery, minPrice, maxPrice, size, sort }),
    getAvailableProductSizes(),
  ]);

  const festivalDiscount  = activeFestival?.salePercentage || 0;
  const filterCategories  = ['all', ...categories.map(c => c.slug), 'new_arrival', 'sale'];
  const heading           = searchQuery ? `"${searchQuery}"` : categoryLabel(category);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

          {/* Sidebar */}
          <ProductSidebar categories={filterCategories} availableSizes={uniqueSizes} />

          {/* Product area */}
          <main className="flex-1 min-w-0 space-y-8">

            {/* Page header */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                {searchQuery ? 'Search results for' : 'Luxury Collections'}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight capitalize">
                {heading}
              </h1>
              <p className="text-sm text-neutral-500 font-normal">
                {allProducts.length} {allProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>

            {/* Grid */}
            {allProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                {allProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    festivalDiscount={festivalDiscount}
                    showNewBadge={storeSettings?.showNewBadge}
                    showSaleBadge={storeSettings?.showSaleBadge}
                    showSizeBadge={storeSettings?.showSizeBadge}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-5">
                  <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">No products found</h3>
                <p className="text-sm text-neutral-500 max-w-xs leading-relaxed mb-7">
                  Try adjusting your filters or searching for something else.
                </p>
                <Link
                  href="/products"
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Clear Filters
                </Link>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
