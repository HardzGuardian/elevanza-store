import 'dotenv/config';
import { db } from './index';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🚀 Running Schema Migration V3 (Deep Customization)...');
  try {
    const productsAlter = [
      'ALTER TABLE products ADD COLUMN sizes VARCHAR(255)'
    ];

    const settingsAlter = [
      'ALTER TABLE settings ADD COLUMN primary_color VARCHAR(20) NOT NULL DEFAULT "#4f46e5"',
      'ALTER TABLE settings ADD COLUMN accent_color VARCHAR(20) NOT NULL DEFAULT "#818cf8"',
      'ALTER TABLE settings ADD COLUMN theme_preset ENUM("default", "diwali", "ganpati") NOT NULL DEFAULT "default"',
      'ALTER TABLE settings ADD COLUMN show_hero TINYINT(1) NOT NULL DEFAULT 1',
      'ALTER TABLE settings ADD COLUMN show_categories TINYINT(1) NOT NULL DEFAULT 1',
      'ALTER TABLE settings ADD COLUMN show_features TINYINT(1) NOT NULL DEFAULT 1',
      'ALTER TABLE settings ADD COLUMN show_newsletter TINYINT(1) NOT NULL DEFAULT 1'
    ];

    console.log('📦 Updating products table...');
    for (const statement of productsAlter) {
      try {
        await db.execute(sql.raw(statement));
        console.log(`✅ Success: ${statement}`);
      } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('⚠️ Column already exists, skipping.');
        else throw e;
      }
    }

    console.log('⚙️ Updating settings table...');
    for (const statement of settingsAlter) {
      try {
        await db.execute(sql.raw(statement));
        console.log(`✅ Success: ${statement}`);
      } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('⚠️ Column already exists, skipping.');
        else throw e;
      }
    }

    console.log('✨ Migration V3 completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrate();
