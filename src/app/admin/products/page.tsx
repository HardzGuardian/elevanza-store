import { db } from '@/core/db';
import { products } from '@/core/db/schema';
import { ProductTable } from '@/features/admin/components/ProductTable';
import { getCategories } from '@/features/admin/actions/taxonomy';

export default async function AdminProductsPage() {
  const allProducts = await db.select().from(products);
  const allCategories = await getCategories();

  return (
    <div className="p-8">
      <ProductTable products={allProducts} categoriesList={allCategories} />
    </div>
  );
}


