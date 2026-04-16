'use server';

import { auth } from '@/core/auth/auth';
import { db } from '@/core/db';
import { ensureContentPagesVisibilityColumn } from '@/core/db/ensure-content-pages-visibility';
import { contentPages } from '@/core/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { STOREFRONT_TAGS } from '@/features/shop/services/data';

async function assertAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Admin access required');
  }
}

export async function getPage(slug: string) {
  try {
    await ensureContentPagesVisibilityColumn();
    const [page] = await db
      .select()
      .from(contentPages)
      .where(eq(contentPages.slug, slug))
      .limit(1);
    return page;
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error);
    return null;
  }
}

export async function getAllPages() {
  try {
    await ensureContentPagesVisibilityColumn();
    return await db.select().from(contentPages);
  } catch (error) {
    console.error('Error fetching all pages:', error);
    return [];
  }
}

export async function createPage(slug: string, title: string, content: string = '', footerGroup: string = 'none') {
  try {
    await assertAdmin();
    await ensureContentPagesVisibilityColumn();
    
    await db.insert(contentPages).values({
      slug,
      title,
      content,
      isVisible: true,
      footerGroup
    });

    revalidatePath('/admin/pages');
    revalidateTag(STOREFRONT_TAGS.contentPages);
    return { success: true };
  } catch (error: any) {
    console.error('Error creating page:', error);
    const message = error?.message?.includes('unique') 
      ? 'Slug already exists. Please pick another.' 
      : 'Failed to create page.';
    return { success: false, error: message };
  }
}

export async function updatePage(slug: string, title: string, content: string, footerGroup: string = 'none') {
  try {
    await assertAdmin();
    await ensureContentPagesVisibilityColumn();
    await db
      .update(contentPages)
      .set({ title, content, footerGroup })
      .where(eq(contentPages.slug, slug));
    
    revalidatePath(`/pages/${slug}`);
    revalidatePath('/admin/pages');
    revalidateTag(STOREFRONT_TAGS.contentPages);
    return { success: true };
  } catch (error) {
    console.error(`Error updating page ${slug}:`, error);
    return { success: false, error: 'Failed to update page' };
  }
}

export async function deletePage(slug: string) {
  try {
    await assertAdmin();
    await db.delete(contentPages).where(eq(contentPages.slug, slug));
    revalidatePath('/admin/pages');
    revalidateTag(STOREFRONT_TAGS.contentPages);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting page ${slug}:`, error);
    return { success: false, error: 'Failed to delete page.' };
  }
}

export async function togglePageVisibility(slug: string, isVisible: boolean) {
  try {
    await assertAdmin();
    await ensureContentPagesVisibilityColumn();

    await db
      .update(contentPages)
      .set({ isVisible })
      .where(eq(contentPages.slug, slug));

    revalidatePath(`/pages/${slug}`);
    revalidatePath('/admin/pages');
    revalidateTag(STOREFRONT_TAGS.contentPages);
    return { success: true };
  } catch (error) {
    console.error(`Error updating page visibility for ${slug}:`, error);
    return { success: false, error: 'Failed to update page visibility' };
  }
}

