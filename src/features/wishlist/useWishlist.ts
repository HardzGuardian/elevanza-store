'use client';

import { useSession } from 'next-auth/react';
import { useWishlistStore } from './store';
import { toggleWishlistItem } from './actions';

export function useWishlist() {
  const { data: session } = useSession();
  const store = useWishlistStore();

  const toggle = async (productId: number) => {
    // Optimistic update immediately
    store.toggle(productId);
    // If signed in, persist to DB
    if (session?.user) {
      await toggleWishlistItem(productId);
    }
  };

  return {
    ids:          store.ids,
    isWishlisted: store.isWishlisted,
    toggle,
  };
}
