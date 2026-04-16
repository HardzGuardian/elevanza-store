import { OptimizedImage } from '@/components/ui/optimized-image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { StoreSettings, Festival } from '@/core/types';

interface HeroProps {
  settings: StoreSettings | null;
  festival: Festival | null;
}

export function Hero({ settings, festival }: HeroProps) {
  const title = festival?.name ?? settings?.heroTitle ?? 'New Collection';
  const subtitle =
    festival?.promoMessage ??
    settings?.heroSubtitle ??
    'Discover our curated selection of luxury fashion for the modern lifestyle.';
  const backgroundImage =
    settings?.heroImage ||
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80';

  return (
    <header className="relative flex items-end overflow-hidden" style={{ height: 'min(90vh, 900px)', minHeight: '560px' }}>

      {/* Background */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={backgroundImage}
          alt="Hero Collection"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <Container className="relative z-10 w-full pb-16 md:pb-20 lg:pb-24">
        <div className="max-w-2xl space-y-5 animate-fade-in-up">

          {/* Eye-brow label */}
          {festival ? (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-white">
              {festival.name} — Special Offers
            </span>
          ) : (
            <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">
              Spring / Summer 2026
            </span>
          )}

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-bold text-white leading-[0.92] tracking-tight text-balance">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-[17px] text-white/65 font-normal max-w-md leading-relaxed">
            {subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-neutral-900 text-[13px] font-semibold rounded-lg hover:bg-neutral-100 transition-colors duration-200 group"
            >
              Shop Collection
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/products?category=new_arrival"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 text-white text-[13px] font-semibold border border-white/25 rounded-lg hover:bg-white/20 hover:border-white/50 transition-all duration-200 backdrop-blur-sm"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-3">
        <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/35 rotate-90 origin-center mb-2">
          Scroll
        </span>
        <div className="w-px h-12 bg-white/15 overflow-hidden rounded-full relative">
          <div className="absolute inset-x-0 h-5 bg-white/50 rounded-full animate-scroll-indicator" />
        </div>
      </div>
    </header>
  );
}
