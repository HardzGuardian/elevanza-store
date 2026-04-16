import { Category } from "@/core/types";

export interface HomeCollection {
  id: string;
  name: string;
  href: string;
  image: string | null;
}

const CAMPAIGN_MAPPINGS: Record<string, HomeCollection> = {
  new_arrival: {
    id: 'new_arrival',
    name: 'New Arrivals',
    href: '/products?category=new_arrival',
    image: '', // Clear mock image
  },
  sale: {
    id: 'sale',
    name: 'Flash Sale',
    href: '/products?category=sale',
    image: '', // Clear mock image
  },
};

/**
 * Resolves a list of segment configurations into a finalized list of collections for the home page.
 * Mixes static campaign links (like "Sale") with dynamic database categories.
 */
export function resolveHomeCollections(
  categories: Category[],
  segments: { slug: string, image?: string }[]
): HomeCollection[] {
  const seenIds = new Set<string>();

  return segments.flatMap((segment) => {
    const slug = segment.slug;
    if (!slug) return [];

    // Prioritize static campaigns (Sale, New Arrival)
    const campaign = CAMPAIGN_MAPPINGS[slug];
    if (campaign && !seenIds.has(campaign.id)) {
      seenIds.add(campaign.id);
      return [{
        ...campaign,
        image: segment.image || campaign.image
      }];
    }

    // Match against database categories
    const category = categories.find((cat) => cat.slug === slug);
    if (!category || seenIds.has(category.slug)) {
      return [];
    }

    seenIds.add(category.slug);

    return [{
      id: category.slug,
      name: category.name,
      href: `/products?category=${category.slug}`,
      image: segment.image || category.image,
    }];
  });
}

