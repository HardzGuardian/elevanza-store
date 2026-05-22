"use server";

import { db } from "@/core/db";
import { products } from "@/core/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { STOREFRONT_TAGS, getQuickProductSearchResults } from "@/features/shop/services/data";
import { z } from "zod";
import { assertAdmin } from "@/core/auth/guards";

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(5000).optional().nullable(),
  price: z.coerce.number().positive("Price must be positive").finite(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  category: z.string().min(1, "Category is required").max(255),
  isNewArrival: z.boolean().optional().default(false),
  isSale: z.boolean().optional().default(false),
  salePercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  image: z.string().url().optional().nullable().or(z.literal("")),
  sizes: z.string().max(500).optional().nullable(),
});

export async function createProduct(data: any) {
  await assertAdmin();
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors, product: null };
  try {
    const [product] = await db.insert(products).values({
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price.toString(),
      image: parsed.data.image,
      sizes: parsed.data.sizes,
      category: parsed.data.category,
      stock: parsed.data.stock,
      isNewArrival: parsed.data.isNewArrival,
      isSale: parsed.data.isSale,
      salePercentage: parsed.data.salePercentage?.toString(),
    }).returning();

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidateTag(STOREFRONT_TAGS.products, {});
    return { success: true, product };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product", product: null };
  }
}

export async function updateProduct(id: number, data: any) {
  await assertAdmin();
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors, product: null };
  try {
    const [product] = await db.update(products).set({
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price.toString(),
      image: parsed.data.image,
      sizes: parsed.data.sizes,
      category: parsed.data.category,
      stock: parsed.data.stock,
      isNewArrival: parsed.data.isNewArrival,
      isSale: parsed.data.isSale,
      salePercentage: parsed.data.salePercentage?.toString(),
    }).where(eq(products.id, id)).returning();

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    revalidateTag(STOREFRONT_TAGS.products, {});
    return { success: true, product };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product", product: null };
  }
}

export async function deleteProduct(id: number) {
  await assertAdmin();
  try {
    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidateTag(STOREFRONT_TAGS.products, {});
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

export async function bulkDeleteProducts(ids: number[]) {
  await assertAdmin();
  if (!ids.length) return { success: true };
  try {
    await db.delete(products).where(inArray(products.id, ids));
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidateTag(STOREFRONT_TAGS.products, {});
    return { success: true };
  } catch (error) {
    console.error("Failed to bulk delete products:", error);
    return { success: false, error: "Failed to delete products" };
  }
}

export async function searchProducts(query: string) {
  try {
    return await getQuickProductSearchResults(query);
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}

