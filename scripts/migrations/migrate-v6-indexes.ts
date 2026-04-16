import 'server-only';

import { sql } from 'drizzle-orm';
import { db } from '@/core/db';

async function migrate() {
  console.log('--- Database Indexing Migration (v6) ---');
  
  try {
    // Products table indexes
    console.log('Adding indexes to products table...');
    await db.execute(sql.raw('CREATE INDEX idx_products_category ON products (category)'));
    await db.execute(sql.raw('CREATE INDEX idx_products_is_sale ON products (is_sale)'));
    await db.execute(sql.raw('CREATE INDEX idx_products_is_new ON products (is_new_arrival)'));
    
    // Categories table index
    console.log('Adding indexes to categories table...');
    await db.execute(sql.raw('CREATE INDEX idx_categories_slug ON categories (slug)'));
    
    // Content Pages table index
    console.log('Adding indexes to content_pages table...');
    await db.execute(sql.raw('CREATE INDEX idx_content_pages_slug ON content_pages (slug)'));
    
    // Festivals table index
    console.log('Adding indexes to festivals table...');
    await db.execute(sql.raw('CREATE INDEX idx_festivals_active ON festivals (is_active)'));

    console.log('✅ Migration completed successfully!');
  } catch (error: any) {
    const errorCode = error?.code || error?.cause?.code;
    
    // Silence "index already exists" errors
    if (errorCode === 'ER_DUP_KEYNAME') {
      console.log('ℹ️ Some indexes already exist, skipping...');
    } else {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }
}

migrate();

