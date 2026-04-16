import { getAllPages } from '@/features/admin/actions/pages';
import { CmsPageCard } from '@/features/admin/components/CmsPageCard';
import { CreatePageButton } from '@/features/admin/components/CreatePageButton';
import { FileText } from 'lucide-react';

export default async function AdminPagesPage() {
  const pages = await getAllPages();

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">CMS Pages</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your store's content pages.</p>
        </div>
        <CreatePageButton />
      </div>

      {pages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => <CmsPageCard key={page.id} page={page} />)}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-xl border border-neutral-100 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 bg-neutral-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-neutral-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">No pages yet</h3>
            <p className="text-sm text-neutral-400 mt-1">Create your first content page to get started.</p>
          </div>
        </div>
      )}
    </div>
  );
}


