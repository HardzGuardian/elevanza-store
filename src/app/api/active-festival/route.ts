import { db } from "@/core/db";
import { festivals } from "@/core/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [activeFestival] = await db.select().from(festivals).where(eq(festivals.isActive, true)).limit(1);
    return NextResponse.json({ discount: activeFestival?.salePercentage || 0, name: activeFestival?.name || '' });
  } catch (error) {
    return NextResponse.json({ discount: 0 }, { status: 500 });
  }
}

