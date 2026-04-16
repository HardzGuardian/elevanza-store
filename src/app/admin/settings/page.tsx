import { db } from '@/core/db';
import { settings, categories } from '@/core/db/schema';
import { SettingsForm } from '@/features/admin/components/SettingsForm';

import { DbErrorView } from '@/features/admin/components/DbErrorView';

export default async function AdminSettingsPage() {
  let storeSettings, allCategories;

  try {
    const [[settingsResult], categoriesResult] = await Promise.all([
      db.select().from(settings).limit(1),
      db.select().from(categories)
    ]);
    storeSettings = settingsResult;
    allCategories = categoriesResult;
  } catch (error) {
    console.error("Settings page data fetching failed:", error);
    return <DbErrorView error={error} />;
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Store Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your store's public profile and configurations.</p>
      </div>

      <SettingsForm initialSettings={storeSettings} categoriesList={allCategories} />
    </div>
  );
}


