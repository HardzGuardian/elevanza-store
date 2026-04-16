import 'server-only';

import { unstable_cache } from 'next/cache';
import { and, desc, eq, gt, gte, like, lte, or, asc } from 'drizzle-orm';

import { db } from '@/core/db';
import { categories, contentPages, festivals, products, settings } from '@/core/db/schema';
import { initializeDatabase } from '@/core/db/init';

// Standardized Types
import { PublicProductFilters, NormalizedProductFilters } from '@/core/types/filters';
import { Product, StoreSettings, Category, Festival } from '@/core/types';

/**
 * Caching Strategy Configuration
 */
const PUBLIC_REVALIDATE_SECONDS = 300; // 5 minutes for general public data
const SEARCH_REVALIDATE_SECONDS = 60;  // 1 minute for search results

export const STOREFRONT_TAGS = {
  settings: 'settings',
  categories: 'categories',
  festivals: 'festivals',
  products: 'products',
  contentPages: 'content-pages',
} as const;

/**
 * Internal Utility: Filter Normalization
 * Ensures that incoming URL parameters are sanitized before querying.
 */
function normalizeProductFilters(filters: PublicProductFilters): NormalizedProductFilters {
  const normalizedSort =
    filters.sort === 'price-low' || filters.sort === 'price-high'
      ? filters.sort
      : 'newest';

  return {
    category: filters.category?.trim() || null,
    isSale: Boolean(filters.isSale),
    inStock: Boolean(filters.inStock),
    searchQuery: filters.searchQuery?.trim() || null,
    minPrice: typeof filters.minPrice === 'number' && Number.isFinite(filters.minPrice) ? filters.minPrice : null,
    maxPrice: typeof filters.maxPrice === 'number' && Number.isFinite(filters.maxPrice) ? filters.maxPrice : null,
    size: filters.size?.trim() || null,
    sort: normalizedSort,
  };
}

/**
 * Core Storefront Shell
 * Fetches common data required by the root layout and landing page.
 */
const getStorefrontShellCached = unstable_cache(
  async () => {
    try {
      await initializeDatabase();
      
      const [storeSettingsResult, activeFestivalResult, allCategories] = await Promise.all([
        db.select().from(settings).limit(1),
        db.select().from(festivals).where(eq(festivals.isActive, true)).limit(1),
        db.select().from(categories),
      ]);

      return {
        storeSettings: (storeSettingsResult[0] as StoreSettings) ?? null,
        activeFestival: (activeFestivalResult[0] as Festival) ?? null,
        categories: allCategories as Category[],
      };
    } catch (error) {
      console.error('Failed to fetch storefront shell:', error);
      return {
        storeSettings: null,
        activeFestival: null,
        categories: [],
      };
    }
  },
  ['storefront-shell'],
  {
    tags: [STOREFRONT_TAGS.settings, STOREFRONT_TAGS.festivals, STOREFRONT_TAGS.categories, 'storefront-shell'],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  }
);

export async function getStorefrontShell(): Promise<{
  storeSettings: StoreSettings | null;
  activeFestival: Festival | null;
  categories: Category[];
}> {
  return getStorefrontShellCached();
}

// Bypassed the cached version for real-time debugging

/**
 * Product Queries
 * Functions related to fetching products, sizes, and search results.
 */

const getAvailableProductSizesCached = unstable_cache(
  async () => {
    const allSizesRaw = await db.select({ sizes: products.sizes }).from(products);

    return Array.from(
      new Set(
        allSizesRaw
          .flatMap((product) => (product.sizes ? product.sizes.split(',').map((size) => size.trim()) : []))
          .filter(Boolean)
      )
    ).sort();
  },
  ['product-sizes'],
  {
    tags: [STOREFRONT_TAGS.products],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  }
);

export async function getAvailableProductSizes() {
  return getAvailableProductSizesCached();
}

const getPublicProductByIdCached = unstable_cache(
  async (id: number) => {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        category: products.category,
        isNewArrival: products.isNewArrival,
        isSale: products.isSale,
        salePercentage: products.salePercentage,
        image: products.image,
        sizes: products.sizes,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return product ?? null;
  },
  ['product-detail'],
  {
    tags: [STOREFRONT_TAGS.products],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  }
);

export async function getPublicProductById(id: number) {
  return getPublicProductByIdCached(id);
}

