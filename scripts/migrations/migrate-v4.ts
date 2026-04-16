import 'dotenv/config';
import { db } from './index';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🚀 Running Schema Migration V4 (Taxonomy & Festive CMS)...');
  try {
    // 1. Create Categories table
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `));

    // 2. Create Festivals table
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS festivals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        is_active TINYINT(1) DEFAULT 0,
        sale_percentage INT DEFAULT 0,
        primary_color VARCHAR(20),
        accent_color VARCHAR(20),
        promo_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `));

    // 3. Update products table
    console.log('📦 Updating products status...');
    await db.execute(sql.raw('ALTER TABLE products MODIFY COLUMN category VARCHAR(255) NOT NULL'));

    // 4. Update settings table
    console.log('⚙️ Updating settings table...');
    const settingsAlter = [
      'ALTER TABLE settings MODIFY COLUMN theme_preset VARCHAR(50) NOT NULL DEFAULT "default"',
      'ALTER TABLE settings ADD COLUMN emergency_notice_text TEXT',
      'ALTER TABLE settings ADD COLUMN show_emergency_notice TINYINT(1) NOT NULL DEFAULT 0'
    ];

    for (const statement of settingsAlter) {
      try {
        await db.execute(sql.raw(statement));
        console.log(`✅ Success: ${statement}`);
      } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('⚠️ Column already exists, skipping.');
        else if (e.code === 'ER_DUP_ENUM_VALUE') console.log('⚠️ Already updated, skipping.');
        else throw e;
      }
    }

    // 5. Seed Initial Categories
    const initialCategories = [
      { name: 'Men', slug: 'men' },
      { name: 'Women', slug: 'women' },
      { name: 'Accessories', slug: 'accessories' }
    ];
    
    console.log('🌱 Seeding initial categories...');
    for (const cat of initialCategories) {
      await db.execute(sql.raw(`INSERT IGNORE INTO categories (name, slug) VALUES ('${cat.name}', '${cat.slug}')`));
    }

    console.log('✨ Migration V4 completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrate();
