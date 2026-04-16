'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function DesignTab() {
  const { register } = useFormContext();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Brand Colors */}
      <Card className="border border-neutral-100 shadow-none rounded-xl bg-white">
        <CardHeader className="p-5 border-b border-neutral-100">
          <CardTitle className="text-base font-bold text-neutral-900">Brand Colors</CardTitle>
          <CardDescription className="text-sm text-neutral-500">Define your brand's digital identity colors.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Primary Brand Color</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Main buttons and links</p>
            </div>
            <input
              type="color"
              {...register("primaryColor")}
              className="w-10 h-10 rounded-lg cursor-pointer border border-neutral-200 p-1"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Accent Color</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Highlights and focus states</p>
            </div>
            <input
              type="color"
              {...register("accentColor")}
              className="w-10 h-10 rounded-lg cursor-pointer border border-neutral-200 p-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Festive Presets */}
      <Card className="border border-neutral-100 shadow-none rounded-xl bg-white">
        <CardHeader className="p-5 border-b border-neutral-100">
          <CardTitle className="text-base font-bold text-neutral-900">Festive Presets</CardTitle>
          <CardDescription className="text-sm text-neutral-500">Instantly transform your store for seasonal events.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Theme Event</label>
            <select
              id="themePreset"
              {...register("themePreset")}
              className="w-full h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm focus:outline-none focus:border-neutral-400 transition-colors"
            >
              <option value="default">Default Modern</option>
              <option value="diwali">Diwali Festival</option>
              <option value="ganpati">Ganesh Chaturthi</option>
            </select>
          </div>
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Note</p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Selecting a festival preset will override your brand colors and apply festive icon overlays to the storefront.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
