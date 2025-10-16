import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql as vercelSql } from '@vercel/postgres';
import * as schema from './schema';

// Create Drizzle instance with Vercel Postgres
export const db = drizzle(vercelSql, { schema });

// Check if database is configured
// In development, always use in-memory storage for easier testing
// In production, use database if DATABASE_URL is configured
export function isDatabaseConfigured(): boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasDbUrl = !!process.env.DATABASE_URL;
  
  // Only use database in production when URL is configured
  return isProduction && hasDbUrl;
}
