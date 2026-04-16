import { getPage } from '@/features/admin/actions/pages';
import { PageEditor } from '@/features/admin/components/PageEditor';
import { notFound } from 'next/navigation';

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminEditPage({ params }: EditPageProps) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return <PageEditor page={page} />;
}
