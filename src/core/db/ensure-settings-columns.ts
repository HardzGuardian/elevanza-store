import 'server-only';

import { sql } from 'drizzle-orm';
import { db } from '@/core/db';

let ensurePromise: Promise<void> | null = null;

export function ensureSettingsColumns() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      try {
        // Attempt to add featured_segments_title
        try {
          await db.execute(sql.raw(`
            ALTER TABLE settings
            ADD COLUMN featured_segments_title VARCHAR(255) NOT NULL DEFAULT 'Curated Segments'
          `));
        } catch (error: any) {
          const errorCode = error?.code || error?.cause?.code;
          if (errorCode !== 'ER_DUP_FIELDNAME') throw error;
        }

        // Attempt to add featured_segments_description
        try {
          await db.execute(sql.raw(`
            ALTER TABLE settings
            ADD COLUMN featured_segments_description TEXT
          `));
          
          // Set default value for new column
          await db.execute(sql.raw(`
            UPDATE settings 
            SET featured_segments_description = 'Handpicked collections designed for the modern individual.'
            WHERE featured_segments_description IS NULL
          `));
          
          // Make it NOT NULL after seeding
          await db.execute(sql.raw(`
            ALTER TABLE settings
            MODIFY COLUMN featured_segments_description TEXT NOT NULL
          `));
        } catch (error: any) {
          const errorCode = error?.code || error?.cause?.code;
          if (errorCode !== 'ER_DUP_FIELDNAME') throw error;
        }
      } catch (error) {
        console.error('Failed to ensure settings schema integrity:', error);
      }
    })();
  }

  return ensurePromise;
}

