'use client';

import { useState } from 'react';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';

interface NewsletterSignupProps {
  themePreset?: string;
}

export function NewsletterSignup({ themePreset }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

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
          {success ? (
            <p className="text-sm font-medium text-white/80 py-3.5">
              You&apos;re in. Welcome to the Inner Circle.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="flex-1 px-5 py-3.5 bg-white/8 border border-white/10 text-white placeholder:text-neutral-600 text-sm font-normal rounded-lg focus:outline-none focus:border-white/25 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3.5 bg-white text-neutral-900 text-[13px] font-semibold rounded-lg hover:bg-neutral-100 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Joining...' : 'Join Now'}
              </button>
            </form>
          )}

          {/* Error message */}
          {error && (
            <p className="text-[12px] text-red-400 font-medium -mt-3">
              {error}
            </p>
          )}

          <p className="text-[11px] text-neutral-700 font-medium">
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </Container>
    </Section>
  );
}
