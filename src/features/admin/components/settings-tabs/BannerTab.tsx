'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ui/image-upload';

export function BannerTab() {
  const { register, watch, setValue } = useFormContext();

  const heroImage = watch("heroImage");
  const heroTitle = watch("heroTitle");
  const heroSubtitle = watch("heroSubtitle");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Visual Preview */}
      <Card className="border border-neutral-100 shadow-none rounded-xl bg-neutral-950 text-white overflow-hidden relative min-h-[360px]">
        <img
          src={heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80'}
          alt="Hero preview"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        <div className="relative z-10 flex flex-col h-full p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-auto">Banner Preview</p>
          <div className="mt-auto">
            <h3 className="text-4xl font-bold uppercase tracking-tight leading-none">
              {heroTitle || 'Your Title'}
            </h3>
            <p className="mt-4 text-sm text-neutral-300 max-w-xs leading-relaxed">
              {heroSubtitle || 'Your subtitle appears here…'}
            </p>
          </div>
        </div>
      </Card>

      {/* Editor */}
      <Card className="border border-neutral-100 shadow-none rounded-xl bg-white">
        <CardHeader className="p-5 border-b border-neutral-100">
          <CardTitle className="text-base font-bold text-neutral-900">Banner Configuration</CardTitle>
          <CardDescription className="text-sm text-neutral-500">Upload your hero image and set your landing message.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Hero Title</label>
            <Input
              id="heroTitle"
              {...register("heroTitle")}
              className="h-10 rounded-lg border-neutral-200 text-sm"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Hero Subtitle</label>
            <textarea
              id="heroSubtitle"
              {...register("heroSubtitle")}
              rows={3}
              className="w-full rounded-lg border border-neutral-200 p-3 text-sm focus:outline-none focus:border-neutral-400 transition-colors resize-none"
              required
            />
          </div>
          <ImageUpload
            label="Main Hero Image"
            value={heroImage}
            onChange={(url) => setValue("heroImage", url)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
