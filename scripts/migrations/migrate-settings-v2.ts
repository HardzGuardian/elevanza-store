import 'dotenv/config';
import { db } from './index';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🚀 Updating settings table with home config...');
  try {
    // Try adding columns one by one in case some exist
    const columns = [
      'ALTER TABLE settings ADD COLUMN hero_title VARCHAR(255) NOT NULL DEFAULT "ELEVANZA MODERNE"',
      'ALTER TABLE settings ADD COLUMN hero_subtitle TEXT NOT NULL',
      'ALTER TABLE settings ADD COLUMN hero_image VARCHAR(255) NOT NULL DEFAULT "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"',
      'ALTER TABLE settings ADD COLUMN featured_category_1 VARCHAR(50) NOT NULL DEFAULT "men"',
      'ALTER TABLE settings ADD COLUMN featured_category_2 VARCHAR(50) NOT NULL DEFAULT "women"',
      'ALTER TABLE settings ADD COLUMN featured_category_3 VARCHAR(50) NOT NULL DEFAULT "accessories"'
    ];

    for (const statement of columns) {
      try {
        await db.execute(sql.raw(statement));
        console.log(`✅ Success: ${statement.substring(0, 30)}...`);
      } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️ Column already exists, skipping: ${statement.substring(0, 30)}...`);
        } else {
          throw e;
        }
      }
    }

    console.log('✨ Settings table successfully updated.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrate();
