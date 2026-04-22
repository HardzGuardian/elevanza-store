'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [sent, setSent]           = useState(false);
  const [cooldown, setCooldown]   = useState(0);

  // Countdown timer for Resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading || cooldown > 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setCooldown(60);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-[calc(100vh-68px)] items-center justify-center px-6 bg-white">
        <div className="w-full max-w-[360px] text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto">
            <MailCheck className="w-7 h-7 text-green-500" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Check your inbox</h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              We sent a reset link to <span className="font-semibold text-neutral-700">{email}</span>.
              It expires in 1 hour.
            </p>
          </div>

          {/* Resend */}
          <div className="pt-2 space-y-3">
            <button
              onClick={submit}
              disabled={loading || cooldown > 0}
              className="w-full h-11 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend email'}
            </button>
            <p className="text-xs text-neutral-400">
              Check your spam folder if you don't see it.
            </p>
          </div>

          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center px-6 bg-white">
      <div className="w-full max-w-[360px] space-y-8">

        <div className="space-y-1.5">
          <h1 className="text-[28px] font-bold text-neutral-900 tracking-tight">Forgot password?</h1>
          <p className="text-sm text-neutral-500 font-normal">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="h-11 border-neutral-200 rounded-lg text-sm focus:border-neutral-900 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
          </button>
        </form>

        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
