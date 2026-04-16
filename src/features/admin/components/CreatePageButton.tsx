'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2 } from 'lucide-react';
import { createPage } from '@/features/admin/actions/pages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

export function CreatePageButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const router = useRouter();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    // Auto-slugify
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) return;

    setLoading(true);
    const result = await createPage(slug, title);
    setLoading(false);

    if (result.success) {
      toast.success('Page created successfully!');
      setIsOpen(false);
      setTitle('');
      setSlug('');
      router.push('/admin/pages');
    } else {
      toast.error(result.error || 'Failed to create page.');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-[13px] font-semibold rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Page
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-md border border-neutral-100 shadow-2xl rounded-2xl overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-neutral-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-neutral-900">New Page</CardTitle>
                <p className="text-xs text-neutral-400 mt-0.5">Create a new CMS content page</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Display Title</label>
                  <Input
                    required
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Terms of Service"
                    className="h-10 rounded-lg border-neutral-200 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">URL Slug</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">/</span>
                    <Input
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="terms-of-service"
                      className="h-10 rounded-lg border-neutral-200 pl-7 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 rounded-lg bg-neutral-900 hover:bg-black text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Page'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
