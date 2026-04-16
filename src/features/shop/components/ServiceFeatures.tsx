import { ShieldCheck, Truck, RefreshCcw, CreditCard } from 'lucide-react';
import { Container } from '@/components/layout/Container';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Authenticity Guaranteed',
    desc: '100% genuine luxury products, certified and verified.',
  },
  {
    icon: Truck,
    title: 'Express Delivery',
    desc: 'Free shipping to 50+ countries on orders over $500.',
  },
  {
    icon: RefreshCcw,
    title: 'Easy Returns',
    desc: '30-day hassle-free returns on all purchases.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    desc: 'End-to-end encrypted via Stripe.',
  },
];

export function ServiceFeatures() {
  return (
    <section className="border-y border-neutral-100 bg-neutral-50/50">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-100">
          {PILLARS.map((p, i) => (
            <div key={i} className="flex flex-col items-center text-center px-5 py-10 md:py-12 gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <p.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-neutral-900 leading-snug">{p.title}</h4>
                <p className="text-[11px] text-neutral-500 font-normal leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
