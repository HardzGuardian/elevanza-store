import { NextResponse } from 'next/server';
import { db } from '@/core/db';
import { products } from '@/core/db/schema';
import { inArray } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get('ids') || '';
  const ids = raw.split(',').map(Number).filter(n => !isNaN(n) && n > 0);

  if (ids.length === 0) return NextResponse.json([]);

  const rows = await db
    .select({
      id:             products.id,
      name:           products.name,
      price:          products.price,
      image:          products.image,
      category:       products.category,
      salePercentage: products.salePercentage,
    })
    .from(products)
    .where(inArray(products.id, ids));

  return NextResponse.json(rows);
}
