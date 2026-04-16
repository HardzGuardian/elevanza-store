import 'server-only';

import { sql } from 'drizzle-orm';

import { db } from '@/core/db';

let ensurePromise: Promise<void> | null = null;

export function ensureContentPagesVisibilityColumn() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      try {
        await db.execute(sql.raw(`
          ALTER TABLE content_pages
          ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true
        `));
      } catch (error: any) {
        console.error('Error ensuring content_pages visibility column:', error);
      }
    })();
  }

  return ensurePromise;
}

