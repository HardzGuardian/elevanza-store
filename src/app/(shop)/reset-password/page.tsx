'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

function ResetForm() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const token         = searchParams.get('token') || '';

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 8)  { toast.error('Password must be at least 8 characters'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to reset password'); return; }
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-neutral-500">Invalid reset link.</p>
        <Link href="/forgot-password" className="text-sm font-semibold text-neutral-900 hover:opacity-60 transition-opacity">
          Request a new one
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-green-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Password updated!</h2>
        <p className="text-sm text-neutral-500">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-[28px] font-bold text-neutral-900 tracking-tight">Set new password</h1>
        <p className="text-sm text-neutral-500">Must be at least 8 characters.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="h-11 border-neutral-200 rounded-lg text-sm pr-10 focus:border-neutral-900 transition-colors"
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
            Confirm Password
          </Label>
          <Input
            id="confirm"
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            className="h-11 border-neutral-200 rounded-lg text-sm focus:border-neutral-900 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center px-6 bg-white">
      <div className="w-full max-w-[360px]">
        <Suspense>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
