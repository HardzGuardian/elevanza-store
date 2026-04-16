'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  ids: number[];
  toggle: (id: number) => void;
  setIds: (ids: number[]) => void;
  isWishlisted: (id: number) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle:      (id)  => set(s => ({ ids: s.ids.includes(id) ? s.ids.filter(i => i !== id) : [...s.ids, id] })),
      setIds:      (ids) => set({ ids }),
      isWishlisted:(id)  => get().ids.includes(id),
      clear:       ()    => set({ ids: [] }),
    }),
    { name: 'fashion-shop-wishlist' }
  )
);
