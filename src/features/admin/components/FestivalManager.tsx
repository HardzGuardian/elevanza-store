'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { createFestival, toggleFestival, deleteFestival } from '@/features/admin/actions/festival';
import { Plus, Trash2, Calendar, Sparkles, Power } from 'lucide-react';
import { cn } from '@/core/utils';

interface FestivalManagerProps {
  initialFestivals: any[];
}

export function FestivalManager({ initialFestivals }: FestivalManagerProps) {
  const router = useRouter();
  const [festivals, setFestivals] = useState(initialFestivals);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    salePercentage: '20',
    promoMessage: '',
    primaryColor: '#f59e0b',
    accentColor: '#fbbf24',
  });

  const handleCreate = async () => {
    setLoading(true);
    const result = await createFestival(formData);
    if (result.success) {
      toast.success('Festival created!');
      setIsAdding(false);
      setFormData({ name: '', slug: '', salePercentage: '20', promoMessage: '', primaryColor: '#f59e0b', accentColor: '#fbbf24' });
      router.push('/admin/festivals');
    } else {
      toast.error('Failed to create festival');
    }
    setLoading(false);
  };

  const handleToggle = async (id: number, active: boolean) => {
    setLoading(true);
    const result = await toggleFestival(id, active);
    if (result.success) {
      toast.success(active ? 'Festival activated!' : 'Festival deactivated');
      router.push('/admin/festivals');
    } else {
      toast.error('Failed to toggle festival');
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this festival?')) return;
    setLoading(true);
    const result = await deleteFestival(id);
    if (result.success) {
      toast.success('Festival deleted');
      setFestivals(festivals.filter(f => f.id !== id));
    } else {
      toast.error('Failed to delete');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-neutral-600" />
            Festival Manager
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Transform your store for special occasions instantly.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-[13px] font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New Festival
        </button>
      </div>

      {isAdding && (
        <Card className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
          <CardHeader className="p-6 border-b border-neutral-100">
            <CardTitle className="text-base font-bold text-neutral-900">Configure New Festival</CardTitle>
            <CardDescription className="text-sm text-neutral-500">Set the details and discount for the upcoming event.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Event Name</label>
                    <Input
                      placeholder="e.g. Diwali Sale"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-10 rounded-lg border-neutral-200 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Slug Identifier</label>
                    <Input
                      placeholder="diwali"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="h-10 rounded-lg border-neutral-200 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Site-wide Discount (%)</label>
                    <Input
                      type="number"
                      value={formData.salePercentage}
                      onChange={(e) => setFormData({...formData, salePercentage: e.target.value})}
                      className="h-10 rounded-lg border-neutral-200 text-sm"
                    />
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Promo Banner Message</label>
                    <textarea
                      placeholder="Celebrate the festival of lights with 20% off everything!"
                      value={formData.promoMessage}
                      onChange={(e) => setFormData({...formData, promoMessage: e.target.value})}
                      className="w-full rounded-lg border border-neutral-200 h-28 p-3 text-sm focus:outline-none focus:border-neutral-400 transition-colors resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Color Presets</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Diwali Gold', primary: '#f59e0b', accent: '#fbbf24' },
                        { name: 'Spring Pink', primary: '#ff85a1', accent: '#ffc2d1' },
                        { name: 'Holi Purple', primary: '#a855f7', accent: '#d8b4fe' },
                        { name: 'Winter Blue', primary: '#3b82f6', accent: '#93c5fd' },
                        { name: 'Midnight', primary: '#4f46e5', accent: '#818cf8' },
                        { name: 'Emerald', primary: '#10b981', accent: '#6ee7b7' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, primaryColor: preset.primary, accentColor: preset.accent })}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase transition-all border",
                            formData.primaryColor === preset.primary ? "border-neutral-900 bg-white text-neutral-900" : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-400"
                          )}
                        >
                          <div className="flex -space-x-0.5">
                            <div className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: preset.primary }} />
                            <div className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: preset.accent }} />
                          </div>
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Primary</label>
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                        className="w-full h-10 rounded-lg border border-neutral-200 cursor-pointer p-1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Accent</label>
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({...formData, accentColor: e.target.value})}
                        className="w-full h-10 rounded-lg border border-neutral-200 cursor-pointer p-1"
                      />
                    </div>
                  </div>
               </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
               <Button variant="outline" onClick={() => setIsAdding(false)} className="rounded-lg text-sm">Cancel</Button>
               <Button onClick={handleCreate} disabled={loading} className="rounded-lg bg-neutral-900 hover:bg-black text-white text-sm font-semibold px-6">Create Festival</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {festivals.map((festival) => (
          <Card key={festival.id} className={cn(
            "rounded-xl border transition-all relative overflow-hidden bg-white",
            festival.isActive ? "border-neutral-900 shadow-sm" : "border-neutral-100 hover:border-neutral-300"
          )}>
            {/* Color accent bar */}
            <div className="h-1 w-full" style={{ backgroundColor: festival.primaryColor }} />

            <CardHeader className="p-5">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-neutral-100 mb-3">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                </div>
                <button onClick={() => handleDelete(festival.id)} className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <CardTitle className="text-base font-bold text-neutral-900">{festival.name}</CardTitle>
              <CardDescription className="text-xs text-neutral-400 font-mono">{festival.slug}</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-neutral-900 text-white font-bold text-xs flex-shrink-0">
                  {festival.salePercentage}%
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Site-wide Discount</p>
                  <p className="text-sm font-medium text-neutral-700">Applied automatically</p>
                </div>
              </div>

              {festival.promoMessage && (
                <p className="text-xs text-neutral-500 line-clamp-2 italic">
                  "{festival.promoMessage}"
                </p>
              )}

              <div className="flex gap-1.5">
                <div className="h-1.5 flex-grow rounded-full" style={{ backgroundColor: festival.primaryColor }} />
                <div className="h-1.5 flex-grow rounded-full" style={{ backgroundColor: festival.accentColor }} />
              </div>

              <Button
                onClick={() => handleToggle(festival.id, !festival.isActive)}
                disabled={loading}
                className={cn(
                  "w-full rounded-lg h-9 text-xs font-semibold uppercase tracking-wider transition-all",
                  festival.isActive
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                    : "bg-neutral-900 text-white hover:bg-black"
                )}
              >
                {festival.isActive ? (
                  <><Power className="w-3 h-3 mr-1.5" /> Deactivate</>
                ) : (
                  <><Sparkles className="w-3 h-3 mr-1.5" /> Activate</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

