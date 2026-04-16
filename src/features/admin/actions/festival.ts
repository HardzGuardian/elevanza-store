"use server";

import { db } from "@/core/db";
import { festivals } from "@/core/db/schema";
import { eq, not } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { STOREFRONT_TAGS } from "@/features/shop/services/data";

export async function getFestivals() {
  return await db.select().from(festivals);
}

export async function createFestival(data: any) {
  try {
    await db.insert(festivals).values({
      name: data.name,
      slug: data.slug,
      salePercentage: parseInt(data.salePercentage),
      promoMessage: data.promoMessage,
      primaryColor: data.primaryColor,
      accentColor: data.accentColor,
      isActive: false, // Default to inactive
    });

    revalidatePath("/admin/festivals");
    revalidateTag(STOREFRONT_TAGS.festivals);
    return { success: true };
  } catch (error) {
    console.error("Failed to create festival:", error);
    return { success: false, error: "Failed to create festival" };
  }
}

export async function updateFestival(id: number, data: any) {
  try {
    await db.update(festivals).set({
      name: data.name,
      slug: data.slug,
      salePercentage: parseInt(data.salePercentage),
      promoMessage: data.promoMessage,
      primaryColor: data.primaryColor,
      accentColor: data.accentColor,
    }).where(eq(festivals.id, id));

    revalidatePath("/admin/festivals");
    revalidatePath("/");
    revalidateTag(STOREFRONT_TAGS.festivals);
    return { success: true };
  } catch (error) {
    console.error("Failed to update festival:", error);
    return { success: false, error: "Failed to update festival" };
  }
}

export async function toggleFestival(id: number, active: boolean) {
  try {
    // If we're activating this one, deactivate all others first
    if (active) {
      await db.update(festivals).set({ isActive: false });
    }

    await db.update(festivals).set({ isActive: active }).where(eq(festivals.id, id));

    revalidatePath("/admin/festivals");
    revalidatePath("/");
    revalidateTag(STOREFRONT_TAGS.festivals);
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle festival:", error);
    return { success: false, error: "Failed to toggle festival" };
  }
}

export async function deleteFestival(id: number) {
  try {
    await db.delete(festivals).where(eq(festivals.id, id));
    revalidatePath("/admin/festivals");
    revalidateTag(STOREFRONT_TAGS.festivals);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete festival:", error);
    return { success: false, error: "Failed to delete festival" };
  }
}

