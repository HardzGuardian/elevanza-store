/**
 * Types and interfaces related to product filtering and search.
 */

export interface PublicProductFilters {
  category?: string | null;
  isSale?: boolean;
  inStock?: boolean;
  searchQuery?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  size?: string | null;
  sort?: string | null;
}

export type NormalizedProductFilters = {
  category: string | null;
  isSale: boolean;
  inStock: boolean;
  searchQuery: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  size: string | null;
  sort: 'newest' | 'price-low' | 'price-high';
};
