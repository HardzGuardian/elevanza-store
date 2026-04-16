'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePage } from '@/features/admin/actions/pages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft, Eye, Layout } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';

interface PageEditorProps {
  page: {
    slug: string;
    title: string;
    content: string;
    isVisible?: boolean;
    footerGroup?: string;
  };
}

export function PageEditor({ page }: PageEditorProps) {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [footerGroup, setFooterGroup] = useState(page.footerGroup || 'none');
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updatePage(page.slug, title, content, footerGroup);
    setIsSaving(false);

    if (result.success) {
      toast.success('Page updated successfully!');
      router.refresh();
    } else {
      toast.error('Failed to update page.');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Edit Page</h1>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">/{page.slug}</p>
          </div>
          <Badge variant={page.isVisible ? 'default' : 'secondary'} className="rounded-md px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
            {page.isVisible ? 'Live' : 'Hidden'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-9 px-4 rounded-lg border-neutral-200 text-sm font-medium text-neutral-600 hover:text-neutral-900"
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? <Layout className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
            {isPreview ? 'Editor' : 'Preview'}
          </Button>
          <Button
            className="h-9 px-5 rounded-lg bg-neutral-900 hover:bg-black text-white text-sm font-semibold transition-colors disabled:opacity-50"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <Card className="border border-neutral-100 shadow-none rounded-xl overflow-hidden bg-white">
        <CardHeader className="bg-neutral-50 p-6 border-b border-neutral-100">
          <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400 mb-4">Page Details</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Page Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 rounded-lg border-neutral-200 text-sm bg-white"
                placeholder="Enter page title..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Footer Placement</label>
              <select
                value={footerGroup}
                onChange={(e) => setFooterGroup(e.target.value)}
                className="w-full h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm focus:outline-none focus:border-neutral-400 transition-colors"
              >
                <option value="none">Not in Footer</option>
                <option value="company">Company Column</option>
                <option value="support">Support Column</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Content</label>
            {!isPreview && <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">HTML Supported</span>}
          </div>

          {isPreview ? (
            <div className="min-h-[500px] p-8 border border-dashed border-neutral-200 rounded-xl bg-neutral-50">
              <div
                className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[500px] p-5 rounded-xl border-neutral-200 focus:border-neutral-400 bg-neutral-50 font-mono text-sm leading-relaxed resize-y"
              placeholder="Type your page content here (HTML supported)..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
