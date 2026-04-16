'use server';

import { auth } from "@/core/auth/auth";
import { db } from "@/core/db";
import { settings } from "@/core/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { STOREFRONT_TAGS } from "@/features/shop/services/data";

/**
 * Internal: Admin Guard
 * Ensures that only authenticated administrators can modify global store settings.
 */
async function assertAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Admin access required');
  }
}

/**
 * Persistence: Save Store Configuration
 * Updates or inserts the singleton settings record (ID: 1).
 */
export async function saveSettings(data: any) {
  try {
    await assertAdmin();

    // Attempt to update the existing singleton record (ID: 1) first
    const [updated] = await db.update(settings)
      .set({
        storeName: data.storeName,
        storeEmail: data.storeEmail,
        shippingFee: (data.shippingFee || '0').toString(),
        taxRate: (data.taxRate || '0').toString(),
        freeShippingThreshold: (data.freeShippingThreshold || '0').toString(),
        heroTitle: data.heroTitle,
        heroSubtitle: data.heroSubtitle,
        heroImage: data.heroImage,
        featuredCategory1: data.featuredCategory1,
        featuredCategory2: data.featuredCategory2,
        featuredCategory3: data.featuredCategory3,
        featuredSegmentsTitle: data.featuredSegmentsTitle,
        featuredSegmentsDescription: data.featuredSegmentsDescription,
        
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        themePreset: data.themePreset,
        showHero: !!data.showHero,
        showCategories: !!data.showCategories,
        showFeatures: !!data.showFeatures,
        showNewsletter: !!data.showNewsletter,
        showNavCategories: !!data.showNavCategories,
        
        showSizeBadge: !!data.showSizeBadge,
        showSaleBadge: !!data.showSaleBadge,
        showNewBadge: !!data.showNewBadge,
        
        emergencyNoticeText: data.emergencyNoticeText,
        showEmergencyNotice: !!data.showEmergencyNotice,
        featuredSegmentsConfig: data.featuredSegmentsConfig,
        socialLinks: data.socialLinks,
        footerShopLinks: data.footerShopLinks,
        showFooterShop: !!data.showFooterShop,
        showFooterCompany: !!data.showFooterCompany,
        showFooterSupport: !!data.showFooterSupport,
        showFooterNewsletter: !!data.showFooterNewsletter,
      })
      .where(eq(settings.id, 1))
      .returning();

    // If no record was updated, it means we need to insert it for the first time
    if (!updated) {
      await db.insert(settings)
        .values({
          id: 1,
          storeName: data.storeName,
          storeEmail: data.storeEmail,
          shippingFee: (data.shippingFee || '0').toString(),
          taxRate: (data.taxRate || '0').toString(),
          freeShippingThreshold: (data.freeShippingThreshold || '0').toString(),
          heroTitle: data.heroTitle,
          heroSubtitle: data.heroSubtitle,
          heroImage: data.heroImage,
          featuredCategory1: data.featuredCategory1,
          featuredCategory2: data.featuredCategory2,
          featuredCategory3: data.featuredCategory3,
          featuredSegmentsTitle: data.featuredSegmentsTitle,
          featuredSegmentsDescription: data.featuredSegmentsDescription,
          
          primaryColor: data.primaryColor,
          accentColor: data.accentColor,
          themePreset: data.themePreset,
          showHero: !!data.showHero,
          showCategories: !!data.showCategories,
          showFeatures: !!data.showFeatures,
          showNewsletter: !!data.showNewsletter,
          showNavCategories: !!data.showNavCategories,
          
          showSizeBadge: !!data.showSizeBadge,
          showSaleBadge: !!data.showSaleBadge,
          showNewBadge: !!data.showNewBadge,
          
          emergencyNoticeText: data.emergencyNoticeText,
          showEmergencyNotice: !!data.showEmergencyNotice,
          featuredSegmentsConfig: data.featuredSegmentsConfig,
          socialLinks: data.socialLinks,
          footerShopLinks: data.footerShopLinks,
          showFooterShop: !!data.showFooterShop,
          showFooterCompany: !!data.showFooterCompany,
          showFooterSupport: !!data.showFooterSupport,
          showFooterNewsletter: !!data.showFooterNewsletter,
        });
    }

    // Revalidate relevant cache paths and tags
    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidateTag(STOREFRONT_TAGS.settings);
    revalidateTag(STOREFRONT_TAGS.contentPages);
    revalidateTag('storefront-shell');

    return { success: true };
  } catch (error) {
    console.error("Critical: Failed to save store settings:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to save settings" 
    };
  }
}

