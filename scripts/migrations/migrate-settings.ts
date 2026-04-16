import 'dotenv/config';
import { db } from './index';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🚀 Creating settings table...');
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        store_name VARCHAR(255) NOT NULL DEFAULT 'Elevanza Moderne',
        store_email VARCHAR(255) NOT NULL DEFAULT 'contact@elevanza.com',
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 25.00,
        tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 8.00,
        free_shipping_threshold DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default settings if not exists
    await db.execute(sql`
      INSERT IGNORE INTO settings (id, store_name, store_email, currency, shipping_fee, tax_rate, free_shipping_threshold)
      VALUES (1, 'Elevanza Moderne', 'contact@elevanza.com', 'USD', 25.00, 8.00, 500.00)
    `);

    console.log('✅ Settings table created and initialized.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrate();