async function queryPublicProducts(filters: NormalizedProductFilters) {
  const conditions = [];

  if (filters.category && filters.category !== 'all') {
    if (filters.category === 'sale') {
      conditions.push(eq(products.isSale, true));
    } else if (filters.category === 'new_arrival') {
      conditions.push(eq(products.isNewArrival, true));
    } else {
      conditions.push(eq(products.category, filters.category));
    }
  }

  if (filters.isSale && filters.category !== 'sale') {
    conditions.push(eq(products.isSale, true));
  }

  if (filters.inStock) {
    conditions.push(gt(products.stock, 0));
  }

  if (filters.searchQuery) {
    conditions.push(
      or(
        like(products.name, `%${filters.searchQuery}%`),
        like(products.description, `%${filters.searchQuery}%`),
        like(products.category, `%${filters.searchQuery}%`)
      )!
    );
  }

  if (filters.minPrice !== null) {
    conditions.push(gte(products.price, filters.minPrice.toString()));
  }

  if (filters.maxPrice !== null) {
    conditions.push(lte(products.price, filters.maxPrice.toString()));
  }

  if (filters.size) {
    conditions.push(like(products.sizes, `%${filters.size}%`));
  }

  const baseQuery = db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      image: products.image,
      category: products.category,
      isNewArrival: products.isNewArrival,
      isSale: products.isSale,
      salePercentage: products.salePercentage,
      sizes: products.sizes,
      createdAt: products.createdAt,
    })
    .from(products);

  const filteredQuery = conditions.length > 0 ? baseQuery.where(and(...conditions)!) : baseQuery;

  if (filters.sort === 'price-low') {
    return filteredQuery.orderBy(asc(products.price));
  }

  if (filters.sort === 'price-high') {
    return filteredQuery.orderBy(desc(products.price));
  }

  return filteredQuery.orderBy(desc(products.createdAt));
}

const getPublicProductsCached = unstable_cache(
  async (serializedFilters: string) => {
    const filters = normalizeProductFilters(JSON.parse(serializedFilters) as PublicProductFilters);
    return queryPublicProducts(filters);
  },
  ['public-products'],
  {
    tags: [STOREFRONT_TAGS.products],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  }
);

export async function getPublicProducts(filters: PublicProductFilters) {
  return getPublicProductsCached(JSON.stringify(normalizeProductFilters(filters)));
}

const getQuickProductSearchResultsCached = unstable_cache(
  async (query: string) => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      return [];
    }

    return db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        image: products.image,
        category: products.category,
        isSale: products.isSale,
        salePercentage: products.salePercentage,
      })
      .from(products)
      .where(
        or(
          like(products.name, `%${normalizedQuery}%`),
          like(products.category, `%${normalizedQuery}%`)
        )!
      )
      .orderBy(desc(products.createdAt))
      .limit(5);
  },
  ['quick-product-search'],
  {
    tags: [STOREFRONT_TAGS.products],
    revalidate: SEARCH_REVALIDATE_SECONDS,
  }
);

export async function getQuickProductSearchResults(query: string) {
  return getQuickProductSearchResultsCached(query.trim());
}

/**
 * Content Page Queries
 * Functions related to informational and legal pages.
 */

const getVisibleContentPagesCached = unstable_cache(
  async () => {
    await initializeDatabase();

    return db
      .select({
        id: contentPages.id,
        slug: contentPages.slug,
        title: contentPages.title,
        isVisible: contentPages.isVisible,
        footerGroup: contentPages.footerGroup,
      })
      .from(contentPages)
      .where(eq(contentPages.isVisible, true));
  },
  ['visible-content-pages'],
  {
    tags: [STOREFRONT_TAGS.contentPages],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  }
);

export async function getVisibleContentPages() {
  return getVisibleContentPagesCached();
}

const getContentPageBySlugCached = unstable_cache(
  async (slug: string) => {
    await initializeDatabase();

    const [page] = await db
      .select()
      .from(contentPages)
      .where(and(eq(contentPages.slug, slug), eq(contentPages.isVisible, true))!)
      .limit(1);

    return page ?? null;
  },
  ['content-page'],
  {
    tags: [STOREFRONT_TAGS.contentPages],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  }
);

export async function getContentPageBySlug(slug: string) {
  return getContentPageBySlugCached(slug);
}

