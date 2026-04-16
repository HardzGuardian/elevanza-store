'use server';

import { db } from "@/core/db";
import { users } from "@/core/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/core/auth/auth";
import { z } from "zod";

const accountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export async function updateAccountSettings(data: z.infer<typeof accountSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Validate the data
    const validatedData = accountSchema.parse(data);

    const userId = Number.parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      throw new Error("Invalid user ID");
    }

    await db.update(users)
      .set({
        name: validatedData.name,
        phone: validatedData.phone,
        address: validatedData.address,
      })
      .where(eq(users.id, userId));

    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    console.error("Failed to update account:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Something went wrong" };
  }
}
