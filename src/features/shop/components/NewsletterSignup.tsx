import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';

interface NewsletterSignupProps {
  themePreset?: string;
}

export function NewsletterSignup({ themePreset }: NewsletterSignupProps) {
  return (
    <Section className="bg-neutral-950">
      <Container>
        <div className="max-w-xl mx-auto text-center space-y-7">

          {/* Label */}
          <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Members Only
          </span>

          {/* Headline */}
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight text-balance">
              The Inner Circle
            </h2>
            <p className="text-neutral-400 text-[15px] font-normal leading-relaxed">
              Join for exclusive early access to collections, private sales, and members-only events.
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-5 py-3.5 bg-white/8 border border-white/10 text-white placeholder:text-neutral-600 text-sm font-normal rounded-lg focus:outline-none focus:border-white/25 transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-white text-neutral-900 text-[13px] font-semibold rounded-lg hover:bg-neutral-100 transition-colors whitespace-nowrap"
            >
              Join Now
            </button>
          </form>

          <p className="text-[11px] text-neutral-700 font-medium">
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </Container>
    </Section>
  );
}
