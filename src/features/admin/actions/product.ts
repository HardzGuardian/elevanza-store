"use server";

import { db } from "@/core/db";
import { products } from "@/core/db/schema";
import { eq, or, like } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { STOREFRONT_TAGS, getQuickProductSearchResults } from "@/features/shop/services/data";

export async function createProduct(data: any) {
  try {
    await db.insert(products).values({
      name: data.name,
      description: data.description,
      price: data.price.toString(),
      image: data.image,
      sizes: data.sizes,
      category: data.category,
      stock: parseInt(data.stock),
      isNewArrival: data.isNewArrival,
      isSale: data.isSale,
      salePercentage: data.salePercentage?.toString(),
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidateTag(STOREFRONT_TAGS.products);
    return { success: true };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(id: number, data: any) {
  try {
    await db.update(products).set({
      name: data.name,
      description: data.description,
      price: data.price.toString(),
      image: data.image,
      sizes: data.sizes,
      category: data.category,
      stock: parseInt(data.stock),
      isNewArrival: data.isNewArrival,
      isSale: data.isSale,
      salePercentage: data.salePercentage?.toString(),
    }).where(eq(products.id, id));

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    revalidateTag(STOREFRONT_TAGS.products);
    return { success: true };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: number) {
  try {
    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidateTag(STOREFRONT_TAGS.products);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product" };
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

