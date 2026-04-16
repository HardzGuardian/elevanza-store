import 'server-only';
import { sql } from 'drizzle-orm';
import { db } from './index';

let initializationPromise: Promise<void> | null = null;

/**
 * Ensures that the database schema is up-to-date with essential columns.
 * This runs once during the app's initialization phase.
 */
export async function initializeDatabase() {
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      console.log('Core: Verifying database schema...');
      
      // Ensure Settings Columns
      await addColumnIfNotExists('settings', 'featured_segments_title', "VARCHAR(255) NOT NULL DEFAULT 'Curated Segments'");
      await addColumnIfNotExists('settings', 'featured_segments_description', "TEXT");
      await addColumnIfNotExists('content_pages', 'is_visible', "BOOLEAN NOT NULL DEFAULT TRUE");
      
      // Seed default description if needed
      await db.execute(sql.raw(`
        UPDATE settings 
        SET featured_segments_description = 'Handpicked collections designed for the modern individual.'
        WHERE featured_segments_description IS NULL
      `));

      console.log('Core: Database schema verified.');
    } catch (error) {
      console.error('Core: Database initialization failed:', error);
    }
  })();

  return initializationPromise;
}

/**
 * Utility to safely add columns without crashing if they already exist.
 * Handles both PostgreSQL (42701) and MySQL (ER_DUP_FIELDNAME) error codes.
 */
async function addColumnIfNotExists(table: string, column: string, definition: string) {
  try {
    await db.execute(sql.raw(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`));
  } catch (error: any) {
    const errorCode = error?.code || error?.cause?.code;
    // PostgreSQL: 42701 = duplicate_column, MySQL: ER_DUP_FIELDNAME
    if (errorCode === '42701' || errorCode === 'ER_DUP_FIELDNAME') return;
    throw error;
  }
}
