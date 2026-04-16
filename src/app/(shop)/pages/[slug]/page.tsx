import { getContentPageBySlug } from '@/features/shop/services/data';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InformationalPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getContentPageBySlug(slug);

  if (!page) notFound();

  return (
    <div className="bg-white min-h-screen">
      <Container className="py-14 md:py-20">
        <div className="max-w-2xl mx-auto">

          <header className="mb-10 pb-8 border-b border-neutral-100">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-3">
              Information
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight text-balance">
              {page.title}
            </h1>
          </header>

          <div
            className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

          <footer className="mt-12 pt-8 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
            <p>Last updated: {new Date(page.updatedAt!).toLocaleDateString()}</p>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </footer>
        </div>
      </Container>
    </div>
  );
}
