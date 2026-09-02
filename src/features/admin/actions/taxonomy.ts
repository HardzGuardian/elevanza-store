"use server";

import { db } from "@/core/db";
import { categories, festivals } from "@/core/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { STOREFRONT_TAGS } from "@/features/shop/services/data";
import { assertAdmin } from "@/core/auth/guards";

// --- CATEGORIES ---
export async function getCategories() {
  return await db.select().from(categories);
}

export async function createCategory(data: { name: string; slug: string; image?: string }) {
  await assertAdmin();
  try {
    const [category] = await db.insert(categories).values(data).returning();
    revalidatePath("/admin/taxonomy");
    revalidatePath("/products");
    revalidateTag(STOREFRONT_TAGS.categories, {});
    return { success: true, category };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, category: null };
  }
}

export async function deleteCategory(id: number) {
  await assertAdmin();
  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/admin/taxonomy");
    revalidatePath("/products");
    revalidateTag(STOREFRONT_TAGS.categories, {});
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false };
  }
}

// --- FESTIVALS ---
export async function getFestivals() {
  return await db.select().from(festivals);
}

interface FestivalInput {
  name: string;
  slug: string;
  salePercentage: number | string;
  promoMessage?: string;
  primaryColor?: string;
  accentColor?: string;
}

function toFestivalValues(data: FestivalInput) {
  return {
    name: data.name,
    slug: data.slug,
    salePercentage: parseInt(String(data.salePercentage), 10) || 0,
    promoMessage: data.promoMessage,
    primaryColor: data.primaryColor,
    accentColor: data.accentColor,
  };
}

export async function createFestival(data: FestivalInput) {
  await assertAdmin();
  try {
    const [festival] = await db.insert(festivals)
      .values({ ...toFestivalValues(data), isActive: false })
      .returning();
    revalidatePath("/admin/taxonomy");
    revalidatePath("/");
    revalidateTag(STOREFRONT_TAGS.festivals, {});
    return { success: true, festival };
  } catch (error) {
    console.error("Failed to create festival:", error);
    return { success: false, festival: null };
  }
}

export async function updateFestival(id: number, data: FestivalInput) {
  await assertAdmin();
  try {
    await db.update(festivals).set(toFestivalValues(data)).where(eq(festivals.id, id));
    revalidatePath("/admin/taxonomy");
    revalidatePath("/");
    revalidateTag(STOREFRONT_TAGS.festivals, {});
    return { success: true };
  } catch (error) {
    console.error("Failed to update festival:", error);
    return { success: false };
  }
}

export async function deleteFestival(id: number) {
  await assertAdmin();
  try {
    await db.delete(festivals).where(eq(festivals.id, id));
    revalidatePath("/admin/taxonomy");
    revalidatePath("/");
    revalidateTag(STOREFRONT_TAGS.festivals, {});
    return { success: true };
  } catch (error) {
    console.error("Failed to delete festival:", error);
    return { success: false };
  }
}

export async function toggleFestival(id: number, active: boolean) {
  await assertAdmin();
  try {
    // Disable all others first
    if (active) {
      await db.update(festivals).set({ isActive: false });
    }
    await db.update(festivals).set({ isActive: active }).where(eq(festivals.id, id));
    revalidatePath("/admin/taxonomy");
    revalidatePath("/");
    revalidatePath("/(shop)", "layout");
    revalidateTag(STOREFRONT_TAGS.festivals, {});
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle festival:", error);
    return { success: false };
  }
}

