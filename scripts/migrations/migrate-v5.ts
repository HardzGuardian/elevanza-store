import 'dotenv/config';
import { db } from './index';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🚀 Running Schema Migration V5 (Featured Segments Customization)...');
  try {
    // Update settings table
    console.log('⚙️ Updating settings table...');
    const settingsAlter = [
      'ALTER TABLE settings ADD COLUMN featured_segments_title VARCHAR(255) NOT NULL DEFAULT "Curated Segments"',
      'ALTER TABLE settings ADD COLUMN featured_segments_description TEXT NOT NULL'
    ];

    for (const statement of settingsAlter) {
      try {
        await db.execute(sql.raw(statement));
        console.log(`✅ Success: ${statement}`);
      } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('⚠️ Column already exists, skipping.');
        else throw e;
      }
    }

    // Set default value for description manually if it's not handled by the column add
    await db.execute(sql.raw(`UPDATE settings SET featured_segments_description = 'Handpicked collections designed for the modern individual.' WHERE featured_segments_description IS NULL OR featured_segments_description = ''`));

    console.log('✨ Migration V5 completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrate();
