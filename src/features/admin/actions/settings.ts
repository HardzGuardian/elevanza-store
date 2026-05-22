'use server';

import { db } from "@/core/db";
import { settings } from "@/core/db/schema";

import { assertAdmin } from "@/core/auth/guards";
import { revalidatePath, revalidateTag } from "next/cache";
import { STOREFRONT_TAGS } from "@/features/shop/services/data";
import { z } from "zod";

const colorField = z
  .string()
  .regex(/^(#[0-9a-fA-F]{3,8}|rgb\([\d,\s]+\)|rgba\([\d,.\s]+\)|)$/)
  .optional()
  .nullable();

const urlOrEmpty = z.string().url().optional().nullable().or(z.literal(""));

const settingsSchema = z.object({
  // Store basics
  storeName: z.string().max(255).optional().nullable(),
  storeEmail: z.string().email().optional().nullable().or(z.literal("")),

  // Numeric / financial fields
  shippingFee: z.coerce.number().min(0).max(99999).optional().nullable(),
  taxRate: z.coerce.number().min(0).max(100).optional().nullable(),
  freeShippingThreshold: z.coerce.number().min(0).max(99999).optional().nullable(),

  // Hero / content strings
  heroTitle: z.string().max(500).optional().nullable(),
  heroSubtitle: z.string().max(1000).optional().nullable(),
  heroImage: urlOrEmpty,

  // Featured categories
  featuredCategory1: z.string().max(255).optional().nullable(),
  featuredCategory2: z.string().max(255).optional().nullable(),
  featuredCategory3: z.string().max(255).optional().nullable(),

  // Featured segments
  featuredSegmentsTitle: z.string().max(500).optional().nullable(),
  featuredSegmentsDescription: z.string().max(2000).optional().nullable(),
  featuredSegmentsConfig: z.unknown().optional().nullable(),

  // Colors / theme
  primaryColor: colorField,
  accentColor: colorField,
  themePreset: z.string().max(100).optional().nullable(),

  // Section visibility booleans
  showHero: z.boolean().optional(),
  showCategories: z.boolean().optional(),
  showFeatures: z.boolean().optional(),
  showNewsletter: z.boolean().optional(),
  showNavCategories: z.boolean().optional(),

  // Badge visibility
  showSizeBadge: z.boolean().optional(),
  showSaleBadge: z.boolean().optional(),
  showNewBadge: z.boolean().optional(),

  // Emergency notice
  emergencyNoticeText: z.string().max(1000).optional().nullable(),
  showEmergencyNotice: z.boolean().optional(),

  // Social / footer
  socialLinks: z.unknown().optional().nullable(),
  footerShopLinks: z.unknown().optional().nullable(),
  showFooterShop: z.boolean().optional(),
  showFooterCompany: z.boolean().optional(),
  showFooterSupport: z.boolean().optional(),
  showFooterNewsletter: z.boolean().optional(),
});

/**
 * Persistence: Save Store Configuration
 * Upserts the singleton settings record (ID: 1).
 */
export async function saveSettings(data: any) {
  try {
    await assertAdmin();

    const parsed = settingsSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors };
    }
    const d = parsed.data;

    const settingsPayload = {
      storeName: d.storeName,
      storeEmail: d.storeEmail,
      shippingFee: (d.shippingFee ?? 0).toString(),
      taxRate: (d.taxRate ?? 0).toString(),
      freeShippingThreshold: (d.freeShippingThreshold ?? 0).toString(),
      heroTitle: d.heroTitle,
      heroSubtitle: d.heroSubtitle,
      heroImage: d.heroImage,
      featuredCategory1: d.featuredCategory1,
      featuredCategory2: d.featuredCategory2,
      featuredCategory3: d.featuredCategory3,
      featuredSegmentsTitle: d.featuredSegmentsTitle,
      featuredSegmentsDescription: d.featuredSegmentsDescription,

      primaryColor: d.primaryColor,
      accentColor: d.accentColor,
      themePreset: d.themePreset,
      showHero: !!d.showHero,
      showCategories: !!d.showCategories,
      showFeatures: !!d.showFeatures,
      showNewsletter: !!d.showNewsletter,
      showNavCategories: !!d.showNavCategories,

      showSizeBadge: !!d.showSizeBadge,
      showSaleBadge: !!d.showSaleBadge,
      showNewBadge: !!d.showNewBadge,

      emergencyNoticeText: d.emergencyNoticeText,
      showEmergencyNotice: !!d.showEmergencyNotice,
      featuredSegmentsConfig: d.featuredSegmentsConfig,
      socialLinks: d.socialLinks,
      footerShopLinks: d.footerShopLinks,
      showFooterShop: !!d.showFooterShop,
      showFooterCompany: !!d.showFooterCompany,
      showFooterSupport: !!d.showFooterSupport,
      showFooterNewsletter: !!d.showFooterNewsletter,
    };

    await db.insert(settings)
      .values({ id: 1, ...settingsPayload })
      .onConflictDoUpdate({ target: settings.id, set: settingsPayload });

    // Revalidate relevant cache paths and tags
    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidateTag(STOREFRONT_TAGS.settings, {});
    revalidateTag(STOREFRONT_TAGS.contentPages, {});
    revalidateTag('storefront-shell', {});

    return { success: true };
  } catch (error) {
    console.error("Critical: Failed to save store settings:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to save settings" 
    };
  }
}

