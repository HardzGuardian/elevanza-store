import { calculateBestPrice, formatPrice } from '@/features/shop/services/pricing';
import { notFound } from 'next/navigation';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { ShieldCheck, Truck, RefreshCcw, ArrowLeft } from 'lucide-react';
import { ProductSelection } from '@/features/shop/components/ProductSelection';
import { getPublicProductById, getStorefrontShell } from '@/features/shop/services/data';
import { RealtimeStockBadge } from '@/features/shop/components/RealtimeStockBadge';
import { Container } from '@/components/layout/Container';
import Link from 'next/link';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

const VALUE_PROPS = [
  { icon: Truck,       label: 'Free Express Shipping',   sub: 'On orders over $500' },
  { icon: RefreshCcw,  label: '30-Day Easy Returns',     sub: 'No questions asked' },
  { icon: ShieldCheck, label: '2-Year Warranty',         sub: 'Luxury guarantee' },
];

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) notFound();

  const [product, { activeFestival }] = await Promise.all([
    getPublicProductById(productId),
    getStorefrontShell(),
  ]);

  if (!product) notFound();

  const festivalDiscount = activeFestival?.salePercentage || 0;
  const pricing = calculateBestPrice(
    Number(product.price),
    Number(product.salePercentage || 0),
    festivalDiscount
  );

  return (
    <div className="bg-white min-h-screen">
      <Container className="py-10 md:py-14">

        {/* Back link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 hover:text-neutral-900 transition-colors mb-10 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20">

          {/* ── Gallery ─────────────────────────────── */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100">
              <OptimizedImage
                src={product.image || ''}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />

              {/* Badges */}
              <div className="absolute top-5 left-5 flex flex-col gap-2">
                {pricing.isFestivalSale && (
                  <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
                    ✦ {activeFestival?.name} Offer
                  </span>
                )}
                {product.isNewArrival && !pricing.isFestivalSale && (
                  <span className="px-3 py-1 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
                    New Arrival
                  </span>
                )}
                {pricing.discountPercentage > 0 && !pricing.isFestivalSale && (
                  <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
                    -{pricing.discountPercentage}% Off
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Info ────────────────────────────────── */}
          <div className="flex flex-col gap-7">

            {/* Meta */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  {product.category}
                </span>
                <RealtimeStockBadge productId={product.id} initialStock={product.stock} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight tracking-tight text-balance">
                {product.name}
              </h1>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-neutral-900">
                {formatPrice(pricing.finalPrice)}
              </span>
              {pricing.discountPercentage > 0 && (
                <span className="text-lg text-neutral-400 line-through font-normal">
                  {formatPrice(pricing.originalPrice)}
                </span>
              )}
              {pricing.discountPercentage > 0 && (
                <span className="px-2 py-0.5 bg-red-50 text-red-500 text-xs font-bold rounded">
                  Save {pricing.discountPercentage}%
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-[15px] text-neutral-600 leading-relaxed font-normal">
                {product.description}
              </p>
            )}

            {/* Selection (size + add to cart) */}
            <ProductSelection product={{
              id:       product.id,
              name:     product.name,
              price:    pricing.finalPrice,
              image:    product.image,
              category: product.category,
              sizes:    product.sizes,
            }} />

            {/* Value props */}
            <div className="pt-6 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {VALUE_PROPS.map(vp => (
                <div key={vp.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <vp.icon className="w-4 h-4 text-neutral-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900 leading-tight">{vp.label}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{vp.sub}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </Container>
    </div>
  );
}
