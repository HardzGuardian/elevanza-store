import { getCategories, getFestivals } from '@/features/admin/actions/taxonomy';
import { TaxonomyManager } from '@/features/admin/components/TaxonomyManager';

export default async function AdminTaxonomyPage() {
  const allCategories = await getCategories();
  const allFestivals = await getFestivals();

  return (
    <div className="p-8">
      <TaxonomyManager 
        initialCategories={allCategories} 
        initialFestivals={allFestivals} 
      />
    </div>
  );
}


