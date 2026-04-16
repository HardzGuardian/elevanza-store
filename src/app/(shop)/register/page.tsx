'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PERKS = [
  'Early access to new collections',
  'Members-only pricing & private sales',
  'Free express shipping on orders over $500',
  'Dedicated personal style assistance',
];

export default function RegisterPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      toast.success('Account created! Please sign in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-68px)]">

      {/* ── Visual panel (left) ─────────────────────── */}
      <div className="hidden lg:flex flex-1 bg-neutral-950 items-center justify-center p-12 relative overflow-hidden order-first">
        <div className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 40% 60%, oklch(0.35 0 0) 0%, transparent 65%)',
          }}
        />
        <div className="relative max-w-xs space-y-7">
          <div className="space-y-3">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
              Membership
            </span>
            <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
              Join the<br />Inner Circle
            </h2>
            <p className="text-neutral-400 text-sm font-normal leading-relaxed">
              Access exclusive benefits reserved for Elevanza members.
            </p>
          </div>
          <ul className="space-y-3">
            {PERKS.map(perk => (
              <li key={perk} className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-medium text-neutral-400 leading-relaxed">{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Form panel (right) ──────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-[360px] space-y-8">

          <div className="space-y-1.5">
            <h1 className="text-[28px] font-bold text-neutral-900 tracking-tight">Create account</h1>
            <p className="text-sm text-neutral-500 font-normal">
              Join for exclusive access to luxury fashion.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="h-11 border-neutral-200 rounded-lg text-sm focus:border-neutral-900 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                Email
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

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 border-neutral-200 rounded-lg text-sm pr-10 focus:border-neutral-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <p className="text-sm text-neutral-500 text-center">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-neutral-900 hover:opacity-60 transition-opacity">
              Sign in
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
