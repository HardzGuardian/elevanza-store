"use server";

import { db } from "@/core/db";
import { categories, festivals } from "@/core/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { STOREFRONT_TAGS } from "@/features/shop/services/data";

// --- CATEGORIES ---
export async function getCategories() {
  return await db.select().from(categories);
}

export async function createCategory(data: { name: string; slug: string; image?: string }) {
  try {
    await db.insert(categories).values(data);
    revalidatePath("/admin/taxonomy");
    revalidatePath("/products");
    revalidateTag(STOREFRONT_TAGS.categories);
    return { success: true };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false };
  }
}

export async function deleteCategory(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/admin/taxonomy");
    revalidatePath("/products");
    revalidateTag(STOREFRONT_TAGS.categories);
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

export async function createFestival(data: any) {
  try {
    await db.insert(festivals).values(data);
    revalidatePath("/admin/taxonomy");
    revalidatePath("/");
    revalidateTag(STOREFRONT_TAGS.festivals);
    return { success: true };
  } catch (error) {
    console.error("Failed to create festival:", error);
    return { success: false };
  }
}

export async function updateFestival(id: number, data: any) {
  try {
    await db.update(festivals).set(data).where(eq(festivals.id, id));
    revalidatePath("/admin/taxonomy");
    revalidatePath("/");
    revalidateTag(STOREFRONT_TAGS.festivals);
    return { success: true };
  } catch (error) {
    console.error("Failed to update festival:", error);
    return { success: false };
  }
}

export async function deleteFestival(id: number) {
  try {
    await db.delete(festivals).where(eq(festivals.id, id));
    revalidatePath("/admin/taxonomy");
    revalidatePath("/");
    revalidateTag(STOREFRONT_TAGS.festivals);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete festival:", error);
    return { success: false };
  }
}

export async function toggleFestival(id: number, active: boolean) {
  try {
    // Disable all others first
    if (active) {
      await db.update(festivals).set({ isActive: false });
    }
    await db.update(festivals).set({ isActive: active }).where(eq(festivals.id, id));
    revalidatePath("/admin/taxonomy");
    revalidatePath("/");
    revalidatePath("/(shop)", "layout");
    revalidateTag(STOREFRONT_TAGS.festivals);
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle festival:", error);
    return { success: false };
  }
}

