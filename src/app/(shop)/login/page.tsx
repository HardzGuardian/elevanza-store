'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        toast.error('Invalid email or password.');
      } else {
        toast.success('Welcome back!');
        router.push('/');
        router.refresh();
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-68px)]">

      {/* ── Form panel ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-[360px] space-y-8">

          <div className="space-y-1.5">
            <h1 className="text-[28px] font-bold text-neutral-900 tracking-tight">Sign in</h1>
            <p className="text-sm text-neutral-500 font-normal">
              Welcome back. Enter your details to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
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
                : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <p className="text-sm text-neutral-500 text-center">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-neutral-900 hover:opacity-60 transition-opacity">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* ── Visual panel ───────────────────────────── */}
      <div className="hidden lg:flex flex-1 bg-neutral-950 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 60% 40%, oklch(0.3 0 0) 0%, transparent 70%)',
          }}
        />
        <div className="relative text-center space-y-4 max-w-xs">
          <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
            Welcome back<br />to Elevanza
          </h2>
          <p className="text-neutral-400 text-sm font-normal leading-relaxed">
            Access your orders, wishlist, and exclusive member benefits.
          </p>
          <div className="pt-6 grid grid-cols-2 gap-3 text-left">
            {[
              { label: 'Orders', val: 'Track & manage' },
              { label: 'Wishlist', val: 'Save favourites' },
              { label: 'Members', val: 'Exclusive access' },
              { label: 'Returns', val: '30-day policy' },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl bg-white/5 border border-white/8">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-1">{item.label}</p>
                <p className="text-xs font-medium text-neutral-300">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
