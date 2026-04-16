import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// For serverless environments like Vercel, we can use a single connection or a pool.
// Use 'postgres' for a robust managed connection.
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
