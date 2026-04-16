'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, ExternalLink, Eye, EyeOff, FileText, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { togglePageVisibility, deletePage } from '@/features/admin/actions/pages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CmsPageCardProps {
  page: {
    id: number;
    slug: string;
    title: string;
    isVisible: boolean;
  };
}

export function CmsPageCard({ page }: CmsPageCardProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(page.isVisible ?? true);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleVisibilityToggle() {
    setPending(true);
    const result = await togglePageVisibility(page.slug, !isVisible);
    if (result.success) {
      toast.success(!isVisible ? 'Page is visible on the site now.' : 'Page hidden from the site.');
      setIsVisible(prev => !prev);
    } else {
      toast.error(result.error || 'Failed to update page visibility.');
    }
    setPending(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const result = await deletePage(page.slug);
    if (result.success) {
      toast.success('Page deleted.');
      router.push('/admin/pages');
    } else {
      toast.error(result.error || 'Failed to delete page.');
      setDeleting(false);
    }
  }

  return (
    <Card className="border border-neutral-100 shadow-none rounded-xl overflow-hidden group hover:border-neutral-300 transition-all bg-white">
      <CardHeader className="bg-white p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="p-2.5 bg-neutral-100 rounded-xl text-neutral-600">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900"
              onClick={handleVisibilityToggle}
              disabled={pending}
              title={isVisible ? 'Hide from site' : 'Show on site'}
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isVisible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4 text-red-400" />
              )}
            </Button>
            {isVisible ? (
              <Link href={`/pages/${page.slug}`} target="_blank">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-neutral-200" disabled>
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-neutral-900 tracking-tight">
              {page.title}
            </CardTitle>
            <p className="text-xs text-neutral-400 font-mono mt-1 lowercase">/{page.slug}</p>
          </div>
          <Badge variant={isVisible ? 'default' : 'secondary'} className="rounded-md px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider flex-shrink-0">
            {isVisible ? 'Live' : 'Hidden'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <div className="h-px w-full bg-neutral-100 mb-4" />
        <div className="flex gap-2">
          <Link href={`/admin/pages/${page.slug}`} className="flex-1">
            <Button className="w-full h-10 rounded-lg bg-neutral-900 hover:bg-black text-white text-sm font-semibold transition-colors">
              <Edit className="w-4 h-4 mr-2" />
              Edit Content
            </Button>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleting}
            className="h-10 w-10 rounded-lg border border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors flex-shrink-0"
            title="Delete page"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

