'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Trash2,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  createCategory,
  deleteCategory,
  createFestival,
  deleteFestival,
  toggleFestival
} from '@/features/admin/actions/taxonomy';
import { toast } from 'react-hot-toast';
import { cn } from '@/core/utils';
import { Badge } from '@/components/ui/badge';

interface TaxonomyManagerProps {
  initialCategories: any[];
  initialFestivals: any[];
}

export function TaxonomyManager({ initialCategories, initialFestivals }: TaxonomyManagerProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'festivals'>('categories');
  const [categoriesList, setCategoriesList] = useState(initialCategories);
  const [festivalsList, setFestivalsList] = useState(initialFestivals);

  const [newCatName, setNewCatName] = useState('');
  const [newFestName, setNewFestName] = useState('');
  const [festLoading, setFestLoading] = useState(false);

  const handleCreateCategory = async () => {
    if (!newCatName) return;
    const slug = newCatName.toLowerCase().replace(/ /g, '-');
    const result = await createCategory({ name: newCatName, slug });
    if (result.success) {
      toast.success('Category created!');
      setNewCatName('');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Delete this category? Products in it may become unassigned.')) {
      const result = await deleteCategory(id);
      if (result.success) toast.success('Category removed');
    }
  };

  const handleCreateFestival = async () => {
    if (!newFestName) return;
    setFestLoading(true);
    const slug = newFestName.toLowerCase().replace(/ /g, '-');
    const result = await createFestival({
      name: newFestName,
      slug,
      salePercentage: 10,
      primaryColor: '#eab308',
      accentColor: '#ef4444',
      promoMessage: `Celebrate ${newFestName} with exclusive deals!`
    });
    if (result.success) {
      toast.success('Festival event added!');
      setNewFestName('');
    }
    setFestLoading(false);
  };

  const handleToggleFestival = async (id: number, active: boolean) => {
    const result = await toggleFestival(id, active);
    if (result.success) {
      toast.success(active ? 'Festival activated!' : 'Festival deactivated');
    }
  };

  const handleDeleteFestival = async (id: number) => {
    if (confirm('Permanently remove this festival event?')) {
      const result = await deleteFestival(id);
      if (result.success) toast.success('Festival deleted');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Taxonomy</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage categories and seasonal festival events.</p>
        </div>
        <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => setActiveTab('categories')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-[0.1em] transition-all",
              activeTab === 'categories' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('festivals')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-[0.1em] transition-all",
              activeTab === 'festivals' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            Festivals
          </button>
        </div>
      </div>

      {activeTab === 'categories' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-1 border border-neutral-100 shadow-none rounded-xl bg-white h-fit">
            <CardHeader className="p-5 border-b border-neutral-100">
              <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center mb-3">
                <Layers className="w-4 h-4 text-neutral-600" />
              </div>
              <CardTitle className="text-base font-bold text-neutral-900">New Category</CardTitle>
              <CardDescription className="text-sm text-neutral-500">Add a department to your shop.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Category Name</label>
                  <Input
                    placeholder="e.g. Footwear"
                    className="h-10 rounded-lg border-neutral-200 text-sm"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCreateCategory}
                  className="w-full h-10 rounded-lg bg-neutral-900 hover:bg-black text-white text-sm font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Create
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border border-neutral-100 shadow-none rounded-xl bg-white">
            <CardHeader className="p-5 border-b border-neutral-100">
              <CardTitle className="text-base font-bold text-neutral-900">Active Categories</CardTitle>
              <CardDescription className="text-sm text-neutral-500">Current shop departments.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoriesList.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-neutral-200 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center font-bold text-[10px] text-neutral-500 uppercase">
                        {cat.slug.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-neutral-900">{cat.name}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">/{cat.slug}</p>
                      </div>
                    </div>
                    <button
                      className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-1 border border-neutral-100 shadow-none rounded-xl bg-white h-fit">
            <CardHeader className="p-5 border-b border-neutral-100">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <CardTitle className="text-base font-bold text-neutral-900">New Festival</CardTitle>
              <CardDescription className="text-sm text-neutral-500">Setup a seasonal sale period.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Event Name</label>
                  <Input
                    placeholder="e.g. Diwali Sale"
                    className="h-10 rounded-lg border-neutral-200 text-sm"
                    value={newFestName}
                    onChange={(e) => setNewFestName(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCreateFestival}
                  disabled={festLoading}
                  className="w-full h-10 rounded-lg bg-neutral-900 hover:bg-black text-white text-sm font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Create Event
                </Button>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-neutral-500 leading-relaxed">Only one festival can be active at a time.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border border-neutral-100 shadow-none rounded-xl bg-white">
            <CardHeader className="p-5 border-b border-neutral-100">
              <CardTitle className="text-base font-bold text-neutral-900">Festival Events</CardTitle>
              <CardDescription className="text-sm text-neutral-500">Manage seasonal themes and promotions.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                {festivalsList.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-sm text-neutral-400">No festivals defined yet.</p>
                  </div>
                )}
                {festivalsList.map((fest) => (
                  <div key={fest.id} className={cn(
                    "p-4 rounded-xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
                    fest.isActive ? "border-neutral-900 bg-neutral-50" : "border-neutral-100 bg-white hover:border-neutral-200"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                        <Sparkles className={cn('w-4 h-4', fest.isActive ? 'text-neutral-900' : 'text-neutral-300')} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-neutral-900">{fest.name}</h3>
                          {fest.isActive && <Badge className="bg-neutral-900 text-white text-[9px] px-1.5 py-0.5 rounded font-semibold">Active</Badge>}
                        </div>
                        <p className="text-xs text-neutral-400">-{fest.salePercentage}% site-wide sale</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={fest.isActive ? "outline" : "default"}
                        className={cn(
                          "rounded-lg h-8 px-4 text-xs font-semibold",
                          fest.isActive
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "bg-neutral-900 hover:bg-black text-white"
                        )}
                        onClick={() => handleToggleFestival(fest.id, !fest.isActive)}
                      >
                        {fest.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <button
                        className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => handleDeleteFestival(fest.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
