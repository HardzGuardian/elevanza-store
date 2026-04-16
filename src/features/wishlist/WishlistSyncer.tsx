'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useWishlistStore } from './store';
import { fetchWishlistIds, syncWishlistIds } from './actions';

export function WishlistSyncer() {
  const { data: session } = useSession();
  const { ids: localIds, setIds } = useWishlistStore();
  const synced = useRef<string | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || synced.current === userId) return;
    synced.current = userId;

    (async () => {
      // Push any local-only items to DB first
      if (localIds.length > 0) await syncWishlistIds(localIds);
      // Then pull the full DB list (merged)
      const dbIds = await fetchWishlistIds();
      setIds(dbIds);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // On sign-out, clear local store
  useEffect(() => {
    if (!session?.user) {
      synced.current = null;
    }
  }, [session?.user]);

  return null;
}
