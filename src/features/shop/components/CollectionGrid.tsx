import { OptimizedImage } from '@/components/ui/optimized-image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { HomeCollection } from '@/features/shop/services/home-utils';

interface CollectionGridProps {
  collections: HomeCollection[];
  title?: string;
  description?: string;
}

export function CollectionGrid({
  collections,
  title = 'Shop by Collection',
  description = 'Handpicked styles for every occasion',
}: CollectionGridProps) {
  if (collections.length === 0) return null;

  return (
    <Section className="bg-white">
      <Container>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 md:mb-14 gap-4">
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400 mb-3">
              Collections
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-neutral-900 tracking-tight leading-tight">
              {title}
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 hover:text-neutral-900 transition-colors duration-200 group flex-shrink-0"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid */}
        <CollectionLayout collections={collections} />

        {description && (
          <p className="text-center text-[12px] text-neutral-400 font-medium mt-8 tracking-wide">{description}</p>
        )}
      </Container>
    </Section>
  );
}

/* ── Layout engine ──────────────────────────────────────────── */
function CollectionLayout({ collections }: { collections: HomeCollection[] }) {
  const count = collections.length;

  if (count === 1) {
    return (
      <div className="aspect-[16/7] md:aspect-[21/9]">
        <CollectionCard item={collections[0]} index={0} className="w-full h-full" />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {collections.map((item, i) => (
          <div key={item.id} className="aspect-[4/5]">
            <CollectionCard item={item} index={i} className="w-full h-full" />
          </div>
        ))}
      </div>
    );
  }

  // 3+ items: first card is tall, rest fill a column
  const [first, ...rest] = collections;
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
      {/* Featured tall card */}
      <div className="md:col-span-7">
        <div className="aspect-[4/5] md:aspect-auto md:h-full" style={{ minHeight: '420px' }}>
          <CollectionCard item={first} index={0} className="w-full h-full" featured />
        </div>
      </div>

      {/* Stack of smaller cards */}
      <div className="md:col-span-5 grid grid-rows-2 gap-4 md:gap-5">
        {rest.slice(0, 2).map((item, i) => (
          <div key={item.id}>
            <CollectionCard item={item} index={i + 1} className="w-full h-full" style={{ minHeight: '190px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Single card ────────────────────────────────────────────── */
function CollectionCard({
  item,
  index,
  featured = false,
  className = '',
  style,
}: {
  item: HomeCollection;
  index: number;
  featured?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Link
      href={item.href}
      className={`group relative overflow-hidden rounded-2xl bg-neutral-100 block ${className}`}
      style={style}
    >
      <OptimizedImage
        src={
          item.image ||
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
        }
        alt={item.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 50vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-90" />

      {/* Content */}
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45 mb-1">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className={`font-bold text-white leading-tight ${featured ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
              {item.name}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex-shrink-0">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}
