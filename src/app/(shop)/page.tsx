import { getStorefrontShell } from "@/features/shop/services/data";
import { resolveHomeCollections } from "@/features/shop/services/home-utils";

// Refactored Components
import { Hero } from "@/features/shop/components/Hero";
import { CollectionGrid } from "@/features/shop/components/CollectionGrid";
import { ServiceFeatures } from "@/features/shop/components/ServiceFeatures";
import { NewsletterSignup } from "@/features/shop/components/NewsletterSignup";

/**
 * The dynamic landing page for the storefront.
 * Orchestrates various high-level sections and resolves collection data.
 */
export default async function Home() {
  const { storeSettings, activeFestival, categories } = await getStorefrontShell();
  
  // Parse dynamic segments from settings
  let segments = [];
  try {
    segments = JSON.parse(storeSettings?.featuredSegmentsConfig || '[]');
  } catch (e) {
    console.error("Failed to parse home segments:", e);
  }
  
  // Resolve which collections to display based on dynamic config
  const collections = resolveHomeCollections(categories, segments);
  
  // Design configuration
  const themePreset = activeFestival?.slug || storeSettings?.themePreset || 'default';
  
  const config = {
    showHero: storeSettings?.showHero ?? true,
    showCollections: storeSettings?.showCategories ?? true,
    showServices: storeSettings?.showFeatures ?? true,
    showNewsletter: storeSettings?.showNewsletter ?? true,
  };

  return (
    <main>
      {config.showHero && (
        <Hero settings={storeSettings} festival={activeFestival} />
      )}

      {config.showCollections && (
        <CollectionGrid 
          collections={collections}
          title={storeSettings?.featuredSegmentsTitle ?? undefined}
          description={storeSettings?.featuredSegmentsDescription ?? undefined}
        />
      )}

      {config.showServices && (
        <ServiceFeatures />
      )}

      {config.showNewsletter && (
        <NewsletterSignup themePreset={themePreset} />
      )}
    </main>
  );
}

